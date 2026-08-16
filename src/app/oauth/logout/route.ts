// RP-Initiated Logout —— OIDC 的 end_session_endpoint。
//
// ── 这个端点解决的问题 ──────────────────────────────────────────────────────
// 在此之前，下游应用（如 cp.phybench.cn）点「退出登录」只能吊销它自己的会话。
// 用户重新访问时，下游跳来 /oauth/authorize，本站的 NextAuth cookie 还在，
// 于是**零交互**签发授权码回去 —— 表现为「退出了但还是上一个人的身份」。
// 在机房、实验室这类共用机器上，这是一个真实的身份串号问题。
//
// ── 三层会话，本端点负责中间一层 ────────────────────────────────────────────
//   下游应用（自有会话，它自己能清）
//     → 本站 NextAuth（cookie，只有这里能清）  ← 本端点的职责边界
//       → UAAA（它自己的 SSO，只有它自己能清）
//
// **不级联到 UAAA，这是产品决策，不是没做完。**
// UAAA 作为学校的统一身份认证记住登录状态是预期行为 —— 那是它跟用户之间的事，
// 不该由某个接入方替全校做主清掉。所以退出后重新登录会停在 UAAA 的「用户确认」
// 页（显示当前账号 + 提供「切换账号」），而不是零交互直接进来。这已经解决了
// 共用机器上真正的问题：换人时看得见、切得掉。
//
// 下面 UPSTREAM_END_SESSION 那条级联路径的代码保留但**默认不启用**（环境变量
// 留空）。保留是为了万一将来需求变了，不是等着谁去打开它。要开之前先确认这
// 是不是当前的产品意图，再确认 UAAA 管理员已登记 LOGOUT_CALLBACK 白名单 ——
// 两个条件缺一个，用户就会卡在 UAAA 的错误页上，比不做更差。
//
// ── 请求参数（OIDC RP-Initiated Logout 1.0）──────────────────────────────
//   id_token_hint            推荐。用它确定「是谁、从哪个客户端来」
//   client_id                id_token_hint 缺失时的退路
//   post_logout_redirect_uri 可选。必须在该客户端白名单内，否则忽略（不报错）
//   state                    可选，原样带回
//
// 规范允许在无法确定身份时仍然完成登出。这里遵循该精神：**任何情况下都先把
// 本站会话清掉**，参数有问题只影响「要不要回跳」，不影响「有没有登出」。

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, createLocalJWKSet } from "jose";

import { prisma } from "@/prisma";
import { auth, signOut } from "@/auth";
import { getClient, isPostLogoutRedirectUriAllowed } from "@/lib/oauth/clients";
import { revokeTokensForUserClient } from "@/lib/oauth/tokens";
import { getPublicJwks } from "@/lib/oauth/keys";
import {
  ISSUER,
  LOGOUT_CALLBACK,
  UPSTREAM_END_SESSION,
} from "@/lib/oauth/config";
import { signLogoutState, withState } from "@/lib/oauth/logout-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 解析 id_token_hint。
 *
 * 注意这里**故意不校验过期**：登出场景下 id_token 多半已经过期了（用户可能
 * 挂了几小时才点退出），而规范也只要求用它识别身份，不要求它仍然有效。
 * 签名、issuer 仍然严格校验 —— 那是防止伪造身份来吊销别人令牌的关键。
 */
async function parseIdTokenHint(
  hint: string | null,
): Promise<{ sub: string; clientId: string } | null> {
  if (!hint) return null;
  try {
    const jwks = createLocalJWKSet(getPublicJwks());
    const { payload } = await jwtVerify(hint, jwks, {
      issuer: ISSUER,
      clockTolerance: Number.MAX_SAFE_INTEGER, // 等价于跳过 exp 校验
    });
    const aud = Array.isArray(payload.aud) ? payload.aud[0] : payload.aud;
    if (typeof payload.sub !== "string" || typeof aud !== "string") return null;
    return { sub: payload.sub, clientId: aud };
  } catch {
    return null;
  }
}

/**
 * 取请求参数。
 *
 * 规范允许用表单 POST 发起登出，参数就在 body 里而不是 query 里；下面那个
 * 确认页也是这么提交的。query 优先：同名时以 URL 上的为准，免得表单 body
 * 能悄悄覆盖掉地址栏里看得见的值。
 */
