import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { ProblemTag } from "@prisma/client";

export async function POST(req: NextRequest) {
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
    const {
      title,
      source,
      selectedType,
      description,
      note,
      offererEmail,
      problem,
      solution,
      answer,
      variables,
      aiResponses,
    } = body;

    // 数据验证
    if (
      !title ||
      !problem ||
      !solution ||
      !answer ||
      !selectedType ||
      !description
    ) {
      return NextResponse.json({ message: "缺少必要字段" }, { status: 400 });
    }

    // 将selectedType转换为ProblemTag枚举
    let tag: ProblemTag;
    switch (selectedType) {
      case "力学":
        tag = ProblemTag.MECHANICS;
        break;
      case "电磁学":
        tag = ProblemTag.ELECTRICITY;
        break;
      case "热学":
        tag = ProblemTag.THERMODYNAMICS;
        break;
      case "光学":
        tag = ProblemTag.OPTICS;
        break;
      case "近代物理":
        tag = ProblemTag.MODERN;
        break;
      case "四大力学及以上知识":
        tag = ProblemTag.ADVANCED;
        break;
      default:
        tag = ProblemTag.OTHER;
    }

    // 使用查找到的 userId 创建问题记录
    const createdProblem = await prisma.problem.create({
      data: {
        userId: dbUser.id, // 使用数据库中的用户ID
        title,
        tag,
        description,
        note,
        offererEmail,
        source: source || null,
        content: problem,
        solution,
        answer,
        status: "PENDING",
      },
    });

    // 创建变量记录
    if (variables && variables.length > 0) {
      await Promise.all(
        variables.map(async (variable: any) => {
          await prisma.problemVariable.create({
            data: {
              problemId: createdProblem.id,
              name: variable.name,
              lowerBound: parseFloat(variable.min) || 0,
              upperBound: parseFloat(variable.max) || 0,
            },
          });
        })
      );
    }

    // 创建AI表现记录
    if (aiResponses && aiResponses.length > 0) {
      await Promise.all(
        aiResponses.map(async (response: any) => {
          await prisma.aiPerformance.create({
            data: {
              problemId: createdProblem.id,
              aiName: response.name,
              aiSolution: response.process,
              aiAnswer: response.answer,
              isCorrect: response.correctness === "correct",
              comment: response.comment || null,
              tag: "SUBMITTED",
            },
          });
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: "问题提交成功",
      problemId: createdProblem.id,
    });
  } catch (error) {
    console.error("提交问题时出错:", error);
    return NextResponse.json(
      {
        message: "服务器错误，提交失败",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
