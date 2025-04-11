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

    // For each user, clear their examine problems.
    for (const user of users) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          examineProblems: {
            set: [],
          },
        },
      });
      results.push(updatedUser);
    }

    return NextResponse.json({ message: "User scores updated", results });
  } catch (error: any) {
    console.error("Error clearing:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
