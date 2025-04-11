"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalculateScorePage() {
  const [loadingAll, setLoadingAll] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [userId, setUserId] = useState("");

  // Calculate all users' scores using the /api/data/calculateallscores endpoint
  const handleCalculateAllScores = async () => {
    setLoadingAll(true);
    setMessage("");
    try {
      const res = await fetch("/api/data/calculateallscores", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Calculation failed");
      }
      setMessage("All user scores updated successfully!");
    } catch (error: any) {
      console.error(error);
      setMessage("Error: " + error.message);
    } finally {
      setLoadingAll(false);
    }
  };

  // Calculate a single user's score using the /api/data/calculatescore endpoint
  const handleCalculateScore = async () => {
    if (!userId.trim()) {
      setMessage("Please enter a user ID.");
      return;
    }
    setLoadingSingle(true);
    setMessage("");
    try {
      const res = await fetch("/api/data/calculatescore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Calculation failed");
      }
      setMessage(
        `User score updated successfully! New score: ${data.updatedUser.score}`,
      );
    } catch (error: any) {
      console.error(error);
      setMessage("Error: " + error.message);
    } finally {
      setLoadingSingle(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Link href="/admin">
        <button className="mb-4 bg-blue-500 text-white py-2 px-4 rounded">
          返回AdminPage主页
        </button>
      </Link>
      <h1 className="text-xl mb-4">Calculate User Scores</h1>

      {/* Section for calculating all users' scores */}
      <div className="mb-6">
        <h2 className="text-lg mb-2">Calculate ALL Users Scores</h2>
        <button
          onClick={handleCalculateAllScores}
          disabled={loadingAll}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
        >
          {loadingAll ? "Calculating All Scores..." : "Calculate All Scores"}
        </button>
      </div>

      {/* Section for calculating a single user's score */}
      <div className="mb-6">
        <h2 className="text-lg mb-2">Calculate Score for a Single User</h2>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border border-gray-300 p-2 mb-4 w-full"
        />
        <button
          onClick={handleCalculateScore}
          disabled={loadingSingle}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
        >
          {loadingSingle ? "Calculating..." : "Calculate Score"}
        </button>
      </div>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
