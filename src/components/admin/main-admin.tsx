"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <Link href="/admin/admin-browse">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到管理员题目浏览页面
        </button>
      </Link>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <Link href="/admin/examine-control">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到审核权限控制页面
        </button>
      </Link>
      <Link href="/admin/translate-control">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到翻译审核权限控制页面
        </button>
      </Link>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <Link href="/admin/download-problem">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到题目下载页面
        </button>
      </Link>
      <Link href="/admin/upload-problem-attribute">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到题目字段上传页面
        </button>
      </Link>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <Link href="/admin/submit-event">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到积分事件上传页面
        </button>
      </Link>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>

      <Link href="/admin/calculate-score">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到积分核算页面（使用无害，但应已自动化）
        </button>
      </Link>
      <Link href="/admin/sync-examination-opinion">
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          跳转到审核意见同步页面（慎用！可能冲掉题目的正式审核状态）
        </button>
      </Link>
    </div>
  );
}
