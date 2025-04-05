"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";

export function MDXCode(props) {
  const { children, className, node, ...rest } = props;
  const match = /language-(\w+)/.exec(className || "");
  const { theme, systemTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof children === "string") {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return match ? (
    <div className="relative group mt-6">
      <div className="flex items-center justify-between px-4 py-2 my-[-6px] bg-slate-200 dark:bg-slate-800 rounded-t-lg">
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {match[1]}
        </span>
        <button
          onClick={handleCopy}
          className="relative flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <Copy className="h-4 w-4" />
          {copied && (
            <span className="absolute right-0 -top-8 px-2 py-1 text-xs text-white dark:text-slate-700 font-semibold bg-lime-600 dark:bg-lime-300 rounded shadow">
              已复制！
            </span>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        {...rest}
        PreTag="div"
        children={String(children).replace(/\n$/, "")}
        language={match[1]}
        style={
          theme === "system"
            ? systemTheme === "dark"
              ? vscDarkPlus
              : vs
            : theme === "dark"
              ? vscDarkPlus
              : vs
        }
      />
    </div>
  ) : (
    <code {...rest} className={cn("bg-transparent p-0 m-0", className)}>
      {children}
    </code>
  );
}

export default MDXCode;
