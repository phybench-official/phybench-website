"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RenderMarkdown from "./render-markdown";
import { ChatCompletionStream } from "openai/lib/ChatCompletionStream";

export function FetchChat({
  content,
  model,
  provider,
}: {
  content: string;
  model: string;
  provider: string;
}) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, model }),
      });

      // @ts-expect-error fuck
      const runner = ChatCompletionStream.fromReadableStream(response.body);

      runner.on("content", (delta, snapshot) => {
        setAnswer(snapshot);
      });

      await runner.finalChatCompletion();
    } catch (error) {
      console.error("Error:", error);
      toast.error("连接服务器失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg">
      <div className="flex flex-row justify-between">
        <h2 className="font-bold">
          {provider} - {model}
        </h2>
        <Button
          onClick={handleFetch}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          {loading ? "生成中..." : "获取回答"}
        </Button>
      </div>
      <div className="overflow-y-scroll h-full border rounded-lg p-4">
        <RenderMarkdown content={answer} />
      </div>
    </div>
  );
}
