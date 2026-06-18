// 生成 OIDC Provider 用于签名 id_token 的 RS256 密钥对。
// 用法： node scripts/generate-oauth-keys.mjs
// 将输出的一行写入 .env（OAUTH_JWK_PRIVATE_KEY）。JWKS 端点会自动从中导出公钥。

import { generateKeyPair, exportJWK } from "jose";
import { randomBytes } from "crypto";

const { privateKey } = await generateKeyPair("RS256", { extractable: true });
const jwk = await exportJWK(privateKey);
jwk.kid = randomBytes(8).toString("hex");
jwk.alg = "RS256";
jwk.use = "sig";

const line = `OAUTH_JWK_PRIVATE_KEY='${JSON.stringify(jwk)}'`;

console.log("\n把下面这一行加入 .env（注意整段含单引号）：\n");
console.log(line);
console.log("\nkid =", jwk.kid, "\n");
