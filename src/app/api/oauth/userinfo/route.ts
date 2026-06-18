// OIDC userinfo 端点。下游用 Bearer access token 换取按 scope 过滤后的身份声明。
import { NextResponse } from "next/server";
import { resolveAccessToken, buildClaims } from "@/lib/oauth/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized(description: string) {
  return NextResponse.json(
    { error: "invalid_token", error_description: description },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": `Bearer error="invalid_token", error_description="${description}"`,
        "Cache-Control": "no-store",
      },
    },
  );
}

async function handle(req: Request) {
  const authz = req.headers.get("authorization");
  if (!authz || !authz.toLowerCase().startsWith("bearer ")) {
    return unauthorized("缺少 Bearer access token");
  }
  const token = authz.slice(7).trim();
  const record = await resolveAccessToken(token);
  if (!record) {
    return unauthorized("access token 无效或已过期");
  }

  const claims = buildClaims(record.user, record.scope);
  return NextResponse.json(claims, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
