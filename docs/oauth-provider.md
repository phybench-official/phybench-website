# 作为 OIDC Provider 给下游应用提供 UAAA 代理登录

本应用（`submit.phybench.cn`）已通过 NextAuth 接入北大统一身份认证 UAAA。
本特性把本应用再封装成一个**标准 OIDC Provider（身份代理网关）**：下游第三方应用
向本站发起标准 OAuth2 授权码流程，本站用现有的 UAAA 会话确认用户身份，并签发**本站自有**
的 token 给下游。下游应用全程拿不到 UAAA 的原始 token，也**无需** UAAA 管理员新增端点。

```
下游应用 ──OAuth(授权码+PKCE)──▶ submit.phybench.cn ──OIDC──▶ UAAA
                                  (本站签发自有 id_token / access_token)
```

> ⚠️ 治理提示：这相当于把 UAAA 身份再分发给未向 UAAA 报备的第三方应用，可能触碰 UAAA 使用协议。
> 请自行确认合规后再开放。下游拿到的是真实姓名 / 邮箱 / 学号级别身份。

## 一、部署步骤

1. 生成 id_token 签名密钥（RS256），把输出的一行写入服务器 `.env`：

   ```bash
   node scripts/generate-oauth-keys.mjs
   # 将打印的 OAUTH_JWK_PRIVATE_KEY='...' 整行写入 .env
   ```

2. 配置 issuer（对外可访问地址，必须与下游配置一致；留空则回退到 `AUTH_URL`）：

   ```env
   OAUTH_ISSUER="https://submit.phybench.cn"
   ```

3. 应用数据库迁移（新增 4 张 OAuth 表）：

   ```bash
   npx prisma migrate deploy      # 生产
   # 或本地开发： npx prisma migrate dev
   ```

4. 重新构建镜像并部署。`docker build` 已包含 `prisma generate`。

## 二、对外端点

| 用途 | 地址 |
| --- | --- |
| OIDC 发现文档 | `GET /.well-known/openid-configuration` |
| 公钥 JWKS | `GET /.well-known/jwks.json`（= `/api/oauth/jwks`） |
| 授权端点 | `GET /oauth/authorize` |
| 令牌端点 | `POST /api/oauth/token` |
| 用户信息 | `GET/POST /api/oauth/userinfo` |

支持：authorization_code（强制/可选 PKCE S256）、refresh_token（旋转式，需 `offline_access` scope）。
scope：`openid`（必选）、`profile`（name/realname/username/role）、`email`、`offline_access`。

## 三、注册下游应用

管理员登录后进入 **`/admin` → OAuth 应用接入管理**（`/admin/oauth-clients`）：

- 填写应用名称、一个或多个回调地址（精确匹配）、勾选 scope。
- 机密客户端（有后端）默认勾选，会校验 `client_secret`；纯前端 SPA 请取消勾选并使用 PKCE。
- 创建后**一次性**显示 `client_id` / `client_secret`，请立即保存。

## 四、下游接入示例（NextAuth v5 自定义 OIDC Provider）

```ts
// 下游应用的 auth.config.ts
providers: [
  {
    id: "phybench",
    name: "PhyBench (PKU)",
    type: "oidc",
    issuer: "https://submit.phybench.cn",          // 与 OAUTH_ISSUER 一致
    clientId: process.env.PHYBENCH_CLIENT_ID,
    clientSecret: process.env.PHYBENCH_CLIENT_SECRET,
    authorization: { params: { scope: "openid profile email" } },
    profile(p) {
      return { id: p.sub, name: p.name, email: p.email, realname: p.realname };
    },
  },
]
```

下游回调地址即上面注册时填写的 redirect_uri，NextAuth 默认形如
`https://下游域名/api/auth/callback/phybench`。其它语言/框架用通用 OIDC 客户端库，
指向上面的 issuer 即可自动发现全部端点。

## 五、安全基线（已实现）

- redirect_uri **精确白名单**匹配，未注册地址绝不重定向。
- 公共客户端**强制 PKCE（S256）**；机密客户端校验 `client_secret`。
- 授权码 **60s 过期、用后即焚**（原子消费防重放/并发双花）。
- `client_secret`、授权码、access/refresh token 均以 **sha256 哈希**入库，明文不落库。
- access token 为 **opaque 可吊销**；refresh token **旋转式**签发并吊销旧值。
- userinfo / id_token 按授予的 scope **过滤声明**。
- JWKS 仅暴露公钥，私钥材料不外泄。

## 六、可选的后续增强

- 定期清理过期的授权码 / token（可加一个 cron 或在签发时顺手清理）。
- 增加 token 撤销端点（RFC 7009）与 introspection 端点（RFC 7662）。
- 如需对用户可见的「已授权应用」管理与一键解绑，可加授权同意记录表。
