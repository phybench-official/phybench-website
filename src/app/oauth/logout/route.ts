// RP-Initiated Logout —— OIDC 的 end_session_endpoint。
//
// ── 这个端点解决的问题 ──────────────────────────────────────────────────────
// 在此之前，下游应用（如 cp.phybench.cn）点「退出登录」只能吊销它自己的会话。
// 用户重新访问时，下游跳来 /oauth/authorize，本站的 NextAuth cookie 还在，
// 于是**零交互**签发授权码回去 —— 表现为「退出了但还是上一个人的身份」。
// 在机房、实验室这类共用机器上，这是一个真实的身份串号问题。
//
// ── 三层会话，必须逐层往上清 ────────────────────────────────────────────────
//   下游应用（自有会话，它自己能清）
//     → 本站 NextAuth（cookie，只有这里能清）
//       → UAAA（它自己的 SSO，只有它自己能清）
// 只清中间一层不够：/oauth/authorize 在无 session 时会 AutoSignIn 静默跳 UAAA，
// 身份原样回来，静默那一跳只是从第一段挪到了第二段。所以要级联到上游。
//
// ── 请求参数（OIDC RP-Initiated Logout 1.0）──────────────────────────────
//   id_token_hint            推荐。用它确定「是谁、从哪个客户端来」
//   client_id                id_token_hint 缺失时的退路
//   post_logout_redirect_uri 可选。必须在该客户端白名单内，否则忽略（不报错）
//   state                    可选，原样带回
//
// 规范允许在无法确定身份时仍然完成登出。这里遵循该精神：**任何情况下都先把
// 本站会话清掉**，参数有问题只影响「要不要回跳」，不影响「有没有登出」。

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, createLocalJWKSet } from "jose";

import { prisma } from "@/prisma";
import { auth, signOut } from "@/auth";
import { getClient, isPostLogoutRedirectUriAllowed } from "@/lib/oauth/clients";
import { revokeTokensForUserClient } from "@/lib/oauth/tokens";
import { getPublicJwks } from "@/lib/oauth/keys";
import {
  ISSUER,
  LOGOUT_CALLBACK,
  UPSTREAM_END_SESSION,
} from "@/lib/oauth/config";
import { signLogoutState, withState } from "@/lib/oauth/logout-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 解析 id_token_hint。
 *
 * 注意这里**故意不校验过期**：登出场景下 id_token 多半已经过期了（用户可能
 * 挂了几小时才点退出），而规范也只要求用它识别身份，不要求它仍然有效。
 * 签名、issuer 仍然严格校验 —— 那是防止伪造身份来吊销别人令牌的关键。
 */
async function parseIdTokenHint(
  hint: string | null,
): Promise<{ sub: string; clientId: string } | null> {
  if (!hint) return null;
  try {
    const jwks = createLocalJWKSet(getPublicJwks());
    const { payload } = await jwtVerify(hint, jwks, {
      issuer: ISSUER,
      clockTolerance: Number.MAX_SAFE_INTEGER, // 等价于跳过 exp 校验
    });
    const aud = Array.isArray(payload.aud) ? payload.aud[0] : payload.aud;
    if (typeof payload.sub !== "string" || typeof aud !== "string") return null;
    return { sub: payload.sub, clientId: aud };
  } catch {
    return null;
  }
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const sp = req.nextUrl.searchParams;
  const hint = sp.get("id_token_hint");
  const requestedRedirect = sp.get("post_logout_redirect_uri");
  const downstreamState = sp.get("state") ?? undefined;

  const parsed = await parseIdTokenHint(hint);
  const clientId = parsed?.clientId ?? sp.get("client_id");

  // ── 1. 校验回跳地址（决定「登出后去哪」，不影响「是否登出」）──────────────
  let redirectUri: string | undefined;
  if (requestedRedirect && clientId) {
    const client = await getClient(clientId);
    if (client && isPostLogoutRedirectUriAllowed(client, requestedRedirect)) {
      redirectUri = requestedRedirect;
    }
    // 不在白名单：静默忽略。**绝不能**照着跳 —— 那就是开放重定向。
  }

  // ── 2. 吊销该用户在该客户端下的令牌 ────────────────────────────────────
  // 只清 cookie 不吊销令牌，等于「前台登出了、后台还在」：下游后端捏着
  // access token 还能取 1 小时数据，refresh token 30 天。
  //
  // 吊销主体**只认会话**，不认 id_token_hint 里的 sub。
  // 原因：parseIdTokenHint 故意跳过了 exp 校验（登出场景下 id_token 多半已过期，
  // 见上），于是一枚泄漏过的 id_token —— 浏览器历史、日志、Referer 里都可能留下 ——
  // 会永久成为「吊销该用户令牌」的钥匙，且持有者**不需要任何会话**。
  // 那不是越权（拿不到别人的 hint 就动不了别人），但足以构成可重放的骚扰。
  // 所以：hint 只用来确定 clientId 和回跳地址，谁的令牌被吊销由会话说了算。
  const session = await auth();
  let userId: string | undefined;
  if (session?.user?.email) {
    const u = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = u?.id;
  }
  // hint 指向的人和当前会话不是同一个：只清本浏览器的会话，不碰任何令牌。
  // 登出本身照常完成 —— 规范要求的是「结束这个会话」，不是「按 hint 办事」。
  if (parsed?.sub && userId && parsed.sub !== userId) {
    userId = undefined;
  }
  if (userId && clientId) {
    try {
      await revokeTokensForUserClient({ userId, clientId });
    } catch {
      // 吊销失败不能阻断登出本身 —— 清会话比清令牌更要紧
    }
  }

  // ── 3. 取上游 id_token，供级联登出用 ──────────────────────────────────
  // 必须在 signOut() 之前取：signOut 之后就认不出是谁了。
  let upstreamIdToken: string | null = null;
  if (UPSTREAM_END_SESSION && userId) {
    const account = await prisma.account.findFirst({
      where: { userId, provider: "uaaa" },
      select: { id_token: true },
    });
    upstreamIdToken = account?.id_token ?? null;
  }

  // ── 4. 清掉本站会话 ──────────────────────────────────────────────────
  // redirect: false —— 由本函数决定去哪，不让 NextAuth 抢方向盘。
  await signOut({ redirect: false });

  // ── 5. 级联到 UAAA ───────────────────────────────────────────────────
  // 没配上游地址时跳过：本站 cookie 已经清了，但下一次登录仍会从 UAAA
  // 静默拿回身份。响应头里标一下，免得排查时以为端点没生效。
  if (UPSTREAM_END_SESSION) {
    const state = await signLogoutState({ redirectUri, downstreamState });
    const url = new URL(UPSTREAM_END_SESSION);
    url.searchParams.set("post_logout_redirect_uri", LOGOUT_CALLBACK);
    url.searchParams.set("state", state);
    if (upstreamIdToken) url.searchParams.set("id_token_hint", upstreamIdToken);
    return NextResponse.redirect(url, { status: 302 });
  }

  const res = redirectUri
    ? NextResponse.redirect(withState(redirectUri, downstreamState), {
        status: 302,
      })
    : NextResponse.json({ logged_out: true, upstream_logout: false });
  res.headers.set("X-Upstream-Logout", "skipped-not-configured");
  return res;
}

export const GET = handle;
// 规范要求同时支持 POST（表单方式发起登出）。
export const POST = handle;
