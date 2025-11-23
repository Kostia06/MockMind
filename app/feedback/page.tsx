"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

interface Feedback {
  overallScore: number;
  interviewReadiness: string;
  strengths: string[];
  weaknesses: string[];
  fillerWords: {
    count: number;
    examples: string[];
  };
  communicationScore: number;
  technicalScore: number;
  suggestions: string[];
  answerQualityByQuestion: Array<{
    questionNumber: number;
    quality: number;
    feedback: string;
  }>;
}

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const interviewData = sessionStorage.getItem("lastInterview");
        if (!interviewData) {
          setError("No interview data found. Please complete an interview first.");
          setIsLoading(false);
          return;
        }

        const { type, difficulty, conversationHistory } = JSON.parse(
          interviewData
        );

        const response = await axios.post("/api/feedback", {
          type,
          difficulty,
          conversationHistory,
        });

        setFeedback(response.data);
        sessionStorage.removeItem("lastInterview");
      } catch (err) {
        console.error("Failed to load feedback:", err);
        setError("Failed to generate feedback. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "from-emerald-400 to-green-400";
    if (score >= 6) return "from-yellow-400 to-orange-400";
    return "from-red-400 to-pink-400";
  };

  const getReadinessStyle = (readiness: string) => {
    if (readiness === "Ready to Apply") return "border-emerald-400/50 bg-emerald-500/10";
    if (readiness === "Need More Prep") return "border-yellow-400/50 bg-yellow-500/10";
    return "border-red-400/50 bg-red-500/10";
  };

  const handleBackHome = () => {
    router.push("/");
  };

  const handleViewHistory = () => {
    router.push("/history");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-zinc-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 text-center border border-white/10"
        >
          <div className="inline-block">
            <svg className="animate-spin h-12 w-12 text-emerald-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-gray-200 mt-4 font-medium">Analyzing your performance...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-zinc-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center border border-red-400/20"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={handleBackHome}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold transition-all shadow-lg"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Your Interview
            <span className="block bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
              Performance Report
            </span>
          </h1>
          <p className="text-gray-400">Detailed analysis and actionable feedback</p>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative"
        >
          <div className={`absolute -inset-[1px] bg-gradient-to-r ${getScoreColor(feedback.overallScore)} rounded-2xl opacity-50 blur-sm`} />

          <div className="relative bg-zinc-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Overall Score */}
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                  Overall Performance
                </h3>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="relative inline-flex items-center justify-center"
                >
                  {/* Circular progress */}
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-white/5"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#scoreGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: feedback.overallScore / 10 }}
                      transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                      style={{ strokeDasharray: 2 * Math.PI * 88 }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-6xl font-black bg-gradient-to-r ${getScoreColor(feedback.overallScore)} bg-clip-text text-transparent`}>
                        {feedback.overallScore}
                      </div>
                      <div className="text-gray-400 text-sm font-medium">out of 10</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Readiness Badge */}
              <div className="flex flex-col justify-center">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                  Interview Readiness
                </h3>
                <div className={`p-6 rounded-2xl border-2 ${getReadinessStyle(feedback.interviewReadiness)}`}>
                  <div className="text-3xl font-black text-white mb-2">
                    {feedback.interviewReadiness}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {feedback.interviewReadiness === "Ready to Apply"
                      ? "You're well-prepared for interviews!"
                      : "Keep practicing to improve your skills."}
                  </p>
                </div>

                {/* Skills Breakdown */}
                <div className="mt-6 space-y-4">
                  <SkillBar label="Communication" score={feedback.communicationScore} gradient="from-emerald-400 to-green-400" delay={0.6} />
                  <SkillBar label="Technical" score={feedback.technicalScore} gradient="from-green-400 to-teal-400" delay={0.7} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightCard
            title="Strengths"
            items={feedback.strengths}
            icon="✓"
            gradient="from-emerald-500 to-green-500"
            delay={0.2}
          />
          <InsightCard
            title="Areas to Improve"
            items={feedback.weaknesses}
            icon="⚡"
            gradient="from-orange-500 to-red-500"
            delay={0.3}
          />
        </div>

        {/* Filler Words Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative"
        >
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/50 to-cyan-500/50 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />

          <div className="relative bg-zinc-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Speech Pattern Analysis
              </h2>
            </div>

            <div className="bg-black/40 rounded-xl p-5 border border-white/10">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-sm font-semibold text-gray-400">Filler Words Detected:</span>
                <span className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {feedback.fillerWords.count}
                </span>
              </div>

              {feedback.fillerWords.examples.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {feedback.fillerWords.examples.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-sm font-medium"
                    >
                      "{word}"
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-gray-400 mt-4 flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Try pausing instead of using filler words to sound more confident and articulate.</span>
            </p>
          </div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              Suggestions for Improvement
            </h2>
          </div>

          <div className="space-y-3">
            {feedback.suggestions.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="group/item flex gap-4 p-4 rounded-xl bg-black/40 border border-white/10 hover:border-purple-400/30 hover:bg-white/5 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm group-hover/item:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Answer Quality by Question */}
        {feedback.answerQualityByQuestion.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-zinc-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Answer Quality by Question
              </h2>
            </div>

            <div className="space-y-4">
              {feedback.answerQualityByQuestion.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="p-5 rounded-xl bg-black/40 border border-white/10 hover:border-indigo-400/30 transition-all"
                >
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
                    <h3 className="font-bold text-white">
                      Question {item.questionNumber}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.quality / 10) * 100}%` }}
                          transition={{ delay: 0.8 + idx * 0.1, duration: 1 }}
                          className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {item.quality}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.feedback}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <button
            onClick={handleBackHome}
            className="group relative flex-1 px-8 py-4 rounded-xl overflow-hidden transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 group-hover:from-emerald-600 group-hover:to-green-600 transition-all" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 blur-xl opacity-50 group-hover:opacity-75 transition-all" />
            <span className="relative text-white font-bold text-lg flex items-center justify-center gap-2">
              Start Another Interview
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <button
            onClick={handleViewHistory}
            className="group relative flex-1 px-8 py-4 rounded-xl overflow-hidden transition-all"
          >
            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-all" />
            <div className="absolute inset-0 border border-white/10 group-hover:border-white/20 rounded-xl transition-all" />
            <span className="relative text-white font-semibold text-lg flex items-center justify-center gap-2">
              View Interview History
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// Skill Bar Component
function SkillBar({ label, score, gradient, delay }: { label: string; score: number; gradient: string; delay: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <span className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {score}/10
        </span>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ delay, duration: 1, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
        />
      </div>
    </div>
  );
}

// Insight Card Component
function InsightCard({ title, items, icon, gradient, delay }: { title: string; items: string[]; icon: string; gradient: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative"
    >
      <div className={`absolute -inset-[1px] bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500`} />

      <div className="relative bg-zinc-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/10 h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold`}>
            {icon}
          </div>
          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>
        </div>

        <ul className="space-y-3">
          {items.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 + idx * 0.05 }}
              className="flex gap-3 text-gray-300 text-sm leading-relaxed"
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient} mt-2 flex-shrink-0`} />
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
