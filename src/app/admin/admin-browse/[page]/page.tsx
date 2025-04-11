import { auth } from "@/auth";
import BrowsePage from "@/components/submit/main-browse";
import { NotAuthorized } from "@/components/ui/not-authorized";
import { NotPermitted } from "@/components/ui/not-permitted";

export default async function Page({
  params,
}: {
  params: Promise<{ page: number }>;
}) {
  const session = await auth();
  if (!session) return <NotAuthorized />;
  if (session.user.role !== "admin") return <NotPermitted />;
  const { page } = await params;
  return (
    <div className="w-screen py-24">
      <BrowsePage
        currentPage={page}
        isExam
        isAdmin={session.user.role == "admin"}
      />
    </div>
  );
}
