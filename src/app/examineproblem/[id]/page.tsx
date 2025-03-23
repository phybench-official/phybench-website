import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";
import { NotPermitted } from "@/components/ui/not-permitted";
import { ProblemExamine } from "@/components/problem-examine";
import { notFound } from "next/navigation";
import { prisma } from "@/prisma";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  // 获取问题数据
  const { id } = await params;

  const problem = await prisma.problem.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      variables: true,
      aiPerformances: true,
      examiners: true,
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
  });

  if (!problem) return notFound();

  let isExaminer = false;
  for (const examiner of problem.examiners) {
    if (examiner.email === session.user.email) {
      isExaminer = true;
      break;
    }
  }
  if (session.user.role === "admin") isExaminer = true;
  if (!isExaminer) {
    return <NotPermitted />;
  }

  return (
    <div className="w-screen py-20 flex flex-col items-center">
      <ProblemExamine problem={problem} />
    </div>
  );
}
