import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { ProblemStatus } from "@prisma/client";

export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { problemId, remark, status, score, nominated } = body;

    // 根据问题id查找问题
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        examiners: true,
      },
    });

    if (!problem) {
      return NextResponse.json({ message: "未找到问题" }, { status: 404 });
    }

    // 数据验证
    if (!problemId || !status || score === undefined) {
      return NextResponse.json({ message: "缺少必要字段" }, { status: 400 });
    }

    // 后端鉴权
    let isExaminer = false;
    for (const examiner of problem.examiners) {
      if (examiner.email === session.user.email) {
        isExaminer = true;
        break;
      }
    }
    if (!isExaminer) {
      return NextResponse.json({ message: "Unpermitted" }, { status: 401 });
    }

    // 更新题目记录
    const updatedProblem = await prisma.problem.update({
      where: {
        id: problemId,
      },
      data: {
        remark: remark || null,
        status: status in ProblemStatus ? status : ProblemStatus.PENDING, // 确保状态有效
        score: score !== undefined ? score : null,
        nominated: nominated,
      },
    });

    return NextResponse.json({
      success: true,
      message: "问题更新成功",
      problemId: updatedProblem.id,
    });
  } catch (error) {
    console.error("更新问题时出错:", error);
    return NextResponse.json(
      {
        message: "服务器错误，更新失败",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
