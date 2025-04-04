import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";
import { NotPermitted } from "@/components/ui/not-permitted";
import { TranslateView } from "@/components/translate-view";
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
      translators: true,
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

  let isTranslator = false;
  for (const translator of problem.translators) {
    if (translator.email === session.user.email) {
      isTranslator = true;
      break;
    }
  }
  if (session.user.role === "admin") isTranslator = true;
  if (!isTranslator) {
    return <NotPermitted />;
  }
  
  return (
    <div className="w-screen py-20 flex flex-col items-center">
      <TranslateView
        problem={problem}
        editable={true}
        examable={true}
      />
    </div>
  );
}
