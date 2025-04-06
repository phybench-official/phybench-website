"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RenderMarkdown from "./render-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft } from "lucide-react";
import type { ExaminerInfo, ProblemData } from "@/lib/types";
import { statusMap, translatedStatusMap, tagMap } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { examProblem, getExaminerNumber } from "@/lib/actions";
import { toast } from "sonner";

function ExamDialog({
  problem,
  isAdmin = false,
}: {
  problem: ProblemData;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [examinerInfo, setExaminerInfo] = useState<ExaminerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState("");
  const [score, setScore] = useState<string>("0");
  const [status, setStatus] = useState<
    "PENDING" | "RETURNED" | "APPROVED" | "REJECTED" | "ARCHIVED"
  >("PENDING");
  const [nominated, setNominated] = useState<string>("No");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [examinerComments, setExaminerComments] = useState<ExaminerComment[]>(
    [],
  );

  // 获取审核信息
  useEffect(() => {
    async function fetchExaminerInfo() {
      try {
        setLoading(true);
        const info = await getExaminerNumber(problem.id);
        setExaminerInfo(info);
        // 设置表单初始值
        setRemark(info?.examinerRemark || "");
        setScore((info?.examinerAssignedScore || 0).toString());
        setStatus(
          (info?.examinerAssignedStatus as
            | "PENDING"
            | "RETURNED"
            | "APPROVED"
            | "REJECTED"
            | "ARCHIVED") || "PENDING",
        );
        setNominated(info?.examinerNominated === "Yes" ? "Yes" : "No");

        // 设置历史审核消息
        const comments = problem.scoreEvents.filter(
          (event) => event.tag === "EXAMINE",
        );
        setExaminerComments(comments);
      } catch (error) {
        toast.error("获取审核信息失败");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      fetchExaminerInfo();
    }
  }, [problem.id, open, problem.scoreEvents]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 验证积分是否为有效数字
      const scoreNumber = parseInt(score);
      if (isNaN(scoreNumber)) {
        toast.error("请确保审核积分是一个有效的数字");
        return;
      }

      const result = await examProblem({
        problemId: problem.id,
        remark,
        status,
        score: scoreNumber,
        nominated,
      });

      if (result.success) {
        toast.success("审核成功");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "审核失败");
      }
    } catch (error) {
      toast.error("审核过程中发生错误");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-1 cursor-pointer">
          审核题目
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {loading
              ? "加载中..."
              : `审核题目：您是${examinerInfo?.examinerNo}号审题人`}
          </DialogTitle>
          <DialogDescription>
            编辑审核状态、积分和评语，决定是否提名为好题
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            加载审核信息...
          </div>
        ) : (
          <Tabs defaultValue="review" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="review">审核</TabsTrigger>
              <TabsTrigger value="history">历史记录</TabsTrigger>
            </TabsList>
            <TabsContent value="review">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">审核状态</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(
                        value as
                          | "PENDING"
                          | "RETURNED"
                          | "APPROVED"
                          | "REJECTED"
                          | "ARCHIVED",
                      )
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="选择审核状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">待审核</SelectItem>
                      <SelectItem value="APPROVED">已通过</SelectItem>
                      <SelectItem value="REJECTED">已拒绝</SelectItem>
                      <SelectItem value="RETURNED">已打回</SelectItem>
                      {isAdmin && (
                        <SelectItem value="ARCHIVED">已入库</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score">审核积分</Label>
                  <Input
                    id="score"
                    type="text"
                    placeholder="请输入一个自然数"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominated">是否提名为好题</Label>
                  <Select value={nominated} onValueChange={setNominated}>
                    <SelectTrigger id="nominated">
                      <SelectValue placeholder="是否提名为好题" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">是</SelectItem>
                      <SelectItem value="No">否</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remark">审核评语</Label>
                  <Textarea
                    id="remark"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="请输入审核评语"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "提交中..." : "提交审核信息"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="history">
              {examinerComments.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {examinerComments.map((comment, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline">
                          {index+1}号审题人  {isAdmin && (comment.userId)}
                        </Badge>
                        <Badge
                          variant={
                            comment.problemStatus === "APPROVED"
                              ? "default"
                              : comment.problemStatus === "REJECTED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {comment.problemStatus === "APPROVED"
                            ? "已通过"
                            : comment.problemStatus === "REJECTED"
                              ? "已拒绝"
                              : comment.problemStatus === "RETURNED"
                                ? "已打回"
                                : comment.problemStatus === "ARCHIVED"
                                  ? "已入库"
                                  : "待审核"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>积分: {comment.problemScore || 0}</span>
                          <span>
                            提名好题:{" "}
                            {comment.problemNominated === "Yes" ? "是" : "否"}
                          </span>
                        </div>
                        {comment.problemRemark && (
                          <div className="text-sm mt-2">
                            <p className="font-medium text-xs text-muted-foreground">
                              评语:
                            </p>
                            <p className="italic p-2 bg-muted rounded-md">
                              {comment.problemRemark}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  暂无历史审核记录
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ExaminerComment {
  tag: string;
  userId: string;
  problemScore?: number | null;
  problemRemark?: string | null;
  problemStatus?: string | null;
  problemNominated?: string | null;
}

export function ProblemView({
  problem,
  editable = false,
  examable = false,
  isAdmin = false,
}: {
  problem: ProblemData;
  editable?: boolean;
  examable?: boolean;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="container mt-16 md:mt-0 px-4 md:px-0 grid grid-cols-1 lg:grid-cols-3 gap-4 py-4 max-w-7xl">
      <div className="lg:col-span-3 mb-2 w-full flex flex-row justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" /> 返回题目列表
        </Button>

        {editable && (
          <div className="flex flex-row items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => router.push(`/submit/edit/${problem.id}`)}
            >
              编辑题目
            </Button>
            {examable && <ExamDialog problem={problem} isAdmin={isAdmin} />}
          </div>
        )}
      </div>

      {/* 第一列：题目基本信息 */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>题目信息</span>
            <Badge className={`${statusMap[problem.status].color}`}>
              {statusMap[problem.status].label}
            </Badge>
            {isAdmin && (<Badge className={`${translatedStatusMap[problem.translatedStatus].color}`}>
              {translatedStatusMap[problem.translatedStatus].label}
            </Badge>)}
          </CardTitle>
          <CardDescription>查看题目详细信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <div>
            <h3 className="font-semibold text-lg mb-2">{problem.title}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge
                variant="secondary"
                className={`${tagMap[problem.tag].color} text-white`}
              >
                {tagMap[problem.tag].label}
              </Badge>
              {<Badge variant="outline">积分: {problem.score}</Badge>}
            </div>
            {problem.source && (
              <p className="text-sm text-muted-foreground">
                来源: {problem.source}
              </p>
            )}
          </div>

          <div className="pt-2 border-t">
            <h4 className="font-semibold mb-2">题目标签</h4>
            <div className="text-sm text-muted-foreground">
              {problem.description ? (
                <RenderMarkdown content={problem.description} />
              ) : (
                <p className="italic">暂无标签</p>
              )}
            </div>
          </div>

          {problem.note && (
            <div className="pt-2 border-t">
              <h4 className="font-semibold mb-2">题目备注</h4>
              <div className="text-sm text-muted-foreground">
                <RenderMarkdown content={problem.note} />
              </div>
            </div>
          )}

          {problem.variables.length > 0 && (
            <div className="pt-2 border-t">
              <h4 className="font-semibold mb-2">变量范围</h4>
              <div className="text-sm">
                {problem.variables.map((variable) => (
                  <p key={variable.id} className="mb-1">
                    {variable.name}: [{variable.lowerBound},{" "}
                    {variable.upperBound}]
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t">
            <h4 className="font-semibold mb-2">提交者信息</h4>
            <div className="flex flex-col items-start gap-1">
              <div className="flex flex-row items-center gap-2">
                <p className="text-sm font-medium">
                  {problem.user.realname ||
                    problem.user.username ||
                    "未命名用户"}
                </p>
                <p className="text-xs">{problem.user.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(problem.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {
            <div className="pt-2 border-t">
              <h4 className="font-medium mb-2">供题人</h4>
              <p className="text-sm italic">
                {!problem.offererEmail ? "本人供题" : problem.offererEmail}
              </p>
            </div>
          }

          {problem.remark && (
            <div className="pt-2 border-t">
              <h4 className="font-medium mb-2">审核意见</h4>
              <p className="text-sm italic">{problem.remark}</p>
            </div>
          )}

          {
            <div className="pt-2 border-t">
              <h4 className="font-medium mb-2">是否被提名为好题</h4>
              <p className="text-sm italic">
                {problem.nominated === "Yes" ? "是" : "否"}
              </p>
            </div>
          }
        </CardContent>
      </Card>

      {/* 第二列：题干、答案、解答过程 */}
      <Card className="lg:col-span-1 overflow-auto max-h-[80vh]">
        <CardHeader>
          <CardTitle>题目内容</CardTitle>
          <CardDescription>题干、答案与解答过程</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="mb-4">
            <AccordionItem value="content">
              <AccordionTrigger>题干</AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-muted rounded-md">
                  <RenderMarkdown content={problem.content} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="answer">
              <AccordionTrigger>答案</AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-muted rounded-md">
                  <RenderMarkdown content={problem.answer} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="solution">
              <AccordionTrigger>解答过程</AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-muted rounded-md">
                  <RenderMarkdown content={problem.solution} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* 第三列：AI表现 */}
      <Card className="lg:col-span-1 overflow-auto max-h-[80vh]">
        <CardHeader>
          <CardTitle>AI表现</CardTitle>
          <CardDescription>
            {problem.aiPerformances.length
              ? `共有 ${problem.aiPerformances.length} 个AI解答记录`
              : "暂无AI解答记录"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {problem.aiPerformances.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
              <p>尚未添加任何 AI 表现</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {problem.aiPerformances.map((ai) => (
                <Dialog key={ai.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer py-3 px-0 hover:shadow-md transition-shadow dark:bg-slate-800/50 bg-slate-50">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-1 flex-row items-center">
                            <CardTitle className="text-base font-bold">
                              {ai.unlistedAiName || ai.aiName}
                            </CardTitle>
                          </div>
                          <Badge
                            variant={ai.isCorrect ? "default" : "destructive"}
                            className="h-6 flex-nowrap"
                          >
                            {ai.isCorrect ? "正确" : "错误"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="mt-[-1em] text-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {new Date(ai.createdAt).toLocaleDateString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 cursor-pointer"
                          >
                            <Eye className="h-3 w-3" /> 查看详情
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl md:min-w-2xl max-h-[90vh]  overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between pr-6">
                        <span>
                          AI解答详情: {ai.unlistedAiName || ai.aiName}
                        </span>
                        <Badge
                          variant={ai.isCorrect ? "default" : "destructive"}
                        >
                          {ai.isCorrect ? "正确" : "错误"}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        提交于 {new Date(ai.createdAt).toLocaleString()}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 overflow-y-auto">
                      <div className="space-y-2">
                        <h4 className="font-medium">解答过程</h4>
                        <div className="p-4 bg-muted rounded-md max-h-[50vh] overflow-auto">
                          <RenderMarkdown content={ai.aiSolution} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">答案</h4>
                          <div className="p-4 bg-muted rounded-md mt-2">
                            <RenderMarkdown content={ai.aiAnswer} />
                          </div>
                        </div>

                        {ai.comment && (
                          <div>
                            <h4 className="font-medium">评价</h4>
                            <div className="p-4 bg-muted rounded-md mt-2">
                              <p className="italic">&quot;{ai.comment}&quot;</p>
                            </div>
                          </div>
                        )}

                        {ai.aiScore !== undefined && (
                          <div>
                            <h4 className="font-medium">AI得分</h4>
                            {ai.aiScore === null ? (
                              <p className="p-4 bg-muted rounded-md mt-2 italic">
                                暂无评分
                              </p>
                            ) : (
                              <p className="p-4 bg-muted rounded-md mt-2">
                                {ai.aiScore} 分
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
