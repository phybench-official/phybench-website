import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkdownEditor } from "./markdown-editor";
import { Input } from "@/components/ui/input";

export default function Step1({
  title,
  setTitle,
  source,
  setSource,
  problem,
  setProblem,
  selectedType,
  setSelectedType,
  description,
  setDescription,
  note,
  setNote,
  offererEmail,
  setOffererEmail,
}: {
  title: string;
  setTitle: (v: string) => void;
  source: string;
  setSource: (v: string) => void;
  problem: string;
  setProblem: (v: string) => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  offererEmail: string;
  setOffererEmail: (v: string) => void;
}) {
  return (
    <Card className="flex-1 h-[60vh] w-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">题目信息</CardTitle>
        <CardDescription>请填写题目基本信息及编辑题干</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 w-full flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-4  h-full">
          {/* 左侧：基本信息填写 */}
          <div className="space-y-4 overflow-y-auto px-2">
            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm font-medium mt-2">题目名称</label>
              <Input
                placeholder="请输入题目名称"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm font-medium mt-2">题目来源</label>
              <Input
                placeholder="请输入题目来源"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm font-medium mt-2">题目类型</label>
              <div className="col-span-2 max-w-[300px]">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择题目类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="力学">力学</SelectItem>
                    <SelectItem value="电磁学">电磁学</SelectItem>
                    <SelectItem value="热学">热学</SelectItem>
                    <SelectItem value="光学">光学</SelectItem>
                    <SelectItem value="近代物理">近代物理</SelectItem>
                    <SelectItem value="四大力学及以上知识">
                      四大力学及以上知识
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm font-medium mt-2">题目标签</label>
              <Input
                placeholder="请输入描述题目的若干tag，如：力学/分析力学/几何/感知/推理/有图"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm font-medium mt-2">题目备注</label>
              <Input
                placeholder="请输入题目备注（可选）"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm font-medium mt-2">
                供题人邮箱
              </label>
              <Input
                placeholder="请输入供题人邮箱（可选）"
                value={offererEmail}
                onChange={(e) => setOffererEmail(e.target.value)}
                className="col-span-2"
              />
            </div>
          </div>
          <div className="flex flex-col h-full">
            <MarkdownEditor
              text={problem}
              setText={setProblem}
              placeholder="请输入Markdown格式的题干"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>{/* 可根据需要添加底部操作 */}</CardFooter>
    </Card>
  );
}
