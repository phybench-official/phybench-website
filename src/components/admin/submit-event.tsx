"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// 定义用户和问题的类型
interface User {
  id: string;
  name?: string;
  email: string;
  realname?: string;
}

export default function SubmitEventPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [score, setScore] = useState("");
  const [tag, setTag] = useState("OFFER");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!selectedUserId || !score.trim() || !tag.trim()) {
      setMessage("请选择用户、输入积分和选择标签");
      return;
    }
    const numericScore = Number(score);
    if (isNaN(numericScore)) {
      setMessage("积分必须为有效数字");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/data/scoreevent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          score: numericScore,
          tag,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "添加失败");
      }
      setMessage("积分事件添加成功！");
      setSelectedUserId("");
      setScore("");
      setTag("OFFER");
    } catch (error: any) {
      console.error("Error submitting score event:", error);
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
      <h1 className="text-xl mb-4">Submit Score Event</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="user-select" className="block mb-1">
            选择用户
          </label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border border-gray-300 p-2 w-full"
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
        <div className="mb-4">
          <label htmlFor="score" className="block mb-1">
            Score
          </label>
          <input
            type="number"
            id="score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="border border-gray-300 p-2 w-full"
            placeholder="Enter Score"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="tag" className="block mb-1">
            Tag
          </label>
          <select
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="border border-gray-300 p-2 w-full"
          >
            <option value="OFFER">OFFER</option>
            <option value="SUBMIT">SUBMIT</option>
            <option value="EXAMINE">EXAMINE</option>
            <option value="DEBUG">DEBUG</option>
            <option value="PUNISH">PUNISH</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
        >
          {loading ? "Submitting..." : "Submit Score Event"}
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}