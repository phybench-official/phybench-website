import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userID");

    if (!userId) {
      return NextResponse.json({ message: "缺少用户ID" }, { status: 400 });
    }

    // 根据 userID 查找用户
    const dbUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "未找到用户记录" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: dbUser,
    });
  } catch (error) {
    console.error("获取用户时出错:", error);
    return NextResponse.json(
      {
        message: "服务器错误，获取失败",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
