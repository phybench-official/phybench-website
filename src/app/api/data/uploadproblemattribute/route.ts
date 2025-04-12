import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let jsonData;
  try {
    jsonData = await request.json();
  } catch (error) {
    console.error("解析json时出错:", error);
    return NextResponse.json(
      { message: "Invalid JSON input" },
      { status: 400 },
    );
  }

  if (!Array.isArray(jsonData)) {
    return NextResponse.json(
      { message: "Invalid data format. Expected an array." },
      { status: 400 },
    );
  }

  try {
    const results = await Promise.all(
      jsonData.map(async (item: any) => {
        const {
          id,
          translatedContent,
          translatedSolution,
          title,
          answer,
          remark,
          aiPerformances,
        } = item;

        // 检查 id 是否存在
        if (!id) {
          return { id, success: false, error: "ID is required" };
        }

        // 检查 aiPerformances 是否为列表
        if (!Array.isArray(aiPerformances)) {
          return { success: false, error: "aiPerformance should be an array" };
        }

        // 准备更新的数据对象
        const updateData: any = {};
        if (typeof translatedContent === "string") {
          updateData.translatedContent = translatedContent;
        }
        if (typeof translatedSolution === "string") {
          updateData.translatedSolution = translatedSolution;
        }
        if (typeof title === "string") {
          updateData.title = title;
        }
        if (typeof answer === "string") {
          updateData.answer = answer;
        }
        if (typeof remark === "string") {
          updateData.remark = remark;
        }

        // 如果没有要更新的字段，返回相应结果
        if (
          Object.keys(updateData).length === 0 &&
          aiPerformances.length === 0
        ) {
          return { id, success: false, error: "No valid fields to update" };
        }

        try {
          // 更新数据库中的问题记录，依据提供的字段
          await prisma.problem.update({
            where: { id },
            data: updateData,
          });

          // 创建 AI 表现逐条处理
          for (const performance of aiPerformances) {
            const { aiName, aiSolution, aiAnswer, isCorrect, comment } =
              performance;

            // 检查 AI 表现字段有效性
            if (
              typeof aiName === "string" &&
              typeof aiSolution === "string" &&
              typeof aiAnswer === "string" &&
              (isCorrect === "Yes" || isCorrect === "No")
            ) {
              try {
                await prisma.aiPerformance.create({
                  data: {
                    problemId: id,
                    aiName: aiName,
                    aiSolution: aiSolution,
                    aiAnswer: aiAnswer,
                    isCorrect: isCorrect === "Yes",
                    comment: comment,
                  },
                });
              } catch (error: any) {
                console.error(
                  `Error creating AI performance for problem id ${id}:`,
                  error,
                );
                return {
                  id,
                  success: false,
                  error: `Failed to create AI performance: ${error.message}`,
                };
              }
            } else {
              return {
                id,
                success: false,
                error: "Invalid AI performance data",
              };
            }
          }

          return { id, success: true };
        } catch (error: any) {
          console.error(`Error updating problem id ${id}:`, error);
          return { id, success: false, error: error.message };
        }
      }),
    );

    return NextResponse.json({ message: "Upload processed", results });
  } catch (error: any) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
