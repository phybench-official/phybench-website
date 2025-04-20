"use client";

import { useState } from "react";
import Link from "next/link";

export default function UpdateExaminationStatusPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [updatedCount, setUpdatedCount] = useState<number | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setMessage("");
    setUpdatedCount(null);
    try {
      const res = await fetch("/api/data/updateexaminationstatus", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }
      setUpdatedCount(data.updatedCount);
      setMessage("Update complete!");
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
      <h1 className="text-xl mb-4">Update examination status</h1>
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
      >
        {loading ? "Updating..." : "Update Examination Status"}
      </button>
      {message && (
        <div className="mt-4">
          <p>{message}</p>
          {updatedCount !== null && (
            <p className="text-gray-600 mt-1">
              {updatedCount} problem{updatedCount !== 1 ? "s" : ""} were updated.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
