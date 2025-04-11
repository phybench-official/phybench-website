"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  realname: string | null;
  role: "user" | "admin";
}

export default function RoleControlPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取用户列表
  useEffect(() => {
    fetch("/api/data/changerole")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("获取用户列表失败:", error);
        alert("获取用户列表失败");
        setIsLoading(false);
      });
  }, []);

  // 当选择用户ID变化时，找到对应用户信息
  useEffect(() => {
    if (selectedUserId) {
      const user = users.find((u) => u.id === selectedUserId);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  }, [selectedUserId, users]);

  // 变更用户角色
  const changeUserRole = async (newRole: "user" | "admin") => {
    if (!selectedUserId) {
      alert("请先选择用户");
      return;
    }

    try {
      const res = await fetch("/api/data/changerole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUserId, role: newRole }),
      });

      if (!res.ok) {
        throw new Error("更改用户角色失败");
      }

      const data = await res.json();

      // 更新本地状态
      setUsers(
        users.map((user) =>
          user.id === selectedUserId ? { ...user, role: newRole } : user,
        ),
      );

      // 更新选中用户
      setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));

      alert(
        `已将用户 ${data.user.username || data.user.email} 的角色更新为 ${newRole === "admin" ? "管理员" : "普通用户"}`,
      );
    } catch (error) {
      console.error(error);
      alert("更改用户角色失败");
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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">正在加载用户数据...</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">用户角色管理系统</h2>
              <ul className="grid grid-cols-2 gap-4">
                <li className="bg-gray-50 p-3 rounded-lg">
                  总用户数: {users.length} 名
                </li>
                <li className="bg-gray-50 p-3 rounded-lg">
                  管理员: {users.filter((user) => user.role === "admin").length}{" "}
                  名
                </li>
                <li className="bg-gray-50 p-3 rounded-lg">
                  普通用户:{" "}
                  {users.filter((user) => user.role === "user").length} 名
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
              {/* 左侧：选择用户 - 与examine-control完全一致 */}
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
                      const nameA =
                        a.realname || a.name || a.username || a.email;
                      const nameB =
                        b.realname || b.name || b.username || b.email;
                      return nameA.localeCompare(nameB, "zh");
                    })
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.realname ||
                          user.name ||
                          user.username ||
                          user.email}
                      </option>
                    ))}
                </select>
              </div>

              {/* 右侧：用户信息 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">用户详情:</h2>
                {selectedUser ? (
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      邮箱: {selectedUser.email}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      用户名: {selectedUser.username || "未设置"}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      真实姓名: {selectedUser.realname || "未设置"}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      当前角色:{" "}
                      {selectedUser.role === "admin" ? "管理员" : "普通用户"}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    请先选择一个用户
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">角色管理:</h2>
              {selectedUser ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <button
                      onClick={() => changeUserRole("user")}
                      disabled={selectedUser.role === "user"}
                      className={`w-full p-2 rounded-lg transition-colors ${
                        selectedUser.role === "user"
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-yellow-500 text-white hover:bg-yellow-600"
                      }`}
                    >
                      设为普通用户
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => changeUserRole("admin")}
                      disabled={selectedUser.role === "admin"}
                      className={`w-full p-2 rounded-lg transition-colors ${
                        selectedUser.role === "admin"
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      设为管理员
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  请先选择一个用户进行角色管理
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
