import { auth } from "@/auth";
import BrowsePage from "@/components/main-browse";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page() {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  return (
    <div>
      <BrowsePage />
    </div>
  );
}
