// UAAA 登出完成后的落点。
//
// 为什么要绕这一跳，而不让 UAAA 直接跳回下游应用：
// UAAA 会校验 post_logout_redirect_uri 是否在**本应用**的 openid.logoutUrls
// 白名单里。让它直接跳回下游，就得把每一个下游的地址都登记进 UAAA ——
// 每接入一个新应用都要找 UAAA 管理员改配置。绕本站一跳，UAAA 那边只需要
// 登记这一个地址（LOGOUT_CALLBACK），下游的白名单由本站自己管。

import { NextRequest, NextResponse } from "next/server";

import { verifyLogoutState, withState } from "@/lib/oauth/logout-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const state = await verifyLogoutState(req.nextUrl.searchParams.get("state"));

  // state 缺失、过期或被篡改：登出这件事**已经发生了**（本站与 UAAA 的会话
  // 都已清掉），只是不知道该把用户送回哪。给一个明确的完成页而不是静默 404。
  if (!state?.redirectUri) {
    return NextResponse.json({
      logged_out: true,
      upstream_logout: true,
      note: "已登出。未提供有效的回跳地址，请手动返回原应用。",
    });
  }

  return NextResponse.redirect(
    withState(state.redirectUri, state.downstreamState),
    { status: 302 },
  );
}
