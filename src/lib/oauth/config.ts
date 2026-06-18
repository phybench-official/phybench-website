// OIDC Provider 全局配置常量。
// issuer 必须与 .well-known/openid-configuration 中以及 id_token 的 iss 完全一致。

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

// 本站作为 OIDC Provider 对外的 issuer（外网可访问地址）。
// 优先用 OAUTH_ISSUER，其次复用 NextAuth 的 AUTH_URL，最后回退到生产域名。
export const ISSUER = trimTrailingSlash(
  process.env.OAUTH_ISSUER ||
    process.env.AUTH_URL ||
    "https://submit.phybench.cn",
);

export const ENDPOINTS = {
  issuer: ISSUER,
  authorization_endpoint: `${ISSUER}/oauth/authorize`,
  token_endpoint: `${ISSUER}/api/oauth/token`,
  userinfo_endpoint: `${ISSUER}/api/oauth/userinfo`,
  jwks_uri: `${ISSUER}/api/oauth/jwks`,
};

// 支持的 scope。openid 必选；profile / email 控制 userinfo 与 id_token 暴露的声明。
export const SUPPORTED_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
];

export const SUPPORTED_CLAIMS = [
  "sub",
  "name",
  "realname",
  "username",
  "preferred_username",
  "role",
  "email",
  "email_verified",
];

// 令牌时效（秒）。
export const AUTH_CODE_TTL = 60; // 授权码 60s
export const ACCESS_TOKEN_TTL = 60 * 60; // access token 1h
export const ID_TOKEN_TTL = 60 * 60; // id_token 1h
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // refresh token 30d

// 签名算法。
export const SIGNING_ALG = "RS256";
