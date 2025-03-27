import { Scoreboard } from "@/components/main-find";
import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page() {
  const session = await auth();
  if (!session) return <NotAuthorized />;
  
  return <Scoreboard />;
}
