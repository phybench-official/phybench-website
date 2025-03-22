import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  experimental: {
    turbo: {
      resolveAlias: {
        "micromark-extension-math": "micromark-extension-llm-math",
      },
    },
  },
  // redirect /submit to /submit/1 permanently
  // redirect /examine to /examine/1 permanently
  async redirects() {
    return [
      {
        source: "/submit",
        destination: "/submit/1",
        permanent: true,
      },
      {
        source: "/examine",
        destination: "/examine/1",
        permanent: true,
      },
    ];
  },
  output: "standalone",
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [
      // @ts-expect-error fuck
      ["remark-math", { strict: true, throwOnError: true }],
      // @ts-expect-error fuck
      ["remark-gfm", { throwOnError: true }],
    ],
    rehypePlugins: [
      // @ts-expect-error fuck
      ["rehype-katex", { strict: true, throwOnError: true }],
      // rehypeRaw
    ],
  },
});

export default withMDX(nextConfig);
