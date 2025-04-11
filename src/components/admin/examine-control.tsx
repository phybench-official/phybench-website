"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// 定义用户和问题的类型
interface User {
  id: string;
  name?: string;
  email: string;
  realname?: string;
}

interface Problem {
  id: number;
  title: string;
  description: string;
  solution: string;
}

interface ProblemCounts {
  mechanics: number;
  electricity: number;
  thermodynamics: number;
  optics: number;
  modern: number;
  advanced: number;
}

export default function ExamineControlPage() {
  const [examineProblems, setExamineProblems] = useState<Problem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [problemCounts, setProblemCounts] = useState<ProblemCounts | null>(
    null,
  );
  const [loadingAll, setLoadingAll] = useState(false);

  // 新增状态用于存储输入框的值
  const [mechanicsReview, setMechanicsReview] = useState<string>("");
  const [electricityReview, setElectricityReview] = useState<string>("");
  const [thermodynamicsReview, setThermodynamicsReview] = useState<string>("");
  const [opticsReview, setOpticsReview] = useState<string>("");
  const [modernReview, setModernReview] = useState<string>("");
  const [advancedReview, setAdvancedReview] = useState<string>("");

  useEffect(() => {
    // 获取所有用户
    fetch("/api/data/getusers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      // 获取指定用户可以审核的题目
      fetch(`/api/data/getexamineproblems?userId=${selectedUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setExamineProblems(data.problems);
          }
        });
    } else {
      setExamineProblems([]);
    }
  }, [selectedUserId]);

  useEffect(() => {
    // 获取问题统计
    fetch("/api/data/getexamineproblemcounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblemCounts(data.counts);
        }
      });
  }, []);

  // 提交审核问题
  const handleSubmit = async () => {
    const checkFormat = (input: string, maxId: number) => {
      // Regular expression: allows empty string, numbers, ranges (e.g., 1-3), and comma-separated values
      const regex = /^\s*$|^(\d+\s*(-\s*\d+)?\s*(,\s*\d+\s*(-\s*\d+)?\s*)*)$/;

      if (!regex.test(input)) {
        return false; // 格式不正确
      }

      // 分析输入并进行范围检查
      const parts = input.split(",");
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue; // Skip empty strings

        if (trimmedPart.includes("-")) {
          // Handle ranges
          const [start, end] = trimmedPart
            .split("-")
            .map((num) => parseInt(num.trim()));
          if (
            isNaN(start) ||
            isNaN(end) ||
            start < 1 ||
            end > maxId ||
            start > end // Invalid range
          ) {
            return false;
          }
        } else {
          // Handle single numbers
          const num = parseInt(trimmedPart);
          if (isNaN(num) || num < 1 || num > maxId) {
            return false; // Number out of valid range
          }
        }
      }

      return true; // 格式和范围都正确
    };

    const getIdsFromInput = (input: string) => {
      const ids: number[] = [];
      const parts = input.split(",");

      for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue; // Skip empty strings

        if (trimmedPart.includes("-")) {
          // Handle ranges
          const [start, end] = trimmedPart
            .split("-")
            .map((num) => parseInt(num.trim()));
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            for (let i = start; i <= end; i++) {
              ids.push(i);
            }
          }
        } else {
          // Handle single numbers
          const num = parseInt(trimmedPart);
          if (!isNaN(num)) {
            ids.push(num);
          }
        }
      }

      return ids;
    };

    // 格式检查
    if (!checkFormat(mechanicsReview, problemCounts?.mechanics || 0)) {
      alert("力学审核填写的问题格式不正确或超出有效范围！");
      return;
    }
    if (!checkFormat(electricityReview, problemCounts?.electricity || 0)) {
      alert("电磁学审核填写的问题格式不正确或超出有效范围！");
      return;
    }
    if (
      !checkFormat(thermodynamicsReview, problemCounts?.thermodynamics || 0)
    ) {
      alert("热学审核填写的问题格式不正确或超出有效范围！");
      return;
    }
    if (!checkFormat(opticsReview, problemCounts?.optics || 0)) {
      alert("光学审核填写的问题格式不正确或超出有效范围！");
      return;
    }
    if (!checkFormat(modernReview, problemCounts?.modern || 0)) {
      alert("近代物理审核填写的问题格式不正确或超出有效范围！");
      return;
    }
    if (!checkFormat(advancedReview, problemCounts?.advanced || 0)) {
      alert("四大及以上审核填写的问题格式不正确或超出有效范围！");
      return;
    }

    // 处理力学
    const mechanicsExamineProblemIds = getIdsFromInput(mechanicsReview).sort(
      (a, b) => a - b,
    );
    setMechanicsReview("");

    // 处理电磁学
    const electricityExamineProblemIds = getIdsFromInput(
      electricityReview,
    ).sort((a, b) => a - b);
    setElectricityReview("");

    // 处理热学
    const thermodynamicsExamineProblemIds = getIdsFromInput(
      thermodynamicsReview,
    ).sort((a, b) => a - b);
    setThermodynamicsReview("");

    // 处理光学
    const opticsExamineProblemIds = getIdsFromInput(opticsReview).sort(
      (a, b) => a - b,
    );
    setOpticsReview("");

    // 处理近代物理
    const modernExamineProblemIds = getIdsFromInput(modernReview).sort(
      (a, b) => a - b,
    );
    setModernReview("");

    // 处理四大及以上
    const advancedExamineProblemIds = getIdsFromInput(advancedReview).sort(
      (a, b) => a - b,
    );
    setAdvancedReview("");

    // 准备要提交的数据
    const dataToSubmit = {
      userId: selectedUserId,
      mechanicsExamineProblemIds,
      electricityExamineProblemIds,
      thermodynamicsExamineProblemIds,
      opticsExamineProblemIds,
      modernExamineProblemIds,
      advancedExamineProblemIds,
    };

    // 在提交之前打印数据
    console.log("要提交的数据:", JSON.stringify(dataToSubmit, null, 2));

    // 提交审核问题到后端
    const response = await fetch("/api/data/updateexamineproblem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSubmit),
    });

    const result = await response.json();
    if (result.success) {
      alert("审核问题更新成功！");
      // 重新获取当前用户的可审题目
      if (selectedUserId) {
        fetch(`/api/data/getexamineproblems?userId=${selectedUserId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setExamineProblems(data.problems);
            }
          });
      }
    } else {
      alert(`更新失败: ${result.message}`);
    }
  };

  // 清空审核问题
  const handleClear = async () => {
    setLoadingAll(true);
    try {
      const res = await fetch("/api/data/clearexamineproblems", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.message || "失败了失败了失败了失败了失败了失败了失败了失败了",
        );
      }
      alert("清完啦！");
      // 重新获取当前用户的可审题目
      if (selectedUserId) {
        fetch(`/api/data/getexamineproblems?userId=${selectedUserId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setExamineProblems(data.problems);
            }
          });
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoadingAll(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <Link href="/admin">
        <button className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          返回AdminPage主页
        </button>
      </Link>
      <div className="p-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            当前一共有{" "}
            {problemCounts
              ? Object.values(problemCounts).reduce((a, b) => a + b, 0)
              : 0}{" "}
            道问题待审核，其中
          </h2>
          <ul className="grid grid-cols-2 gap-4">
            <li className="bg-gray-50 p-3 rounded-lg">
              力学: {problemCounts?.mechanics || 0} 道
            </li>
            <li className="bg-gray-50 p-3 rounded-lg">
              电磁学: {problemCounts?.electricity || 0} 道
            </li>
            <li className="bg-gray-50 p-3 rounded-lg">
              热学: {problemCounts?.thermodynamics || 0} 道
            </li>
            <li className="bg-gray-50 p-3 rounded-lg">
              光学: {problemCounts?.optics || 0} 道
            </li>
            <li className="bg-gray-50 p-3 rounded-lg">
              近代物理: {problemCounts?.modern || 0} 道
            </li>
            <li className="bg-gray-50 p-3 rounded-lg">
              四大力学及以上知识: {problemCounts?.advanced || 0} 道
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* 左侧：选择用户 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label
              htmlFor="user-select"
              className="block text-lg font-semibold mb-2"
            >
              选择用户:
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择用户</option>
              {users
                .sort((a, b) => {
                  const nameA = a.realname || a.name || a.email; // 获取用户的名称
                  const nameB = b.realname || b.name || b.email;
                  return nameA.localeCompare(nameB, "zh"); // 使用拼音排序
                })
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.realname || user.name || user.email}
                  </option>
                ))}
            </select>
          </div>

          {/* 右侧：可以审核的题目 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">可以审核的题目:</h2>
            <div className="max-h-50 overflow-y-auto">
              {" "}
              {/* 限制高度并启用垂直滚动条 */}
              <ul className="space-y-2">
                {examineProblems.length > 0 ? (
                  examineProblems.map((problem) => (
                    <li
                      key={problem.id}
                      className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      题目ID: {problem.id} - {problem.title}
                    </li>
                  ))
                ) : (
                  <li className="bg-gray-50 p-3 rounded-lg">
                    没有可以审核的题目！
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "力学审核",
                value: mechanicsReview,
                onChange: setMechanicsReview,
              },
              {
                label: "电磁学审核",
                value: electricityReview,
                onChange: setElectricityReview,
              },
              {
                label: "热学审核",
                value: thermodynamicsReview,
                onChange: setThermodynamicsReview,
              },
              {
                label: "光学审核",
                value: opticsReview,
                onChange: setOpticsReview,
              },
              {
                label: "近代物理审核",
                value: modernReview,
                onChange: setModernReview,
              },
              {
                label: "四大及以上审核",
                value: advancedReview,
                onChange: setAdvancedReview,
              },
            ].map((input, index) => (
              <div key={index}>
                <label className="block text-lg font-semibold mb-1">
                  {input.label}:
                </label>
                <input
                  type="text"
                  value={input.value}
                  onChange={(e) => input.onChange(e.target.value)}
                  placeholder={`请输入${input.label}的问题`}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          修改审核权限
        </button>
        <button
          onClick={handleClear}
          disabled={loadingAll}
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {loadingAll ? "正在清除中。。。" : "清空所有用户的审核权限"}
        </button>
      </div>
    </div>
  );
}
