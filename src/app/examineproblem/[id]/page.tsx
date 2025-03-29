import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";
import { NotPermitted } from "@/components/ui/not-permitted";
import { ProblemView } from "@/components/problem-view";
import { notFound } from "next/navigation";
import { prisma } from "@/prisma";
import { getExaminerNumber } from "@/lib/actions";

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

  // 使用 server action 获取审核员编号与既往审核信息
  let examinerData;
  try {
    examinerData = await getExaminerNumber(session.user.email!, parseInt(id));
  } catch (error) {
    console.error("获取审核员信息失败:", error);
    throw new Error(
      `获取审核员信息失败: ${
        error instanceof Error ? error.message : "未知错误"
      }`
    );
  }

  console.log(examinerData);

  const examinerNo = examinerData.examinerNo;
  const examinerAssignedStatus = examinerData.examinerAssignedStatus;
  const examinerAssignedScore = examinerData.examinerAssignedScore;
  const examinerRemark = examinerData.examinerRemark;
  const examinerNominated = examinerData.examinerNominated;

  if (
    examinerAssignedStatus === null ||
    examinerAssignedScore === null ||
    examinerRemark === null ||
    examinerNominated === null
  ) {
    return notFound();
  }

  return (
    <div className="w-screen py-20 flex flex-col items-center">
      <ProblemView
        problem={problem}
        editable={true}
        examinerNo={examinerNo}
        examinerAssignedStatus={examinerAssignedStatus}
        examinerAssignedScore={examinerAssignedScore}
        examinerRemark={examinerRemark}
        examinerNominated={examinerNominated}
      />
    </div>
  );
}
