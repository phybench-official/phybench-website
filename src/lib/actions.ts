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

export async function fetchProblems(page: number, perPage: number) {
  const session = await auth();
  if (!session) throw new Error("Not authorized");
  if (!session.user.email) throw new Error("Email not found");
  const where = session.user.role === "admin" ? {} : { 
    userId: await prisma.user.findUnique({ where: { email: session.user.email } }).then(user => user?.id)
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
