import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";
import { NotPermitted } from "@/components/ui/not-permitted";
import { ProblemView } from "@/components/problem-view";
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
      translators: {
        select: {
          id: true,
          name: true,
          username: true,
          realname: true,
          email: true,
        },
      }
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
      <ProblemView
        problem={problem}
        editable={true}
        examable={true}
        isAdmin={session.user.role == "admin"}
      />
    </div>
  );
}
