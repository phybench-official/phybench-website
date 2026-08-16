-- RP-Initiated Logout：登出后可回跳的地址白名单。
--
-- 与 redirectUris 分开存：一个管「授权码回哪」，一个管「登出后回哪」。
-- 合用会让登出端点变成开放重定向 —— 攻击者拿一个合法的授权回调地址
-- 就能把用户从登出流程导去任意站点。
--
-- 默认空数组：现存客户端不受影响，行为与迁移前完全一致
-- （不配白名单 = 不允许带 post_logout_redirect_uri 登出）。
ALTER TABLE "OAuthClient"
  ADD COLUMN "postLogoutRedirectUris" TEXT[] DEFAULT ARRAY[]::TEXT[];
