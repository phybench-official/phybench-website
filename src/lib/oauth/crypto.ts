// OAuth 通用密码学工具：随机令牌、哈希存储、定长比较、PKCE 校验。
// 所有进入数据库的 secret / code / token 都以 sha256 哈希形式存储，
// 比对时对输入再次哈希后做定长比较，避免明文落库与时序泄露。

import { createHash, randomBytes, timingSafeEqual } from "crypto";

// 生成 URL-safe 的随机字符串（默认 32 字节 ≈ 256 bit 熵）。
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

// sha256 -> hex，用于把 secret/token 存成不可逆摘要。
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

// 定长比较两个 hex 摘要。
export function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length || ba.length === 0) return false;
  return timingSafeEqual(ba, bb);
}

// 校验明文是否匹配已存储的 sha256 摘要。
export function verifyAgainstHash(plain: string, storedHash: string): boolean {
  return safeEqualHex(sha256(plain), storedHash);
}

// 校验 PKCE：S256 -> base64url(sha256(verifier)) === challenge；plain -> 直接相等。
export function verifyPkce(
  verifier: string,
  challenge: string,
  method: string | null | undefined,
): boolean {
  if (method === "S256") {
    const computed = createHash("sha256").update(verifier).digest("base64url");
    return computed === challenge;
  }
  // 仅在客户端显式使用 plain 时允许（不推荐）。
  if (method === "plain" || !method) {
    return verifier === challenge;
  }
  return false;
}
