// OAuth2 token 端点。支持 authorization_code（含 PKCE）与 refresh_token 两种授权。
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import {
  getClient,
  verifyClientSecret,
  parseClientCredentials,
} from "@/lib/oauth/clients";
import { verifyPkce, sha256, randomToken } from "@/lib/oauth/crypto";
import {
  issueAccessToken,
  issueRefreshToken,
  signIdToken,
} from "@/lib/oauth/tokens";
import { REFRESH_TOKEN_TTL } from "@/lib/oauth/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store", Pragma: "no-cache" };

function oauthError(
  error: string,
  description?: string,
  status = 400,
): NextResponse {
  return NextResponse.json(
    { error, ...(description ? { error_description: description } : {}) },
    { status, headers: NO_STORE },
  );
}

export async function POST(req: Request) {
  let body: URLSearchParams;
  try {
    body = new URLSearchParams(await req.text());
  } catch {
    return oauthError("invalid_request", "请求体解析失败");
  }

  const grantType = body.get("grant_type");

  // —— 客户端认证（两种授权都需要）——
  const { clientId, clientSecret } = parseClientCredentials(req, body);
  const client = await getClient(clientId);
  if (!client) {
    return oauthError("invalid_client", "client_id 无效或已禁用", 401);
  }
  if (client.isConfidential && !verifyClientSecret(client, clientSecret)) {
    return oauthError("invalid_client", "client_secret 校验失败", 401);
  }

  if (grantType === "authorization_code") {
    return handleAuthorizationCode(body, client);
  }
  if (grantType === "refresh_token") {
    return handleRefreshToken(body, client);
  }
  return oauthError(
    "unsupported_grant_type",
    `不支持的 grant_type: ${grantType}`,
  );
}

async function handleAuthorizationCode(
  body: URLSearchParams,
  client: Awaited<ReturnType<typeof getClient>>,
) {
  if (!client) return oauthError("invalid_client", undefined, 401);
  const code = body.get("code");
  const redirectUri = body.get("redirect_uri");
  const codeVerifier = body.get("code_verifier");
  if (!code) return oauthError("invalid_request", "缺少 code");

  const record = await prisma.oAuthAuthorizationCode.findUnique({
    where: { code: sha256(code) },
  });
  if (!record || record.clientId !== client.clientId) {
    return oauthError("invalid_grant", "授权码无效");
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return oauthError("invalid_grant", "授权码已过期");
  }
  if (record.redirectUri !== redirectUri) {
    return oauthError("invalid_grant", "redirect_uri 不匹配");
  }

  // PKCE 校验：签发时带了 challenge 就必须给 verifier。
  if (record.codeChallenge) {
    if (
      !codeVerifier ||
      !verifyPkce(
        codeVerifier,
        record.codeChallenge,
        record.codeChallengeMethod,
      )
    ) {
      return oauthError("invalid_grant", "PKCE 校验失败");
    }
  } else if (!client.isConfidential) {
    return oauthError("invalid_grant", "公共客户端必须使用 PKCE");
  }

  // 原子消费授权码，杜绝重放/并发双花。
  const consumed = await prisma.oAuthAuthorizationCode.updateMany({
    where: { id: record.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (consumed.count !== 1) {
    return oauthError("invalid_grant", "授权码已被使用");
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) return oauthError("invalid_grant", "用户不存在");

  const { token: accessToken, expiresIn } = await issueAccessToken({
    clientId: client.clientId,
    userId: user.id,
    scope: record.scope,
  });
  const idToken = await signIdToken({
    user,
    clientId: client.clientId,
    scope: record.scope,
    nonce: record.nonce,
  });

  const scopes = record.scope.split(/\s+/);
  let refreshToken: string | undefined;
  if (scopes.includes("offline_access")) {
    refreshToken = await issueRefreshToken({
      clientId: client.clientId,
      userId: user.id,
      scope: record.scope,
    });
  }

  return NextResponse.json(
    {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      scope: record.scope,
      id_token: idToken,
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    },
    { headers: NO_STORE },
  );
}

async function handleRefreshToken(
  body: URLSearchParams,
  client: Awaited<ReturnType<typeof getClient>>,
) {
  if (!client) return oauthError("invalid_client", undefined, 401);
  const refreshToken = body.get("refresh_token");
  if (!refreshToken) return oauthError("invalid_request", "缺少 refresh_token");

  const record = await prisma.oAuthRefreshToken.findUnique({
    where: { token: sha256(refreshToken) },
  });
  if (
    !record ||
    record.clientId !== client.clientId ||
    record.revokedAt ||
    record.expiresAt.getTime() < Date.now()
  ) {
    return oauthError("invalid_grant", "refresh_token 无效");
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) return oauthError("invalid_grant", "用户不存在");

  // 旋转 refresh token：吊销旧的，签发新的。
  const newRefresh = randomToken(32);
  await prisma.$transaction([
    prisma.oAuthRefreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    }),
    prisma.oAuthRefreshToken.create({
      data: {
        token: sha256(newRefresh),
        clientId: client.clientId,
        userId: user.id,
        scope: record.scope,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
      },
    }),
  ]);

  const { token: accessToken, expiresIn } = await issueAccessToken({
    clientId: client.clientId,
    userId: user.id,
    scope: record.scope,
  });
  const idToken = await signIdToken({
    user,
    clientId: client.clientId,
    scope: record.scope,
  });

  return NextResponse.json(
    {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      scope: record.scope,
      id_token: idToken,
      refresh_token: newRefresh,
    },
    { headers: NO_STORE },
  );
}
