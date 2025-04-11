import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

// 获取所有用户及其角色
export async function GET() {
  try {
    // 验证是否为管理员
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权访问" }, { status: 403 });
    }

    // 获取所有用户（按排序顺序：先管理员，再按邮箱字母排序）
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        realname: true,
        role: true,
      },
      orderBy: [
        { role: "desc" }, // admin 会排在 user 前面
        { email: "asc" },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 });
  }
}

// 更改用户角色
export async function POST(req: NextRequest) {
  try {
    // 验证是否为管理员
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权访问" }, { status: 403 });
    }

    const { userId, role } = await req.json();

    // 数据验证
    if (!userId || !["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "参数无效" }, { status: 400 });
    }

    // 不允许自己降级自己的权限（避免系统中没有管理员的情况）
    if (session.user.id === userId && role !== "admin") {
      return NextResponse.json(
        { error: "不能降级自己的权限" },
        { status: 400 },
      );
    }

    // 更新用户角色
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        realname: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "用户角色已更新",
      user: updatedUser,
    });
  } catch (error) {
    console.error("更改用户角色失败:", error);
    return NextResponse.json({ error: "更改用户角色失败" }, { status: 500 });
  }
}
