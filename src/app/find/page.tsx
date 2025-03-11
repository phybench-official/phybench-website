import { auth } from "@/auth";
import FindPage from "@/components/main-find";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page() {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  return (
    <div>
      <FindPage />
    </div>
  );
}
