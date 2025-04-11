import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag") || undefined;
  const status = searchParams.get("status") || undefined;
  const translatedStatus = searchParams.get("translatedStatus") || undefined;
  const nominated = searchParams.get("nominated") || undefined;
  const aiPerformancesParam = searchParams.get("aiPerformances") || undefined;

  // Build the basic where clause.
  const where: any = {
    ...(status ? { status } : {}),
    ...(tag ? { tag } : {}),
    ...(translatedStatus ? { translatedStatus } : {}),
    ...(nominated ? { nominated } : {}),
  };

  // If the aiPerformances filter equals "0", return only problems with no aiPerformances.
  if (aiPerformancesParam === "0") {
    where.aiPerformances = { none: {} };
  }

  try {
    const problems = await prisma.problem.findMany({
      where,
      select: {
        id: true,
        content: true,
        solution: true,
        answer: true,
      },
    });
    return NextResponse.json(problems);
  } catch (error: any) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
