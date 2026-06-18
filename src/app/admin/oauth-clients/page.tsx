import { auth } from "@/auth";
import OAuthClientsPage from "@/components/admin/oauth-clients";
import { NotPermitted } from "@/components/ui/not-permitted";
import { NotAuthorized } from "@/components/ui/not-authorized";
import { ISSUER } from "@/lib/oauth/config";

export default async function Page() {
  const session = await auth();
  if (!session) return <NotAuthorized />;
  if (session.user.role !== "admin") return <NotPermitted />;

  return (
    <div className="overflow-auto pt-24">
      <OAuthClientsPage issuer={ISSUER} />
    </div>
  );
}
