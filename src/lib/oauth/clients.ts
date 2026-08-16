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

// 管理端写入 redirectUris / postLogoutRedirectUris 时的协议校验。
//
// 只做 `new URL(u)` 不抛异常是不够的：`javascript:alert(1)`、`data:text/html,...`
// 都是**合法 URL**，能原样进白名单。之后授权回调和登出回跳都是精确匹配后
// 直接拿去做 302 / location 赋值，等于给了一个存储型 XSS 的落点。
// 写入需要 admin 权限，所以这是纵深防御而非紧急漏洞 —— 但白名单本身就是
// 「被信任的地址集合」，让它只可能装得下真正能跳的东西，代价几乎为零。
//
// 为什么是「白名单协议」而不是「黑名单 javascript:/data:」：
// 黑名单要穷举，而 URL 协议是开放集合（intent:、blob:、自定义 scheme…），
// 漏一个就等于没写。
//
// http 为什么没有一刀切禁掉：库里现存两个开发用客户端配的是
// http://localhost:3000/...，而 PATCH 提交的是**整个数组**（含未改动的条目），
// 禁掉 http 会让这两个客户端在管理界面上彻底改不动 —— 想删一个多余的回调地址
// 都会被自己现存的值卡住。所以放行环回地址，其余一律 https。
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function validateClientUri(raw: string): string | null {
  // URL 解析器会静默剥掉串内部的 TAB/CR/LF，于是 "https://exa\tmple.com/" 会以
  // hostname=example.com 通过校验，**落库的却是带 TAB 的原串**（调用方存 raw，
  // 不存规范化结果 —— 那是有意的，见下面关于不自动改写的说明）。而白名单是精确
  // 字符串匹配，这种条目永远命中不了任何真实请求，症状是「配了但一直不生效」，
  // 偏偏管理界面上肉眼看不出来。挡在这里，比事后排查便宜得多。
  //
  // 这不是在防头注入：Location 里带 CRLF 会被 Response 构造函数直接拒掉，
  // 带 TAB 的浏览器也会剥掉后按 example.com 解析。纯粹是个排查陷阱。
  // 用字符码判断而不是正则：正则字面量里塞控制字符既看不见、又会触发 no-control-regex。
  const hasControlChar = [...raw].some((c) => {
    const code = c.charCodeAt(0);
    return code <= 0x1f || code === 0x7f;
  });
  if (hasControlChar) {
    return "含不可见控制字符（TAB／换行等），请重新输入";
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "不是合法的绝对 URL";
  }
  if (url.protocol === "https:") return null;
  if (url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname)) return null;
  return "只允许 https://，本地开发可用 http://localhost";
}

// 登出后的回跳地址同样必须精确匹配白名单。
//
// 单独一份白名单而不是复用 redirectUris：两者语义不同，混用会让登出端点变成
// 开放重定向 —— 一个合法的授权回调地址就能把用户从登出流程导去任意站点。
// 未配置（空数组）时一律拒绝，登出照常执行、只是不回跳。
export function isPostLogoutRedirectUriAllowed(
  client: OAuthClient,
  uri: string | null | undefined,
): boolean {
  if (!uri) return false;
  return client.postLogoutRedirectUris.includes(uri);
}
