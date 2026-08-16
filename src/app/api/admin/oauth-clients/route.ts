// 管理端：下游应用（OAuth 客户端）列表与创建。仅管理员可访问。
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { randomToken, sha256 } from "@/lib/oauth/crypto";
import { SUPPORTED_SCOPES } from "@/lib/oauth/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// 列出所有客户端（不含 secret 哈希）。
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "未授权访问" }, { status: 403 });
  }
  const clients = await prisma.oAuthClient.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clientId: true,
      name: true,
      description: true,
      redirectUris: true,
      postLogoutRedirectUris: true,
      scopes: true,
      grantTypes: true,
      isConfidential: true,
      disabled: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ clients });
}

// 创建客户端，返回一次性明文 client_secret。
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "未授权访问" }, { status: 403 });
  }

  let payload: {
    name?: string;
    description?: string;
    redirectUris?: string[];
    postLogoutRedirectUris?: string[];
    scopes?: string[];
    isConfidential?: boolean;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const name = payload.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "缺少应用名称" }, { status: 400 });
  }

  const redirectUris = (payload.redirectUris ?? [])
    .map((u) => u.trim())
    .filter(Boolean);
  if (redirectUris.length === 0) {
    return NextResponse.json(
      { error: "至少需要一个回调地址 (redirect_uri)" },
      { status: 400 },
    );
  }
  // 回调地址必须是合法的绝对 URL。
  for (const u of redirectUris) {
    try {
      new URL(u);
    } catch {
      return NextResponse.json(
        { error: `回调地址不是合法 URL: ${u}` },
        { status: 400 },
      );
    }
  }

  // 登出后回跳地址白名单。可选 —— 不配就是「不允许带回跳地址登出」，
  // 登出本身照常执行。与 redirectUris 一样必须是合法绝对 URL 且精确匹配。
  const postLogoutRedirectUris = (payload.postLogoutRedirectUris ?? [])
    .map((u) => u.trim())
    .filter(Boolean);
  for (const u of postLogoutRedirectUris) {
    try {
      new URL(u);
    } catch {
      return NextResponse.json(
        { error: `登出回跳地址不是合法 URL: ${u}` },
        { status: 400 },
      );
    }
  }

  const scopes = (payload.scopes ?? ["openid", "profile", "email"]).filter(
    (s) => SUPPORTED_SCOPES.includes(s),
  );
  if (!scopes.includes("openid")) scopes.unshift("openid");

  const isConfidential = payload.isConfidential ?? true;

  const clientId = `phy_${randomToken(12)}`;
  const clientSecretPlain = randomToken(32);

  const created = await prisma.oAuthClient.create({
    data: {
      clientId,
      clientSecret: sha256(clientSecretPlain),
      name,
      description: payload.description?.trim() || null,
      redirectUris,
      postLogoutRedirectUris,
      scopes: Array.from(new Set(scopes)),
      isConfidential,
    },
    select: { id: true, clientId: true, name: true },
  });

  // client_secret 明文仅此一次返回，之后无法再次获取。
  return NextResponse.json({
    client: created,
    clientId,
    clientSecret: clientSecretPlain,
    notice: "请立即保存 client_secret，关闭后将无法再次查看。",
  });
}
