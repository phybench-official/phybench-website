// 管理端：单个客户端的更新（禁用/启用、改回调与 scope）与删除。仅管理员可访问。
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { SUPPORTED_SCOPES } from "@/lib/oauth/config";
import { validateClientUri } from "@/lib/oauth/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "未授权访问" }, { status: 403 });
  }
  const { id } = await params;

  let payload: {
    disabled?: boolean;
    name?: string;
    description?: string;
    redirectUris?: string[];
    postLogoutRedirectUris?: string[];
    scopes?: string[];
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof payload.disabled === "boolean") data.disabled = payload.disabled;
  if (typeof payload.name === "string" && payload.name.trim())
    data.name = payload.name.trim();
  if (typeof payload.description === "string")
    data.description = payload.description.trim() || null;

  // 每个字段都以 Array.isArray 为门卫：请求里没带的 key 一律不进 data，
  // 也就不会被重新校验。这既是「老界面不会误清空新字段」的保证，也意味着
  // 收紧协议校验不会波及未改动的历史值 —— 但改动时提交的是整个数组（含未变的
  // 条目），所以 validateClientUri 仍必须放行 http://localhost。
  if (Array.isArray(payload.redirectUris)) {
    const uris = payload.redirectUris.map((u) => u.trim()).filter(Boolean);
    for (const u of uris) {
      const bad = validateClientUri(u);
      if (bad) {
        return NextResponse.json(
          { error: `回调地址不可用（${bad}）: ${u}` },
          { status: 400 },
        );
      }
    }
    if (uris.length === 0) {
      return NextResponse.json(
        { error: "至少需要一个回调地址" },
        { status: 400 },
      );
    }
    data.redirectUris = uris;
  }

  // 登出回跳白名单：允许清空（传空数组 = 收回该客户端带回跳登出的能力）。
  if (Array.isArray(payload.postLogoutRedirectUris)) {
    const uris = payload.postLogoutRedirectUris
      .map((u) => u.trim())
      .filter(Boolean);
    for (const u of uris) {
      const bad = validateClientUri(u);
      if (bad) {
        return NextResponse.json(
          { error: `登出回跳地址不可用（${bad}）: ${u}` },
          { status: 400 },
        );
      }
    }
    data.postLogoutRedirectUris = uris;
  }

  if (Array.isArray(payload.scopes)) {
    const scopes = payload.scopes.filter((s) => SUPPORTED_SCOPES.includes(s));
    if (!scopes.includes("openid")) scopes.unshift("openid");
    data.scopes = Array.from(new Set(scopes));
  }

  try {
    const updated = await prisma.oAuthClient.update({
      where: { id },
      data,
      select: {
        id: true,
        clientId: true,
        name: true,
        description: true,
        redirectUris: true,
        // 写得进去却读不回来，排查时会误以为没保存成功
        postLogoutRedirectUris: true,
        scopes: true,
        isConfidential: true,
        disabled: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ client: updated });
  } catch {
    return NextResponse.json({ error: "客户端不存在" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "未授权访问" }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.oAuthClient.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "客户端不存在" }, { status: 404 });
  }
}
