"use server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
export async function updateUsername(formData: FormData) {
  const session = await auth();
  if (!session) return;
  const username = formData.get("username")?.toString();
  const email = formData.get("email")?.toString();
  if (!username || !email) return;
  await prisma.user.update({
    where: { email },
    data: { username },
  });
}

export async function fetchProblems(
  page: number,
  perPage: number,
  isExam = false
) {
  const session = await auth();
  if (!session) throw new Error("Not authorized");
  if (!session.user.email) throw new Error("Email not found");
  const currentUser = await prisma.user
    .findUnique({ where: { email: session.user.email } })
    .then((user) => user?.id);

  const where = isExam
    ? session.user.role === "admin"
      ? {}
      : {
          OR: [{ examiners: { some: { id: currentUser } } }],
        }
    : {
        OR: [{ userId: currentUser }, { offererEmail: session.user.email }],
      };

  const [problems, count] = await Promise.all([
    prisma.problem.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        tag: true,
        status: true,
        remark: true,
        score: true,
        createdAt: true,
      },
    }),
    prisma.problem.count({ where }),
  ]);
  const totalPages = Math.ceil(count / perPage);
  return { problems, totalPages };
}

export async function fetchTranslateProblems(page: number, perPage: number) {
  const session = await auth();
  if (!session) throw new Error("Not authorized");
  if (!session.user.email) throw new Error("Email not found");
  const currentUser = await prisma.user
    .findUnique({ where: { email: session.user.email } })
    .then((user) => user?.id);

  const where =
    session.user.role === "admin"
      ? {}
      : {
          OR: [{ translators: { some: { id: currentUser } } }],
        };
  const [problems, count] = await Promise.all([
    prisma.problem.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      select: {
        content: true,
        solution: true,
        id: true,
        title: true,
        tag: true,
        status: true,
        remark: true,
        score: true,
        createdAt: true,
      },
    }),
    prisma.problem.count({ where }),
  ]);
  const totalPages = Math.ceil(count / perPage);
  return { problems, totalPages };
}

export async function deleteProblem(problemId: number) {
  const session = await auth();
  if (!session) throw new Error("Not authorized");
  if (!problemId) throw new Error("Problem ID is required");
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) throw new Error("Problem not found");
  if (session.user.role !== "admin" && problem.userId !== session.user.id) {
    throw new Error("Not authorized to delete this problem");
  }
  await prisma.aiPerformance.deleteMany({
    where: { problemId },
  });
  await prisma.problem.delete({ where: { id: problemId } });
}

export const fetchAllUsers = async () => {
  "use server";
  const session = await auth();
  if (!session) throw new Error("Not authorized");
  return await prisma.user
    .findMany({
      select: { email: true, name: true, realname: true },
    })
    .then((users) =>
      users.map((user) => ({
        label: user.name + " (" + user.realname + ")",
        value: user.email,
      }))
    );
};

