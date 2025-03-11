import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@ant-design/pro-editor'],
  experimental: {
    turbo: {
      resolveAlias: {
        'micromark-extension-math': 'micromark-extension-llm-math'
      }
    }
  }
};

export default nextConfig;
