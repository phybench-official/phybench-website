import type { MDXComponents } from 'mdx/types'
import 'katex/dist/katex.min.css'
import Image, { ImageProps } from 'next/image'
import { cn } from "@/lib/utils"
import MDXCode from '@/components/mdx-code'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
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
      <p className={cn("leading-7 text-base [&:not(:first-child)]:mt-6", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("mt-2 ", className)} {...props} />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props} />
    ),
    img: (props) => {
      return (
        <Image
          width={800}
          height={1000}
          className={cn("rounded-md border")}
          {...(props as ImageProps)}
          alt={(props as ImageProps).alt || 'MDX image'}
          unoptimized
        />
      )
    },
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
    code: (props) => <MDXCode {...props} />,
    ...components,
  }
}