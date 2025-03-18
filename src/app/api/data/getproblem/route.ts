import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json(
        { message: "用户邮箱缺失，无法确认用户身份" },
        { status: 400 }
      );
    }

    // 根据邮箱查找用户
    const dbUser = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "未找到用户记录" }, { status: 404 });
    }

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page")) || 1; // 默认页码为1
    const limit = Number(url.searchParams.get("limit")) || 10; // 默认每页问题数量为10
    const skip = (page - 1) * limit; // 计算跳过的记录数

    let problems;

    // 根据用户角色返回不同的问题
    if (dbUser.role === "admin") {
      // 如果是管理员，获取所有问题
      problems = await prisma.problem.findMany({
        // select: {
        //   remark: true,
        // },
        skip,
        take: limit,
      });
    } else if (dbUser.role === "user") {
      // 如果是普通用户，获取该用户的问题
      problems = await prisma.problem.findMany({
        // select: {
        //   remark: true,
        // },
        where: {
          userId: dbUser.id,
        },
        skip,
        take: limit,
      });
    } else {
      return NextResponse.json({ message: "未知用户角色" }, { status: 403 });
    }

    // 获取问题总数
    const totalProblems = await prisma.problem.count({
      where: dbUser.role === "user" ? { userId: dbUser.id } : {},
    });

    return NextResponse.json({
      success: true,
      problems,
      total: totalProblems,
    });
  } catch (error) {
    console.error("获取问题时出错:", error);
    return NextResponse.json(
      {
        message: "服务器错误，获取失败",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
