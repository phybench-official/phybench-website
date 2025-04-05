"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { updateUsername } from "@/lib/actions";

interface EditUsernameFormProps {
  initialUsername: string;
  userEmail: string;
}

export default function EditUsernameForm({
  initialUsername,
  userEmail,
}: EditUsernameFormProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateUsername(formData);
    router.refresh(); // 刷新页面数据
    setOpen(false);
    toast.success("用户名已更新");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="ml-4 cursor-pointer">
          <Pencil className="w-[20px]" />
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>编辑用户名</DialogTitle>
            <DialogDescription>更改将写入数据库</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                defaultValue={initialUsername}
                className="col-span-3"
              />
            </div>
            <input type="hidden" name="email" value={userEmail} />
          </div>
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
