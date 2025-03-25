import { ScoreboardPage } from "@/components/main-find";
import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page({
  params,
}: {
  params: Promise<{ page: number }>;
}) {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  const { page } = await params;
  const currentPage = page;
  
  return <ScoreboardPage currentPage={currentPage} />;
}
