"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ZoomWaitingRoom from "@/components/zoom-waiting-room";
import ZoomInterviewEnhanced from "@/components/zoom-interview-enhanced";

interface ConversationItem {
  question: string;
  userAnswer: string;
  aiResponse: string;
}

function ZoomInterviewContent() {
  const router = useRouter();

  const [stage, setStage] = useState<"waiting" | "interview" | "complete">("waiting");
  const [selectedVoice, setSelectedVoice] = useState<"alloy" | "echo" | "nova" | "shimmer">("alloy");
  const [jobPosting, setJobPosting] = useState<string>("");
  const [jobRole, setJobRole] = useState<string>("");
  const [jobLevel, setJobLevel] = useState<string>("mid");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [interviewStartTime, setInterviewStartTime] = useState<number>(0);

  // Load job posting from session storage on mount
  useEffect(() => {
    const posting = sessionStorage.getItem("jobPosting");
    if (!posting) {
      router.push("/");
      return;
    }
    setJobPosting(posting);
  }, [router]);

  const handleJoinInterview = (voice: "alloy" | "echo" | "nova" | "shimmer", role: string, level: string) => {
    setSelectedVoice(voice);
    setJobRole(role);
    setJobLevel(level);
    setInterviewStartTime(Date.now());
    setStage("interview");
  };

  const handleInterviewComplete = (data: ConversationItem[]) => {
    setConversation(data);

    // Calculate interview duration
    const duration = Math.floor((Date.now() - interviewStartTime) / 1000); // in seconds

    // Store for feedback page
    sessionStorage.setItem(
      "lastInterview",
      JSON.stringify({
        jobRole,
        jobLevel,
        jobPosting,
        conversationHistory: data,
      })
    );

    // Save to interview history in localStorage
    try {
      const historyItem = {
        id: `interview-${Date.now()}`,
        jobRole,
        jobLevel,
        timestamp: Date.now(),
        duration,
        questionsAnswered: data.length,
        score: undefined, // Will be updated when viewing feedback
      };

      const existingHistory = localStorage.getItem("interviewHistory");
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push(historyItem);
      localStorage.setItem("interviewHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save interview to history:", error);
    }

    setStage("complete");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleViewFeedback = () => {
    router.push("/feedback");
  };

  const handleNewInterview = () => {
    router.push("/");
  };

  if (stage === "waiting") {
    return (
      <ZoomWaitingRoom
        onJoin={handleJoinInterview}
        onBack={handleBackToHome}
        jobPosting={jobPosting}
      />
    );
  }

  if (stage === "interview") {
    return (
      <ZoomInterviewEnhanced
        jobRole={jobRole}
        jobLevel={jobLevel}
        jobPosting={jobPosting}
        selectedVoice={selectedVoice}
        onComplete={handleInterviewComplete}
      />
    );
  }

  // Completion screen
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="group relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/50 via-green-500/50 to-teal-500/50 rounded-3xl opacity-50 blur-sm" />

          <div className="relative bg-zinc-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-12 text-center space-y-8 border border-white/10">
            {/* Celebration */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-7xl mb-2"
              >
                🎉
              </motion.div>
              <div className="flex justify-center gap-3 text-4xl">
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  ✨
                </motion.span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
                >
                  🎊
                </motion.span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}
                >
                  ✨
                </motion.span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white">
                Interview
                <br />
                <span className="relative inline-block">
                  <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 opacity-50" />
                  <span className="relative bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
                    Complete!
                  </span>
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Great job! Your responses have been analyzed using AI. Ready to review your performance?
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 sm:gap-6 my-8"
            >
              {[
                {
                  label: "Questions",
                  value: conversation.length,
                  gradient: "from-emerald-400 to-green-400",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                },
                {
                  label: "Position",
                  value: jobRole,
                  gradient: "from-green-400 to-teal-400",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                },
                {
                  label: "Level",
                  value: jobLevel,
                  gradient: "from-teal-400 to-cyan-400",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group/stat relative"
                >
                  <div className={`absolute -inset-[1px] bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover/stat:opacity-100 blur-sm transition-all duration-500`} />

                  <div className="relative p-5 sm:p-6 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-3 group-hover/stat:scale-110 transition-transform`}>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {stat.icon}
                      </svg>
                    </div>
                    <div className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 capitalize`}>
                      {stat.value}
                    </div>
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-4"
            >
              <button
                onClick={handleViewFeedback}
                className="group/btn relative w-full px-8 py-4 rounded-xl overflow-hidden transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 group-hover/btn:from-emerald-600 group-hover/btn:to-green-600 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 blur-xl opacity-50 group-hover/btn:opacity-75 transition-all" />
                <span className="relative text-white font-bold text-lg flex items-center justify-center gap-2">
                  View Detailed Feedback
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleNewInterview}
                  className="group/btn relative px-6 py-3 rounded-xl overflow-hidden transition-all"
                >
                  <div className="absolute inset-0 bg-white/5 group-hover/btn:bg-white/10 transition-all" />
                  <div className="absolute inset-0 border border-white/10 group-hover/btn:border-white/20 rounded-xl transition-all" />
                  <span className="relative text-white font-semibold flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    New Interview
                  </span>
                </button>

                <button
                  onClick={handleBackToHome}
                  className="group/btn relative px-6 py-3 rounded-xl overflow-hidden transition-all"
                >
                  <div className="absolute inset-0 bg-white/5 group-hover/btn:bg-white/10 transition-all" />
                  <div className="absolute inset-0 border border-white/10 group-hover/btn:border-white/20 rounded-xl transition-all" />
                  <span className="relative text-white font-semibold flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Status indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap justify-center gap-4 pt-6 border-t border-white/10"
            >
              {[
                "Interview recorded",
                "AI analysis complete",
                "Feedback generated"
              ].map((status, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-emerald-300 text-sm font-medium">{status}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ZoomInterviewPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-black" />}>
      <ZoomInterviewContent />
    </Suspense>
  );
}
