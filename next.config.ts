import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  resolve: {
    alias: {
      'micromark-extension-math': 'micromark-extension-llm-math'
    }
  },
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

export default nextConfig;
