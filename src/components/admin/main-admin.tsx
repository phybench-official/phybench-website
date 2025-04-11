"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8 text-center">管理员控制面板</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左侧栏 */}
        <div className="space-y-6">
          {/* 1. 题目浏览界面 */}
          <Link href="/admin/admin-browse" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              题目浏览页面
            </motion.button>
          </Link>

          {/* 2. 题目下载 */}
          <Link href="/admin/download-problem" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              题目下载
            </motion.button>
          </Link>

          {/* 3. 题目字段上传 */}
          <Link href="/admin/upload-problem-attribute" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              题目字段上传
            </motion.button>
          </Link>

          {/* 4. 积分核算 */}
          <Link href="/admin/calculate-score" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              积分核算
            </motion.button>
          </Link>

          {/* 5. 积分事件上传 */}
          <Link href="/admin/submit-event" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              积分事件上传
            </motion.button>
          </Link>
        </div>

        {/* 右侧栏 */}
        <div className="space-y-6">
          {/* 1. 审核权限控制 */}
          <Link href="/admin/examine-control" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              审核权限控制
            </motion.button>
          </Link>

          {/* 2. 翻译审核权限控制 */}
          <Link href="/admin/translate-control" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              翻译审核权限控制
            </motion.button>
          </Link>

          {/* 3. 用户角色管理 */}
          <Link href="/admin/role-control" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              用户角色管理
            </motion.button>
          </Link>

          {/* 4. 批量更新审核积分 */}
          <Link href="/admin/update-examine-score" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              批量更新审核积分
            </motion.button>
          </Link>

          {/* 5. 审核意见同步 */}
          <Link href="/admin/sync-examination-opinion" className="block mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              审核意见同步
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}
