import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { ProblemTag } from "@prisma/client";

// 获取特定题目的信息
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const problemId = parseInt(id);
    if (isNaN(problemId)) {
      return NextResponse.json(
        { message: "无效的题目ID" },
        { status: 400 }
      );
    }

    // 获取题目及其关联数据
    const problem = await prisma.problem.findUnique({
      where: {
        id: problemId,
      },
      include: {
        variables: true,
        aiPerformances: {
          where: {
            tag: "SUBMITTED" // 只获取用户提交的AI表现
          }
        }
      }
    });

    if (!problem) {
      return NextResponse.json(
        { message: "未找到题目" },
        { status: 404 }
      );
    }

    const currentUserId = await prisma.user.findUnique({
      where: {
        email: session.user.email || ""
      },
      select: {
        id: true
      }
    }).then((user) => user?.id);

    // 验证用户权限（只有题目创建者或审核员可以编辑）
    if (currentUserId !== problem.userId) {
      // 检查用户是否为审核员
      const isExaminer = await prisma.problem.findFirst({
        where: {
          id: problemId,
          examiners: {
            some: {
              id: currentUserId
            }
          }
        }
      });

      if (!isExaminer && session.user.role !== "admin") {
        return NextResponse.json(
          { message: "没有权限编辑此题目" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(problem);
  } catch (error) {
    console.error("获取题目信息时出错:", error);
    return NextResponse.json(
      { message: "服务器错误，获取失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 更新特定题目
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const problemId = parseInt(id);
    if (isNaN(problemId)) {
      return NextResponse.json(
        { message: "无效的题目ID" },
        { status: 400 }
      );
    }

    // 查找题目
    const existingProblem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        variables: true, 
        aiPerformances: {
          where: { tag: "SUBMITTED" }
        }
      }
    });

    if (!existingProblem) {
      return NextResponse.json(
        { message: "未找到题目" },
        { status: 404 }
      );
    }
    const currentUserId = await prisma.user.findUnique({
      where: {
        email: session.user.email || ""
      },
      select: {
        id: true
      }
    }).then((user) => user?.id);

    // 验证用户权限（只有题目创建者或审核员可以编辑）
    if (existingProblem.userId !== currentUserId) {
      // 检查用户是否为审核员
      const isExaminer = await prisma.problem.findFirst({
        where: {
          id: problemId,
          examiners: {
            some: {
              id: currentUserId
            }
          }
        }
      });

      if (!isExaminer && session.user.role !== "admin") {
        return NextResponse.json(
          { message: "没有权限编辑此题目" },
          { status: 403 }
        );
      }
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

    // 更新题目基本信息
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        title,
        tag,
        description,
        note,
        offererEmail,
        source: source || null,
        content: problem,
        solution,
        answer,
        status: "PENDING", // 更新后重置为待审核状态
        updatedAt: new Date(),
      },
    });

    // 处理变量 - 删除现有变量然后重新创建
    if (existingProblem.variables.length > 0) {
      await prisma.problemVariable.deleteMany({
        where: {
          problemId,
        },
      });
    }

    // 创建新变量记录
    if (variables && variables.length > 0) {
      await Promise.all(
        variables.map(async (variable: any) => {
          await prisma.problemVariable.create({
            data: {
              problemId,
              name: variable.name,
              lowerBound: parseFloat(variable.min) || 0,
              upperBound: parseFloat(variable.max) || 0,
            },
          });
        })
      );
    }

    // 处理AI表现 - 删除现有AI表现然后重新创建
    if (existingProblem.aiPerformances.length > 0) {
      await prisma.aiPerformance.deleteMany({
        where: {
          problemId,
          tag: "SUBMITTED",
        },
      });
    }

    // 创建新的AI表现记录
    if (aiResponses && aiResponses.length > 0) {
      await Promise.all(
        aiResponses.map(async (response: any) => {
          await prisma.aiPerformance.create({
            data: {
              problemId,
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
      message: "题目更新成功",
      problemId,
    });
  } catch (error) {
    console.error("更新题目时出错:", error);
    return NextResponse.json(
      { message: "服务器错误，更新失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
