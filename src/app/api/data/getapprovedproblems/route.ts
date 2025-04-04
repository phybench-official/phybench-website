import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const approvedProblems = await prisma.problem.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        content: true,
        solution: true,
        answer: true,
      },
    });
    return NextResponse.json(approvedProblems);
  } catch (error) {
    console.error("Error fetching approved problems:", error);
    return NextResponse.error();
  }
}
