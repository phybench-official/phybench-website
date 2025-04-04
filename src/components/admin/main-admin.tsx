"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <Link href="/admin/examine-control">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到审核权限控制页面
        </button>
      </Link>
      <Link href="/admin/download-problem">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到题目下载页面
        </button>
      </Link>
      <Link href="/admin/calculate-score">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到积分核算页面
        </button>
      </Link>
      <Link href="/admin/submit-event">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到积分事件手动上传页面
        </button>
      </Link>
      <Link href="/admin/upload-translated-content">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到英文题干上传页面
        </button>
      </Link>
      <Link href="/admin/sync-examination-opinion">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到审核意见同步页面
        </button>
      </Link>
    </div>
  );
}
