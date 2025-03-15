import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/prisma"
import { type User } from "@/types"
import EditUsernameForm from "@/components/username-form"

export default async function UserInfo({ user }:{ user: User }) {
  const userinfo = {
    "姓名": user.realname,
    "学号": user.name,
    "角色": user.role === "admin" ? "管理员" : "用户",
    "邮箱": user.email,
  }

  const usernameData = await prisma.user.findUnique({
    where: {
      email: user.email ?? "",
    },
  })

  return (
    <div className="w-full flex flex-row justify-center">
      <Card className="w-1/2 border-2 border-slate-400 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl">用户信息</CardTitle>
          <CardDescription className="text-base">实名信息仅供确认用户权限使用</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 space-y-2">
            <span className="font-semibold">用户名</span>
            <div className="col-span-2 opacity-90 flex flex-row">
              { usernameData?.username }
              <EditUsernameForm initialUsername={usernameData?.username || ""} userEmail={user.email || ""} />
            </div>
          </div>
          {
            Object.entries(userinfo).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 space-y-2">
                <span className="font-semibold">{key}</span>
                <span className="col-span-2 opacity-90">{value}</span>
              </div>
            ))
          }
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="text-sm font-semibold  text-slate-500 dark:text-gray-400">
            本项目通过
            <a href="https://unifiedauth.pku.edu.cn/" target="_blank" rel="noopener noreferrer" className="text-primary underline mx-2 opacity-80 hover:opacity-100">UAAA</a>
            实现身份认证
            <br/>
            技术支持：
            <a href="https://lcpu.dev/" target="_blank" rel="noopener noreferrer" className="text-primary underline opacity-80 hover:opacity-100">北京大学Linux俱乐部</a>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}