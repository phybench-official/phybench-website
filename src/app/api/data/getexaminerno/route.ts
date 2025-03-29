import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userEmail, problemId } = await req.json();

    if (!problemId) {
      return NextResponse.json({ message: "缺少题目ID" }, { status: 400 });
    }

    // 根据 problemId 查找题目
    const dbProblem = await prisma.problem.findUnique({
      where: {
        id: Number(problemId),
      },
      select: {
        examiners: {
          select: { id: true },
        },
        scoreEvents: {
          select: {
            tag: true,
            userId: true,
            problemStatus: true,
            problemScore: true,
            problemRemark: true,
            problemNominated: true,
          },
        },
      },
    });

    if (!dbProblem) {
      return NextResponse.json({ message: "未找到题目记录" }, { status: 404 });
    }

    if (!userEmail) {
      return NextResponse.json({ message: "缺少用户邮箱" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { message: "未找到邮箱对应的用户" },
        { status: 404 }
      );
    }

    const userId = dbUser.id;

    if (!userId) {
      return NextResponse.json({ message: "缺少用户ID" }, { status: 400 });
    }

    // 后端鉴权，只有管理员/此时在examiners列表中的用户才能审核
    const examinersIndex = dbProblem.examiners.findIndex(
      (examiner) => examiner.id === userId
    );

    if (examinersIndex === -1 && session.user.role !== "admin") {
      return NextResponse.json(
        { message: "您没有权限审核此题，请联系管理员" },
        { status: 403 }
      );
    }

    // 查找 scoreEvents 中是否存在符合条件的事件
    const index = dbProblem.scoreEvents.findIndex(
      (event) => event.tag === "EXAMINE" && event.userId === userId
    );

    if (index !== -1) {
      // 如果存在，返回其编号（index + 1）
      return NextResponse.json({
        examinerNo: index + 1,
        examinerAssignedStatus: dbProblem.scoreEvents[index].problemStatus,
        examinerAssignedScore: dbProblem.scoreEvents[index].problemScore,
        examinerRemark: dbProblem.scoreEvents[index].problemRemark,
        examinerNominated: dbProblem.scoreEvents[index].problemNominated,
      });
    } else {
      // 如果不存在，创建一个新的 ScoreEvent
      const newScoreEvent = await prisma.scoreEvent.create({
        data: {
          tag: "EXAMINE",
          score: 1,
          userId: userId,
          problemId: Number(problemId),
          problemStatus: "PENDING",
          problemScore: 0,
          problemRemark: "",
          problemNominated: "No",
        },
      });

      // 返回新创建的事件的编号（假设你想要返回的是最后一个事件的编号）
      return NextResponse.json({
        examinerNo: dbProblem.scoreEvents.length + 1,
        examinerAssignedStatus: "PENDING",
        examinerAssignedScore: 0,
        examinerRemark: "",
        examinerNominated: "No",
      });
    }
  } catch (error) {
    console.error("获取用户时出错:", error);
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
