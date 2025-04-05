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
    const groupedEvents = new Map<number, (typeof scoreEvents)[0]>();
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
          status: event.problemStatus!, // Sync problemStatus
          score: event.problemScore, // Sync problemScore
          remark: event.problemRemark, // Sync problemRemark
          nominated: event.problemNominated, // Sync problemNominated
        },
      });
      const problem = await prisma.problem.findUnique({
        where: {
          id: problemId,
        },
        select: {
          id: true,
          offererEmail: true,
          userId: true,
          scoreEvents: {
            select: {
              id: true,
              tag: true,
              userId: true,
            },
          },
        },
      });
      if (!problem) {
        return NextResponse.json({ message: "error" }, { status: 404 });
      }
      const hasOfferer = problem.offererEmail ? true : false;
      const submitterIndex = problem.scoreEvents.findIndex(
        (event) => event.tag === "SUBMIT" && event.userId === problem.userId,
      );
      if (submitterIndex === -1) {
        await prisma.scoreEvent.create({
          data: {
            tag: "SUBMIT",
            score: hasOfferer
              ? event.problemScore
                ? event.problemScore / 2
                : 0
              : event.problemScore
                ? event.problemScore
                : 0,
            userId: problem.userId,
            problemId: problem.id,
          },
        });
      } else {
        const submitScoreEvent = problem.scoreEvents[submitterIndex];
        await prisma.scoreEvent.update({
          where: { id: submitScoreEvent.id },
          data: {
            score: hasOfferer
              ? event.problemScore
                ? event.problemScore / 2
                : 0
              : event.problemScore
                ? event.problemScore
                : 0,
          },
        });
      }
      if (hasOfferer) {
        if (!problem.offererEmail) {
          return NextResponse.json({ message: "error" }, { status: 404 });
        }

        const offerer = await prisma.user.findUnique({
          where: { email: problem.offererEmail },
          select: {
            id: true,
          },
        });

        if (!offerer) {
          return NextResponse.json({ message: "error" }, { status: 404 });
        }
        const offererIndex = problem.scoreEvents.findIndex(
          (event) => event.tag === "OFFER" && event.userId === offerer.id,
        );

        if (offererIndex === -1) {
          await prisma.scoreEvent.create({
            data: {
              tag: "OFFER",
              score: event.problemScore ? event.problemScore / 2 : 0,
              userId: offerer.id,
              problemId: problem.id,
            },
          });
        } else {
          const offerScoreEvent = problem.scoreEvents[offererIndex];
          await prisma.scoreEvent.update({
            where: { id: offerScoreEvent.id },
            data: {
              score: event.problemScore ? event.problemScore / 2 : 0,
            },
          });
        }
      }
      updateResults.push(updated);
    }

    return NextResponse.json({
      message: "Sync complete",
      updated: updateResults,
    });
  } catch (error: any) {
    console.error("Error syncing examination opinion:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
