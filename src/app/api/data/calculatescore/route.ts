import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
  // Authorization check: Only authenticated admin users can perform score calculation.
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let jsonData;
  try {
    jsonData = await request.json();
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ message: "Invalid JSON input" }, { status: 400 });
  }

  const { userId } = jsonData;
  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    // Aggregate the sum of scoreEvents for the given user
    const aggregate = await prisma.scoreEvent.aggregate({
      _sum: {
        score: true,
      },
      where: { userId },
    });
    const newScore = aggregate._sum.score || 0;

    // Update the user's score
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { score: newScore },
    });

    return NextResponse.json({ message: "User score updated", updatedUser });
  } catch (error: any) {
    console.error("Error calculating user score:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
