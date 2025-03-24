import { ScoreboardPage } from "@/components/main-find";
import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page({
  params,
}: {
  params: Promise<{ page: string }> | { page: string };
}) {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  // 处理params可能是Promise的情况
  const resolvedParams = 'then' in params ? await params : params;
  const currentPage = parseInt(resolvedParams.page) || 1;
  
  return <ScoreboardPage currentPage={currentPage} />;
}
