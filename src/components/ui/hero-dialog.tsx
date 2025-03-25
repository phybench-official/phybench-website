import { auth } from "@/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "./input";
import { prisma } from "@/prisma";

export async function Announcement() {
  const session = await auth();
  if (!session) return null;

  const realname = await prisma.user.findUnique({
    where: { email: session.user.email || "" },
    select: { realname: true },
  }).then((user) => user?.realname);

  if (realname != null) return null;

  const updateRealName = async function (formData: FormData) {
    "use server";
    const realname = formData.get("realname") as string;

    await prisma.user.update({
      where: { email: session.user.email || "" },
      data: { realname },
    });
  }

  return (
    <Dialog defaultOpen={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>请提供真实姓名</DialogTitle>
          <DialogDescription>
            （由于UAAA系统问题，在某个历史时间段内登录的用户未能获取到实名信息，需要手动添加姓名信息，谢谢配合！）
          </DialogDescription>
        </DialogHeader>
        <form action={updateRealName}>
          <Input
            type="text"
            name="realname"
            placeholder="请输入真实姓名"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <DialogFooter className="flex flex-row items-center mt-4">
            <DialogClose asChild>
              <Button type="submit" className="cursor-pointer">
                提交
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}