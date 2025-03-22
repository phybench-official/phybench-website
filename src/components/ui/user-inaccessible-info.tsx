import React from "react";

export default function UserInaccessibleInfo() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">访问受限</h1>
        <p className="text-gray-700 mb-6">
          您的账户没有访问此页面的权限。请联系管理员以获取更多信息。
        </p>
      </div>
    </div>
  );
}
