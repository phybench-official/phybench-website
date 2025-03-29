"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, BookOpen, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// 积分排行榜用户类型
type UserScore = {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  realname: string | null;
  score: number;
};

// 题目数排行榜用户类型
type UserProblemCount = UserScore & {
  problemCount: number;
};

export function Scoreboard() {
  // 积分排行榜相关状态
  const [scoreUsers, setScoreUsers] = useState<UserScore[]>([]);
  const [scoreLoading, setScoreLoading] = useState(true);
  const [scoreLoadingMore, setScoreLoadingMore] = useState(false);
  const [scorePage, setScorePage] = useState(1);
  const [scoreHasMore, setScoreHasMore] = useState(true);
  const scoreObserverRef = useRef<IntersectionObserver | null>(null);
  const scoreLastElementRef = useRef<HTMLDivElement>(null);
  const [scoreTotalCount, setScoreTotalCount] = useState(0);

  // 题目数排行榜相关状态
  const [problemUsers, setProblemUsers] = useState<UserProblemCount[]>([]);
  const [problemLoading, setProblemLoading] = useState(true);
  const [problemLoadingMore, setProblemLoadingMore] = useState(false);
  const [problemPage, setProblemPage] = useState(1);
  const [problemHasMore, setProblemHasMore] = useState(true);
  const problemObserverRef = useRef<IntersectionObserver | null>(null);
  const problemLastElementRef = useRef<HTMLDivElement>(null);
  const [problemTotalCount, setProblemTotalCount] = useState(0);

  // 获取积分排行榜数据
  const fetchScoreUsers = useCallback(async (page: number) => {
    try {
      if (page === 1) setScoreLoading(true);
      else setScoreLoadingMore(true);
      
      const response = await fetch(`/api/data/getscoreboard?type=score&page=${page}&pageSize=20`);
      
      if (!response.ok) {
        throw new Error('服务器响应错误');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setScoreUsers(prev => page === 1 ? data.data : [...prev, ...data.data]);
        setScoreHasMore(data.data.length === 20);
        setScoreTotalCount(data.totalCount);
      } else {
        toast.error("获取积分排行榜失败");
      }
    } catch (error) {
      toast.error("获取积分排行榜时发生错误");
      console.error(error);
    } finally {
      setScoreLoading(false);
      setScoreLoadingMore(false);
    }
  }, []);

  // 获取题目数排行榜数据
  const fetchProblemUsers = useCallback(async (page: number) => {
    try {
      if (page === 1) setProblemLoading(true);
      else setProblemLoadingMore(true);
      
      const response = await fetch(`/api/data/getscoreboard?type=problems&page=${page}&pageSize=20`);
      
      if (!response.ok) {
        throw new Error('服务器响应错误');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProblemUsers(prev => page === 1 ? data.data : [...prev, ...data.data]);
        setProblemHasMore(data.data.length === 20);
        setProblemTotalCount(data.totalCount);
      } else {
        toast.error("获取题目排行榜失败");
      }
    } catch (error) {
      toast.error("获取题目排行榜时发生错误");
      console.error(error);
    } finally {
      setProblemLoading(false);
      setProblemLoadingMore(false);
    }
  }, []);

  // 初始加载数据
  useEffect(() => {
    fetchScoreUsers(1);
    fetchProblemUsers(1);
  }, [fetchScoreUsers, fetchProblemUsers]);

  // 设置IntersectionObserver用于无限滚动
  useEffect(() => {
    // 积分排行榜的observer
    scoreObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && scoreHasMore && !scoreLoadingMore) {
          setScorePage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    // 题目数排行榜的observer
    problemObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && problemHasMore && !problemLoadingMore) {
          setProblemPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    return () => {
      if (scoreObserverRef.current) scoreObserverRef.current.disconnect();
      if (problemObserverRef.current) problemObserverRef.current.disconnect();
    };
  }, [scoreHasMore, scoreLoadingMore, problemHasMore, problemLoadingMore]);

  // 监听观察点元素
  useEffect(() => {
    if (scoreLastElementRef.current && scoreObserverRef.current) {
      scoreObserverRef.current.observe(scoreLastElementRef.current);
    }
    
    if (problemLastElementRef.current && problemObserverRef.current) {
      problemObserverRef.current.observe(problemLastElementRef.current);
    }
  }, [scoreUsers, problemUsers]);

  // 加载更多积分排行榜数据
  useEffect(() => {
    if (scorePage > 1) {
      fetchScoreUsers(scorePage);
    }
  }, [scorePage, fetchScoreUsers]);

  // 加载更多题目数排行榜数据
  useEffect(() => {
    if (problemPage > 1) {
      fetchProblemUsers(problemPage);
    }
  }, [problemPage, fetchProblemUsers]);

  // 返回顶部功能
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 获取用户显示名
  const getUserDisplayName = (user: UserScore) => {
    return user.realname || user.username || "未知用户";
  };

  return (
    <div className="container mt-8 sm:mt-12 mx-auto h-full px-4 py-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 px-2 gap-6 my-auto">
        {/* 积分排行榜卡片 */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                积分排行榜
              </CardTitle>
              <Badge variant="outline" className="flex items-center">
                <Star className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                积分
              </Badge>
            </div>
            <CardDescription>根据用户积分高低进行排名 共{scoreTotalCount}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {scoreLoading ? (
                // 加载中显示骨架屏
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : (
                <>
                  {scoreUsers.map((user, index) => (
                    <div
                      key={user.id + index}
                      className={`flex items-center py-3 px-4 border-b last:border-b-0 ${
                        index < 3 ? 'bg-amber-50/50 dark:bg-amber-800/20' : ''
                      }`}
                    >
                      {/* 排名 */}
                      <div className={`flex-shrink-0 w-8 text-center font-semibold ${
                        index === 0 ? 'text-yellow-300' :
                        index === 1 ? 'text-cyan-400' :
                        index === 2 ? 'text-red-700' : ''
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* 用户名 */}
                      <div className="flex-1 min-w-0 ml-2">
                        <p className="font-medium truncate">{getUserDisplayName(user)}</p>
                      </div>
                      
                      {/* 积分 */}
                      <div className="flex items-center space-x-1 text-yellow-600 font-semibold">
                        <Star className="h-4 w-4" />
                        <span>{user.score}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* 观察点元素，用于无限滚动 */}
                  {scoreHasMore && (
                    <div
                      ref={scoreLastElementRef}
                      className="py-4 text-center"
                    >
                      {scoreLoadingMore ? (
                        <Skeleton className="h-8 w-24 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-500">滚动加载更多...</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 题目数排行榜卡片 */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-blue-500" />
                题目贡献排行榜
              </CardTitle>
              <Badge variant="outline" className="flex items-center">
                <BookOpen className="h-3.5 w-3.5 mr-1 text-blue-500" />
                题目数
              </Badge>
            </div>
            <CardDescription>根据用户提交题目数量进行排名 共{problemTotalCount}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {problemLoading ? (
                // 加载中显示骨架屏
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : (
                <>
                  {problemUsers.map((user, index) => (
                    <div
                      key={user.id + index}
                      className={`flex items-center px-4 py-3 border-b last:border-b-0 ${
                        index < 3 ? 'bg-amber-50/50 dark:bg-amber-800/20' : ''
                      }`}
                    >
                      {/* 排名 */}
                      <div className={`flex-shrink-0 w-8 text-center font-semibold ${
                        index === 0 ? 'text-yellow-300' :
                        index === 1 ? 'text-cyan-400' :
                        index === 2 ? 'text-red-700' : ''
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* 用户名 */}
                      <div className="flex-1 min-w-0 ml-2">
                        <p className="font-medium truncate">{getUserDisplayName(user)}</p>
                      </div>
                      
                      {/* 题目数 */}
                      <div className="flex items-center space-x-1 text-blue-500 font-semibold">
                        <BookOpen className="h-4 w-4" />
                        <span>{user.problemCount}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* 观察点元素，用于无限滚动 */}
                  {problemHasMore && (
                    <div
                      ref={problemLastElementRef}
                      className="py-4 text-center"
                    >
                      {problemLoadingMore ? (
                        <Skeleton className="h-8 w-24 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-500">滚动加载更多...</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* 返回顶部按钮 */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 rounded-full shadow-lg"
        onClick={scrollToTop}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </div>
  );
}

