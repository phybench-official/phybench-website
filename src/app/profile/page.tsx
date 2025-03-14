import { auth } from "@/auth"
import UserInfo from "@/components/user-info"
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return <NotAuthorized />
  }

  console.log(session);

  return (
    <div className="mt-[20vh]">
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
      <UserInfo user={session.user} />
    </div>
  )
}