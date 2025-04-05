import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const type = searchParams.get("type") || "score"; // 'score' 或 'problems'

    const skip = (page - 1) * pageSize;

    if (type === "score") {
      // 按积分排名
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          realname: true,
          score: true,
        },
        orderBy: [
          {
            score: "desc",
          },
          {
            createdAt: "asc",
          },
        ],
        skip,
        take: pageSize,
      });

      // 获取总记录数
      const totalCount = await prisma.user.count();

      return NextResponse.json({
        success: true,
        data: users,
        totalCount,
        hasMore: skip + users.length < totalCount,
      });
    } else {
      // 按题目数排名
      const usersWithProblemCount = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          realname: true,
          email: true,
          score: true,
          _count: {
            select: {
              problems: true,
            },
          },
        },
        orderBy: [
          {
            problems: {
              _count: "desc",
            },
          },
          {
            createdAt: "asc",
          },
        ],
        skip,
        take: pageSize,
      });

      const formattedUsers = usersWithProblemCount.map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        realname: user.realname,
        email: user.email,
        score: user.score,
        problemCount: user._count.problems,
      }));

      // 获取总记录数
      const totalCount = await prisma.user.count();

      return NextResponse.json({
        success: true,
        data: formattedUsers,
        totalCount,
        hasMore: skip + formattedUsers.length < totalCount,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "服务器错误，获取失败", error: String(error) },
      { status: 500 },
    );
  }
}
