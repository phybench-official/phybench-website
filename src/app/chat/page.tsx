import { auth } from "@/auth"
import ChatPage from "@/components/main-chat"
import { NotAuthorized } from "@/components/ui/not-authorized"

export default async function Page() {
  const session = await auth()
  if (!session) return <NotAuthorized />

  return (
    <div className=" h-screen max-h-screen overflow-clip pt-24">
      <ChatPage />
    </div>
  )
}