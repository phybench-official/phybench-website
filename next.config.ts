import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  config: {
    turbo: {
      resolveAlias: {
        "micromark-extension-math": "micromark-extension-llm-math",
      },
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "micromark-extension-math": "micromark-extension-llm-math",
    };
    return config;
  },
  // 把 OIDC 标准发现地址映射到内部路由处理器。
  async rewrites() {
    return [
      {
        source: "/.well-known/openid-configuration",
        destination: "/api/oauth/openid-configuration",
      },
      {
        source: "/.well-known/jwks.json",
        destination: "/api/oauth/jwks",
      },
    ];
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
      {
        source: "/translate",
        destination: "/translate/1",
        permanent: true,
      },
      {
        source: "/admin/admin-browse",
        destination: "/admin/admin-browse/1",
        permanent: true,
      },
    ];
  },
  output: "standalone",
};

export default nextConfig;
