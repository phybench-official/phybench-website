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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { deleteProblem, fetchProblems } from "@/lib/actions";
import { tagMap } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FilterDialog } from "./browse-filter";
import { FilterOptions } from "@/lib/types";

// 定义每页显示数量
const PER_PAGE = 15;

interface Problem {
  id: number;
  title: string;
  tag: keyof typeof tagMap;
  status: string;
  translatedStatus: string;
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

export default function BrowsePage({
  currentPage,
  isExam = false,
  isAdmin = false,
}: {
  currentPage: number;
  isExam?: boolean;
  isAdmin?: boolean;
}) {
  // 获取题目列表与总页数
  const [problems, setProblems] = useState<Problem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [nextPage, setNextPage] = useState(currentPage);
  const [loading, setLoading] = useState(true);

  // 使用URL查询参数获取筛选条件
  const searchParams = useSearchParams();
  const router = useRouter();

  // 从URL查询参数中提取筛选条件
  const getFiltersFromUrl = (): FilterOptions => {
    return {
      tag: searchParams.get("tag"),
      status: searchParams.get("status"),
      nominated: searchParams.get("nominated") === "true" ? true : null,
      title: searchParams.get("title"),
      translatedStatus: searchParams.get("translatedStatus"),
    };
  };

  // 初始化筛选条件
  const [filters, setFilters] = useState<FilterOptions>(getFiltersFromUrl());

  // 更新URL查询参数
  const updateUrlParams = (newFilters: FilterOptions) => {
    const params = new URLSearchParams();

    if (newFilters.tag) params.set("tag", newFilters.tag);
    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.translatedStatus)
      params.set("translatedStatus", newFilters.translatedStatus);
    if (newFilters.nominated === true) params.set("nominated", "true");
    if (newFilters.title) params.set("title", newFilters.title);
    const queryString = params.toString();
    const baseUrl = isExam
      ? isAdmin
        ? `/admin/admin-browse/${currentPage}`
        : `/examine/${currentPage}`
      : `/submit/${currentPage}`;
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    router.replace(url, { scroll: false });
  };

