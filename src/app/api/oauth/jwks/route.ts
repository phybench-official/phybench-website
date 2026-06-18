// JWKS 端点：对外发布 id_token 验签所需的公钥。
import { NextResponse } from "next/server";
import { getPublicJwks } from "@/lib/oauth/keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(getPublicJwks(), {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch (e) {
    console.error("JWKS 读取失败:", e);
    return NextResponse.json(
      { error: "server_error", error_description: "签名密钥未配置" },
      { status: 500 },
    );
  }
}
