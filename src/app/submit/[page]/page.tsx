import { auth } from "@/auth";
import BrowsePage from "@/components/submit/main-browse";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page({
  params,
}: {
  params: Promise<{ page: number }>;
}) {
  const session = await auth();
  if (!session) return <NotAuthorized />;
  const { page } = await params;
  return (
    <div className="w-screen py-24">
      <BrowsePage currentPage={page} />
    </div>
  );
}
