"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ZoomWaitingRoomProps {
  onJoin: (voice: "alloy" | "echo" | "nova" | "shimmer", role: string, level: string) => void;
  onBack: () => void;
  jobPosting?: string;
}

export default function ZoomWaitingRoom({
  onJoin,
  onBack,
  jobPosting = ""
}: ZoomWaitingRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedVoice, setSelectedVoice] = useState<"alloy" | "echo" | "nova" | "shimmer">("alloy");
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [jobRole, setJobRole] = useState<string>("Software Engineer");
  const [jobLevel, setJobLevel] = useState<string>("mid");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Initialize webcam
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Webcam error:", err);
      }
    };

    initWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const voiceOptions = [
    { id: "alloy", name: "Alloy", desc: "Professional, neutral", icon: "👨" },
    { id: "echo", name: "Echo", desc: "Male, clear and direct", icon: "👨‍💼" },
    { id: "nova", name: "Nova", desc: "Female, warm", icon: "👩" },
    { id: "shimmer", name: "Shimmer", desc: "Female, professional", icon: "👩‍💼" },
  ];

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
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

      <div className="w-full max-w-6xl relative z-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Ready for Your
            <br />
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 opacity-50" />
              <span className="relative bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
                Interview?
              </span>
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            Position: <span className="font-semibold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">{jobRole}</span>
          </p>
          <p className="text-gray-400">Test your camera and choose your interviewer's voice</p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="group relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/50 to-green-500/50 rounded-2xl opacity-50 blur-sm" />

              <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {!videoOn && (
                  <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm">Video Off</p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10">
                  <p className="text-white text-xs font-medium">Your Camera</p>
                </div>

                {/* Status indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 text-xs font-medium">Ready</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`group/btn relative flex-1 py-3 rounded-xl overflow-hidden transition-all ${
                  videoOn ? "" : "opacity-75"
                }`}
              >
                <div className={`absolute inset-0 ${
                  videoOn
                    ? "bg-white/5 group-hover/btn:bg-white/10"
                    : "bg-red-500/20 group-hover/btn:bg-red-500/30"
                } transition-all`} />
                <div className={`absolute inset-0 border ${
                  videoOn
                    ? "border-white/10 group-hover/btn:border-white/20"
                    : "border-red-400/30 group-hover/btn:border-red-400/50"
                } rounded-xl transition-all`} />
                <span className="relative text-white font-semibold flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {videoOn ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    )}
                  </svg>
                  {videoOn ? "Video On" : "Video Off"}
                </span>
              </button>

              <button
                onClick={() => setAudioOn(!audioOn)}
                className={`group/btn relative flex-1 py-3 rounded-xl overflow-hidden transition-all ${
                  audioOn ? "" : "opacity-75"
                }`}
              >
                <div className={`absolute inset-0 ${
                  audioOn
                    ? "bg-white/5 group-hover/btn:bg-white/10"
                    : "bg-red-500/20 group-hover/btn:bg-red-500/30"
                } transition-all`} />
                <div className={`absolute inset-0 border ${
                  audioOn
                    ? "border-white/10 group-hover/btn:border-white/20"
                    : "border-red-400/30 group-hover/btn:border-red-400/50"
                } rounded-xl transition-all`} />
                <span className="relative text-white font-semibold flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {audioOn ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    )}
                  </svg>
                  {audioOn ? "Audio On" : "Audio Off"}
                </span>
              </button>
            </div>
          </motion.div>

          {/* Voice selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Interviewer Voice</h2>
                <p className="text-gray-400 text-sm">Choose your AI interviewer's voice</p>
              </div>
            </div>

            <div className="space-y-3">
              {voiceOptions.map((option, idx) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  onClick={() => setSelectedVoice(option.id as any)}
                  className="group/voice relative w-full"
                >
                  <div className={`absolute -inset-[1px] rounded-xl transition-all duration-500 ${
                    selectedVoice === option.id
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 opacity-100 blur-sm"
                      : "opacity-0"
                  }`} />

                  <div className={`relative p-4 rounded-xl backdrop-blur-xl border transition-all ${
                    selectedVoice === option.id
                      ? "bg-zinc-900/80 border-white/20"
                      : "bg-zinc-900/50 border-white/10 hover:bg-zinc-900/70 hover:border-white/20"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{option.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-white text-lg">{option.name}</div>
                        <div className="text-sm text-gray-400">{option.desc}</div>
                      </div>
                      {selectedVoice === option.id && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-400 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: "🎥", title: "Good Lighting", desc: "Ensure your face is well-lit" },
            { icon: "🔇", title: "Quiet Room", desc: "Minimize background noise" },
            { icon: "🌐", title: "Stable Connection", desc: "Use wired internet if possible" },
          ].map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + idx * 0.1 }}
              className="p-4 rounded-xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 hover:border-emerald-400/30 hover:bg-zinc-900/70 transition-all"
            >
              <div className="text-2xl mb-2">{tip.icon}</div>
              <div className="font-bold text-white text-sm mb-1">{tip.title}</div>
              <div className="text-xs text-gray-400">{tip.desc}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={onBack}
            className="group/btn relative px-6 py-3 rounded-xl overflow-hidden transition-all"
          >
            <div className="absolute inset-0 bg-white/5 group-hover/btn:bg-white/10 transition-all" />
            <div className="absolute inset-0 border border-white/10 group-hover/btn:border-white/20 rounded-xl transition-all" />
            <span className="relative text-white font-semibold flex items-center justify-center gap-2">
              <svg className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </span>
          </button>

          <button
            onClick={() => onJoin(selectedVoice, jobRole, jobLevel)}
            className="group/btn relative px-12 py-3 rounded-xl overflow-hidden transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 group-hover/btn:from-emerald-600 group-hover/btn:to-green-600 transition-all" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 blur-xl opacity-50 group-hover/btn:opacity-75 transition-all" />
            <span className="relative text-white font-bold text-lg flex items-center gap-2">
              Join Interview
              <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </motion.div>

        {/* Connection indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-sm font-medium">Connected • Ready to begin</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
