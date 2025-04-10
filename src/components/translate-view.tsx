"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner"; // 使用 sonner 提示库
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/submit/markdown-editor";
import RenderMarkdown from "@/components/render-markdown"; // 引入 RenderMarkdown

interface Problem {
  content: string;
  id: number;
  translatedStatus?:
    | "PENDING"
    | "RETURNED"
    | "APPROVED"
    | "REJECTED"
    | "ARCHIVED";
  translatedContent?: string;
  solution?: string;
  translatedSolution?: string;
}

export function TranslateView({ problem }: { problem: Problem }) {
  const router = useRouter();

  const [translatedStatus, setTranslatedStatus] = useState(
    problem.translatedStatus || "PENDING",
  );

  const [englishTranslation, setEnglishTranslation] = useState(
    problem.translatedContent,
  );
  const [translatedSolution, setTranslatedSolution] = useState(
    problem.translatedSolution,
  );

  const saveStatus = async (
    newStatus: "PENDING" | "RETURNED" | "APPROVED" | "REJECTED" | "ARCHIVED",
  ) => {
    try {
      const res = await fetch("/api/data/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          translatedStatus: newStatus,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save status");
      }
      setTranslatedStatus(newStatus);
      toast.success(`状态已更新为 ${newStatus}`);
    } catch (error) {
      console.error("Error saving status:", error);
      toast.error("更新状态失败，请重试。");
    }
  };

  const saveEnglishTranslation = async (text: string) => {
    try {
      const res = await fetch("/api/data/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          translatedContent: text,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save translation");
      }
      setEnglishTranslation(text);
      toast.success("题干翻译保存成功！");
    } catch (error) {
      console.error("Error saving english translation:", error);
      toast.error("题干翻译保存失败，请重试。");
    }
  };

  const saveTranslatedSolution = async (text: string) => {
    try {
      const res = await fetch("/api/data/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          translatedSolution: text,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save solution translation");
      }
      setTranslatedSolution(text);
      toast.success("解答过程翻译保存成功！");
    } catch (error) {
      console.error("Error saving translated solution:", error);
      toast.error("解答过程翻译保存失败，请重试。");
    }
  };

  const handleCopyProblemContent = () => {
    if (problem.content) {
      navigator.clipboard.writeText(problem.content);
      toast.success("题干已复制");
    } else {
      toast.info("暂无题干可复制");
    }
  };

  const handleCopySolution = () => {
    if (problem.solution) {
      navigator.clipboard.writeText(problem.solution);
      toast.success("解答过程已复制");
    } else {
      toast.info("暂无解答过程可复制");
    }
  };

  return (
    <div className="container max-w-full mx-auto px-4 py-4">
      {/* 返回按钮放在最上方 */}
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 cursor-pointer ml-40"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" /> 返回题目列表
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="container grid grid-cols-1 gap-4 md:grid-cols-2 max-w-auto mx-auto">
          {/* 顶部行：问题内容及其翻译 */}
          <Card className="mb-4 md:mb-0 h-[600px] overflow-auto">
            <CardContent>
              <p className="font-bold">题干</p>
              <RenderMarkdown content={problem.content} />
              <Button onClick={handleCopyProblemContent} className="mt-2">
                复制内容
              </Button>
            </CardContent>
          </Card>
          <Card className="mb-4 md:mb-0 h-[600px] overflow-auto">
            <CardContent>
              <p className="font-bold">题干翻译</p>
              <br></br>
              <MarkdownEditor
                text={englishTranslation || ""}
                setText={setEnglishTranslation}
                placeholder="暂无题干翻译"
              />
              <br></br>
              <Button
                onClick={() => saveEnglishTranslation(englishTranslation || "")}
              >
                保存翻译
              </Button>
            </CardContent>
          </Card>

          {/* 底部行：解决方案内容及其翻译 */}
          <Card className="mb-4 md:mb-0 h-[800px] overflow-auto">
            <CardContent>
              <p className="font-bold">解答过程</p>
              <RenderMarkdown content={problem.solution || "暂无解答内容"} />
              <Button onClick={handleCopySolution} className="mt-2">
                复制解答
              </Button>
            </CardContent>
          </Card>
          <Card className="mb-4 md:mb-0 h-[800px] overflow-auto">
            <CardContent>
              <p className="font-bold">解答过程翻译</p>
              <br></br>
              <MarkdownEditor
                text={translatedSolution || ""}
                setText={setTranslatedSolution}
                placeholder="暂无解答过程翻译"
              />
              <br></br>
              <Button
                onClick={() => saveTranslatedSolution(translatedSolution || "")}
              >
                保存翻译
              </Button>
            </CardContent>
          </Card>

          {/* 当前状态保持不变 */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              当前状态: {translatedStatus === "PENDING" ? "待处理" : "已归档"}
            </h2>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => saveStatus("ARCHIVED")}>标记为归档</Button>
              <Button onClick={() => saveStatus("PENDING")}>
                标记为待处理
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
