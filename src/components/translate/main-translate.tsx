"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTranslateProblems } from "@/lib/actions";
import { tagMap } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 定义每页显示数量
const PER_PAGE = 15;

interface Problem {
  content: string;
  solution: string;
  id: number;
  title: string;
  tag: keyof typeof tagMap;
  status: string;
  remark: string | null;
  score: number | null;
  createdAt: Date;
}

function SkeletonCard() {
  return (
    <div className="mt-24 mx-6 xl:mx-32 lg:mx-24 flex flex-col items-center transition-all duration-500 ease-in-out">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-h-[50vh]">
        {Array(9)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="flex flex-col justify-between">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex flex-row gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
              <CardFooter className="flex flex-row justify-between items-center">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}

export default function TranslatePage({
  currentPage,
}: {
  currentPage: number;
  isExam?: boolean;
}) {
  // 获取题目列表与总页数
  const [problems, setProblems] = useState<Problem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [nextPage, setNextPage] = useState(currentPage);

  const [loading, setLoading] = useState(true);

  const router = useRouter();
  useEffect(() => {
    fetchTranslateProblems(currentPage, PER_PAGE).then(
      ({ problems, totalPages }) => {
        setProblems(problems);
        setTotalPages(totalPages);
        setLoading(false);
      },
    );
  }, [currentPage]);

  // 生成分页数组的函数
  const getPaginationItems = () => {
    if (totalPages <= 1) return [];
    currentPage = parseInt(currentPage as unknown as string);
    const items = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // 始终添加第1页
    items.push(1);
    if (showEllipsisStart) {
      items.push(-1); // -1 表示省略号
    } else {
      // 靠近开始，显示 2
      if (totalPages >= 2) items.push(2);
    }

    for (
      let i = Math.max(3, currentPage - 1);
      i <= Math.min(totalPages - 2, currentPage + 1);
      i++
    ) {
      if (items.indexOf(i) === -1) {
        items.push(i);
      }
    }
    if (showEllipsisEnd) {
      items.push(-2); // -2 表示省略号
    } else {
      // 靠近结尾，显示倒数第二页
      if (totalPages >= 4) items.push(totalPages - 1);
    }
    if (totalPages > 1 && items.indexOf(totalPages) === -1) {
      items.push(totalPages);
    }
    return items;
  };
  const paginationItems = getPaginationItems();

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <div className="mt-12 md:mt-4 xl:mx-32 lg:mx-24 md:mx-20 mx-4 flex flex-col items-center">
      {/* title and add button */}
      <div className="flex flex-row justify-between w-full mb-4">
        <div>
          <h1 className="text-2xl font-bold">问题列表</h1>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            当前 {currentPage}页 / 共 {totalPages} 页{" "}
          </p>
        </div>
      </div>

      {/* main list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="md:hidden text-center text-gray-800 dark:text-gray-200">
          目前移动端尚未支持提交和审核功能 <br /> 请使用电脑端访问
        </div>
        {!problems.length && (
          <div className="md:col-span-3 text-center text-gray-500 dark:text-gray-400 h-[50vh]">
            {"暂无可翻译问题；如果希望翻译题目，请关注群内消息、报名翻译活动！"}
          </div>
        )}
        {problems.map((problem) => (
          <Card key={problem.id} className="felx flex-col justify-between">
            <CardHeader>
              <CardTitle
                className="leading-5 cursor-pointer hover:font-bold"
                onClick={() => router.push(`/translateproblem/${problem.id}`)}
              >
                {problem.title}
              </CardTitle>
              <CardDescription className="flex flex-row space-x-1 text-sm">
                <Badge
                  variant="secondary"
                  className={`${tagMap[problem.tag].color} text-white`}
                >
                  {tagMap[problem.tag].label}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter className="flex flex-row justify-between items-center">
              <div
                className={
                  problem.status === "APPROVED"
                    ? "text-green-700 dark:text-green-300"
                    : problem.status === "REJECTED"
                      ? "text-red-800 dark:text-red-300"
                      : problem.status === "RETURNED"
                        ? "text-yellow-800 dark:text-yellow-300"
                        : "text-gray-600 dark:text-slate-300"
                }
              >
                {problem.status === "APPROVED"
                  ? "已通过"
                  : problem.status === "ARCHIVED"
                    ? "已入库"
                    : problem.status === "REJECTED"
                      ? "已拒绝"
                      : problem.status === "RETURNED"
                        ? "已退回"
                        : "待审核"}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="w-full mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={
                    currentPage > 1
                      ? `/translate/${Number(currentPage) - 1}`
                      : "#"
                  }
                  isActive={Number(currentPage) > 1}
                />
              </PaginationItem>

              {/* 动态生成分页项 */}
              {paginationItems.map((pageNum, index) => {
                if (pageNum < 0) {
                  // 显示省略号
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else {
                  // 显示页码
                  return (
                    <PaginationItem key={`page-${pageNum}`}>
                      <PaginationLink
                        href={`/translate/${pageNum}`}
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              })}

              <PaginationItem>
                <PaginationNext
                  href={
                    currentPage < totalPages
                      ? `/translate/${Number(currentPage) + 1}`
                      : "#"
                  }
                  isActive={Number(currentPage) < totalPages}
                />
              </PaginationItem>
            </PaginationContent>

            {/* 输入框切换页码 */}
            <div className="hidden md:flex justify-center mt-2">
              <Input
                type="number"
                value={nextPage}
                min={1}
                max={totalPages}
                className="w-20 text-center"
                onChange={(e) => setNextPage(parseInt(e.target.value))}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (nextPage >= 1 && nextPage <= totalPages) {
                    router.push(`/translate/${nextPage}`);
                  }
                }}
              >
                跳转
              </Button>
            </div>
          </Pagination>
        </div>
      )}
    </div>
  );
}
