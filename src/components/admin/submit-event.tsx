"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubmitEventPage() {
  const [userId, setUserId] = useState("");
  const [score, setScore] = useState("");
  const [tag, setTag] = useState("OFFER"); // Default value is OFFER
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!userId.trim() || !score.trim() || !tag.trim()) {
      setMessage("User ID, Score, and Tag are required.");
      return;
    }
    const numericScore = Number(score);
    if (isNaN(numericScore)) {
      setMessage("Score must be a valid number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/data/scoreevent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          score: numericScore,
          tag,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add score event");
      }
      setMessage("Score event added successfully!");
      setUserId("");
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
          <label htmlFor="userId" className="block mb-1">
            User ID
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border border-gray-300 p-2 w-full"
            placeholder="Enter User ID"
          />
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
