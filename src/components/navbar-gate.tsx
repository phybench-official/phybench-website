"use client";

// 在 /oauth 授权中转路由隐藏全站导航栏，避免向下游应用泄漏本站信息，只展示干净的 loading 页。
import { usePathname } from "next/navigation";

export function NavBarGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/oauth")) {
    return null;
  }
  return <>{children}</>;
}
