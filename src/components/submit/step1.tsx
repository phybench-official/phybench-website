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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RenderMarkdown from "@/components/render-markdown";

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
              <label className="block text-sm font-medium mt-2">题目描述</label>
              <Input
                placeholder="请输入进一步描述题目的若干tag，如：刚体动力学 感知 几何 有图（详见项目文档）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-2"
              />
            </div>
          </div>
          <div className="flex flex-col h-full">
            <Tabs defaultValue="edit" className="w-full flex flex-col flex-1">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="flex-1 overflow-hidden">
                <Textarea
                  placeholder="请输入Markdown格式的题干"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full h-[35vh] resize-none overflow-y-auto"
                />
              </TabsContent>
              <TabsContent value="preview" className="flex-1 overflow-hidden">
                <div className="border p-2 h-[35vh] overflow-y-auto text-start">
                  <RenderMarkdown content={problem} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
      <CardFooter>{/* 可根据需要添加底部操作 */}</CardFooter>
    </Card>
  );
}
