import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { prisma } from "@/prisma"
import { type User } from "@/lib/types"
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
    include: {
      scoreEvents: {
        include: {
          problem: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
  
  // 积分事件类型映射表
  const scoreEventTagMap: Record<string, string> = {
    "OFFER": "提供题目",
    "SUBMIT": "上传题目",
    "EXAMINE": "审核题目",
    "DEBUG": "反馈Bug",
    "PUNISH": "惩罚",
  };

  return (
    <div className="w-full lg:px-24 grid grid-cols-3 justify-center items-center gap-6 mb-12">
      <Card className=" border-2 border-slate-400 dark:border-slate-800">
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
          <div className="grid grid-cols-3 space-y-2 mt-2">
            <span className="font-semibold">当前积分</span>
            <span className="col-span-2 opacity-90 font-bold text-primary">{usernameData?.score || 0}</span>
          </div>
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

      <Card className=" col-span-2 border-2 border-slate-400 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl">积分记录</CardTitle>
          <CardDescription>用户积分变动历史</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] overflow-y-auto relative border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[180px]">时间</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="text-right">积分变动</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usernameData?.scoreEvents && usernameData.scoreEvents.length > 0 ? (
                  usernameData.scoreEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono">
                        {new Date(event.createdAt).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>{scoreEventTagMap[event.tag] || event.tag}</TableCell>
                      <TableCell>
                        {event.problem ? `题目: ${event.problem.title}` : '系统操作'}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${event.score >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {event.score >= 0 ? `+${event.score}` : event.score}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      暂无积分记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}