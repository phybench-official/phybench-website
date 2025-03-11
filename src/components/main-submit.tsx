"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import RenderMarkdown from "@/components/render-markdown";

interface Variable {
  name: string;
  min: string;
  max: string;
}

interface AIResponse {
  name: string;
  process: string;
  answer: string;
  correctness: string;
  customName?: string;
}

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [source, setSource] = useState("");
  const [question, setQuestion] = useState("");
  const [solution, setSolution] = useState("");
  const [answer, setAnswer] = useState("");
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newVariable, setNewVariable] = useState<Variable>({
    name: "",
    min: "",
    max: "",
  });
  const [error, setError] = useState("");
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [newAIResponse, setNewAIResponse] = useState<AIResponse>({
    name: "",
    process: "",
    answer: "",
    correctness: "",
  });
  const [aiError, setAiError] = useState("");

  const handleInput = (
    e: React.FormEvent<HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const target = e.currentTarget;
    setter(target.value);
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  // 状态管理
  const [showQuestionResult, setShowQuestionResult] = useState(false);
  const [showSolutionResult, setShowSolutionResult] = useState(false);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [showAIProcessResult, setShowAIProcessResult] = useState(false);
  const [showAIAnswerResult, setShowAIAnswerResult] = useState(false);

  const toggleQuestionResult = () => {
    setShowQuestionResult((prev) => !prev);
  };

  const toggleSolutionResult = () => {
    setShowSolutionResult((prev) => !prev);
  };

  const toggleAnswerResult = () => {
    setShowAnswerResult((prev) => !prev);
  };

  const toggleAIAnswerResult = () => {
    setShowAIAnswerResult((prev) => !prev);
  };

  const toggleAIProcessResult = () => {
    setShowAIProcessResult((prev) => !prev);
  };

  const addVariable = () => {
    if (!newVariable.name || newVariable.min === "" || newVariable.max === "") {
      setError("请输入变量信息！");
      return;
    }
    setVariables([...variables, newVariable]);
    setNewVariable({ name: "", min: "", max: "" });
    setError("");
  };

  const removeVariable = (index: number) => {
    const newVariables = variables.filter((_, i) => i !== index);
    setVariables(newVariables);
  };

  const addAIResponse = () => {
    const isNameValid =
      (newAIResponse.name !== "" && newAIResponse.name !== "其它") ||
      (newAIResponse.name == "其它" && newAIResponse.customName);
    const isProcessValid = newAIResponse.process !== "";
    const isAnswerValid = newAIResponse.answer !== "";
    const isCorrectnessValid = newAIResponse.correctness !== "";

    if (
      !isNameValid ||
      !isProcessValid ||
      !isAnswerValid ||
      !isCorrectnessValid
    ) {
      setAiError("请输入完整AI表现信息！");
      return;
    }

    setAiError("");
    setAiResponses([...aiResponses, newAIResponse]);
    setNewAIResponse({ name: "", process: "", answer: "", correctness: "" });
  };

  const saveData = () => {
    const dataToSave = {
      title,
      selectedType,
      source,
      question,
      solution,
      answer,
      variables,
      aiResponses,
    };
    localStorage.setItem("savedData", JSON.stringify(dataToSave));
    alert("数据已保存！");
  };

  const handleSubmit = () => {
    setTitle("");
    setSelectedType("");
    setSource("");
    setQuestion("");
    setSolution("");
    setAnswer("");
    setVariables([]);
    setNewAIResponse({ name: "", process: "", answer: "", correctness: "" });
    setAiResponses([]);
  };

  return (
    <div className="flex flex-col mt-20 px-32">
      <h2 className="text-xl font-semibold mb-2 mt-4">题目名称</h2>
      <Textarea
        className="border p-2 mb-4 w-full resize-none"
        placeholder="请输入题目名称"
        value={title}
        onInput={(e) =>
          handleInput(e as React.FormEvent<HTMLTextAreaElement>, setTitle)
        }
        rows={1}
      />

      <h2 className="text-xl font-semibold mb-2 mt-4">题目类型</h2>
      <select
        className="border p-2 mb-4"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
      >
        <option value="">请选择题目类型</option>
        <option value="力学">力学</option>
        <option value="电磁学">电磁学</option>
        <option value="热学">热学</option>
        <option value="光学">光学</option>
        <option value="近代物理">近代物理</option>
        <option value="四大力学及以上知识">四大力学及以上知识</option>
      </select>

      <h2 className="text-xl font-semibold mb-2 mt-4">题目来源</h2>
      <Textarea
        className="border p-2 mb-4 w-full resize-none"
        placeholder="请输入题目来源，以精确到题号为佳"
        value={source}
        onInput={(e) =>
          handleInput(e as React.FormEvent<HTMLTextAreaElement>, setSource)
        }
        rows={1}
      />

      <h2 className="text-xl font-semibold mb-2 mt-4">题干</h2>
      <Textarea
        className="border p-2 mb-4 w-full resize-none"
        placeholder="请输入Markdown格式的题干"
        value={question}
        onInput={(e) =>
          handleInput(e as React.FormEvent<HTMLTextAreaElement>, setQuestion)
        }
        rows={1}
      />

      {/* 控制题干渲染的按钮 */}
      <button
        onClick={toggleQuestionResult}
        className={`mb-4 px-4 py-2 text-white rounded-lg ${
          showQuestionResult ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {showQuestionResult ? "隐藏渲染结果" : "渲染题干"}
      </button>

      {showQuestionResult && (
        <div className="my-4 w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
          <RenderMarkdown content={question} />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2 mt-4">题目涉及的变量</h2>
      {variables.length > 0 && (
        <table className="min-w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 text-center">变量名</th>
              <th className="border border-gray-300 p-2 text-center">
                变量数值范围下限
              </th>
              <th className="border border-gray-300 p-2 text-center">
                变量数值范围上限
              </th>
              <th className="border border-gray-300 p-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {variables.map((variable, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2 text-center">
                  {variable.name}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {variable.min}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {variable.max}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  <button
                    className="text-red-500"
                    onClick={() => removeVariable(index)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          className="border p-2 w-3/10"
          placeholder="请输入变量名"
          value={newVariable.name}
          onChange={(e) =>
            setNewVariable({ ...newVariable, name: e.target.value })
          }
        />
        <input
          type="number"
          className="border p-2 w-2/5"
          placeholder="请输入变量数值范围下限"
          value={newVariable.min}
          onChange={(e) =>
            setNewVariable({ ...newVariable, min: e.target.value })
          }
        />
        <input
          type="number"
          className="border p-2 w-2/5"
          placeholder="请输入变量数值范围上限"
          value={newVariable.max}
          onChange={(e) =>
            setNewVariable({ ...newVariable, max: e.target.value })
          }
        />
      </div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        className="bg-green-500 text-white p-2 rounded mb-4"
        onClick={addVariable}
      >
        添加变量
      </button>

      <h2 className="text-xl font-semibold mb-2 mt-4">题目解答过程</h2>
      <Textarea
        className="border p-2 mb-4 w-full resize-none"
        placeholder="请输入Markdown格式的题目解答过程"
        value={solution}
        onInput={(e) =>
          handleInput(e as React.FormEvent<HTMLTextAreaElement>, setSolution)
        }
        rows={1}
      />

      {/* 控制解答过程渲染的按钮 */}
      <button
        onClick={toggleSolutionResult}
        className={`mb-4 px-4 py-2 text-white rounded-lg ${
          showSolutionResult ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {showSolutionResult ? "隐藏渲染结果" : "渲染解答过程"}
      </button>

      {showSolutionResult && (
        <div className="my-4 w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
          <RenderMarkdown content={solution} />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2 mt-4">题目答案</h2>
      <Textarea
        className="border p-2 mb-4 w-full resize-none"
        placeholder="请输入Markdown格式的题目答案（由题目涉及的变量组成）"
        value={answer}
        onInput={(e) =>
          handleInput(e as React.FormEvent<HTMLTextAreaElement>, setAnswer)
        }
        rows={1}
      />

      {/* 控制答案渲染的按钮 */}
      <button
        onClick={toggleAnswerResult}
        className={`mb-4 px-4 py-2 text-white rounded-lg ${
          showAnswerResult ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {showAnswerResult ? "隐藏渲染结果" : "渲染题目答案"}
      </button>

      {showAnswerResult && (
        <div className="my-4 w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
          <RenderMarkdown content={answer} />
        </div>
      )}

      {/* AI表现部分 */}
      <h2 className="text-xl font-semibold mb-2 mt-4">AI表现</h2>

      <h3 className="text-lg font-semibold mb-2">AI名称</h3>
      <select
        className="border p-2 mb-4"
        value={newAIResponse.name}
        onChange={(e) =>
          setNewAIResponse({ ...newAIResponse, name: e.target.value })
        }
      >
        <option value="">请选择AI名称</option>
        <option value="Deepseek R1">Deepseek R1（推荐）</option>
        <option value="Gemini 2.0 Flash Thinking Experimental 01-21">
          Gemini 2.0 Flash Thinking Experimental 01-21（推荐）
        </option>
        <option value="o3-mini">o3-mini（推荐）</option>
        <option value="Alpaca">Alpaca</option>
        <option value="BLOOM">BLOOM</option>
        <option value="Claude 1">Claude 1</option>
        <option value="Claude 2">Claude 2</option>
        <option value="ChatGLM-6B">ChatGLM-6B</option>
        <option value="ChatGPT">ChatGPT</option>
        <option value="Cohere Command R">Cohere Command R</option>
        <option value="Deepseek">Deepseek</option>
        <option value="ERNIE 4.0">ERNIE 4.0</option>
        <option value="Falcon 40B">Falcon 40B</option>
        <option value="Flan-T5">Flan-T5</option>
        <option value="Gemini">Gemini 1.5</option>
        <option value="Gemini 2.0 Flash">Gemini 2.0 Flash</option>
        <option value="GPT-4">GPT-4</option>
        <option value="GODEL">GODEL</option>
        <option value="Grok by xAI">Grok by xAI</option>
        <option value="LLaMA 2">LLaMA 2</option>
        <option value="OpenAI Codex">OpenAI Codex</option>
        <option value="其它">其它</option>
      </select>

      {newAIResponse.name === "其它" && (
        <Textarea
          className="border p-2 mb-4 w-full resize-none"
          placeholder="请输入AI名称"
          value={newAIResponse.customName || ""}
          onChange={(e) =>
            setNewAIResponse({ ...newAIResponse, customName: e.target.value })
          }
          rows={1}
        />
      )}

      <h3 className="text-lg font-semibold mb-2">AI解答过程</h3>
      <Textarea
        className="border p-2 mb-4 w-full resize-none"
        placeholder="请输入Markdown格式的AI解答过程"
        value={newAIResponse.process}
        onInput={(e) => {
          const value = e.currentTarget.value;
          setNewAIResponse({ ...newAIResponse, process: value });
        }}
        rows={1}
      />

      {/* 控制AI解答过程渲染的按钮 */}
      <button
        onClick={toggleAIProcessResult}
        className={`mb-4 px-4 py-2 text-white rounded-lg ${
          showAIProcessResult ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {showAIProcessResult ? "隐藏渲染结果" : "渲染AI解答过程"}
      </button>

      {showAIProcessResult && (
        <div className="my-4 w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
          <RenderMarkdown content={newAIResponse.process} />
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">AI答案</h3>
      <Textarea
        className="border p-2 mb-4 w-full resize-none"
        placeholder="请输入Markdown格式的AI答案（由题目涉及的变量组成）"
        value={newAIResponse.answer}
        onInput={(e) => {
          const value = e.currentTarget.value;
          setNewAIResponse({ ...newAIResponse, answer: value });
        }}
        rows={1}
      />

      {/* 控制AI答案渲染的按钮 */}
      <button
        onClick={toggleAIAnswerResult}
        className={`mb-4 px-4 py-2 text-white rounded-lg ${
          showAIAnswerResult ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {showAIAnswerResult ? "隐藏渲染结果" : "渲染AI答案"}
      </button>

      {showAIAnswerResult && (
        <div className="my-4 w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
          <RenderMarkdown content={newAIResponse.answer} />
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">AI答案的正确性</h3>
      <select
        className="border p-2 mb-4"
        value={newAIResponse.correctness}
        onChange={(e) =>
          setNewAIResponse({ ...newAIResponse, correctness: e.target.value })
        }
      >
        <option value="">请选择AI答案的正确性</option>
        <option value="正确">正确</option>
        <option value="错误">错误</option>
      </select>

      {aiError && <p className="text-red-500 mb-2">{aiError}</p>}

      <button
        className="bg-green-500 text-white p-2 rounded mb-4"
        onClick={addAIResponse}
      >
        添加AI表现
      </button>

      {aiResponses.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2">已添加的AI表现</h3>
          <div className="mt-4">
            {aiResponses.map((response, index) => (
              <div key={index} className="border p-4 mb-4 rounded shadow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">
                    {response.name}
                    {response.name === "其它" && response.customName && (
                      <> ({response.customName})</>
                    )}
                  </h3>
                  <button
                    className="text-red-500"
                    onClick={() => {
                      const newResponses = aiResponses.filter(
                        (_, i) => i !== index
                      );
                      setAiResponses(newResponses);
                    }}
                  >
                    删除
                  </button>
                </div>
                <p className="mb-1">解答过程：{response.process}</p>
                <p className="mb-1">答案：{response.answer}</p>
                <p>这个答案是{response.correctness}的！</p>
              </div>
            ))}
          </div>
        </>
      )}
      <button
        className="bg-blue-500 text-white p-2 rounded mt-4"
        onClick={saveData}
      >
        保存
      </button>
      <button
        className="bg-blue-500 text-white p-2 rounded mt-4"
        onClick={handleSubmit}
      >
        提交
      </button>
    </div>
  );
}
