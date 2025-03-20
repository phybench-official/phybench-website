"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import RenderMarkdown from "./render-markdown"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, ChevronLeft } from "lucide-react"
import type { ProblemData } from "@/lib/types"
import { statusMap, tagMap } from "@/lib/constants"
import { useRouter } from "next/navigation"

export function ProblemView({ problem }: { problem: ProblemData }) {
  const router = useRouter();
  
  return (
    <div className="container grid grid-cols-1 lg:grid-cols-3 gap-4 py-4 max-w-7xl">
      <div className="lg:col-span-3 mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => router.push("/submit")}
        >
          <ChevronLeft className="h-4 w-4" /> 返回题目列表
        </Button>
      </div>
      
      {/* 第一列：题目基本信息 */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>题目信息</span>
            <Badge className={`${statusMap[problem.status].color}`}>
              {statusMap[problem.status].label}
            </Badge>
          </CardTitle>
          <CardDescription>查看题目详细信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <div>
            <h3 className="font-semibold text-lg mb-2">{problem.title}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary" className={`${tagMap[problem.tag].color} text-white`}>
                {tagMap[problem.tag].label}
              </Badge>
              {problem.score && (
                <Badge variant="outline">
                  积分: {problem.score}
                </Badge>
              )}
            </div>
            {problem.source && (
              <p className="text-sm text-muted-foreground">来源: {problem.source}</p>
            )}
          </div>
          
          <div className="pt-2 border-t">
            <h4 className="font-semibold mb-2">题目描述</h4>
            <div className="text-sm text-muted-foreground">
              {problem.description ? (
                <RenderMarkdown content={problem.description} />
              ) : (
                <p className="italic">无描述</p>
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
                    {variable.name}: [{variable.lowerBound}, {variable.upperBound}]
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t">
            <h4 className="font-semibold mb-2">提交者信息</h4>
            <div className="flex flex-col items-start gap-1">
              <div className="flex flex-row items-center gap-2">
                <p className="text-sm font-medium">{problem.user.realname || problem.user.username || "未命名用户"}</p>
                <p className="text-xs">{problem.user.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(problem.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {problem.remark && (
            <div className="pt-2 border-t">
              <h4 className="font-medium mb-2">审核意见</h4>
              <p className="text-sm italic">{problem.remark}</p>
            </div>
          )}
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
                          <Button variant="ghost" size="sm" className="gap-1 cursor-pointer">
                            <Eye className="h-3 w-3" /> 查看详情
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl min-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between pr-6">
                        <span>AI解答详情: {ai.unlistedAiName || ai.aiName}</span>
                        <Badge variant={ai.isCorrect ? "default" : "destructive"}>
                          {ai.isCorrect ? "正确" : "错误"}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        提交于 {new Date(ai.createdAt).toLocaleString()}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">解答过程</h4>
                        <div className="p-4 bg-muted rounded-md max-h-[60vh] overflow-auto">
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
                              <p className="italic">
                                &quot;{ai.comment}&quot;</p>
                            </div>
                          </div>
                        )}
                        
                        {ai.aiScore !== undefined && (
                          <div>
                            <h4 className="font-medium">AI得分</h4>
                            {ai.aiScore === null ? (
                              <p className="p-4 bg-muted rounded-md mt-2 italic">暂无评分</p>
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