export async function examProblem(data: {
  problemId: number;
  remark?: string;
  status: "PENDING" | "RETURNED" | "APPROVED" | "REJECTED" | "ARCHIVED";
  score: number;
  nominated: string;
}) {
  const session = await auth();

  // 权限检查
  if (!session?.user?.email) {
    return { success: false, message: "未授权操作" };
  }

  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
      },
    });

    if (!user) {
      return { success: false, message: "未找到用户" };
    }

    // 查找题目并检查权限
    const problem = await prisma.problem.findUnique({
      where: { id: data.problemId },
      select: {
        examiners: {
          select: {
            id: true,
          },
        },
        offererEmail: true,
        userId: true,
        id: true,
        scoreEvents: { select: { id: true, userId: true, tag: true } },
      },
    });
    if (!problem) {
      return { success: false, message: "未找到题目" };
    }

    // 查找此人审此题的积分事件
    const index = problem.scoreEvents.findIndex(
      (event) => event.tag === "EXAMINE" && event.userId === user.id
    );
    if (index === -1) {
      return { success: false, message: "未找到此人审此题的积分事件" };
    }
    const scoreEvent = problem.scoreEvents[index];

    // 后端鉴权
    let isExaminer = false;
    if (session.user.role === "admin") {
      isExaminer = true;
    } else {
      isExaminer = problem.examiners.some(
        (examiner) => examiner.id === user.id
      );
    }

    if (!isExaminer) {
      return { success: false, message: "您没有权限审核此题目" };
    }

    // 更新此人审此题的审核事件
    await prisma.scoreEvent.update({
      where: { id: scoreEvent.id },
      data: {
        score: 5,
        problemStatus: data.status,
        problemScore: data.score,
        problemRemark: data.remark,
        problemNominated: data.nominated,
      },
    });

    // 直接覆盖题目正式审核结果
    await prisma.problem.update({
      where: { id: data.problemId },
      data: {
        status: data.status,
        score: data.score,
        remark: data.remark,
        nominated: data.nominated,
      },
    });

    const hasOfferer = problem.offererEmail ? true : false;
    // // 查找编题人的积分事件
    const submitterIndex = problem.scoreEvents.findIndex(
      (event) => event.tag === "SUBMIT" && event.userId === problem.userId
    );
    if (submitterIndex === -1) {
      await prisma.scoreEvent.create({
        data: {
          tag: "SUBMIT",
          score: hasOfferer ? data.score / 2 : data.score,
          userId: problem.userId,
          problemId: problem.id,
        },
      });
    } else {
      const submitScoreEvent = problem.scoreEvents[submitterIndex];
      await prisma.scoreEvent.update({
        where: { id: submitScoreEvent.id },
        data: {
          score: hasOfferer ? data.score / 2 : data.score,
        },
      });
    }
    if (hasOfferer) {
      if (!problem.offererEmail) {
        return { success: false, message: "错误访问offererEmail字段！" };
      }

      const offerer = await prisma.user.findUnique({
        where: { email: problem.offererEmail },
        select: {
          id: true,
        },
      });

      if (!offerer) {
        return { success: false, message: "未找到供题者ID！" };
      }
      const offererIndex = problem.scoreEvents.findIndex(
        (event) => event.tag === "OFFER" && event.userId === offerer.id
      );

      if (offererIndex === -1) {
        await prisma.scoreEvent.create({
          data: {
            tag: "OFFER",
            score: data.score / 2,
            userId: offerer.id,
            problemId: problem.id,
          },
        });
      } else {
        const offerScoreEvent = problem.scoreEvents[offererIndex];
        await prisma.scoreEvent.update({
          where: { id: offerScoreEvent.id },
          data: {
            score: data.score / 2,
          },
        });
      }
    }
    return {
      success: true,
      message: "审核成功",
    };
  } catch (error) {
    console.error("审核题目时出错:", error);
    return {
      success: false,
      message: "服务器错误，请稍后再试",
    };
  }
}

export async function fetchProblemStats() {
  try {
    const session = await auth();
    if (!session) throw new Error("Not authorized");
    // 获取总题目数
    const totalProblems = await prisma.problem.count();
    // 获取各类别题目数量
    const problemsByTag = await prisma.problem.groupBy({
      by: ["tag"],
      _count: true,
    });
    // 获取用户总数
    const totalUsers = await prisma.user.count();
    // 获取待审核题目数量
    const pendingProblems = await prisma.problem.count({
      where: { status: "PENDING" },
    });
    // 将结果转换为前端所需的格式
    const tagStats = problemsByTag.map((item) => ({
      tag: item.tag,
      count: item._count,
    }));

    return {
      success: true,
      totalProblems,
      tagStats,
      totalUsers,
      pendingProblems,
    };
  } catch (error) {
    console.error("获取题目统计数据失败:", error);
    return {
      success: false,
      message: "获取题目统计数据失败",
    };
  }
}