  // 当URL参数变化时，更新本地筛选状态
  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    setFilters(urlFilters);
  }, [searchParams]);

  // 获取题目数据
  useEffect(() => {
    setLoading(true);

    fetchProblems(currentPage, PER_PAGE, isExam, isAdmin, filters)
      .then(({ problems, totalPages }) => {
        setProblems(problems);
        setTotalPages(totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("获取题目失败", error);
        setLoading(false);
        toast.error("获取题目列表失败");
      });
  }, [currentPage, filters, isExam]);

  // 应用筛选
  const handleApplyFilter = (newFilters: FilterOptions) => {
    // 更新URL参数
    updateUrlParams(newFilters);
    // 如果筛选条件变化很大，可能需要回到第一页
    if (currentPage !== 1) {
      const params = new URLSearchParams();
      if (newFilters.tag) params.set("tag", newFilters.tag);
      if (newFilters.status) params.set("status", newFilters.status);
      if (newFilters.translatedStatus)
        params.set("translatedStatus", newFilters.translatedStatus);
      if (newFilters.nominated === true) params.set("nominated", "true");
      if (newFilters.title) params.set("title", newFilters.title);

      const queryString = params.toString();
      const url = isExam
        ? isAdmin
          ? queryString
            ? `/admin/admin-browse/1?${queryString}`
            : `/admin/admin-browse/1`
          : queryString
            ? `/examine/1?${queryString}`
            : `/examine/1`
        : queryString
          ? `/submit/1?${queryString}`
          : `/submit/1`;

      router.replace(url);
    }
  };

  // 清空筛选
  const handleClearFilter = () => {
    // 清空URL参数
    const baseUrl = isExam
      ? isAdmin
        ? `/admin/admin-browse/${currentPage}`
        : `/examine/${currentPage}`
      : `/submit/${currentPage}`;
    router.replace(baseUrl);
  };

  // 生成带有筛选参数的分页链接
  const getPageLink = (pageNum: number) => {
    const params = new URLSearchParams();
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.status) params.set("status", filters.status);
    if (filters.translatedStatus)
      params.set("translatedStatus", filters.translatedStatus);
    if (filters.nominated === true) params.set("nominated", "true");
    if (filters.title) params.set("title", filters.title);

    const queryString = params.toString();
    return isExam
      ? isAdmin
        ? queryString
          ? `/admin/admin-browse/${pageNum}?${queryString}`
          : `/admin/admin-browse/${pageNum}`
        : queryString
          ? `/examine/${pageNum}?${queryString}`
          : `/examine/${pageNum}`
      : queryString
        ? `/submit/${pageNum}?${queryString}`
        : `/submit/${pageNum}`;
  };

  // 跳转到指定页面
  const handleJumpToPage = () => {
    if (nextPage >= 1 && nextPage <= totalPages) {
      router.push(getPageLink(nextPage));
    }
  };

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
        <div className="flex space-x-2">
          {isExam && (
            <FilterDialog
              onApplyFilter={handleApplyFilter}
              onClearFilter={handleClearFilter}
              currentFilters={filters}
              isExam={isExam}
            />
          )}
          {!isExam && (
            <>
              <Button disabled className="inline md:hidden cursor-pointer">
                添加问题
              </Button>
              <Button
                disabled
                onClick={() => {
                  router.push("/submit/add");
                }}
                className="md:flex hidden cursor-pointer"
              >
                <Plus /> 添加问题
              </Button>
            </>
          )}
        </div>
      </div>

      {/* main list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="md:hidden text-center text-gray-800 dark:text-gray-200">
          目前移动端尚未支持提交和审核功能 <br /> 请使用电脑端访问
        </div>
        {!problems.length && (
          <div className="md:col-span-3 text-center text-gray-500 dark:text-gray-400 h-[50vh]">
            {isExam
              ? isAdmin
                ? "暂未找到问题"
                : "暂无可审问题；如果希望审核题目，请关注群内消息、报名审核活动！"
              : "暂无提交问题"}
          </div>
        )}
        {problems.map((problem) => (
          <Card key={problem.id} className="felx flex-col justify-between">
            <CardHeader>
              <CardTitle
                className="leading-5 cursor-pointer hover:font-bold"
                onClick={
                  isExam
                    ? () => router.push(`/examineproblem/${problem.id}`)
                    : () => router.push(`/problem/${problem.id}`)
                }
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
                <Badge variant="secondary">
                  {problem.createdAt.toLocaleDateString()}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {problem.remark && (
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  &quot; {problem.remark} &quot;
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center">
              <div
                className={
                  problem.status === "APPROVED"
                    ? "text-green-700 dark:text-green-300"
                    : problem.status === "ARCHIVED"
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
              <div className="flex flex-row items-center space-x-2">
                <div
                  className={
                    problem.translatedStatus === "APPROVED"
                      ? "text-green-700 dark:text-green-300"
                      : problem.translatedStatus === "ARCHIVED"
                        ? "text-green-700 dark:text-green-300"
                        : problem.translatedStatus === "REJECTED"
                          ? "text-red-800 dark:text-red-300"
                          : problem.translatedStatus === "PENDING"
                            ? "text-gray-600 dark:text-slate-300"
                            : "text-yellow-800 dark:text-yellow-300"
                  }
                >
                  {problem.translatedStatus === "APPROVED"
                    ? "Error，请联系管理员"
                    : problem.translatedStatus === "ARCHIVED"
                      ? "翻译已审"
                      : problem.translatedStatus === "REJECTED"
                        ? "Error，请联系管理员"
                        : problem.translatedStatus === "PENDING"
                          ? "翻译未审"
                          : "Error，请联系管理员"}
                </div>
                {!isExam && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className=" cursor-pointer"
                      >
                        <Trash2 />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>删除问题</DialogTitle>
                      </DialogHeader>
                      <p>
                        是否真的要删除问题{" "}
                        <span className="font-semibold">{problem.title}</span>？
                      </p>
                      <DialogFooter>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            deleteProblem(problem.id).then(() => {
                              router.refresh();
                              toast.success("问题已删除");
                            });
                          }}
                        >
                          删除
                        </Button>
                        <DialogClose asChild>
                          <Button>取消</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
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
                    currentPage > 1 ? getPageLink(Number(currentPage) - 1) : "#"
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
                        href={getPageLink(pageNum)}
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
                      ? getPageLink(Number(currentPage) + 1)
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
              <Button variant="secondary" size="sm" onClick={handleJumpToPage}>
                跳转
              </Button>
            </div>
          </Pagination>
        </div>
      )}
    </div>
  );
}
