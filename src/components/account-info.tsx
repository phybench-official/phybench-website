import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { auth, signIn, signOut } from "@/auth"

export async function AccountInfo() {
  const session = await auth()

  return (
    <Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className=" cursor-pointer" size="icon">
            <CircleUserRound className="h-[1.5rem] w-[1.5rem]" />
            <span className="sr-only">Account Info</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {
            session ? (      
              <DialogTrigger asChild>     
                <DropdownMenuItem>
                  <p className="cursor-pointer">
                    登出
                  </p>
                </DropdownMenuItem>
              </DialogTrigger>
            ) : (
              <>
                <DropdownMenuItem>
                  <form
                    action={async () => {
                      "use server"
                      await signIn("uaaa")
                    }}
                  >
                    <button type="submit" className="cursor-pointer">登录</button>
                  </form>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <form
                    action={async () => {
                      "use server"
                      await signIn("authentik")
                    }}
                  >
                    <button type="submit" className="cursor-pointer">临时登录</button>
                  </form>
                </DropdownMenuItem>
              </>
            )
          }
          <DropdownMenuItem>
            <Link href="/profile">
              用户信息
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>登出</DialogTitle>
        </DialogHeader>
          <p className="py-4">
            是否退出账号{session?.user.username}?
          </p>
        <DialogFooter className="flex flex-row justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline">取消</Button>
          </DialogClose>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <Button type="submit" variant="destructive" className="cursor-pointer">登出</Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}