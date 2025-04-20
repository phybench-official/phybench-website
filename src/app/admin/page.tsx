import { auth } from "@/auth";
import AdminPage from "@/components/admin/main-admin";
import { NotPermitted } from "@/components/ui/not-permitted";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page() {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  if (session.user.role !== "admin") return <NotPermitted />;

  return (
    <div className=" overflow-auto pt-24">
      <AdminPage />
    </div>
  );
}
