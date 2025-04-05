import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        realname: true,
      },
    });

    return NextResponse.json({
      success: true,
      users,
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
