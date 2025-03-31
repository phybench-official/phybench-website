import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectGroup,
  SelectLabel,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react"
import { MarkdownEditor } from "./markdown-editor"

export interface AIResponse {
  id: string;
  name: string;
  process: string;
  answer: string;
  correctness: "correct" | "incorrect";
  comment: string;
}

export default function Step3({
  responses,
  setResponses
}: {
  responses: AIResponse[];
  setResponses: (v: AIResponse[]) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<AIResponse | null>(null);
  const [aiName, setAiName] = useState("");
  const [aiCustomName, setAiCustomName] = useState("");
  const [aiProcess, setAiProcess] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiCorrectness, setAiCorrectness] = useState<"correct" | "incorrect">("correct");
  const [aiComment, setAiComment] = useState("");
  
  const handleOpenDialog = (response?: AIResponse) => {
    if (response) {
      // 编辑现有回答
      setEditingResponse(response);
      setAiName(response.name);
      setAiCustomName("");
      setAiProcess(response.process);
      setAiAnswer(response.answer);
      setAiCorrectness(response.correctness);
      setAiComment(response.comment);
    } else {
      // 添加新回答
      setEditingResponse(null);
      setAiName("");
      setAiCustomName("");
      setAiProcess("");
      setAiAnswer("");
      setAiCorrectness("correct");
      setAiComment("");
    }
    setIsDialogOpen(true);
  };

  const handleSaveResponse = () => {
    const finalAiName = aiName === "其它" ? aiCustomName : aiName;
    
    if (!finalAiName.trim()) {
      alert("请输入AI名称");
      return;
    }
    
    const newResponse: AIResponse = {
      id: editingResponse?.id || Date.now().toString(),
      name: finalAiName,
      process: aiProcess,
      answer: aiAnswer,
      correctness: aiCorrectness,
      comment: aiComment
    };
    
    if (editingResponse) {
      // 更新现有回答
      setResponses(responses.map(r => 
        r.id === editingResponse.id ? newResponse : r
      ));
    } else {
      // 添加新回答
      setResponses([...responses, newResponse]);
    }
    
    setIsDialogOpen(false);
  };

  const handleDeleteResponse = (id: string) => {
    setResponses(responses.filter(r => r.id !== id));
  };

  return (
    <Card className="flex-1 h-[60vh] w-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="text-start">
          <CardTitle className="text-xl">AI 表现</CardTitle>
          <CardDescription>记录不同 AI 对该题目的解答表现（可以不填）</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4" /> 添加AI表现
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl min-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingResponse ? '编辑' : '添加'}AI表现</DialogTitle>
              <DialogDescription>
                记录AI如何解答该题目，以及解答的正确性
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="ai-name" className="w-32 text-right">
                  AI 名称
                </Label>
                <div className="flex-1 flex gap-2">
                  <Select value={aiName} onValueChange={setAiName}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择AI模型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>OpenAI</SelectLabel>
                        <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                        <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                        <SelectItem value="o3-mini">o3-mini</SelectItem>
                        <SelectItem value="o1-mini">o1-mini</SelectItem>
                        <SelectItem value="o1-preview">o1-preview</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Google Gemini</SelectLabel>
                        <SelectItem value="gemini-2.0-flash">gemini-2.0-flash</SelectItem>
                        <SelectItem value="gemini-2.0-flash-thinking-exp">gemini-2.0-flash-thinking-exp</SelectItem>
                        <SelectItem value="gemini-2.0-pro">gemini-2.0-pro-exp</SelectItem>
                        <SelectItem value="gemini-2.5-pro">gemini-2.5-pro-exp</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Anthropic Claude</SelectLabel>
                        <SelectItem value="claude-3.5-sonnet">claude-3-5-sonnet</SelectItem>
                        <SelectItem value="claude-3.7-sonnet">claude-3-7-sonnet</SelectItem>
                        <SelectItem value="claude-3.7-sonnet-thinking">claude-3-7-sonnet-thinking</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>DeepSeek</SelectLabel>
                        <SelectItem value="deepseek-v3">deepseek-v3</SelectItem>
                        <SelectItem value="deepseek-r1-think">deepseek-r1-think</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>其它模型</SelectLabel>
                        <SelectItem value="glm-4-plus">智谱GLM-4 Plus</SelectItem>
                        <SelectItem value="qwen-max">通义千问 Qwen-Max</SelectItem>
                        <SelectItem value="moonshot-v1-32k">Kimi moonshot-v1-32k</SelectItem>
                        <SelectItem value="grok-3">Grok 3</SelectItem>
                        <SelectItem value="grok-3-reasoner">Grok 3 reasoning</SelectItem>
                        <SelectItem value="Other">其它</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  {aiName === "Other" && (
                    <Input 
                      placeholder="请输入自定义AI名称" 
                      value={aiCustomName}
                      onChange={(e) => setAiCustomName(e.target.value)}
                      className="w-full"
                    />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>解答过程</Label>
                  <MarkdownEditor
                    text={aiProcess}
                    setText={setAiProcess}
                    placeholder="请输入Markdown格式的AI解答过程"
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>答案</Label>
                    <MarkdownEditor
                      text={aiAnswer}
                      setText={setAiAnswer}
                      placeholder="请输入Markdown格式的AI答案"
                      classNames="h-[15vh]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>答案正确性</Label>
                    <RadioGroup 
                      value={aiCorrectness} 
                      onValueChange={(value) => setAiCorrectness(value as "correct" | "incorrect")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="correct" id="ai-correct" />
                        <Label htmlFor="ai-correct">正确</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="incorrect" id="ai-incorrect" />
                        <Label htmlFor="ai-incorrect">错误</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>评价</Label>
                    <Textarea 
                      placeholder="请输入对AI表现的评价"
                      value={aiComment}
                      onChange={(e) => setAiComment(e.target.value)}
                      className="h-[80px] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="mr-2">
                取消
              </Button>
              <Button onClick={handleSaveResponse}>
                确认
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6">
        {responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p>尚未添加任何 AI 表现</p>
            <p className="text-sm">点击右上角按钮添加 AI 解答情况</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {responses.map((response) => (
              <Card 
                key={response.id} 
                className="cursor-pointer hover:shadow-md transition-shadow dark:bg-slate-800/50 bg-slate-50 px-2 py-2"
                onClick={() => handleOpenDialog(response)}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-1 flex-row items-center space-x-4">
                      <CardTitle className="text-base font-bold">{response.name}</CardTitle>
                    </div>
                    <Badge 
                      variant={response.correctness === "correct" ? "default" : "destructive"}
                      className="mt-1 h-6 flex-nowrap"
                    >
                      {response.correctness === "correct" ? "正确" : "错误"}
                    </Badge>
                    <Button
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResponse(response.id);
                      }}
                    >
                      <Trash2 className="h-8 w-8 text-gray-500 hover:text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 text-sm">
                  {response.comment ? (
                    <p className="text-sm text-slate-800 dark:text-slate-300 italic">&quot;{response.comment.length > 100 ? 
                      response.comment.substring(0, 100) + '...' : 
                      response.comment} &quot;</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">无评价</p>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}