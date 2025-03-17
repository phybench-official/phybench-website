"use client";
import { useState } from "react";
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
    title: "提交",
  },
];

export default function Component({ user }: { user: any }) {
  // step状态
  const [page, setPage] = useState({ step: 1, direction: 1 });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 题目基本信息
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [source, setSource] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");

  // 题目答案和变量
  const [solution, setSolution] = useState("");
  const [answer, setAnswer] = useState("");
  const [variables, setVariables] = useState<Variable[]>([]);

  // AI解答
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);

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
      setPage((prev) => ({ step: prev.step + 1, direction: 1 }));
    } else {
      // 最终提交逻辑
      if (!validateForm()) return;

      try {
        setIsSubmitting(true);

        const response = await fetch("/api/data/addproblem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            source,
            selectedType,
            description,
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

        toast.success("题目提交成功!");
        // 成功后跳转到提交页面
        setTimeout(() => {
          router.push("/");
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
      <Stepper
        defaultValue={1}
        value={page.step}
        className="items-start gap-4 max-w-xl"
      >
        {steps.map(({ step, title }) => (
          <StepperItem key={step} step={step} className="flex-1">
            <StepperTrigger className="w-full flex-col items-start gap-2 rounded">
              <StepperIndicator asChild className="bg-border h-1 w-full">
                <span className="sr-only">{step}</span>
              </StepperIndicator>
              <div className="space-y-0.5">
                <StepperTitle>{title}</StepperTitle>
              </div>
            </StepperTrigger>
          </StepperItem>
        ))}
      </Stepper>

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
            {page.step === 4 ? (isSubmitting ? "提交中..." : "提交") : "下一步"}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
