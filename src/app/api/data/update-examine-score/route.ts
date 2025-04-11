import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
  try {
    const { score } = await request.json();

    if (typeof score !== "number" || isNaN(score)) {
      return NextResponse.json(
        { message: "Invalid score value" },
        { status: 400 },
      );
    }

    // 更新所有 tag 为 EXAMINE 的 scoreEvent
    await prisma.scoreEvent.updateMany({
      where: { tag: "EXAMINE" },
      data: { score },
    });



    return NextResponse.json({ message: "Score updated successfully" });
  } catch (error: any) {
    console.error("Error updating examine scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}