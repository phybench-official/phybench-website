import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import RenderMarkdown from "@/components/render-markdown"

interface Step4Props {
  title: string;
  selectedType: string;
  source: string;
  aiResponses: any[];
  problem: string;
  user: any;
}

export default function Step4({ title, selectedType, source, aiResponses, problem, user }: Step4Props) {
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>确认信息</CardTitle>
        <CardDescription>请仔细确认以下信息，缺失内容以红色提示</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* 左侧信息 */}
          <div className="flex flex-col items-start">
            <div>
              <strong>题目名称: </strong>
              {title ? title : <span className="text-red-500">缺失</span>}
            </div>
            <div>
              <strong>题目类别: </strong>
              {selectedType ? <Badge>{selectedType}</Badge> : <Badge variant="destructive">缺失</Badge>}
            </div>
            <div>
              <strong>提交人: </strong>
              {user?.name || user?.email
                ? (user.name || user.email)
                : <span className="text-red-500">缺失</span>}
            </div>
            <div>
              <strong>题目来源: </strong>
              {source ? source : <span className="text-red-500">缺失</span>}
            </div>
            <div>
              <strong>已上传的AI表现:</strong>
              {aiResponses && aiResponses.length > 0 ? (
                <div className="flex flex-col space-y-2">
                  {aiResponses.map((res, index) => (
                    <div className="flex flex-row space-x-4 p-2 w-full border">
                      <span className="text-lg font-semibold">{res.name}</span>
                      {
                        res.correctness == "correct" ? <Badge>正确</Badge> : <Badge variant="destructive">错误</Badge>
                      }
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-red-500">缺失</span>
              )}
            </div>
          </div>
          {/* 右侧Markdown题干 */}
          <div className="md:w-1/2">
            <div className="border rounded p-2 h-[35vh] overflow-y-auto">
              <RenderMarkdown content={problem ? problem : "缺失题干内容"} />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {/* 底部可根据需要添加按钮等操作 */}
      </CardFooter>
    </Card>
  );
}