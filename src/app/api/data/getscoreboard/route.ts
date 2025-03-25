import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    // 检查数据库中积分字段是否存在
    // console.log("正在获取所有用户...");
    // const sampleUser = await prisma.user.findFirst({
    //   select: {
    //     id: true,
    //     name: true,
    //     score: true,
    //   }
    // });
    // console.log("样本用户:", sampleUser);

    // 获取按积分排序的用户列表 - 不过滤积分为0的用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        realname: true,
        username: true,
        score: true,
        // 移除 image 字段，不再返回可能导致问题的外部图片URL
      },
      orderBy: {
        score: 'desc',
      },
      skip,
      take: limit,
    });

    // 获取用户总数
    const total = await prisma.user.count();
    // 仅计算积分大于0的用户数（不影响主列表显示）
    const activeUsers = await prisma.user.count({
      where: {
        score: {
          gt: 0
        }
      }
    });

    // 计算总页数
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      users,
      total,
      activeUsers,
      totalPages,
      currentPage: page,
      pageSize: limit
    });
  } catch (error) {
    console.error("获取积分榜时出错:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误，获取失败", error: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}