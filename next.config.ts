import type { NextConfig } from "next";
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  experimental: {
    turbo: {
      resolveAlias: {
        'micromark-extension-math': 'micromark-extension-llm-math'
      }
    }
  }
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [
      // @ts-expect-error fuck
      ['remark-math', { strict: true, throwOnError: true }],
      // @ts-expect-error fuck
      ['remark-gfm', { throwOnError: true }],
    ],
    rehypePlugins: [
      // @ts-expect-error fuck
      ['rehype-katex', { strict: true, throwOnError: true }],
      // rehypeRaw
    ],
  },
})

export default withMDX(nextConfig);