// OAuth2 / OIDC 授权端点（authorization_endpoint）。
// 流程：校验 client 与 redirect_uri → 确认用户已通过 UAAA 登录 → 跳过同意页直接签发一次性授权码 → 跳回下游。
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { ISSUER, AUTH_CODE_TTL } from "@/lib/oauth/config";
import {
  getClient,
  isRedirectUriAllowed,
  filterScopes,
} from "@/lib/oauth/clients";
import { randomToken, sha256 } from "@/lib/oauth/crypto";
import AutoSignIn from "./auto-signin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

function first(sp: SP, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

function rebuildQuery(sp: SP): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") p.set(k, v);
    else if (Array.isArray(v) && v.length) p.set(k, v[0]!);
  }
  return p.toString();
}

function ErrorView({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-bold">授权请求无效</h1>
      <p className="text-lg">{title}</p>
      <p className="text-muted-foreground max-w-md text-sm">{detail}</p>
    </div>
  );
}

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const responseType = first(sp, "response_type");
  const clientId = first(sp, "client_id");
  const redirectUri = first(sp, "redirect_uri");
  const scope = first(sp, "scope");
  const state = first(sp, "state");
  const nonce = first(sp, "nonce");
  const codeChallenge = first(sp, "code_challenge");
  const codeChallengeMethod = first(sp, "code_challenge_method");

  // 1) 校验客户端与回调地址。这两项失败绝不能重定向（防钓鱼/开放重定向），只能就地报错。
  const client = await getClient(clientId);
  if (!client) {
    return (
      <ErrorView
        title="无效的 client_id"
        detail="该下游应用未注册或已被禁用，请联系管理员。"
      />
    );
  }
  if (!isRedirectUriAllowed(client, redirectUri)) {
    return (
      <ErrorView
        title="redirect_uri 未在白名单中"
        detail="回调地址必须与注册时完全一致，请检查下游应用配置。"
      />
    );
  }

  // 自此之后的错误可以安全地按 OAuth 规范重定向回下游。
  const redirectError = (error: string, description?: string): never => {
    const u = new URL(redirectUri!);
    u.searchParams.set("error", error);
    if (description) u.searchParams.set("error_description", description);
    if (state) u.searchParams.set("state", state);
    redirect(u.toString());
  };

  if (responseType !== "code") {
    redirectError(
      "unsupported_response_type",
      "仅支持 authorization code 流程",
    );
  }
  // 公共客户端（无 secret）强制 PKCE。
  if (!client.isConfidential && !codeChallenge) {
    redirectError("invalid_request", "公共客户端必须使用 PKCE");
  }
  if (
    codeChallenge &&
    codeChallengeMethod &&
    !["S256", "plain"].includes(codeChallengeMethod)
  ) {
    redirectError("invalid_request", "不支持的 code_challenge_method");
  }

  const grantedScope = filterScopes(client, scope);

  // 2) 确认用户身份。未登录则自动走 UAAA 登录，登录后回到本授权地址。
  const session = await auth();
  if (!session?.user?.email) {
    const callbackUrl = `${ISSUER}/oauth/authorize?${rebuildQuery(sp)}`;
    return <AutoSignIn callbackUrl={callbackUrl} />;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    redirectError("access_denied", "登录用户在系统中不存在");
  }

  // 3) 跳过同意页，直接签发一次性授权码（60s 后过期、用后即焚）。
  const code = randomToken(32);
  await prisma.oAuthAuthorizationCode.create({
    data: {
      code: sha256(code),
      clientId: client.clientId,
      userId: user!.id,
      redirectUri: redirectUri!,
      scope: grantedScope,
      nonce: nonce ?? null,
      codeChallenge: codeChallenge ?? null,
      codeChallengeMethod: codeChallenge
        ? (codeChallengeMethod ?? "plain")
        : null,
      expiresAt: new Date(Date.now() + AUTH_CODE_TTL * 1000),
    },
  });

  const dest = new URL(redirectUri!);
  dest.searchParams.set("code", code);
  if (state) dest.searchParams.set("state", state);
  redirect(dest.toString());
}
