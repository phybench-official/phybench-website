import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";
import { NotPermitted } from "@/components/ui/not-permitted";
import { ProblemView } from "@/components/problem-view";
import { notFound } from "next/navigation";
import { prisma } from "@/prisma";
import { ProblemData } from "@/lib/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  // 获取问题数据
  const { id } = await params;
  const problemId = parseInt(id);

  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      tag: true,
      description: true,
      note: true,
      source: true,
      content: true,
      variables: true,
      solution: true,
      answer: true,
      aiPerformances: true,
      status: true,
      score: true,
      remark: true,
      nominated: true,
      offererEmail: true,
      createdAt: true,
      updatedAt: true,
      offer: {
        select: {
          email: true,
        },
      },
      user: {
        select: {
          name: true,
          role: true,
          realname: true,
          username: true,
          email: true,
        },
      },
    },
  }) as unknown as ProblemData; 

  if (!problem) return notFound();
  if (
    problem.user.email !== session.user.email &&
    session.user.role !== "admin" &&
    problem.offer?.email !== session.user.email
  )
    return <NotPermitted />;

  // 根据题目审核状态决定是否可编辑
  const isEditable = problem.status === "RETURNED" || problem.status === "REJECTED";

  return (
    <div className="w-screen py-20 flex flex-col items-center">
      <ProblemView problem={problem} editable={isEditable} />
    </div>
  );
}
