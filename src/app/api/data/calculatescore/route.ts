import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST() {
  // Authorization check: Only authenticated admin users can perform score calculation.
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all users from the database.
    const users = await prisma.user.findMany();
    const results = [];

    // For each user, aggregate their scoreEvents and update the user's score.
    for (const user of users) {
      const aggregate = await prisma.scoreEvent.aggregate({
        _sum: {
          score: true,
        },
        where: { userId: user.id },
      });
      const newScore = aggregate._sum.score || 0;

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { score: newScore },
      });
      results.push(updatedUser);
    }

    return NextResponse.json({ message: "User scores updated", results });
  } catch (error: any) {
    console.error("Error calculating scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
