"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import Step1 from "./step1";
import Step2, { Variable } from "./step2";
import Step3, { AIResponse } from "./step3";
import Step4 from "./step4";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "确定题目基本信息",
  },
  {
    step: 2,
    title: "上传题目",
  },
  {
    step: 3,
    title: "上传AI答案",
  },
  {
    step: 4,
    title: "确认并提交",
  },
];

export default function Component({ user, problemId }: { user: any, problemId?: number }) {
  // step状态
  const [page, setPage] = useState({ step: 1, direction: 1 });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 题目基本信息
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [source, setSource] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [offererEmail, setOffererEmail] = useState("");

  // 题目答案和变量
  const [solution, setSolution] = useState("");
  const [answer, setAnswer] = useState("");
  const [variables, setVariables] = useState<Variable[]>([]);

  // AI解答
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);

  useEffect(() => {
    // 如果有problemId，则从服务器获取题目数据
    const fetchProblemData = async () => {
      if (problemId) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/data/problem/${problemId}`);
          
          if (!response.ok) {
            // 如果403
            if (response.status === 403) {
              toast.error("没有权限编辑此题目");
              router.push("/submit");
              return;
            }
            toast.error("获取题目信息失败");
            throw new Error("获取题目信息失败");
          }
          
          const data = await response.json();
          
          // 填充表单数据
          setTitle(data.title || "");
          setProblem(data.content || "");
          setSource(data.source || "");
          
          // 将ProblemTag枚举值转换为中文显示
          let typeText = "";
          switch (data.tag) {
            case "MECHANICS": typeText = "力学"; break;
            case "ELECTRICITY": typeText = "电磁学"; break;
            case "THERMODYNAMICS": typeText = "热学"; break;
            case "OPTICS": typeText = "光学"; break;
            case "MODERN": typeText = "近代物理"; break;
            case "ADVANCED": typeText = "四大力学及以上知识"; break;
            default: typeText = "其它";
          }
          setSelectedType(typeText);
          
          setDescription(data.description || "");
          setNote(data.note || "");
          setOffererEmail(data.offererEmail || "");
          setSolution(data.solution || "");
          setAnswer(data.answer || "");
          
          // 处理变量
          if (data.variables && data.variables.length > 0) {
            const formattedVariables = data.variables.map((v: any) => ({
              id: v.id,
              name: v.name,
              min: v.lowerBound.toString(),
              max: v.upperBound.toString()
            }));
            setVariables(formattedVariables);
          }
          
          // 处理AI响应
          if (data.aiPerformances && data.aiPerformances.length > 0) {
            const formattedResponses = data.aiPerformances.map((perf: any) => ({
              id: perf.id,
              name: perf.aiName,
              process: perf.aiSolution,
              answer: perf.aiAnswer,
              correctness: perf.isCorrect ? "correct" : "incorrect",
              comment: perf.comment || ""
            }));
            setAiResponses(formattedResponses);
          }
          
          toast.success("已加载题目信息");
        } catch (error: any) {
          toast.error(error.message || "加载题目信息失败");
          console.error("获取题目错误:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // 读取本地草稿数据
        const draft = localStorage.getItem("problemDraft");
        if (draft) {
          const data = JSON.parse(draft);
          if (data.title) setTitle(data.title);
          if (data.source) setSource(data.source);
          if (data.selectedType) setSelectedType(data.selectedType);
          if (data.description) setDescription(data.description);
          if (data.note) setNote(data.note);
          if (data.problem) setProblem(data.problem);
          if (data.solution) setSolution(data.solution);
          if (data.answer) setAnswer(data.answer);
          if (data.variables) setVariables(data.variables);
          if (data.aiResponses) setAiResponses(data.aiResponses);
        }
      }
    };
    
    fetchProblemData();
  }, [problemId]);

  const handlePrev = () => {
    if (page.step > 1) {
      setPage((prev) => ({ step: prev.step - 1, direction: -1 }));
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("请输入题目标题");
      return false;
    }
    if (!selectedType) {
      toast.error("请选择题目类型");
      return false;
    }
    if (!description) {
      toast.error("请输入题目描述");
      return false;
    }
    if (!problem.trim()) {
      toast.error("请输入题目内容");
      return false;
    }
    if (page.step === 2 || page.step === 4) {
      if (!solution.trim()) {
        toast.error("请提供解题过程");
        return false;
      }
      if (!answer.trim()) {
        toast.error("请提供题目答案");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (page.step < 4) {
      if (!validateForm()) return;
      // 保存当前题目信息至本地
      if (!problemId) {
        localStorage.setItem(
          "problemDraft",
          JSON.stringify({
            title,
            source,
            selectedType,
            description,
            note,
            problem,
            solution,
            answer,
            variables,
            aiResponses,
          })
        );
        toast.success("题目信息已保存至浏览器本地");
      }
      setPage((prev) => ({ step: prev.step + 1, direction: 1 }));
    } else {
      // 最终提交逻辑
      if (!validateForm()) return;

      try {
        setIsSubmitting(true);

        const method = problemId ? "PATCH" : "POST";
        const url = problemId 
          ? `/api/data/problem/${problemId}` 
          : "/api/data/problem";

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            source,
            selectedType,
            description,
            note,
            offererEmail,
            problem,
            solution,
            answer,
            variables,
            aiResponses,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "提交失败");
        }

        toast.success(problemId ? "题目更新成功!" : "题目提交成功!");
        // 提交成功后删除本地草稿数据
        if (!problemId) {
          localStorage.removeItem("problemDraft");
        }
        // 成功后跳转到提交页面
        setTimeout(() => {
          router.back();
        }, 1500);
      } catch (error: any) {
        toast.error(error.message || "提交过程中出现错误");
        console.error("提交错误:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (page.step) {
      case 1:
        return (
          <Step1
            title={title}
            setTitle={setTitle}
            source={source}
            setSource={setSource}
            problem={problem}
            setProblem={setProblem}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            description={description}
            setDescription={setDescription}
            note={note}
            setNote={setNote}
            offererEmail={offererEmail}
            setOffererEmail={setOffererEmail}
          />
        );
      case 2:
        return (
          <Step2
            solution={solution}
            setSolution={setSolution}
            answer={answer}
            setAnswer={setAnswer}
            variables={variables}
            setVariables={setVariables}
          />
        );
      case 3:
        return <Step3 responses={aiResponses} setResponses={setAiResponses} />;
      case 4:
        return (
          <Step4
            title={title}
            selectedType={selectedType}
            source={source}
            aiResponses={aiResponses}
            problem={problem}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  // 定义动画 variants，根据方向决定初始与退出状态
  const variants = {
    initial: (dir: number) => ({
      x: dir === 1 ? 100 : -100,
      opacity: 0,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir === 1 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="mx-auto w-full h-full space-y-8 text-center px-24 flex flex-col items-center">
      <div className="grid grid-cols-5 w-full items-center gap-4">
        <div className="justify-self-start">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 cursor-pointer col-span-1"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" /> 返回题目列表
          </Button>
        </div>
        <Stepper
          defaultValue={1}
          value={page.step}
          className="items-start gap-4 max-w-xl col-span-3 justify-self-center"
        >
          {steps.map(({ step, title }) => (
            <StepperItem key={step} step={step} className="flex-1">
              <StepperTrigger className="w-full flex-col items-start gap-2 rounded">
                <StepperIndicator asChild className="bg-border h-1 w-full">
                  <span className="sr-only">{step}</span>
                </StepperIndicator>
                <div className="space-y-0.5 text-center w-full">
                  <StepperTitle className="">{title}</StepperTitle>
                </div>
              </StepperTrigger>
            </StepperItem>
          ))}
        </Stepper>
        <div className=" col-span-1 w-24 justify-self-end"></div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">正在加载题目信息...</p>
          </div>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={page.step}
              custom={page.direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="w-full px-24 max-h-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={page.step}
              className="flex justify-between w-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={handlePrev}
                disabled={page.step === 1}
                className="cursor-pointer"
              >
                上一步
              </Button>
              <Button
                onClick={handleNext}
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {page.step === 4 ? (isSubmitting ? "提交中..." : (problemId ? "更新" : "提交")) : "下一步"}
              </Button>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