async function readParams(req: NextRequest): Promise<URLSearchParams> {
  const sp = new URLSearchParams(req.nextUrl.searchParams);
  if (req.method !== "POST") return sp;
  try {
    for (const [k, v] of (await req.formData()).entries()) {
      if (typeof v === "string" && !sp.has(k)) sp.set(k, v);
    }
  } catch {
    // body 不是表单编码（或者干脆是空的）：退回只用 query 参数。
    // 登出照常进行 —— 参数缺失只影响回跳，不影响会话被清掉。
  }
  return sp;
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const sp = await readParams(req);
  const hint = sp.get("id_token_hint");
  const requestedRedirect = sp.get("post_logout_redirect_uri");
  const downstreamState = sp.get("state") ?? undefined;

  const parsed = await parseIdTokenHint(hint);
  const clientId = parsed?.clientId ?? sp.get("client_id");

  // ── 1. 校验回跳地址（决定「登出后去哪」，不影响「是否登出」）──────────────
  let redirectUri: string | undefined;
  if (requestedRedirect && clientId) {
    const client = await getClient(clientId);
    if (client && isPostLogoutRedirectUriAllowed(client, requestedRedirect)) {
      redirectUri = requestedRedirect;
    }
    // 不在白名单：静默忽略。**绝不能**照着跳 —— 那就是开放重定向。
  }

  // ── 2. 吊销该用户在该客户端下的令牌 ────────────────────────────────────
  // 只清 cookie 不吊销令牌，等于「前台登出了、后台还在」：下游后端捏着
  // access token 还能取 1 小时数据，refresh token 30 天。
  //
  // 吊销主体**只认会话**，不认 id_token_hint 里的 sub。
  // 原因：parseIdTokenHint 故意跳过了 exp 校验（登出场景下 id_token 多半已过期，
  // 见上），于是一枚泄漏过的 id_token —— 浏览器历史、日志、Referer 里都可能留下 ——
  // 会永久成为「吊销该用户令牌」的钥匙，且持有者**不需要任何会话**。
  // 那不是越权（拿不到别人的 hint 就动不了别人），但足以构成可重放的骚扰。
  // 所以：hint 只用来确定 clientId 和回跳地址，谁的令牌被吊销由会话说了算。
  const session = await auth();
  let userId: string | undefined;
  if (session?.user?.email) {
    const u = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = u?.id;
  }
  // hint 指向的人和当前会话不是同一个：只清本浏览器的会话，不碰任何令牌。
  // 登出本身照常完成 —— 规范要求的是「结束这个会话」，不是「按 hint 办事」。
  if (parsed?.sub && userId && parsed.sub !== userId) {
    userId = undefined;
  }
  if (userId && clientId) {
    try {
      await revokeTokensForUserClient({ userId, clientId });
    } catch {
      // 吊销失败不能阻断登出本身 —— 清会话比清令牌更要紧
    }
  }

  // ── 3. 取上游 id_token，供级联登出用 ──────────────────────────────────
  // 必须在 signOut() 之前取：signOut 之后就认不出是谁了。
  let upstreamIdToken: string | null = null;
  if (UPSTREAM_END_SESSION && userId) {
    const account = await prisma.account.findFirst({
      where: { userId, provider: "uaaa" },
      select: { id_token: true },
    });
    upstreamIdToken = account?.id_token ?? null;
  }

  // ── 4. 清掉本站会话 ──────────────────────────────────────────────────
  // redirect: false —— 由本函数决定去哪，不让 NextAuth 抢方向盘。
  await signOut({ redirect: false });

  // ── 5. 级联到 UAAA（默认不启用，见文件头）────────────────────────────
  // 正常路径走的是下面的 skipped 分支：本站会话已清，UAAA 仍记得用户 ——
  // 这是有意的。响应头标一下，免得排查时以为是端点没生效或配置漏了。
  if (UPSTREAM_END_SESSION) {
    const state = await signLogoutState({ redirectUri, downstreamState });
    const url = new URL(UPSTREAM_END_SESSION);
    url.searchParams.set("post_logout_redirect_uri", LOGOUT_CALLBACK);
    url.searchParams.set("state", state);
    if (upstreamIdToken) url.searchParams.set("id_token_hint", upstreamIdToken);
    return NextResponse.redirect(url, { status: 302 });
  }

  const res = redirectUri
    ? NextResponse.redirect(withState(redirectUri, downstreamState), {
        status: 302,
      })
    : NextResponse.json({ logged_out: true, upstream_logout: false });
  res.headers.set("X-Upstream-Logout", "skipped-not-configured");
  return res;
}

