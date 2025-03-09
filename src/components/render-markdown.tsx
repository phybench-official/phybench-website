"use client";

import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { vscDarkPlus ,vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ComponentProps, useState } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from 'next-themes'
import { Copy } from 'lucide-react';

export default function RenderMarkdown() {

  const { theme, systemTheme } = useTheme()

  const markdownComponents: ComponentProps<typeof Markdown>['components'] = {
    h1: ({ className, ...props }) => (
      <h1 className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)} {...props} />
    ),
    h2: ({ className, ...props }) => (
      <h2 className={cn("mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0", className)} {...props} />
    ),
    h3: ({ className, ...props }) => (
      <h3 className={cn("mt-8 scroll-m-20 text-2xl font-semibold tracking-tight", className)} {...props} />
    ),
    h4: ({ className, ...props }) => (
      <h4 className={cn("mt-4 scroll-m-20 text-xl font-semibold tracking-tight", className)} {...props} />
    ),
    p: ({ className, ...props }) => (
      <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("mt-2", className)} {...props} />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props} />
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
      <tr className={cn("m-0 border-t p-0 even:bg-muted", className)} {...props} />
    ),
    th: ({ className, ...props }) => (
      <th className={cn("border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
    ),
    td: ({ className, ...props }) => (
      <td className={cn("border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
    ),
    pre: ({ className, ...props }) => (
      <pre className={cn("mb-4 mt-4 overflow-x-auto rounded-lg py-2", className)} {...props} />
    ),
    a: ({ className, ...props }) => (
      <a className={cn("font-medium underline underline-offset-4 text-sky-800 dark:text-sky-200 hover:font-semibold transition-all", className)} {...props} />
    ),
    code:(props) => {
      const {children, className, node, ...rest} = props
      const match = /language-(\w+)/.exec(className || '')
      const [copied, setCopied] = useState(false);

      const handleCopy = async () => {
        if (typeof children === 'string') {
          await navigator.clipboard.writeText(children);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      };

      return match ? (
        <div className="relative group mt-6">
          <div className="flex items-center justify-between px-4 py-2 my-[-6px] bg-slate-200 dark:bg-slate-800 rounded-t-lg">
            <span className="text-sm text-slate-700 dark:text-slate-300">{match[1]}</span>
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
            children={String(children).replace(/\n$/, '')}
            language={match[1]}
            style={theme === 'system' ? (systemTheme === 'dark' ? vscDarkPlus : vs) : (theme === 'dark' ? vscDarkPlus : vs)}
          />
        </div>
      ) : (
        <code {...rest} className={cn("bg-transparent p-0 m-0", className)}>
          {children}
        </code>
      )
    }
  }

  const content = `# This is an H1
  ## This is an H2
  ### This is an H3
  #### This is an H4
  ##### This is an H5

  The point of reference-style links is not that they’re easier to write. The point is that with reference-style links, your document source is vastly more readable. Compare the above examples: using reference-style links, the paragraph itself is only 81 characters long; with inline-style links, it’s 176 characters; and as raw \`HTML\`, it’s 234 characters. In the raw \`HTML\`, there’s more markup than there is text.

  ---

  > This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
  > consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
  > Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
  >
  > Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
  > id sem consectetuer libero luctus adipiscing.

  ---

  an example | *an example* | **an example**

  ---

  ![](https://gw.alipayobjects.com/zos/kitchen/sLO%24gbrQtp/lobe-chat.webp)

  ![](https://gw.alipayobjects.com/zos/kitchen/8Ab%24hLJ5ur/cover.webp)

  <video
    poster="https://gw.alipayobjects.com/zos/kitchen/sLO%24gbrQtp/lobe-chat.webp"
    src="https://github.com/lobehub/lobe-chat/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2"/>

  ---

  1. Bird
  1. McHale
  1. Parish
      1. Bird
      1. McHale
          1. Parish

  ---

  - Red
  - Green
  - Blue
      - Red
      - Green
          - Blue

  ---

  This is [an example](http://example.com/ "Title") inline link.

  <http://example.com/>


  | title | title | title |
  | --- | --- | --- |
  | content | content | content |


  \`\`\`bash
  $ pnpm install
  \`\`\`


  \`\`\`javascript
  import { renderHook } from '@testing-library/react-hooks';
  import { act } from 'react-dom/test-utils';
  import { useDropNodeOnCanvas } from './useDropNodeOnCanvas';
  \`\`\`


  \`\`\`mermaid
  graph TD
  A[Enter Chart Definition] --> B(Preview)
  B --> C{decide}
  C --> D[Keep]
  C --> E[Edit Definition]
  E --> B
  D --> F[Save Image and Code]
  F --> B
  \`\`\`


  ---

  以下是一段Markdown格式的LaTeX数学公式：

  我是一个行内公式：$E=mc^2$

  我是一个独立的傅里叶公式：
  $$
  f(x) = a_0 + \\sum_{n=1}^{\\infty} \\left( a_n \\cos(nx) + b_n \\sin(nx) \\right)
  $$

  其中，带有积分符号的项：
  $$
  a_0 = \\frac{1}{2\\pi} \\int_{-\\pi}^{\\pi} f(x) \\, dx
  $$

  $$
  a_n = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} f(x) \\cos(nx) \\, dx \\quad \\text{for} \\quad n \\geq 1
  $$

  $$
  b_n = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} f(x) \\sin(nx) \\, dx \\quad \\text{for} \\quad n \\geq 1
  $$

  我是一个带有分式、测试长度超长的泰勒公式：

  $$
  \\begin{equation}
  f(x) = f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\frac{f'''(a)}{3!}(x - a)^3 + \\cdots + \\frac{f^{(n)}(a)}{n!}(x - a)^n + R_n(x)
  \\end{equation}
  $$

  我是上面公式的行内版本，看看我会不会折行：$ f(x) = f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\frac{f'''(a)}{3!}(x - a)^3 + \\cdots + \\frac{f^{(n)}(a)}{n!}(x - a)^n + R_n(x) $


  我是一个带有上下标的公式：
  $$
  q_1 q_2 = (w_1 w_2 - \\vec{v}_1^T \\vec{v}_2, \\, w_1 \\vec{v}_2 + w_2 \\vec{v}_1 + \\vec{v}_1 \\times \\vec{v}_2)
  $$

  我是一个带有 tag 的公式：
  $$
  q = a + bi + cj + dk \\tag{1}
  $$

  ---

  我是一个嵌套测试：
  \`\`\`
  $1
  \`\`\`
  `;

  return (
    <>
      <Markdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={markdownComponents}
        children={content}
      />
    </>
  );
};