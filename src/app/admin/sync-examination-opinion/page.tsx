import { auth } from "@/auth";
import SyncExaminationOpinion from "@/components/admin/sync-examination-opinion";
import { NotPermitted } from "@/components/ui/not-permitted";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page() {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  if (session.user.role !== "admin") return <NotPermitted />;

  return (
    <div className=" h-screen max-h-screen overflow-clip pt-24">
      <SyncExaminationOpinion />
    </div>
  );
}
