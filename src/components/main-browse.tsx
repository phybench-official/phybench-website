"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RenderMarkdown from "@/components/render-markdown";
import { Button } from "@/components/ui/button";

interface Problem {
  title: string;
  source: string;
  tag: string;
  description: string;
  note: string;
  content: string;
  solution: string;
  answer: string;
  status: string;
  userId: string;
  score: string | null;
  realname?: string;
  username?: string;
}

// 每页显示的问题数量
const ITEMS_PER_PAGE = 3;

export default function BrowsePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProblems, setTotalProblems] = useState<number>(0);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true); // 开始加载状态
      try {
        const response = await fetch(
          `/api/data/getproblem?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        if (!response.ok) {
          throw new Error("获取问题失败");
        }
        const data = await response.json();

        if (data.success) {
          // 获取问题后，根据 userId 获取供题人信息
          const problemsWithUserNames = await Promise.all(
            data.problems.map(async (problem: Problem) => {
              const userResponse = await fetch(
                `/api/data/getuser?userID=${problem.userId}`
              );
              if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.success) {
                  problem.realname = userData.user.realname;
                  problem.username = userData.user.username;
                }
              }
              return problem;
            })
          );
          setProblems(problemsWithUserNames);
          setTotalProblems(data.total); // 假设后端返回问题总数
        }
      } catch (err) {
        const errorMessage = (err as Error).message || "未知错误";
        setError(errorMessage);
      } finally {
        setLoading(false); // 结束加载状态
      }
    };
    fetchProblems();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">错误: {error}</p>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">你还没有提交问题，快去提交吧！</p>
      </div>
    );
  }

  // 计算总页数
  const totalPages = Math.ceil(totalProblems / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col items-center space-y-8 mt-28">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {problems.map((problem, index) => (
          <Card key={index} className="p-2 shadow-md rounded-lg w-2xl">
            <CardHeader>
              <CardTitle>
                {problem.title || <span className="text-red-500">缺失</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                {/* 基础信息 */}
                <div>
                  <strong>供题人: </strong>
                  {problem.realname || problem.username || (
                    <span className="text-red-500">缺失</span>
                  )}
                </div>
                <div>
                  <strong>题目来源: </strong>
                  {problem.source || <span className="text-red-500">缺失</span>}
                </div>
                <div>
                  <strong>题目类别: </strong>
                  {problem.tag ? (
                    <Badge>{problem.tag}</Badge>
                  ) : (
                    <Badge variant="destructive">缺失</Badge>
                  )}
                </div>
                <div>
                  <strong>题目描述: </strong>
                  {problem.description || (
                    <span className="text-red-500">缺失</span>
                  )}
                </div>
                <div>
                  <strong>题目备注: </strong>
                  {problem.note || <span className="text-red-500">缺失</span>}
                </div>
                <div>
                  <strong>审核状态: </strong>
                  {problem.status === "PENDING" && (
                    <span className="text-yellow-500">审核中</span>
                  )}
                  {problem.status === "APPROVED" && (
                    <span className="text-green-500">已接收</span>
                  )}
                  {problem.status === "RETURNED" && (
                    <span className="text-yellow-500">已打回</span>
                  )}
                  {problem.status === "REJECTED" && (
                    <span className="text-red-500">已拒绝</span>
                  )}
                  {!["PENDING", "APPROVED", "RETURNED", "REJECTED"].includes(
                    problem.status
                  ) && <span className="text-red-500">未知状态</span>}
                </div>
                <div>
                  <strong>积分: </strong>
                  {problem.score === null ? (
                    <span>暂未获得积分</span>
                  ) : (
                    <span>{problem.score}</span>
                  )}
                </div>
                {/* 题干 */}
                <div className="border rounded p-1 h-[15vh] overflow-y-auto">
                  <strong>题干:</strong>
                  <RenderMarkdown content={problem.content || "缺失题干内容"} />
                </div>
                {/* 答案 */}
                <div className="border rounded p-1 h-[10vh] overflow-y-auto">
                  <strong>答案:</strong>
                  <RenderMarkdown content={problem.answer || "缺失题目答案"} />
                </div>
                {/* 解答过程 */}
                <div className="border rounded p-1 h-[30vh] overflow-y-auto">
                  <strong>解答过程:</strong>
                  <RenderMarkdown
                    content={problem.solution || "缺失解答过程"}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>{/* 底部可根据需要添加按钮等操作 */}</CardFooter>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-between w-full max-w-xl">
        <Button
          className="cursor-pointer"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          上一页
        </Button>

        {/* 当前页和总页数 */}
        <span
          className="cursor-pointer text-xl underline hover:text-blue-600 transition-colors"
          onClick={() => {
            const page = prompt("输入页码:", currentPage.toString());
            if (page) {
              const pageNumber = parseInt(page, 10);
              if (
                !isNaN(pageNumber) &&
                pageNumber >= 1 &&
                pageNumber <= totalPages
              ) {
                setCurrentPage(pageNumber);
              } else {
                alert(`请输入有效的页码（1到${totalPages}）`);
              }
            }
          }}
        >
          {currentPage} / {totalPages}
        </span>

        <Button
          className="cursor-pointer"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
