import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
  try {
    const counts = await prisma.problem.groupBy({
      by: ["tag"],
      _count: {
        id: true,
      },
      where: {
        status: "PENDING",
      },
    });

    const result = {
      mechanics: 0,
      electricity: 0,
      thermodynamics: 0,
      optics: 0,
      modern: 0,
      advanced: 0,
    };

    counts.forEach((count) => {
      switch (count.tag) {
        case "MECHANICS":
          result.mechanics = count._count.id;
          break;
        case "ELECTRICITY":
          result.electricity = count._count.id;
          break;
        case "THERMODYNAMICS":
          result.thermodynamics = count._count.id;
          break;
        case "OPTICS":
          result.optics = count._count.id;
          break;
        case "MODERN":
          result.modern = count._count.id;
          break;
        case "ADVANCED":
          result.advanced = count._count.id;
          break;
      }
    });

    return NextResponse.json({
      success: true,
      counts: result,
    });
  } catch (error) {
    console.error("获取问题统计时出错:", error);
    return NextResponse.json(
      {
        message: "服务器错误，获取失败",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
