import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST() {
  // 1. 鉴权，只允许登录用户（或管理员）调用
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. 批量更新
    const result = await prisma.problem.updateMany({
      where: {
        translatedStatus: "ARCHIVED",
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
      },
    });

    // 3. 返回更新数量
    return NextResponse.json({
      message: "Bulk update complete",
      updatedCount: result.count,
    });
  } catch (error: any) {
    console.error("Error updating problems:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
