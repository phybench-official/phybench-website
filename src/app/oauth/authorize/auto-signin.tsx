"use client";

// 未登录时自动把用户带去 UAAA 登录，登录完成后回到原授权地址继续 OAuth 流程。
// 仅展示一个干净的 loading 页，不暴露本站任何信息。
import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function AutoSignIn({ callbackUrl }: { callbackUrl: string }) {
  useEffect(() => {
    void signIn("uaaa", { callbackUrl, redirectTo: callbackUrl });
  }, [callbackUrl]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">正在登录，请稍候…</p>
    </main>
  );
}
