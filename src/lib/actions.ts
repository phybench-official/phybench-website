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

export async function fetchProblems(page: number, perPage: number, isExam = false) {
  const session = await auth();
  if (!session) throw new Error("Not authorized");
  if (!session.user.email) throw new Error("Email not found");
  const currentUser = await prisma.user
    .findUnique({ where: { email: session.user.email } })
    .then((user) => user?.id);
  
  const where = isExam ? (
    session.user.role === "admin" ? {} : {
      OR: [
        { examiners: { some: { id: currentUser } } },
      ],
    }
  ) : (
    {
      OR: [
        { userId: currentUser },
        { offererId: currentUser },
      ],
    }
  )
  
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
  return await prisma.user.findMany({
    select: { email: true, name: true, realname: true },
  }).then((users) =>
    users.map((user) => ({
      label: user.name + " (" + user.realname + ")",
      value: user.email,
    }))
  )
}

export async function examProblem(data: {
  problemId: number;
  remark?: string;
  status: "PENDING" | "RETURNED" | "APPROVED" | "REJECTED";
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
    });
    
    if (!user) {
      return { success: false, message: "未找到用户" };
    }

    // 查找题目并检查权限
    const problem = await prisma.problem.findUnique({
      where: { id: data.problemId },
      include: { examiners: true },
    });

    if (!problem) {
      return { success: false, message: "未找到题目" };
    }

    // 检查用户是否为审核员或管理员
    let isExaminer = false;
    if (session.user.role === "admin") {
      isExaminer = true;
    } else {
      isExaminer = problem.examiners.some(examiner => examiner.id === user.id);
    }

    if (!isExaminer) {
      return { success: false, message: "您没有权限审核此题目" };
    }

    // 更新题目
    const updatedProblem = await prisma.problem.update({
      where: { id: data.problemId },
      data: {
        status: data.status,
        remark: data.remark || null,
        score: data.score,
        nominated: data.nominated,
      },
    });

    // 如果是首次通过审核，添加积分事件
    if (data.status === "APPROVED" && problem.status !== "APPROVED") {
      // 给提交者加分
      await prisma.scoreEvent.create({
        data: {
          tag: "SUBMIT",
          score: data.score,
          userId: problem.userId,
          problemId: problem.id
        }
      });
      
      // 更新用户总积分
      await prisma.user.update({
        where: { id: problem.userId },
        data: { score: { increment: data.score } }
      });

      // 如果是供题，给供题人加分
      if (problem.offererId && problem.offererId !== problem.userId) {
        await prisma.scoreEvent.create({
          data: {
            tag: "OFFER",
            score: Math.ceil(data.score / 2), // 供题积分为审核积分的一半（向上取整）
            userId: problem.offererId,
            problemId: problem.id
          }
        });

        await prisma.user.update({
          where: { id: problem.offererId },
          data: { score: { increment: Math.ceil(data.score / 2) } }
        });
      }
    }

    return { 
      success: true, 
      message: "审核成功",
      problem: updatedProblem 
    };
  } catch (error) {
    console.error("审核题目时出错:", error);
    return { 
      success: false, 
      message: "服务器错误，请稍后再试" 
    };
  }
}