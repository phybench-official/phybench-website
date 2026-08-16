// 令牌签发与校验：身份声明组装、id_token(RS256) 签名、access/refresh token 落库、userinfo。

import { SignJWT } from "jose";
import { prisma } from "@/prisma";
import type { User } from "@prisma/client";
import { getSigningKey } from "./keys";
import { randomToken, sha256 } from "./crypto";
import {
  ISSUER,
  SIGNING_ALG,
  ID_TOKEN_TTL,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from "./config";

// 根据授予的 scope 过滤出可暴露给下游的身份声明。
// sub 恒定暴露；profile 控制姓名类；email 控制邮箱类。
export function buildClaims(
  user: Pick<
    User,
    "id" | "name" | "realname" | "username" | "role" | "email" | "emailVerified"
  >,
  scope: string,
): Record<string, unknown> {
  const scopes = new Set(scope.split(/\s+/).filter(Boolean));
  const claims: Record<string, unknown> = { sub: user.id };

  if (scopes.has("profile")) {
    claims.name = user.name ?? undefined;
    claims.realname = user.realname ?? undefined;
    claims.username = user.username ?? undefined;
    claims.preferred_username = user.username ?? user.name ?? undefined;
    claims.role = user.role ?? "user";
  }
  if (scopes.has("email")) {
    claims.email = user.email;
    claims.email_verified = Boolean(user.emailVerified);
  }
  return claims;
}

// 签发 RS256 id_token。
export async function signIdToken(params: {
  user: Parameters<typeof buildClaims>[0];
  clientId: string;
  scope: string;
  nonce?: string | null;
}): Promise<string> {
  const { key, kid } = await getSigningKey();
  const now = Math.floor(Date.now() / 1000);
  const claims = buildClaims(params.user, params.scope);
  const builder = new SignJWT({
    ...claims,
    ...(params.nonce ? { nonce: params.nonce } : {}),
  })
    .setProtectedHeader({ alg: SIGNING_ALG, kid })
    .setIssuer(ISSUER)
    .setSubject(params.user.id)
    .setAudience(params.clientId)
    .setIssuedAt(now)
    .setExpirationTime(now + ID_TOKEN_TTL);
  return builder.sign(key);
}

// 签发并落库 access token，返回明文（只此一次）。
export async function issueAccessToken(params: {
  clientId: string;
  userId: string;
  scope: string;
}): Promise<{ token: string; expiresIn: number }> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL * 1000);
  await prisma.oAuthAccessToken.create({
    data: {
      token: sha256(token),
      clientId: params.clientId,
      userId: params.userId,
      scope: params.scope,
      expiresAt,
    },
  });
  return { token, expiresIn: ACCESS_TOKEN_TTL };
}

// 签发并落库 refresh token（仅在 offline_access 时使用）。
export async function issueRefreshToken(params: {
  clientId: string;
  userId: string;
  scope: string;
}): Promise<string> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
  await prisma.oAuthRefreshToken.create({
    data: {
      token: sha256(token),
      clientId: params.clientId,
      userId: params.userId,
      scope: params.scope,
      expiresAt,
    },
  });
  return token;
}

// 通过 Bearer access token 解析出用户与 scope（校验时效）。
export async function resolveAccessToken(token: string) {
  const record = await prisma.oAuthAccessToken.findUnique({
    where: { token: sha256(token) },
    include: { user: true },
  });
  if (!record) return null;
  if (record.expiresAt.getTime() < Date.now()) return null;
  return record;
}

// 登出时吊销该用户在某个客户端下已签发的令牌。
//
// 为什么必须做：access token 是 opaque 且**服务端校验**的，下游后端只要还捏着
// 它就能继续取数据，最长 1 小时；refresh token 更长，30 天。只清 cookie 不吊销
// 令牌，等于「前台登出了、后台还在」。
//
// access token 直接删（无 revokedAt 字段，删除即失效）；refresh token 打
// revokedAt 标记，保留记录以便审计能看出它是被主动吊销而不是自然过期。
export async function revokeTokensForUserClient(params: {
  userId: string;
  clientId: string;
}): Promise<{ accessRevoked: number; refreshRevoked: number }> {
  const [access, refresh] = await prisma.$transaction([
    prisma.oAuthAccessToken.deleteMany({
      where: { userId: params.userId, clientId: params.clientId },
    }),
    prisma.oAuthRefreshToken.updateMany({
      where: {
        userId: params.userId,
        clientId: params.clientId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    }),
  ]);
  return { accessRevoked: access.count, refreshRevoked: refresh.count };
}