// ── GET 的 CSRF 防护 ────────────────────────────────────────────────────────
//
// 威胁：任意第三方页面放一个 <img src="https://submit.phybench.cn/oauth/logout">，
// 访问者就被静默登出。危害等级是「可用性骚扰」——攻击者拿不到任何数据，也没法
// 顶替身份，但能让人反复掉线。该修，代价必须足够小。
//
// ── 为什么不用规范建议的确认页 ───────────────────────────────────────────────
// OIDC RP-Initiated Logout 说 OP SHOULD 向用户确认。但今天上线并已在生产验证的
// 闭环是「cp 点退出 → 整页跳来 → 清会话 → 302 回 cp」，全程零额外点击。插一个
// 「确认登出」按钮 = 用户点两次退出，是明确的体验倒退，且会立刻回归刚验证过的
// 链路。规范同时允许「能确定身份时跳过确认」，但那条路要求 id_token_hint，
// 而 cp 的 OIDC_LOGOUT_URL 是静态环境变量，塞不进每次都不同的 id_token ——
// 采用它等于直接让 cp 的登出失效。两条规范路径在当前部署下都不可用。
//
// ── 为什么不用 Origin/Referer ───────────────────────────────────────────────
// Origin 在这里根本不存在：按 Fetch 规范，navigate 请求只有在方法不是 GET/HEAD
// 时才带 Origin（所以跨站表单 POST 有，跨站顶层 GET 跳转没有）。于是 cp 那次
// 合法跳转和攻击者的 <img> 一样都是「无 Origin」，无从区分。
// Referer 也不行：<img> 同样会带 Referer，且 Referrer-Policy 能把它整个抹掉，
// 既区分不了来源类型，又会误伤设了严格策略的合法跳转。
//
// ── 采用 Fetch Metadata ─────────────────────────────────────────────────────
// 浏览器自己告诉我们这个请求是被什么发起的，攻击页面改不了这几个头（Sec- 前缀
// 是禁止修改的请求头）。关键是它能区分「资源加载」和「顶层导航」：
//   <img>    → Dest: image     <iframe> → Dest: iframe
//   fetch/XHR→ Dest: empty     顶层跳转  → Dest: document + Mode: navigate
// 所以基础放行条件是 document + navigate（再叠加下面的 Sec-Fetch-User）。
// 对 cp 那条链路零影响：跨站顶层跳转的 Sec-Fetch-Site 是 cross-site，但我们
// **故意不看 Site** —— 登出天生就是跨站发起的，看 Site 会把正常场景全挡掉。
//
// 这条规则对下游是一个**接入约束**，不是兼容性遗漏：发起登出必须用整页跳转，
// 隐藏 iframe / <img> 那种「不离开当前页面就把人登出」的写法一律 403。
// OIDC 生态里确实有用 iframe 做前端登出的实现，本站有意不支持 —— 正是那种
// 形态让 CSRF 和正常登出无从区分。接新下游时把这条写进对接说明。
//
// ── 缺头时放行 ─────────────────────────────────────────────────────────────
// Chrome 76+/Edge 79+/Firefox 90+/Safari 16.4+ 才发这些头，Safari 16.3 及更早
// 一个都不发。选择放行（fail-open），因为拒绝的代价是「老浏览器彻底无法登出」——
// 用户被永久锁在别人的会话里，这比被人骚扰登出严重得多；何况防护失效的后果仅仅
// 是回到今天的现状。
// 但缺头时退一步用 Accept 兜底：顶层文档导航必然带 text/html，而 <img> 发的是
// image/*,*/*;q=0.5，fetch 默认是 */*，都不含 text/html。这挡不住定制客户端
// （它爱发什么发什么），但恰好挡住了老浏览器上唯一现实的攻击载体 <img>。
//
// ── 也要求 Sec-Fetch-User: ?1 ───────────────────────────────────────────────
// 光看 document + navigate 挡不住多少东西：location.href、<meta http-equiv=
// refresh>、脚本自动提交的 GET 表单，全都是 document + navigate，全都不需要点击。
// 实测（真实 Chrome，跨站）三者都能打穿只看 Dest+Mode 的规则，而且攻击者可以顺手
// 抄一个已在白名单里的 post_logout_redirect_uri，让受害者最终落在下游自己的首页，
// 观感与「会话过期」无法区分 —— 所谓「顶层跳转对用户可见」并不构成防线。
//
// Sec-Fetch-User: ?1 表示这次导航由用户激活触发。曾经担心它会因为 cp「点击 →
// await 后端 → location.href」中间的异步而丢失，实测不会：浏览器给导航打这个头
// 用的是 sticky activation（文档被激活过就算），不是 5 秒的瞬时激活窗口 ——
// 点击后 setTimeout 6 秒、7 秒再跳，头依然是 ?1。所以对 cp 那条链路零代价。
//
// 它不是万能的：攻击页面只要骗到任意一次点击（关广告、同意 cookie），之后任意
// 时刻的自动跳转就都带 ?1。它的作用是把攻击从「零点击 drive-by」抬高到「需要
// 先骗一次点击」，不是彻底封死。这是抬门槛，不是关门。
//
// ── 缺头时给确认页，而不是放行 ──────────────────────────────────────────────
// Chrome 76+/Edge 79+/Firefox 90+/Safari 16.4+ 才发这些头。之前这里是 fail-open
// 加一道「Accept 含 text/html」兜底，理由是「只有 <img> 会被挡，那是唯一现实的
// 攻击载体」—— 这个理由是错的：实测 <iframe>/<object>/<embed>/<link rel=prefetch>
// 的 Accept 与顶层导航**逐字相同**（text/html,application/xhtml+xml,...），
// Accept 在它们与真导航之间没有任何区分度。于是在不发 Sec-Fetch-* 的浏览器上
// （Safari ≤16.3、老 WebView），一个 1px 隐藏 iframe 就能零交互打穿，
// 正是这道防护声称要消灭的场景。
//
// 所以缺头改为返回确认页：需要一次真实点击，表单 POST 回本端点。
// 代价只落在这一小撮老浏览器上，且**已验证的 cp 闭环永远走不到这个分支**
// （现代浏览器都发 Sec-Fetch-*，直接走上面的快路径）。
type GateVerdict = "allow" | "confirm" | "deny";

