// 下游应用（OAuth 客户端）相关：查询、密钥校验、回调地址匹配、scope 过滤、客户端认证。

import { prisma } from "@/prisma";
import type { OAuthClient } from "@prisma/client";
import { verifyAgainstHash } from "./crypto";

export async function getClient(
  clientId: string | null | undefined,
): Promise<OAuthClient | null> {
  if (!clientId) return null;
  const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
  if (!client || client.disabled) return null;
  return client;
}

// 回调地址必须与白名单精确匹配（防开放重定向）。
export function isRedirectUriAllowed(
  client: OAuthClient,
  redirectUri: string | null | undefined,
): boolean {
  if (!redirectUri) return false;
  return client.redirectUris.includes(redirectUri);
}

// 把请求的 scope 收敛到客户端被允许的范围内，并保证 openid 存在。
export function filterScopes(
  client: OAuthClient,
  requested: string | null | undefined,
): string {
  const req = (requested || "openid").split(/\s+/).filter(Boolean);
  const allowed = new Set(client.scopes);
  const granted = req.filter((s) => allowed.has(s));
  if (!granted.includes("openid")) granted.unshift("openid");
  return Array.from(new Set(granted)).join(" ");
}

export function verifyClientSecret(
  client: OAuthClient,
  secret: string | null | undefined,
): boolean {
  if (!secret) return false;
  return verifyAgainstHash(secret, client.clientSecret);
}

// 从 token 请求中解析客户端凭据：支持 client_secret_basic 与 client_secret_post。
export function parseClientCredentials(
  req: Request,
  body: URLSearchParams,
): { clientId: string | null; clientSecret: string | null } {
  const authz = req.headers.get("authorization");
  if (authz && authz.toLowerCase().startsWith("basic ")) {
    try {
      const decoded = Buffer.from(authz.slice(6), "base64").toString("utf8");
      const idx = decoded.indexOf(":");
      if (idx >= 0) {
        return {
          clientId: decodeURIComponent(decoded.slice(0, idx)),
          clientSecret: decodeURIComponent(decoded.slice(idx + 1)),
        };
      }
    } catch {
      // 忽略，落到 body 解析
    }
  }
  return {
    clientId: body.get("client_id"),
    clientSecret: body.get("client_secret"),
  };
}