export async function fetchLastWeekProblems() {
  try {
    const session = await auth();
    if (!session) throw new Error("Not authorized");
    // 获取过去7天的日期范围（不包括今天）
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为今天的开始时间
    const dates = [];
    for (let i = 7; i > 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    // 准备查询数据
    const weekData = await Promise.all(
      dates.map(async (date) => {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const count = await prisma.problem.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        return {
          date: date.toLocaleDateString("zh-CN", {
            month: "numeric",
            day: "numeric",
          }),
          count: count,
        };
      })
    );
    // 计算周环比数据
    const totalThisWeek = weekData.reduce((sum, day) => sum + day.count, 0);
    // 获取上一周的数据以计算周环比
    const lastWeekStart = new Date();
    lastWeekStart.setDate(today.getDate() - 14);
    lastWeekStart.setHours(0, 0, 0, 0);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(today.getDate() - 8);
    lastWeekEnd.setHours(23, 59, 59, 999);

    const lastWeekCount = await prisma.problem.count({
      where: {
        createdAt: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });

    // 计算周环比变化率
    let weeklyChange = 0;
    if (lastWeekCount > 0) {
      weeklyChange = ((totalThisWeek - lastWeekCount) / lastWeekCount) * 100;
    }

    return {
      success: true,
      weekData,
      weeklyChange: weeklyChange.toFixed(1), // 保留一位小数
      totalThisWeek,
    };
  } catch (error) {
    console.error("获取过去一周题目数据失败:", error);
    return {
      success: false,
      message: "获取过去一周题目数据失败",
    };
  }
}

export async function getExaminerNumber(problemId: number) {
  const session = await auth();

  if (!session || !session.user?.email) {
    throw new Error("未授权");
  }

  const userEmail = session.user.email;

  try {
    if (!problemId) {
      throw new Error("缺少题目ID");
    }

    // 根据 problemId 查找题目
    const dbProblem = await prisma.problem.findUnique({
      where: {
        id: Number(problemId),
      },
      select: {
        examiners: {
          select: { id: true },
        },
        scoreEvents: {
          select: {
            tag: true,
            userId: true,
            problemStatus: true,
            problemScore: true,
            problemRemark: true,
            problemNominated: true,
          },
        },
        status: true,
        score: true,
        remark: true,
        nominated: true,
      },
    });

    if (!dbProblem) {
      throw new Error("未找到题目记录");
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
      },
    });

    if (!dbUser) {
      throw new Error("未找到邮箱对应的用户");
    }

    const userId = dbUser.id;

    // 后端鉴权，只有管理员/此时在examiners列表中的用户才能审核
    const examinersIndex = dbProblem.examiners.findIndex(
      (examiner) => examiner.id === userId
    );

    if (examinersIndex === -1 && session.user.role !== "admin") {
      throw new Error("您没有权限审核此题，请联系管理员");
    }

    // 查找 scoreEvents 中是否存在符合条件的事件
    const index = dbProblem.scoreEvents.findIndex(
      (event) => event.tag === "EXAMINE" && event.userId === userId
    );

    if (index !== -1) {
      // 如果存在，返回其编号（index + 1）
      return {
        examinerNo: index + 1,
        examinerAssignedStatus: dbProblem.scoreEvents[index].problemStatus,
        examinerAssignedScore: dbProblem.scoreEvents[index].problemScore,
        examinerRemark: dbProblem.scoreEvents[index].problemRemark,
        examinerNominated: dbProblem.scoreEvents[index].problemNominated,
      };
    } else {
      // 如果不存在，创建一个新的 ScoreEvent
      await prisma.scoreEvent.create({
        data: {
          tag: "EXAMINE",
          score: 0,
          userId: userId,
          problemId: Number(problemId),
          problemStatus: dbProblem.status,
          problemScore: dbProblem.score,
          problemRemark: dbProblem.remark,
          problemNominated: dbProblem.nominated,
        },
      });

      // 返回新创建的事件的编号
      return {
        examinerNo: dbProblem.scoreEvents.length + 1,
        examinerAssignedStatus: dbProblem.status,
        examinerAssignedScore: dbProblem.score,
        examinerRemark: dbProblem.remark,
        examinerNominated: dbProblem.nominated,
      };
    }
  } catch (error) {
    console.error("获取审核员编号时出错:", error);
    throw new Error(
      "获取审核员信息失败: " +
        (error instanceof Error ? error.message : "未知错误")
    );
  }
}
