import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
  // Authorization: Only allow authenticated admin users.
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let jsonData;
  try {
    jsonData = await request.json();
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json(
      { message: "Invalid JSON input" },
      { status: 400 },
    );
  }

  const { problemId, translatedContent, translatedSolution, translatedStatus } =
    jsonData;
  if (!problemId) {
    return NextResponse.json(
      { message: "problemId is required" },
      { status: 400 },
    );
  }

  // Build update object with the provided fields.
  // 新增状态字段处理
  if (typeof translatedStatus === "string") {
    if (!["ARCHIVED", "PENDING"].includes(translatedStatus)) {
      return NextResponse.json(
        { message: "Invalid translatedStatus value" },
        { status: 400 },
      );
    }
  }

  const updateData: {
    translatedContent?: string;
    translatedSolution?: string;
    translatedStatus?: any;
  } = {};

  if (translatedContent !== undefined) {
    updateData.translatedContent = translatedContent;
  }

  if (translatedSolution !== undefined) {
    updateData.translatedSolution = translatedSolution;
  }

  if (translatedStatus !== undefined) {
    updateData.translatedStatus = translatedStatus;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { message: "No translation fields provided" },
      { status: 400 },
    );
  }

  try {
    const updatedProblem = await prisma.problem.update({
      where: { id: problemId },
      data: updateData,
    });
    return NextResponse.json({
      message: "Translation updated",
      updatedProblem,
    });
  } catch (error: any) {
    console.error("Error updating translation:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
