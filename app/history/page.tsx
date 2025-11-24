"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface InterviewSession {
  id: string;
  jobRole: string;
  jobLevel: string;
  timestamp: number;
  duration: number;
  score?: number;
  questionsAnswered: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    // Load interview history from localStorage
    const loadHistory = () => {
      try {
        const storedSessions = localStorage.getItem("interviewHistory");
        if (storedSessions) {
          const parsedSessions = JSON.parse(storedSessions);
          // Sort by timestamp descending (newest first)
          parsedSessions.sort((a: InterviewSession, b: InterviewSession) => b.timestamp - a.timestamp);
          setSessions(parsedSessions);
        }
      } catch (error) {
        console.error("Failed to load interview history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleBackHome = () => {
    router.push("/");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)',
            left: `${mousePosition.x - 400}px`,
            top: `${mousePosition.y - 400}px`,
            transition: 'left 0.3s ease-out, top 0.3s ease-out',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBackHome}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold"
          >
            <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
              MockMind
            </span>
          </motion.div>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Interview
            <br />
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 opacity-50" />
              <span className="relative bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
                History
              </span>
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Track your progress and review past interview sessions
          </p>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block">
              <svg className="animate-spin h-12 w-12 text-emerald-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-gray-300 mt-4 font-medium">Loading your history...</p>
          </motion.div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative mb-8"
          >
            <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/50 via-green-500/50 to-teal-500/50 rounded-2xl opacity-50 blur-sm" />

            <div className="relative bg-zinc-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-12 border border-white/10 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-white mb-3">
                No Interviews Yet
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Start your first mock interview to build your history and track your progress over time.
              </p>
              <button
                onClick={handleBackHome}
                className="group/btn relative px-8 py-4 rounded-xl overflow-hidden transition-all inline-flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 group-hover/btn:from-emerald-600 group-hover/btn:to-green-600 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 blur-xl opacity-50 group-hover/btn:opacity-75 transition-all" />
                <span className="relative text-white font-bold text-lg flex items-center gap-2">
                  Start Your First Interview
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8"
            >
              {[
                {
                  label: "Total Sessions",
                  value: sessions.length,
                  gradient: "from-emerald-400 to-green-400",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                },
                {
                  label: "Avg Score",
                  value: (sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length).toFixed(1),
                  gradient: "from-green-400 to-teal-400",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                },
                {
                  label: "Practice Time",
                  value: formatDuration(sessions.reduce((sum, s) => sum + s.duration, 0)),
                  gradient: "from-teal-400 to-cyan-400",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
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
                    <div className={`text-2xl sm:text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                      {stat.value}
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Sessions List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Your Sessions ({sessions.length})
              </h2>

              {sessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="group/item relative"
                >
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/30 to-green-500/30 rounded-xl opacity-0 group-hover/item:opacity-100 blur-sm transition-all duration-500" />

                  <div className="relative p-4 sm:p-5 rounded-xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 hover:bg-zinc-900/90 transition-all">
                    <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3 sm:gap-4">
                      <div className="flex-1 w-full md:w-auto">
                        <h3 className="font-bold text-white text-base sm:text-lg capitalize mb-1">
                          {session.jobRole} - {session.jobLevel} Level
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(session.timestamp)}
                        </p>
                      </div>
                      <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm w-full md:w-auto justify-between md:justify-start">
                        <div className="text-center">
                          <p className="text-gray-400 text-xs mb-1">Questions</p>
                          <p className="font-bold text-white">{session.questionsAnswered}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-xs mb-1">Duration</p>
                          <p className="font-bold text-white">{formatDuration(session.duration)}</p>
                        </div>
                        {session.score && (
                          <div className="text-center">
                            <p className="text-gray-400 text-xs mb-1">Score</p>
                            <p className="font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                              {session.score}/10
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
