import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

// 导入 ProblemTag 枚举
import { ProblemTag } from "@prisma/client"; // 确保路径正确

// 定义 Problem 类型
interface Problem {
  id: number;
}

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      mechanicsExamineProblemIds,
      electricityExamineProblemIds,
      thermodynamicsExamineProblemIds,
      opticsExamineProblemIds,
      modernExamineProblemIds,
      advancedExamineProblemIds,
    } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "用户ID缺失" }, { status: 400 });
    }

    // 查找用户并包括 examineProblems
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { examineProblems: true },
    });

    if (!user) {
      return NextResponse.json({ message: "用户未找到" }, { status: 404 });
    }

    // 获取各种类问题的通用函数
    const getProblemsByTag = async (tag: ProblemTag) => {
      // 修改为 ProblemTag
      return await prisma.problem.findMany({
        where: { tag: tag, status: "PENDING" },
        select: { id: true },
        orderBy: { id: "asc" }, // 按 id 升序排序
      });
    };

    // 获取并打印每类问题的长度
    const mechanicsProblems = await getProblemsByTag(ProblemTag.MECHANICS);
    // console.log("Mechanics Problems 的长度:", mechanicsProblems.length);
    // console.log(
    //   "Mechanics ExamineProblemIds 的长度:",
    //   mechanicsExamineProblemIds.length
    // );

    const electricityProblems = await getProblemsByTag(ProblemTag.ELECTRICITY);
    // console.log("Electricity Problems 的长度:", electricityProblems.length);
    // console.log(
    //   "Electricity ExamineProblemIds 的长度:",
    //   electricityExamineProblemIds.length
    // );

    const thermodynamicsProblems = await getProblemsByTag(
      ProblemTag.THERMODYNAMICS,
    );
    // console.log(
    //   "Thermodynamics Problems 的长度:",
    //   thermodynamicsProblems.length
    // );
    // console.log(
    //   "Thermodynamics ExamineProblemIds 的长度:",
    //   thermodynamicsExamineProblemIds.length
    // );

    const opticsProblems = await getProblemsByTag(ProblemTag.OPTICS);
    // console.log("Optics Problems 的长度:", opticsProblems.length);
    // console.log(
    //   "Optics ExamineProblemIds 的长度:",
    //   opticsExamineProblemIds.length
    // );

    const modernProblems = await getProblemsByTag(ProblemTag.MODERN);
    // console.log("Modern Problems 的长度:", modernProblems.length);
    // console.log(
    //   "Modern ExamineProblemIds 的长度:",
    //   modernExamineProblemIds.length
    // );

    const advancedProblems = await getProblemsByTag(ProblemTag.ADVANCED);
    // console.log("Advanced Problems 的长度:", advancedProblems.length);
    // console.log(
    //   "Advanced ExamineProblemIds 的长度:",
    //   advancedExamineProblemIds.length
    // );

    const updatedExamineProblems: Problem[] = [];

    // 更新问题
    const allProblems = [
      { ids: mechanicsExamineProblemIds, problems: mechanicsProblems },
      { ids: electricityExamineProblemIds, problems: electricityProblems },
      {
        ids: thermodynamicsExamineProblemIds,
        problems: thermodynamicsProblems,
      },
      { ids: opticsExamineProblemIds, problems: opticsProblems },
      { ids: modernExamineProblemIds, problems: modernProblems },
      { ids: advancedExamineProblemIds, problems: advancedProblems },
    ];

    allProblems.forEach(({ ids, problems }) => {
      ids.forEach((id: number) => {
        const index = id - 1; // 将 ID 转换为数组索引
        if (index >= 0 && index < problems.length) {
          const problem = problems[index]; // 使用索引获取问题
          updatedExamineProblems.push(problem);
        } else {
          return NextResponse.json(
            { message: "服务器错误，更新失败，索引超出范围" },
            { status: 500 },
          );
        }
      });
    });
    // 解除所有连接
    await prisma.user.update({
      where: { id: userId },
      data: {
        examineProblems: {
          disconnect: user.examineProblems.map((problem) => ({
            id: problem.id,
          })),
        },
      },
    });

    // 更新连接问题
    console.log(
      "updatedExamineProblems 的长度:",
      updatedExamineProblems.length,
    );
    for (const problem of updatedExamineProblems) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          examineProblems: {
            connect: { id: problem.id },
          },
        },
      });
    }

    return NextResponse.json({ success: true, message: "审核问题更新成功" });
  } catch (error) {
    console.error("更新审核问题时出错:", error);
    return NextResponse.json(
      { message: "服务器错误，更新失败" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
