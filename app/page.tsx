"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [jobPosting, setJobPosting] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleViewHistory = () => {
    router.push("/history");
  };

  const handleStartInterview = async () => {
    if (!jobPosting.trim()) {
      setError("Please provide a job posting");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      sessionStorage.setItem("jobPosting", jobPosting);
      router.push("/zoom-interview");
    } catch (err) {
      setError("Failed to start interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearInput = () => {
    setJobPosting("");
    setError("");
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
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

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-4 sm:px-6 lg:px-12 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent font-black">
            MockMind
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleViewHistory}
          className="group relative px-6 py-2.5 text-sm rounded-full overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full group-hover:border-emerald-400/50 transition-all" />
          <span className="relative text-white font-medium">History</span>
        </motion.button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-[1.1]">
            Master Your
            <br />
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 opacity-50" />
              <span className="relative bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
                Next Interview
              </span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            AI-powered mock interviews that adapt to your role.<br className="hidden sm:block" /> Get real-time feedback and ace your dream job.
          </p>
        </motion.div>

        {/* Job Posting Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative mb-12"
        >
          {/* Animated border gradient */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/50 via-green-500/50 to-teal-500/50 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />

          <div className="relative bg-zinc-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Enter Job Details
              </h2>
            </div>

            <div className="space-y-4">
              <div className="relative group/textarea">
                <textarea
                  value={jobPosting}
                  onChange={(e) => {
                    setJobPosting(e.target.value);
                    setError("");
                  }}
                  placeholder="Paste your job posting or job link here...

Example:
Senior Software Engineer at TechCorp

We're looking for an experienced software engineer with 5+ years of experience in React, Node.js, and TypeScript. Strong problem-solving skills required.

Or paste a job link:
https://www.linkedin.com/jobs/view/123456789/"
                  className="w-full h-56 p-5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all text-sm leading-relaxed font-mono"
                />

                {/* Character count */}
                {jobPosting && (
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-black/50 px-2 py-1 rounded">
                    {jobPosting.length} chars
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-400/30 flex items-start gap-3"
                >
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-300 text-sm font-medium">{error}</span>
                </motion.div>
              )}

              {jobPosting.trim() && !error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/30 flex items-start gap-3"
                >
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-emerald-300 text-sm font-medium">
                    Ready to analyze • {Math.ceil(jobPosting.length / 4)} tokens
                  </span>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleClearInput}
                  disabled={!jobPosting.trim()}
                  className="group/btn relative w-full sm:w-auto px-6 py-3.5 rounded-xl overflow-hidden transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/5 group-hover/btn:bg-white/10 transition-all" />
                  <div className="absolute inset-0 border border-white/10 group-hover/btn:border-white/20 rounded-xl transition-all" />
                  <span className="relative text-white font-medium">Clear</span>
                </button>

                <button
                  onClick={handleStartInterview}
                  disabled={!jobPosting.trim() || isLoading}
                  className="group/btn relative w-full sm:flex-1 px-8 py-3.5 rounded-xl overflow-hidden transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 group-hover/btn:from-emerald-600 group-hover/btn:to-green-600 transition-all" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 blur-xl opacity-50 group-hover/btn:opacity-75 transition-all" />
                  <span className="relative text-white font-bold text-lg flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Preparing...
                      </>
                    ) : (
                      <>
                        Start Interview
                        <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
              title: "AI-Powered Questions",
              desc: "GPT-4 generates role-specific questions based on your job posting",
              gradient: "from-emerald-500 to-green-500"
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />,
              title: "Voice Interview",
              desc: "Practice with natural conversational AI using speech recognition",
              gradient: "from-green-500 to-teal-500"
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
              title: "Instant Feedback",
              desc: "Get detailed analysis on communication, technical skills, and areas to improve",
              gradient: "from-teal-500 to-cyan-500"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="group/card relative"
            >
              <div className={`absolute -inset-[1px] bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover/card:opacity-100 blur-sm transition-all duration-500`} />

              <div className="relative p-6 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-white font-bold mb-2 text-lg">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {[
            { number: "1K+", label: "Active Users", gradient: "from-emerald-400 to-green-400" },
            { number: "500+", label: "Interviews", gradient: "from-green-400 to-teal-400" },
            { number: "95%", label: "Success Rate", gradient: "from-teal-400 to-cyan-400" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-5 sm:p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 text-center group/stat cursor-default"
            >
              <div className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 group-hover/stat:scale-110 transition-transform`}>
                {stat.number}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
