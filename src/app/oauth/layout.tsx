import type { Metadata } from "next";

// /oauth 授权中转：覆盖默认站点标题，避免泄漏本站信息。
export const metadata: Metadata = {
  title: "登录中…",
};

export default function OAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
