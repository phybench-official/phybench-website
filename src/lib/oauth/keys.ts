// id_token 的 RS256 签名密钥管理。
// 私钥以 JWK(JSON) 形式存放在环境变量 OAUTH_JWK_PRIVATE_KEY 中，
// 用 `node scripts/generate-oauth-keys.mjs` 生成。
// JWKS 端点对外只暴露公钥部分。

import { importJWK, type JWK } from "jose";
import { SIGNING_ALG } from "./config";

// jose v6 不再导出 KeyLike，直接用 importJWK 的返回类型。
type SigningKey = Awaited<ReturnType<typeof importJWK>>;

let cachedPrivateKey: SigningKey | null = null;
let cachedPrivateJwk: JWK | null = null;

function loadPrivateJwk(): JWK {
  if (cachedPrivateJwk) return cachedPrivateJwk;
  const raw = process.env.OAUTH_JWK_PRIVATE_KEY;
  if (!raw) {
    throw new Error(
      "缺少环境变量 OAUTH_JWK_PRIVATE_KEY，请运行 `node scripts/generate-oauth-keys.mjs` 生成并写入 .env",
    );
  }
  let jwk: JWK;
  try {
    jwk = JSON.parse(raw) as JWK;
  } catch {
    throw new Error("OAUTH_JWK_PRIVATE_KEY 不是合法的 JWK JSON");
  }
  if (!jwk.kid) {
    throw new Error("OAUTH_JWK_PRIVATE_KEY 缺少 kid 字段");
  }
  cachedPrivateJwk = jwk;
  return jwk;
}

// 用于签名 id_token 的私钥。
export async function getSigningKey(): Promise<{
  key: SigningKey;
  kid: string;
}> {
  const jwk = loadPrivateJwk();
  if (!cachedPrivateKey) {
    cachedPrivateKey = await importJWK(jwk, SIGNING_ALG);
  }
  return { key: cachedPrivateKey, kid: jwk.kid as string };
}

// 对外发布的公钥 JWK（剥离私钥字段）。
export function getPublicJwks(): { keys: JWK[] } {
  const jwk = loadPrivateJwk();
  // 仅保留公钥字段，剔除所有私钥材料。
  const pub: JWK = {
    kty: jwk.kty,
    n: jwk.n,
    e: jwk.e,
    kid: jwk.kid,
    use: "sig",
    alg: SIGNING_ALG,
  };
  return { keys: [pub] };
}
