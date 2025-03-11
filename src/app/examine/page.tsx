import { auth } from "@/auth";
import ExaminePage from "@/components/main-examine";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page() {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  return (
    <div>
      <ExaminePage />
    </div>
  );
}
