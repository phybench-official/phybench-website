import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";
import { ProblemView } from "@/components/problem-view";
import { notFound } from "next/navigation";
import { prisma } from "@/prisma";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  // 获取问题数据
  const { id } = await params;

  const problem = await prisma.problem.findUnique({
    where: {
      id: parseInt(id)
    },
    include: {
      variables: true,
      aiPerformances: true,
      user: {
        select: {
          name: true,
          role: true,
          realname: true,
          username: true,
          email: true
        }
      }
    }
  });

  if (!problem) return notFound();
  if (problem.user.email !== session.user.email && session.user.role !== "admin") return <NotAuthorized />;

  return (
    <div className="w-screen py-20 flex flex-col items-center">
      <ProblemView problem={problem} />
    </div>
  );
}
