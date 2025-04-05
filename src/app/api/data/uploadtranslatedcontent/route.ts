import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
  // Authorization check: Only authenticated admin users can update translated content.
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
        const { id, translatedContent, translatedSolution } = item;
        if (
          !id ||
          typeof translatedContent !== "string" ||
          typeof translatedSolution !== "string"
        ) {
          return { id, success: false, error: "Invalid data" };
        }
        try {
          await prisma.problem.update({
            where: { id },
            data: { translatedContent, translatedSolution },
          });
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
