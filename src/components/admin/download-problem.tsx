"use client";

import Link from "next/link";
import { useState } from "react";
// import { UnderConstruction } from "@/components/ui/under-construction";

export default function DownloadProblemPage() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/getapprovedproblems");
      if (!res.ok) {
        throw new Error("Failed to fetch problems");
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "approved_problems.json";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto p-4">
      <Link href="/admin">
        <button className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          返回AdminPage主页
        </button>
      </Link>
      <div className="mt-4">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          {loading ? "Downloading..." : "Download Approved Problems"}
        </button>
      </div>
      {/* <UnderConstruction /> */}
    </div>
  );
}
