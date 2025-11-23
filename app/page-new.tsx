"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeNew() {
  const router = useRouter();
  const [step, setStep] = useState<"type" | "difficulty">("type");
  const [selectedType, setSelectedType] = useState<"technical" | "behavioral" | "mixed" | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"entry" | "mid" | "senior" | null>(null);

  const handleTypeSelect = (type: "technical" | "behavioral" | "mixed") => {
    setSelectedType(type);
    setStep("difficulty");
  };

  const handleDifficultySelect = (difficulty: "entry" | "mid" | "senior") => {
    setSelectedDifficulty(difficulty);
  };

  const handleStartInterview = () => {
    if (selectedType && selectedDifficulty) {
      router.push(
        `/interview?type=${selectedType}&difficulty=${selectedDifficulty}`
      );
    }
  };

  const handleViewHistory = () => {
    router.push("/history");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12 slide-up">
            <div className="text-6xl mb-4">🎓</div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3">MockMind</h1>
            <p className="text-xl text-gray-600">AI-Powered Interview Prep</p>
            <p className="text-gray-600 mt-2">Practice real interviews with natural conversations</p>
          </div>

          {/* Selection Cards */}
          {step === "type" && (
            <div className="space-y-6 slide-up">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  What type of interview?
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      id: "technical",
                      title: "Technical",
                      desc: "Coding, system design, problem-solving",
                      icon: "💻",
                      color: "from-blue-400 to-cyan-500",
                    },
                    {
                      id: "behavioral",
                      title: "Behavioral",
                      desc: "Teamwork, leadership, communication",
                      icon: "👥",
                      color: "from-purple-400 to-pink-500",
                    },
                    {
                      id: "mixed",
                      title: "Mixed",
                      desc: "Combination of technical & behavioral",
                      icon: "⚡",
                      color: "from-orange-400 to-red-500",
                    },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id as any)}
                      className="apple-card p-6 text-left hover:scale-105 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{type.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{type.title}</h3>
                          <p className="text-gray-600">{type.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleViewHistory}
                className="btn-secondary w-full py-3"
              >
                View Interview History
              </button>
            </div>
          )}

          {step === "difficulty" && selectedType && (
            <div className="space-y-6 slide-up">
              <div>
                <button
                  onClick={() => setStep("type")}
                  className="text-green-600 hover:text-green-700 font-medium mb-4 flex items-center gap-1"
                >
                  ← Change interview type
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  What's your experience level?
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      id: "entry",
                      title: "Entry Level",
                      desc: "0-2 years of experience",
                      icon: "🌱",
                    },
                    {
                      id: "mid",
                      title: "Mid Level",
                      desc: "2-5 years of experience",
                      icon: "🌿",
                    },
                    {
                      id: "senior",
                      title: "Senior Level",
                      desc: "5+ years of experience",
                      icon: "🌳",
                    },
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleDifficultySelect(level.id as any)}
                      className={`apple-card p-6 text-left hover:scale-105 transition-all ${
                        selectedDifficulty === level.id ? "ring-2 ring-green-500" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{level.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{level.title}</h3>
                          <p className="text-gray-600">{level.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDifficulty && (
                <button
                  onClick={handleStartInterview}
                  className="btn-primary w-full py-4 text-lg font-bold rounded-xl"
                >
                  Start Interview 🚀
                </button>
              )}
            </div>
          )}

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "🎤", title: "Real Conversations", desc: "Natural AI with human-like responses" },
              { icon: "📊", title: "Live Feedback", desc: "Instant analysis of your performance" },
              { icon: "📈", title: "Track Progress", desc: "Monitor improvement over time" },
            ].map((feature, idx) => (
              <div key={idx} className="apple-card p-4 text-center">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
