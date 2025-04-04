import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST() {
  // Only allow authenticated admin users
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Retrieve all ScoreEvents with tag EXAMINE, non-null problemStatus, and linked to a problem
    const scoreEvents = await prisma.scoreEvent.findMany({
      where: {
        tag: "EXAMINE",
        problemStatus: { not: null },
        problemId: { not: null },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by problemId, taking the most recent event for each problem
    const groupedEvents = new Map<number, typeof scoreEvents[0]>();
    for (const event of scoreEvents) {
      if (event.problemId && !groupedEvents.has(event.problemId)) {
        groupedEvents.set(event.problemId, event);
      }
    }

    // Update each corresponding Problem with the examination opinion data
    const updateResults = [];
    for (const [problemId, event] of groupedEvents) {
      const updated = await prisma.problem.update({
        where: { id: problemId },
        data: {
          status: event.problemStatus!,        // Sync problemStatus
          score: event.problemScore,            // Sync problemScore
          remark: event.problemRemark,          // Sync problemRemark
          nominated: event.problemNominated,    // Sync problemNominated
        },
      });
      updateResults.push(updated);
    }

    return NextResponse.json({ message: "Sync complete", updated: updateResults });
  } catch (error: any) {
    console.error("Error syncing examination opinion:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
