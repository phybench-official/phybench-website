"use client";

import { useState } from "react";
import Link from "next/link";

export default function SyncExaminationOpinionPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/data/syncexaminationopinion", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Sync failed");
      }
      setMessage("Sync complete!");
    } catch (error: any) {
      console.error(error);
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
      <h1 className="text-xl mb-4">Sync Examination Opinion</h1>
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
      >
        {loading ? "Syncing..." : "Sync Examination Opinion"}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
