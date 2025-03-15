import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RenderMarkdown from "@/components/render-markdown"
import { Plus, Trash2, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface Variable {
  name: string;
  min: string;
  max: string;
}

export default function Step2({
  solution,
  setSolution,
  answer,
  setAnswer,
  variables,
  setVariables
}: {
  solution: string;
  setSolution: (v: string) => void;
  answer: string;
  setAnswer: (v: string) => void;
  variables: Variable[];
  setVariables: (v: Variable[]) => void;
}) {
  const [newVariable, setNewVariable] = useState<Variable>({
    name: "",
    min: "",
    max: ""
  });
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingVariable, setEditingVariable] = useState<Variable>({
    name: "",
    min: "",
    max: ""
  });

  const addVariable = () => {
    if (!newVariable.name || !newVariable.min || !newVariable.max) {
      setError("请填写完整的变量信息");
      return;
    }
    
    setError("");
    setVariables([...variables, newVariable]);
    setNewVariable({ name: "", min: "", max: "" });
  };

  const removeVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    setVariables(updatedVariables);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingVariable({ ...variables[index] });
  };

  const saveEditing = () => {
    if (!editingVariable.name || !editingVariable.min || !editingVariable.max) {
      setError("请填写完整的变量信息");
      return;
    }

    if (editingIndex !== null) {
      const updatedVariables = [...variables];
      updatedVariables[editingIndex] = editingVariable;
      setVariables(updatedVariables);
      setEditingIndex(null);
      setError("");
    }
  };

  return (
    <Card className="flex-1 h-[60vh] w-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">题目解答与答案</CardTitle>
        <CardDescription>请填写题目解题步骤、答案及变量信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 w-full flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* 左侧：解题步骤 */}
          <div className="flex flex-col h-full">
            <Tabs defaultValue="edit" className="w-full flex flex-col flex-1">
              <div className="flex flex-row space-x-4">
              <h3 className="text-md font-medium mt-1.5">解题步骤</h3>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="edit">编辑</TabsTrigger>
                <TabsTrigger value="preview">预览</TabsTrigger>
              </TabsList>
              </div>
              <TabsContent value="edit" className="flex-1 overflow-hidden">
                <Textarea
                  placeholder="请输入Markdown格式的解题步骤"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="w-full h-[35vh] resize-none overflow-y-auto"
                />
              </TabsContent>
              <TabsContent value="preview" className="flex-1 overflow-hidden">
                <div className="border p-2 h-[35vh] overflow-y-auto text-start">
                  <RenderMarkdown content={solution} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* 右侧：答案和变量 */}
          <div className="flex flex-col max-h-full space-y-2">
            {/* 答案 */}
            <div className="flex flex-col">
              <Tabs defaultValue="edit" className="w-full h-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="edit">编辑</TabsTrigger>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="flex-1">
                  <Textarea
                    placeholder="请输入Markdown格式的题目答案"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full h-[10vh] resize-none"
                  />
                </TabsContent>
                <TabsContent value="preview" className="flex-1">
                  <div className="border p-2 h-[10vh] overflow-y-auto text-start">
                    <RenderMarkdown content={answer} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* 变量 */}
            <div className="flex-1  overflow-auto max-h-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium">题目变量</h3>
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
              
              <div className="overflow-y-auto h-full">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">变量名</TableHead>
                      <TableHead className="w-1/4">最小值</TableHead>
                      <TableHead className="w-1/4">最大值</TableHead>
                      <TableHead className="w-1/6">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variables.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          暂无变量，请添加
                        </TableCell>
                      </TableRow>
                    )}
                    {variables.map((variable, index) => (
                      <TableRow key={index}>
                        {editingIndex === index ? (
                          <>
                            <TableCell>
                              <Input
                                value={editingVariable.name}
                                onChange={(e) => setEditingVariable({...editingVariable, name: e.target.value})}
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={editingVariable.min}
                                onChange={(e) => setEditingVariable({...editingVariable, min: e.target.value})}
                                type="text"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={editingVariable.max}
                                onChange={(e) => setEditingVariable({...editingVariable, max: e.target.value})}
                                type="text"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={saveEditing}
                                className="h-8 w-8"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{variable.name}</TableCell>
                            <TableCell>{variable.min}</TableCell>
                            <TableCell>{variable.max}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => startEditing(index)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeVariable(index)}
                                  className="h-8 w-8 text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* 添加变量区域 */}
              <div className="flex items-center space-x-2 mt-2 h-full">
                <Input
                  placeholder="变量名"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({...newVariable, name: e.target.value})}
                  className="w-1/3 h-8"
                />
                <Input 
                  placeholder="最小值"
                  value={newVariable.min}
                  onChange={(e) => setNewVariable({...newVariable, min: e.target.value})}
                  type="text"
                  className="w-1/4 h-8"
                />
                <Input 
                  placeholder="最大值"
                  value={newVariable.max}
                  onChange={(e) => setNewVariable({...newVariable, max: e.target.value})}
                  type="text"
                  className="w-1/4 h-8"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addVariable}
                  className="flex-shrink-0 h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />添加
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
