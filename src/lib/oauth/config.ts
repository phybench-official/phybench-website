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
  end_session_endpoint: `${ISSUER}/oauth/logout`,
};

// 登出流程从 UAAA 回来时的落点。它必须被登记进 UAAA 侧该应用的
// openid.logoutUrls 白名单，否则 UAAA 会拒绝回跳。
export const LOGOUT_CALLBACK = `${ISSUER}/oauth/logout/callback`;

// ── 上游（UAAA）登出 ────────────────────────────────────────────────────────
//
// 本站的登录态是三层里的中间一层：
//   下游应用 → 本站（NextAuth JWT cookie）→ UAAA（它自己的 SSO）
//
// 只清本站 cookie 是不够的：/oauth/authorize 在无 session 时会走 AutoSignIn
// 静默跳 UAAA，而 UAAA 的会话还在，于是身份原样回来 —— 用户看到的仍然是
// 「退出了但还是上一个人」。所以登出必须继续往上传。
//
// 用环境变量而不是写死，是为了让上线可以分两步走：先发代码（本站 cookie 能清），
// 等 UAAA 管理员把 LOGOUT_CALLBACK 加进白名单后再打开这个开关。
// 没配置时跳过级联，并在响应头里标注，便于排查「为什么还是静默登录」。
export const UPSTREAM_END_SESSION =
  process.env.OAUTH_UPSTREAM_END_SESSION_ENDPOINT?.trim() || null;

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

// 登出流程里那段 state 的时效（秒）。它只需要覆盖「跳到 UAAA 再回来」这一个来回。
export const LOGOUT_STATE_TTL = 5 * 60;

// 令牌时效（秒）。
export const AUTH_CODE_TTL = 60; // 授权码 60s
export const ACCESS_TOKEN_TTL = 60 * 60; // access token 1h
export const ID_TOKEN_TTL = 60 * 60; // id_token 1h
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // refresh token 30d

// 签名算法。
export const SIGNING_ALG = "RS256";
