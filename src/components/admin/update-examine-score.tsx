"use client";

import { useState } from "react";
import Link from "next/link";

function UpdateExamineScorePage() {
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");

  const numericScore = Number(score);
  if (isNaN(numericScore)) {
    setMessage("Score must be a valid number.");
    return;
  }

  setLoading(true);
  try {
    // 1. 更新 EXAMINE 积分事件
    const updateRes = await fetch("/api/data/update-examine-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: numericScore }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) throw new Error(updateData.message);

    // 2. 触发全量积分重算
    const calcRes = await fetch("/api/data/calculateallscores", {
      method: "POST",
    });
    const calcData = await calcRes.json();

    // 3. 处理最终结果
    if (!calcRes.ok) {
      console.error("积分重算失败:", calcData.message);
      setMessage(
        `审核积分更新成功，但积分重算失败：${calcData.message || "未知错误"}`
      );
    } else {
      setMessage("审核积分更新成功，积分已重新计算！");
    }
  } catch (error: any) {
    console.error("Error updating examine scores:", error);
    setMessage("Error: " + error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen p-4">
      <Link href="/admin">
        <button className="mb-4 bg-blue-500 text-white py-2 px-4 rounded">
          返回AdminPage主页
        </button>
      </Link>
      <h1 className="text-xl mb-4">Update Examine Scores</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="score" className="block mb-1">
            New Score for EXAMINE Events
          </label>
          <input
            type="number"
            id="score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="border border-gray-300 p-2 w-full"
            placeholder="Enter new score"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
        >
          {loading ? "Updating..." : "Update Examine Scores"}
        </button>
        {message && <p className="mt-4">{message}</p>}
      </form>
    </div>
  );
}

export default UpdateExamineScorePage;