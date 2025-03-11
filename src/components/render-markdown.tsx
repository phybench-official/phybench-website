"use client";

import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeMathjax from "rehype-mathjax";
import "katex/dist/katex.min.css";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkParse from "remark-parse";
import rehypeStringify from "rehype-stringify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Copy, ChevronDown, ChevronRight } from "lucide-react";

// 添加自定义类型定义
type CustomMarkdownComponents = ComponentProps<
  typeof Markdown
>["components"] & {
  think: React.ComponentType<{
    children: React.ReactNode;
    className?: string;
  }>;
};

export default function RenderMarkdown({ content }: { content: string }) {
  const { theme, systemTheme } = useTheme();

  const markdownComponents = {
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
          className
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          "mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
          className
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn(
          "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    h4: ({ className, ...props }) => (
      <h4
        className={cn(
          "mt-4 scroll-m-20 text-xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    p: ({ className, ...props }) => (
      <p
        className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("mt-2", className)} {...props} />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn("mt-6 border-l-2 pl-6 italic", className)}
        {...props}
      />
    ),
    img: ({ className, ...props }) => (
      <img className={cn("rounded-md border", className)} {...props} />
    ),
    hr: ({ ...props }) => (
      <hr className="my-4 border-slate-200 dark:border-slate-700" {...props} />
    ),
    table: ({ className, ...props }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className={cn("w-full", className)} {...props} />
      </div>
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={cn("m-0 border-t p-0 even:bg-muted", className)}
        {...props}
      />
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn(
          "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
          className
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={cn(
          "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
          className
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn("mb-4 mt-4 overflow-x-auto rounded-lg py-2", className)}
        {...props}
      />
    ),
    a: ({ className, ...props }) => (
      <a
        className={cn(
          "font-medium underline underline-offset-4 text-sky-800 dark:text-sky-200 hover:font-semibold transition-all",
          className
        )}
        {...props}
      />
    ),
    code: (props) => {
      const { children, className, node, ...rest } = props;
      const match = /language-(\w+)/.exec(className || "");
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
    },
    think: ({ className, ...props }) => {
      const [isOpen, setIsOpen] = useState(true);

      return (
        <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center w-full px-4 py-2 text-left bg-slate-100 dark:bg-slate-800 rounded-t-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 mr-2" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2" />
            )}
            <span className="font-medium text-sm">推理过程</span>
          </button>
          {isOpen && (
            <div className="p-4 bg-slate-300/50 dark:bg-black/50 text-xs text-slate-800 dark:text-slate-200  rounded-b-lg">
              {props.children}
            </div>
          )}
        </div>
      );
    },
  } as CustomMarkdownComponents;

  return (
    <>
      <Markdown
        remarkPlugins={[remarkMath, remarkGfm, remarkParse]}
        rehypePlugins={[rehypeKatex, rehypeRaw, rehypeStringify]}
        components={markdownComponents}
      >
        {content}
      </Markdown>
    </>
  );
}
