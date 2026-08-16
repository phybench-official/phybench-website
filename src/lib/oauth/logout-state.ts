// 登出流程里跨越「跳去 UAAA 再回来」这一个来回所需的状态。
//
// 为什么用签名 JWT 而不是 cookie 或数据库表：
//   - cookie：这一跳是跨站顶层导航（本站 → UAAA → 本站），SameSite=Lax 虽然
//     放行 GET 导航，但多一个必须正确设置的变量；
//   - 数据库：为一个 5 分钟的临时值加一张表和一次迁移不划算。
// 签名 JWT 是无状态的，且 UAAA 本来就要原样带回 state 参数，正好搭这趟车。
//
// 用 HS256 + AUTH_SECRET 而不是 OIDC 的 RS256 签名密钥：这个值只有本站自己
// 签、自己验，不需要对外可验证，对称密钥更省事也更快。

import { SignJWT, jwtVerify } from "jose";
import { LOGOUT_STATE_TTL } from "./config";

export type LogoutState = {
  /** 下游要求登出后回跳的地址（已通过白名单校验） */
  redirectUri?: string;
  /** 下游自己的 state，原样带回给它 */
  downstreamState?: string;
};

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET 未配置，无法签发登出 state");
  return new TextEncoder().encode(s);
}

export async function signLogoutState(payload: LogoutState): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return (
    new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(now)
      .setExpirationTime(now + LOGOUT_STATE_TTL)
      // 加 typ 是为了让这个 token 不可能被当成别的用途的 token 使用
      .setSubject("oauth-logout")
      .sign(secret())
  );
}

export async function verifyLogoutState(
  token: string | null | undefined,
): Promise<LogoutState | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      subject: "oauth-logout",
    });
    return {
      redirectUri:
        typeof payload.redirectUri === "string"
          ? payload.redirectUri
          : undefined,
      downstreamState:
        typeof payload.downstreamState === "string"
          ? payload.downstreamState
          : undefined,
    };
  } catch {
    // 过期或被篡改：当作没有回跳地址处理，登出照常完成
    return null;
  }
}

/**
 * 把下游的 state 原样附回它的回跳地址上。
 *
 * 放在这里而不是 route 文件里：Next 的 route handler 只允许导出 HTTP 方法，
 * 多导出一个函数会让构建报「does not match the required types」。
 */
export function withState(uri: string, state?: string): URL {
  const url = new URL(uri);
  if (state) url.searchParams.set("state", state);
  return url;
}