function gateGet(req: NextRequest): GateVerdict {
  const dest = req.headers.get("sec-fetch-dest");
  const mode = req.headers.get("sec-fetch-mode");
  const user = req.headers.get("sec-fetch-user");

  // 一个都不发 = 老浏览器或非浏览器客户端，无从判断发起方式，走确认页。
  if (dest === null && mode === null && user === null) return "confirm";

  // 只要发了其中任何一个，就按严格规则判 —— 部分缺失是可疑的，不给降级机会。
  return dest === "document" && mode === "navigate" && user === "?1"
    ? "allow"
    : "deny";
}

// POST 的门卫是 Origin。按 Fetch 规范，方法不是 GET/HEAD 的导航**一定**带 Origin
// （这也正是 GET 上用不了 Origin 的原因：跨站顶层 GET 跳转根本没有这个头）。
// 于是对 POST 而言 Origin 是可靠的：跨站自动提交的表单会带上攻击者的源。
//
// 只接受本站源，意味着「下游用表单 POST 直接发起登出」这条规范路径不被支持。
// 当前没有任何 POST 调用方（cp 走的是 GET 整页跳转），真出现了再放宽 ——
// 那时应当改成「Origin 在该 client_id 的注册源白名单内」，而不是简单放开。
function isSameOriginPost(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(ISSUER).origin;
  } catch {
    return false;
  }
}

// 明确报错而不是静默 404：静默失败会让排查者以为端点没部署。
//
// 这个响应**必须**在 handle() 之前产生，一次数据库/会话查询都不能做：
// 内容、状态码、耗时都不允许随「当前有没有登录」变化，否则这个端点就成了
// 跨站探测登录状态的探针 —— 攻击者拿 fetch 打一发看返回什么就知道了。
function denied(): NextResponse {
  const res = NextResponse.json(
    {
      error: "invalid_request",
      error_description:
        "This endpoint must be reached by a user-initiated top-level navigation.",
    },
    { status: 403 },
  );
  // 绝不能让这个 403 被缓存后回喂给真正的顶层跳转，那会直接废掉登出。
  res.headers.set("Cache-Control", "no-store");
  res.headers.set(
    "Vary",
    "Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-User, Origin",
  );
  return res;
}

/** 原样转交给确认页表单的参数。多一个不转，避免把任意 query 反射进 HTML。 */
const FORWARDED_PARAMS = [
  "id_token_hint",
  "client_id",
  "post_logout_redirect_uri",
  "state",
] as const;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function confirmPage(req: NextRequest): NextResponse {
  const sp = req.nextUrl.searchParams;
  // 这些值直接进 HTML 属性，必须转义。白名单参数名 + 属性值转义，两道都要有：
  // post_logout_redirect_uri 是攻击者可控的（校验发生在 handle 里，这里还没校验）。
  const hidden = FORWARDED_PARAMS.flatMap((k) => {
    const v = sp.get(k);
    if (v === null) return [];
    const escaped = v.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
    return [`<input type="hidden" name="${k}" value="${escaped}">`];
  }).join("");

  const res = new NextResponse(
    `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>确认退出登录</title>
<style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:6rem auto;padding:0 1.5rem;line-height:1.7}
button{font:inherit;padding:.6rem 1.4rem;cursor:pointer}</style>
</head><body>
<h1>确认退出登录</h1>
<p>你的浏览器没有提供足以判断本次请求来源的信息，因此需要你手动确认一次，
以免被第三方页面在你不知情的情况下强制登出。</p>
<form method="POST">${hidden}<button type="submit">退出登录</button></form>
</body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
  res.headers.set("Cache-Control", "no-store");
  res.headers.set(
    "Vary",
    "Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-User, Origin",
  );
  return res;
}

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  const verdict = gateGet(req);
  if (verdict === "deny") return denied();
  if (verdict === "confirm") return confirmPage(req);
  return handle(req);
};

// 规范要求同时支持 POST（表单方式发起登出）。这里同时是确认页的提交目标。
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  if (!isSameOriginPost(req)) return denied();
  return handle(req);
};
