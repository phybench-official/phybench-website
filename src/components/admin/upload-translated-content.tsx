"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadTranslatedContentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    // Programmatically click the hidden file input
    document.getElementById("fileInput")?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const res = await fetch("/api/data/uploadtranslatedcontent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }

      setMessage("Upload successful!");
    } catch (error: any) {
      console.error(error);
      setMessage("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Link href="/admin">
      <button className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          返回AdminPage主页
        </button>
      </Link>

      <h1 className="text-xl mb-4">Upload Translated Content</h1>

      {/* Drag-and-drop area (plus click to select file) */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-400 p-8 mb-4 text-center cursor-pointer"
      >
        {file ? (
          <p>Selected file: {file.name}</p>
        ) : (
          <p>Drag and drop a JSON file here, or click to select a file.</p>
        )}
        {/* Hidden file input */}
        <input
          id="fileInput"
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-green-500 w-full text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
