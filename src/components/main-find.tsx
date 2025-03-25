"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Trophy } from "lucide-react";

// 定义常量和接口
const PER_PAGE = 20;

interface User {
  id: string;
  name?: string;
  realname?: string;
  username?: string;
  score: number;
}

// 加载状态骨架屏组件
function SkeletonCard() {
  return (
    <div className="w-full p-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-6" />
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScoreboardPage({ currentPage }: { currentPage: number }) {
  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [nextPage, setNextPage] = useState(currentPage);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const router = useRouter();

  // 获取积分榜数据
  useEffect(() => {
    const fetchScoreboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/data/getscoreboard?page=${currentPage}&limit=${PER_PAGE}`
        );
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
          setTotalPages(Math.ceil(data.total / PER_PAGE));
          console.log("获取积分榜数据成功:", data);
        }
      } catch (error) {
        console.error("获取积分榜失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScoreboard();

    // 自动刷新逻辑
    const intervalId = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [currentPage, refreshKey]);

  // 生成分页数组
  const getPaginationItems = () => {
    if (totalPages <= 1) return [];
    const items = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    items.push(1);
    if (showEllipsisStart) {
      items.push(-1); // 表示省略号
    } else {
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
      items.push(-2); // 表示省略号
    } else {
      if (totalPages >= 3) items.push(totalPages - 1);
    }
    
    if (totalPages > 1 && items.indexOf(totalPages) === -1) {
      items.push(totalPages);
    }
    
    return items;
  };

  // 获取奖杯颜色
  const getTrophyColor = (index: number) => {
    if (index === 0) return "text-yellow-500"; // 金牌
    if (index === 1) return "text-gray-400"; // 银牌
    if (index === 2) return "text-amber-700"; // 铜牌
    return "text-slate-400"; // 其他
  };

  // 页面跳转处理
  const handlePageJump = () => {
    if (nextPage >= 1 && nextPage <= totalPages) {
      router.push(`/find/${nextPage}`);
    }
  };

  // 手动刷新处理
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const paginationItems = getPaginationItems();

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="p-8">
        {/* 只保留刷新数据按钮 */}
        <div className="flex justify-end">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            刷新数据
          </Button>
        </div>

        {/* 用户积分列表 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-2">用户排名</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">按照积分从高到低排序展示</p>
          
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center text-gray-500 dark:text-gray-400">
                暂无积分数据
              </div>
            ) : (
              users.map((user, index) => {
                const rankNumber = (currentPage - 1) * PER_PAGE + index + 1;
                const displayName = user.realname || user.username || user.name || "未命名用户";
                
                return (
                  <div 
                    key={user.id} 
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      index < 3 && currentPage === 1 
                        ? 'bg-gray-50/80 dark:bg-gray-700/80' 
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                        {rankNumber <= 3 && currentPage === 1 ? (
                          <Trophy className={`h-6 w-6 ${getTrophyColor(index)}`} />
                        ) : (
                          <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                            {rankNumber}
                          </span>
                        )}
                      </div>
                      
                      {/* 头像 - 使用用户名的首字母 */}
                      <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                        <span className="font-medium text-sm">
                          {displayName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* 只显示姓名，移除额外的用户信息行 */}
                      <div className="font-medium">{displayName}</div>
                    </div>
                    
                    <Badge className="text-lg px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {user.score} 分
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center space-y-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={
                        currentPage > 1
                          ? `/find/${Number(currentPage) - 1}`
                          : "#"
                      }
                      isActive={Number(currentPage) > 1}
                    />
                  </PaginationItem>

                  {paginationItems.map((pageNum, index) => {
                    if (pageNum < 0) {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    } else {
                      return (
                        <PaginationItem key={`page-${pageNum}`}>
                          <PaginationLink
                            href={`/find/${pageNum}`}
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
                          ? `/find/${Number(currentPage) + 1}`
                          : "#"
                      }
                      isActive={Number(currentPage) < totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">跳转到:</span>
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
                  onClick={handlePageJump}
                  className="px-4"
                >
                  跳转
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
