import { auth } from "@/auth";
import SubmitPage from "@/components/submit/main-submit";
import { NotAuthorized } from "@/components/ui/not-authorized";
import { NotPermitted } from "@/components/ui/not-permitted";
import { notFound } from "next/navigation";
import { prisma } from "@/prisma";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  if (!session) return <NotAuthorized />;

  // 验证是否为管理员/当前题目的所有者/当前题目的审核员
  const problem = await prisma.problem.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      examiners: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  if (!problem) return notFound();
  if (
    session.user.role !== "admin" &&
    problem.user.email !== session.user.email &&
    !problem.examiners.some((examiner) => examiner.email === session.user.email)
  ) {
    return <NotPermitted />;
  }

  return (
    <div className="w-screen h-screen pt-24">
      <SubmitPage user={session?.user} problemId={parseInt(id)} />
    </div>
  );
}
