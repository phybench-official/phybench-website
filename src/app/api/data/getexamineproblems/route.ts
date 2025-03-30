import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "用户ID缺失" }, { status: 400 });
    }

    const problems = await prisma.problem.findMany({
      where: {
        examiners: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      problems,
    });
  } catch (error) {
    console.error("获取题目时出错:", error);
    return NextResponse.json(
      {
        message: "服务器错误，获取失败",
      },
      { status: 500 }
    );
  }
}
