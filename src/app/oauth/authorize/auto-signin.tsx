"use client";

// 未登录时自动把用户带去 UAAA 登录，登录完成后回到原授权地址继续 OAuth 流程。
import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function AutoSignIn({ callbackUrl }: { callbackUrl: string }) {
  useEffect(() => {
    void signIn("uaaa", { callbackUrl, redirectTo: callbackUrl });
  }, [callbackUrl]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <p className="text-muted-foreground">正在跳转到北京大学统一身份认证…</p>
    </div>
  );
}
