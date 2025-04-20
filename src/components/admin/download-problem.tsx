"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Dropdown options for filtering
const tagOptions = [
  { label: "Mechanics", value: "MECHANICS" },
  { label: "Electricity", value: "ELECTRICITY" },
  { label: "Thermodynamics", value: "THERMODYNAMICS" },
  { label: "Optics", value: "OPTICS" },
  { label: "Modern", value: "MODERN" },
  { label: "Advanced", value: "ADVANCED" },
  { label: "Other", value: "OTHER" },
];

const problemStatusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Returned", value: "RETURNED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Archived", value: "ARCHIVED" },
];

const translatedStatusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Returned", value: "RETURNED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Archived", value: "ARCHIVED" },
];

const nominatedOptions = [
  { label: "All", value: "" },
  { label: "No", value: "No" },
  { label: "Yes", value: "Yes" },
];

const aiPerformanceOptions = [
  { label: "All", value: "" },
  { label: "0", value: "0" },
];

export default function DownloadProblemPage() {
  const [loading, setLoading] = useState(false);

  // Filter state values - convert single values to arrays for multi-select
  const [tags, setTags] = useState<string[]>(["MECHANICS"]); // Default to MECHANICS
  const [allTagsSelected, setAllTagsSelected] = useState(false);
  
  const [statuses, setStatuses] = useState<string[]>(["APPROVED"]); // Default to APPROVED
  const [allStatusesSelected, setAllStatusesSelected] = useState(false);
  
  const [translatedStatuses, setTranslatedStatuses] = useState<string[]>(["APPROVED"]); // Default to APPROVED
  const [allTranslatedStatusesSelected, setAllTranslatedStatusesSelected] = useState(false);
  
  const [nominated, setNominated] = useState("");
  const [aiPerformances, setAiPerformances] = useState("");

  // State for additional fields to include in the download.
  const [selectedFields, setSelectedFields] = useState({
    tag: false,
    status: false,
    translatedStatus: false,
    nominated: false,
    translatedContent: false,
    translatedSolution: false,
    variables: false,
    aiPerformances: false,
  });

  // Effects to check if all options are selected for each category
  useEffect(() => {
    const allSelected = problemStatusOptions.every(option => 
      statuses.includes(option.value)
    );
    setAllStatusesSelected(allSelected);
  }, [statuses]);

  useEffect(() => {
    const allSelected = tagOptions.every(option =>
      tags.includes(option.value)
    );
    setAllTagsSelected(allSelected);
  }, [tags]);

  useEffect(() => {
    const allSelected = translatedStatusOptions.every(option =>
      translatedStatuses.includes(option.value)
    );
    setAllTranslatedStatusesSelected(allSelected);
  }, [translatedStatuses]);

  // Toggle checkbox state for additional fields
  const toggleField = (field: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  // Handle status checkbox toggle
  const toggleStatus = (value: string) => {
    setStatuses(prev => 
      prev.includes(value)
        ? prev.filter(status => status !== value)
        : [...prev, value]
    );
  };

  // Handle tag checkbox toggle
  const toggleTag = (value: string) => {
    setTags(prev => 
      prev.includes(value)
        ? prev.filter(tag => tag !== value)
        : [...prev, value]
    );
  };

  // Handle translated status checkbox toggle
  const toggleTranslatedStatus = (value: string) => {
    setTranslatedStatuses(prev => 
      prev.includes(value)
        ? prev.filter(status => status !== value)
        : [...prev, value]
    );
  };

  // Handle "All" checkbox toggles
  const toggleAllStatuses = () => {
    if (allStatusesSelected) {
      setStatuses([]);
    } else {
      setStatuses(problemStatusOptions.map(option => option.value));
    }
  };

  const toggleAllTags = () => {
    if (allTagsSelected) {
      setTags([]);
    } else {
      setTags(tagOptions.map(option => option.value));
    }
  };

  const toggleAllTranslatedStatuses = () => {
    if (allTranslatedStatusesSelected) {
      setTranslatedStatuses([]);
    } else {
      setTranslatedStatuses(translatedStatusOptions.map(option => option.value));
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Validation checks - ensure at least one selection for required fields
      if (tags.length === 0 || statuses.length === 0 || translatedStatuses.length === 0) {
        alert("Please select at least one option for Tag, Problem Status, and Translated Status");
        setLoading(false);
        return;
      }

      // Build query string from filters.
      const queryParams = new URLSearchParams();
      
      // Add multiple tags as separate query parameters
      tags.forEach(tag => {
        queryParams.append("tag", tag);
      });
      
      // Add multiple statuses as separate query parameters
      statuses.forEach(status => {
        queryParams.append("status", status);
      });
      
      // Add multiple translated statuses as separate query parameters
      translatedStatuses.forEach(status => {
        queryParams.append("translatedStatus", status);
      });
      
      if (nominated) queryParams.append("nominated", nominated);
      if (aiPerformances) queryParams.append("aiPerformances", aiPerformances);

      // Build additional fields string.
      const fieldsToInclude = Object.keys(selectedFields)
        .filter((field) => selectedFields[field as keyof typeof selectedFields])
        .join(",");
      if (fieldsToInclude) {
        queryParams.append("fields", fieldsToInclude);
      }

      const res = await fetch(`/api/data/getfilteredproblems?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch problems");
      }

      // Create a JSON blob and trigger the download.
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "problems.json";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error in handleDownload:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto p-4 flex flex-col">
      <Link href="/admin">
        <button className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          返回AdminPage主页
        </button>
      </Link>

      {/* Scrollable content container */}
      <div className="flex-1 overflow-y-auto mt-4">
        {/* Filters Section */}
        <div className="grid grid-cols-1 gap-4">
          {/* Tag Multi-Select Checkboxes */}
          <div>
            <label className="block mb-1 font-medium">
              Tag (select multiple):
            </label>
            <div className="grid grid-cols-3 gap-2 p-2 border rounded">
              {/* All option for tags */}
              <label className="flex items-center space-x-2 font-semibold">
                <input
                  type="checkbox"
                  checked={allTagsSelected}
                  onChange={toggleAllTags}
                  className="form-checkbox"
                />
                <span>All</span>
              </label>
              {/* Individual tag options */}
              {tagOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tags.includes(option.value)}
                    onChange={() => toggleTag(option.value)}
                    className="form-checkbox"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Please select at least one tag</p>
            )}
          </div>

          {/* Problem Status Multi-Select Checkboxes */}
          <div>
            <label className="block mb-1 font-medium">
              Problem Status (select multiple):
            </label>
            <div className="grid grid-cols-3 gap-2 p-2 border rounded">
              {/* All option */}
              <label className="flex items-center space-x-2 font-semibold">
                <input
                  type="checkbox"
                  checked={allStatusesSelected}
                  onChange={toggleAllStatuses}
                  className="form-checkbox"
                />
                <span>All</span>
              </label>
              {/* Individual status options */}
              {problemStatusOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={statuses.includes(option.value)}
                    onChange={() => toggleStatus(option.value)}
                    className="form-checkbox"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {statuses.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Please select at least one status</p>
            )}
          </div>

          {/* Translated Status Multi-Select Checkboxes */}
          <div>
            <label className="block mb-1 font-medium">
              Translated Status (select multiple):
            </label>
            <div className="grid grid-cols-3 gap-2 p-2 border rounded">
              {/* All option for translated status */}
              <label className="flex items-center space-x-2 font-semibold">
                <input
                  type="checkbox"
                  checked={allTranslatedStatusesSelected}
                  onChange={toggleAllTranslatedStatuses}
                  className="form-checkbox"
                />
                <span>All</span>
              </label>
              {/* Individual translated status options */}
              {translatedStatusOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={translatedStatuses.includes(option.value)}
                    onChange={() => toggleTranslatedStatus(option.value)}
                    className="form-checkbox"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {translatedStatuses.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Please select at least one translated status</p>
            )}
          </div>

          {/* Nominated Dropdown */}
          <div>
            <label htmlFor="nominated" className="block mb-1 font-medium">
              Nominated:
            </label>
            <select
              id="nominated"
              value={nominated}
              onChange={(e) => setNominated(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {nominatedOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* AI Performances Dropdown */}
          <div>
            <label htmlFor="aiPerformances" className="block mb-1 font-medium">
              AI Performances:
            </label>
            <select
              id="aiPerformances"
              value={aiPerformances}
              onChange={(e) => setAiPerformances(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {aiPerformanceOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Fields Checkboxes Section */}
        <div className="mt-6">
          <h3 className="font-medium mb-2">Additional Fields to Include:</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Tag", field: "tag" },
              { label: "Status", field: "status" },
              { label: "Translated Status", field: "translatedStatus" },
              { label: "Nominated", field: "nominated" },
              { label: "Translated Content", field: "translatedContent" },
              { label: "Translated Solution", field: "translatedSolution" },
              { label: "Variables", field: "variables" },
              { label: "AI Performances", field: "aiPerformances" },
            ].map(({ label, field }) => (
              <label key={field} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedFields[field as keyof typeof selectedFields]}
                  onChange={() => toggleField(field)}
                  className="form-checkbox"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Download Button (Fixed at bottom) */}
      <div className="mt-6 sticky bottom-4">
        <button
          onClick={handleDownload}
          disabled={loading || tags.length === 0 || statuses.length === 0 || translatedStatuses.length === 0}
          className={`w-full ${
            tags.length === 0 || statuses.length === 0 || translatedStatuses.length === 0
              ? 'bg-gray-400'
              : 'bg-green-500 hover:bg-green-600'
          } text-white py-2 rounded-lg transition-colors`}
        >
          {loading ? "Downloading..." : "Download Problems"}
        </button>
      </div>
    </div>
  );
}
