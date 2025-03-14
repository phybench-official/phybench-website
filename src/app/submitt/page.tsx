import { auth } from "@/auth";
import SubmitPage from "@/components/submit/main-submit-backup";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page() {
  const session = await auth();
  if (!session) return <NotAuthorized />;

  return (
    <div className="w-screen h-screen pt-24">
      <SubmitPage />
    </div>
  );
}