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
      mechanicsTranslateProblemIds,
      electricityTranslateProblemIds,
      thermodynamicsTranslateProblemIds,
      opticsTranslateProblemIds,
      modernTranslateProblemIds,
      advancedTranslateProblemIds,
    } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "用户ID缺失" }, { status: 400 });
    }

    // 查找用户并包括 translateProblems
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { translateProblems: true },
    });

    if (!user) {
      return NextResponse.json({ message: "用户未找到" }, { status: 404 });
    }

    // 获取各种类问题的通用函数
    const getProblemsByTag = async (tag: ProblemTag) => {
      return await prisma.problem.findMany({
        where: { tag: tag, translatedStatus: "PENDING" },
        select: { id: true },
        orderBy: { id: "asc" }, // 按 id 升序排序
  });
};

    // 获取并打印每类问题的长度
    const mechanicsProblems = await getProblemsByTag(ProblemTag.MECHANICS);
    // console.log("Mechanics Problems 的长度:", mechanicsProblems.length);
    // console.log(
    //   "Mechanics TranslateProblemIds 的长度:",
    //   mechanicsTranslateProblemIds.length
    // );

    const electricityProblems = await getProblemsByTag(ProblemTag.ELECTRICITY);
    // console.log("Electricity Problems 的长度:", electricityProblems.length);
    // console.log(
    //   "Electricity TranslateProblemIds 的长度:",
    //   electricityTranslateProblemIds.length
    // );

    const thermodynamicsProblems = await getProblemsByTag(
      ProblemTag.THERMODYNAMICS
    );
    // console.log(
    //   "Thermodynamics Problems 的长度:",
    //   thermodynamicsProblems.length
    // );
    // console.log(
    //   "Thermodynamics TranslateProblemIds 的长度:",
    //   thermodynamicsTranslateProblemIds.length
    // );

    const opticsProblems = await getProblemsByTag(ProblemTag.OPTICS);
    // console.log("Optics Problems 的长度:", opticsProblems.length);
    // console.log(
    //   "Optics TranslateProblemIds 的长度:",
    //   opticsTranslateProblemIds.length
    // );

    const modernProblems = await getProblemsByTag(ProblemTag.MODERN);
    // console.log("Modern Problems 的长度:", modernProblems.length);
    // console.log(
    //   "Modern TranslateProblemIds 的长度:",
    //   modernTranslateProblemIds.length
    // );

    const advancedProblems = await getProblemsByTag(ProblemTag.ADVANCED);
    // console.log("Advanced Problems 的长度:", advancedProblems.length);
    // console.log(
    //   "Advanced TranslateProblemIds 的长度:",
    //   advancedTranslateProblemIds.length
    // );

    const updatedTranslateProblems: Problem[] = [];

    // 更新问题
    const allProblems = [
      { ids: mechanicsTranslateProblemIds, problems: mechanicsProblems },
      { ids: electricityTranslateProblemIds, problems: electricityProblems },
      {
        ids: thermodynamicsTranslateProblemIds,
        problems: thermodynamicsProblems,
      },
      { ids: opticsTranslateProblemIds, problems: opticsProblems },
      { ids: modernTranslateProblemIds, problems: modernProblems },
      { ids: advancedTranslateProblemIds, problems: advancedProblems },
    ];

    allProblems.forEach(({ ids, problems }) => {
      ids.forEach((id: number) => {
        const index = id - 1; // 将 ID 转换为数组索引
        if (index >= 0 && index < problems.length) {
          const problem = problems[index]; // 使用索引获取问题
          updatedTranslateProblems.push(problem);
        } else {
          return NextResponse.json(
            { message: "服务器错误，更新失败，索引超出范围" },
            { status: 500 }
          );
        }
      });
    });
    // 解除所有连接
    await prisma.user.update({
      where: { id: userId },
      data: {
        translateProblems: {
          disconnect: user.translateProblems.map((problem) => ({
            id: problem.id,
          })),
        },
      },
    });

    // 更新连接问题
    console.log(
      "updatedTranslateProblems 的长度:",
      updatedTranslateProblems.length
    );
    for (const problem of updatedTranslateProblems) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          translateProblems: {
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
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
