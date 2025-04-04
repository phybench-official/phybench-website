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
    return NextResponse.json({ message: "Invalid JSON input" }, { status: 400 });
  }

  const { userId, score, tag } = jsonData;
  if (!userId || score === undefined || score === null || !tag) {
    return NextResponse.json(
      { message: "User ID, score, and tag are required" },
      { status: 400 }
    );
  }

  try {
    const newScoreEvent = await prisma.scoreEvent.create({
      data: {
        userId,
        score,
        tag,
      },
    });
    return NextResponse.json({ message: "Score event created", newScoreEvent });
  } catch (error: any) {
    console.error("Error creating score event:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
