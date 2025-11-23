"use client";

import { useState } from "react";

export type PracticeMode = "normal" | "easy" | "hard" | "company-specific";

interface PracticeModeProps {
  onSelect: (mode: PracticeMode, companyName?: string, timeLimit?: number) => void;
}

export default function PracticeModeSelector({ onSelect }: PracticeModeProps) {
  const [selectedMode, setSelectedMode] = useState<PracticeMode>("normal");
  const [companyName, setCompanyName] = useState("");
  const [timeLimit, setTimeLimit] = useState(false);

  const modes = [
    {
      id: "easy",
      title: "Easy Mode",
      desc: "AI provides hints and simpler follow-ups",
      icon: "🌱",
      color: "from-green-400 to-emerald-500",
    },
    {
      id: "normal",
      title: "Normal Mode",
      desc: "Standard interview experience",
      icon: "🎯",
      color: "from-blue-400 to-cyan-500",
    },
    {
      id: "hard",
      title: "Hard Mode",
      desc: "Challenging questions with pressure scenarios",
      icon: "⚡",
      color: "from-orange-400 to-red-500",
    },
    {
      id: "company-specific",
      title: "Company-Specific",
      desc: "Tailored to specific company's style",
      icon: "🏢",
      color: "from-purple-400 to-pink-500",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelect(
      selectedMode,
      selectedMode === "company-specific" ? companyName : undefined,
      timeLimit ? 180 : undefined // 3 minutes
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Practice Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSelectedMode(mode.id as PracticeMode)}
              className={`apple-card p-6 text-left transition-all ${
                selectedMode === mode.id ? "ring-2 ring-green-500" : ""
              }`}
            >
              <div className="text-4xl mb-3">{mode.icon}</div>
              <h3 className="font-semibold text-gray-900 text-lg">{mode.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Company Name Input */}
      {selectedMode === "company-specific" && (
        <div className="apple-card p-6 bg-purple-50 slide-up">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Which company are you interviewing with?
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Google, Microsoft, Apple..."
            className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
        </div>
      )}

      {/* Time Limit Option */}
      <div className="apple-card p-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={timeLimit}
            onChange={(e) => setTimeLimit(e.target.checked)}
            className="w-5 h-5 accent-green-600 cursor-pointer"
          />
          <span className="text-gray-900 font-medium">
            Add 3-minute time limit per question (optional)
          </span>
        </label>
        <p className="text-sm text-gray-600 mt-2">
          Adds pressure but helps simulate real interview conditions
        </p>
      </div>

      <button
        type="submit"
        disabled={selectedMode === "company-specific" && !companyName}
        className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Interview
      </button>
    </form>
  );
}
