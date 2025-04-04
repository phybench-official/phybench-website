"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // 使用 sonner 提示库
import RenderMarkdown from "@/components/render-markdown"; // 引入 RenderMarkdown
interface Problem {
  content: string;
  id: string;
  translatedStatus?: 'ARCHIVED' | 'PENDING';
  translatedContent?: string;
  solution?: string;
  translatedSolution?: string;
}
// Left side: non-editable problem content.
export function ProblemContent({ problem }: { problem: Problem }) {
  return (
    <Card className="mb-4 md:mb-0 h-[400px] overflow-auto">
      <CardContent>
        <h2>题目内容</h2>
        <RenderMarkdown content={problem.content} />
        <Button 
          onClick={() => {
            navigator.clipboard.writeText(problem.content || '');
            toast.success('题目内容已复制');
          }}
          className="mt-2"
        >
          复制内容
        </Button>
      </CardContent>
    </Card>
  );
}

// Editable translation component.
// 定义 EditableTranslation 的参数类型
interface EditableTranslationProps {
  content: string; // 翻译内容
  onSave: (text: string) => void; // 保存翻译的回调函数
}

// 修改后的 EditableTranslation 组件
export function EditableTranslation({ content, onSave }: EditableTranslationProps) {
  const [text, setText] = useState(content || "");

  return (
    <Card className="mb-4 md:mb-0 h-[400px] overflow-auto">
      <CardContent>
        <h2>翻译内容</h2>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="resize-none h-full"
        />
        <Button onClick={() => onSave(text)}>保存翻译</Button>
      </CardContent>
    </Card>
  );
}

// 修改 SolutionContent 组件，添加复制按钮
interface SolutionContentProps {
  solution: string; // 明确类型定义
}

function SolutionContent({ solution }: SolutionContentProps) {
  // 复制解答内容的函数
  const handleCopySolution = () => {
    if (solution) {
      navigator.clipboard.writeText(solution);
      toast.success('解答内容已复制');
    } else {
      toast.info('暂无解答内容可复制');
    }
  };

  return (
    <Card className="mb-4 md:mb-0 h-[400px] overflow-auto">
      <CardContent>
        <h2>解答内容</h2>
        {/* 渲染 Markdown 内容，处理空值 */}
        <RenderMarkdown content={solution || "暂无解答内容"} />
        {/* 复制按钮 */}
        <Button 
          onClick={handleCopySolution}
          className="mt-2"
        >
          复制解答
        </Button>
      </CardContent>
    </Card>
  );
}

// Main TranslateView component.
export function TranslateView({ problem }: { problem: Problem }) {
  // 新增状态管理
  const [translatedStatus, setTranslatedStatus] = useState(problem.translatedStatus || 'PENDING');

  // 新增保存状态的函数
  const saveStatus = async (newStatus: 'ARCHIVED' | 'PENDING') => {
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

  // Local state for translations.
  const [englishTranslation, setEnglishTranslation] = useState(
    problem.translatedContent // 原字段名修正
  );
  const [translatedSolution, setTranslatedSolution] = useState(
    problem.translatedSolution
  );

  // Function to save the translated content (题目翻译).
  const saveEnglishTranslation = async (text: string) => {
    try {
      const res = await fetch("/api/data/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          translatedContent: text, // 确保字段名与后端一致
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

  // Function to save the translated solution.
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
      toast.success("解答翻译保存成功！"); // 成功提示
    } catch (error) {
      console.error("Error saving translated solution:", error);
      toast.error("解答翻译保存失败，请重试。"); // 错误提示
    }
  };

  return (
    <div className="container grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2 max-w-screen-lg mx-auto">
      {/* Top row: problem content and its translation */}
      <ProblemContent problem={problem} />
      <EditableTranslation
        content={englishTranslation}
        onSave={saveEnglishTranslation}
      />

      {/* Bottom row: solution content and its translation */}
      <SolutionContent solution={problem.solution} />
      <EditableTranslation
        content={translatedSolution}
        onSave={saveTranslatedSolution}
      />

      {/* 现有内容保持不变 */}
      // 新增状态控制组件
      <div className="mb-4">
        <h2>当前状态: {translatedStatus}</h2>
        <Button onClick={() => saveStatus("ARCHIVED")}>
          标记为归档
        </Button>
        <Button onClick={() => saveStatus("PENDING")}>
          标记为待处理
        </Button>
      </div>
    </div>
  );
}