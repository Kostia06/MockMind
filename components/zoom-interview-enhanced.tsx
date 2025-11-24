"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { analyzeSpeech, SpeechMetrics } from "@/lib/audio-utils";

interface ConversationItem {
  question: string;
  userAnswer: string;
  aiResponse: string;
  metrics?: SpeechMetrics;
}

interface ZoomInterviewProps {
  jobRole: string;
  jobLevel: string;
  jobPosting: string;
  selectedVoice: "alloy" | "echo" | "nova" | "shimmer";
  onComplete: (conversation: ConversationItem[]) => void;
}

type Speaker = "ai" | "user" | "none";

// Real-time stats component
function LiveStats({
  duration,
  questionIndex,
  totalQuestions,
  confidence
}: {
  duration: number;
  questionIndex: number;
  totalQuestions: number;
  confidence: number;
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-400/20 hover:bg-emerald-500/15 transition-all">
        <div className="text-xs text-emerald-300 font-medium">TIME</div>
        <div className="text-xl sm:text-2xl font-bold text-white mt-1">{formatTime(duration)}</div>
      </div>

      <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-400/20 hover:bg-emerald-500/15 transition-all">
        <div className="text-xs text-emerald-300 font-medium">QUESTION</div>
        <div className="text-xl sm:text-2xl font-bold text-white mt-1">{questionIndex + 1}/{totalQuestions}</div>
      </div>

      <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-400/20 hover:bg-emerald-500/15 transition-all">
        <div className="text-xs text-emerald-300 font-medium">CONFIDENCE</div>
        <div className="flex items-center gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${
                i < Math.floor(confidence / 20) ? "bg-emerald-400" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-400/20 hover:bg-emerald-500/15 transition-all">
        <div className="text-xs text-emerald-300 font-medium">STATUS</div>
        <div className="text-sm font-bold text-emerald-400 mt-1 animate-pulse">● LIVE</div>
      </div>
    </div>
  );
}

export default function ZoomInterviewEnhanced({
  jobRole,
  jobLevel,
  jobPosting,
  selectedVoice,
  onComplete,
}: ZoomInterviewProps) {
  // Refs
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // State
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker>("none");
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(7);
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [showTranscript, setShowTranscript] = useState(true);
  const [transcriptLines, setTranscriptLines] = useState<Array<{ speaker: "ai" | "user"; text: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionQuality, setConnectionQuality] = useState(3);
  const [confidence, setConfidence] = useState(75);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize webcam
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        streamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        await initializeInterview();
      } catch (err) {
        console.error("Webcam error:", err);
        setError("Could not access webcam. Please check permissions.");
      }
    };

    initWebcam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize interview
  const initializeInterview = async () => {
    try {
      setIsLoading(true);

      // First, fetch the generated questions from the job posting
      const questionResponse = await axios.post("/api/generate-questions", {
        jobPosting,
      });

      const questions = questionResponse.data.questions || [];
      setGeneratedQuestions(questions);
      setTotalQuestions(questions.length);

      // Start the interview with the first generated question
      const response = await axios.post("/api/interview", {
        jobRole,
        jobLevel,
        questions,
        isFirstQuestion: true,
        questionIndex: 0,
        conversationHistory: [],
        userTranscript: "",
      });

      setCurrentQuestion(response.data.question);
      setQuestionIndex(0);

      setTranscriptLines((prev) => [
        ...prev,
        { speaker: "ai", text: response.data.question },
      ]);

      await playAIResponse(response.data.aiResponse);
    } catch (err) {
      console.error("Interview init error:", err);
      setError("Failed to start interview");
    } finally {
      setIsLoading(false);
    }
  };

  // Play AI response
  const playAIResponse = async (text: string) => {
    try {
      setCurrentSpeaker("ai");

      const response = await axios.post("/api/tts", {
        text,
        voice: selectedVoice,
        speed: 0.95,
        model: "tts-1-hd",
      });

      if (audioRef.current) {
        audioRef.current.src = response.data.audio;
        await audioRef.current.play();

        await new Promise((resolve) => {
          const handleEnded = () => {
            audioRef.current?.removeEventListener("ended", handleEnded);
            resolve(null);
          };
          audioRef.current?.addEventListener("ended", handleEnded);
        });
      }

      setCurrentSpeaker("none");
    } catch (err) {
      console.error("TTS error:", err);
      setError("Failed to generate AI voice");
      setCurrentSpeaker("none");
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentSpeaker("user");
    } catch (err) {
      console.error("Recording error:", err);
      setError("Could not access microphone");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process audio
  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("audio", audioBlob);

      const transcriptionResponse = await axios.post("/api/transcribe", formData);
      const userAnswer = transcriptionResponse.data.text;

      setTranscriptLines((prev) => [
        ...prev,
        { speaker: "user", text: userAnswer },
      ]);

      const metrics = analyzeSpeech(userAnswer, 30);

      const interviewResponse = await axios.post("/api/interview", {
        jobRole,
        jobLevel,
        questions: generatedQuestions,
        isFirstQuestion: false,
        questionIndex,
        conversationHistory,
        userTranscript: userAnswer,
      });

      const newAiResponse = interviewResponse.data.aiResponse;
      const isComplete = interviewResponse.data.isComplete;

      const newConversation = [
        ...conversationHistory,
        {
          question: currentQuestion,
          userAnswer,
          aiResponse: newAiResponse,
          metrics,
        },
      ];
      setConversationHistory(newConversation);

      if (!isComplete) {
        setTranscriptLines((prev) => [
          ...prev,
          { speaker: "ai", text: newAiResponse },
        ]);

        setCurrentQuestion(interviewResponse.data.nextQuestion || currentQuestion);
        setQuestionIndex(interviewResponse.data.questionIndex);

        await playAIResponse(newAiResponse);
      } else {
        onComplete(newConversation);
      }
    } catch (err) {
      console.error("Processing error:", err);
      setError("Failed to process your answer");
    } finally {
      setIsLoading(false);
      setCurrentSpeaker("none");
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 overflow-y-auto">
      {/* Animated background - Green theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col p-2 sm:p-4 gap-3 sm:gap-4 py-4">
        {/* Top Stats Bar */}
        <LiveStats
          duration={duration}
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
          confidence={confidence}
        />

        {/* Main Interview Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Left: AI Video (60% width equivalent) */}
          <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4 order-2 lg:order-1">
            <div
              className="relative rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl border-2 transition-all shadow-2xl h-48 sm:h-64 lg:h-auto lg:flex-1 lg:min-h-[400px]"
              style={{
                borderColor: currentSpeaker === "ai" ? "#10b981" : "rgba(16,185,129,0.1)",
                backgroundColor: "rgba(5,46,22,0.4)",
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl lg:text-8xl mb-2 sm:mb-4 animate-bounce" style={{ animationDuration: "2s" }}>
                    👨‍💼
                  </div>
                  <p className="text-gray-300 font-semibold text-sm sm:text-base lg:text-lg">{selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1)}</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">AI Interviewer</p>
                </div>

                {/* Speaking indicator */}
                {currentSpeaker === "ai" && (
                  <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 sm:w-1 h-4 sm:h-8 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full"
                        style={{
                          animation: `pulse 0.6s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-black/40 backdrop-blur-lg border border-white/10">
                <p className="text-white text-xs sm:text-sm font-medium">Interview Panel</p>
              </div>
            </div>

            {/* Transcript Panel */}
            {showTranscript && (
              <div className="h-20 sm:h-24 lg:h-32 rounded-xl bg-emerald-500/5 backdrop-blur-lg border border-emerald-400/10 p-2 sm:p-3 lg:p-4 overflow-y-auto">
                <div className="space-y-2">
                  {transcriptLines.slice(-4).map((line, idx) => (
                    <div key={idx} className="text-xs">
                      <span
                        className={`font-semibold ${
                          line.speaker === "ai" ? "text-purple-300" : "text-blue-300"
                        }`}
                      >
                        {line.speaker === "ai" ? "📍 Interviewer:" : "👤 You:"}
                      </span>
                      <span className="text-gray-300 ml-2 line-clamp-1">
                        {line.text.substring(0, 80)}...
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Your Video + Controls (40% width equivalent) */}
          <div className="flex flex-col gap-3 sm:gap-4 order-1 lg:order-2">
            {/* User Video */}
            <div
              className="relative rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl border-2 transition-all shadow-xl h-48 sm:h-56 lg:h-auto lg:flex-1 lg:min-h-[300px]"
              style={{
                borderColor: currentSpeaker === "user" ? "#10b981" : "rgba(16,185,129,0.1)",
                backgroundColor: "rgba(5,46,22,0.4)",
              }}
            >
              <video
                ref={userVideoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {!isVideoOn && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl lg:text-6xl mb-2">📹</div>
                    <p className="text-gray-300 text-xs sm:text-sm">Camera Off</p>
                  </div>
                </div>
              )}

              {/* Label */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-black/40 backdrop-blur-lg border border-white/10">
                <p className="text-white text-xs sm:text-sm font-medium">You (Host)</p>
              </div>

              {/* Mute indicator */}
              {isMuted && (
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-red-500/20 backdrop-blur-lg border border-red-400/30">
                  <span className="text-red-300 text-xs font-medium">🔇 MUTED</span>
                </div>
              )}
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/5 backdrop-blur-md border border-emerald-400/10">
                <p className="text-xs text-emerald-300 font-medium">LEVEL</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-white capitalize mt-1">{jobLevel}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/5 backdrop-blur-md border border-emerald-400/10">
                <p className="text-xs text-emerald-300 font-medium">ROLE</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-white capitalize mt-1 truncate">{jobRole}</p>
              </div>
            </div>

            {/* Control Buttons - Only show on mobile */}
            <div className="grid grid-cols-2 gap-2 lg:hidden">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 sm:p-3 rounded-lg font-semibold text-white transition-all backdrop-blur-md border text-sm ${
                  isMuted
                    ? "bg-red-500/30 border-red-400/50 hover:bg-red-500/40"
                    : "bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇" : "🎤"}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2 sm:p-3 rounded-lg font-semibold text-white transition-all backdrop-blur-md border text-sm ${
                  !isVideoOn
                    ? "bg-red-500/30 border-red-400/50 hover:bg-red-500/40"
                    : "bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20"
                }`}
                title={isVideoOn ? "Stop Video" : "Start Video"}
              >
                📹
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/5 backdrop-blur-lg border border-emerald-400/10 mb-2">
          {/* Top row - Transcript toggle, desktop video/audio controls, and error */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all backdrop-blur-md border ${
                showTranscript
                  ? "bg-emerald-500/30 border-emerald-400 text-white"
                  : "bg-emerald-500/10 border-emerald-400/20 text-gray-300 hover:bg-emerald-500/20"
              }`}
            >
              <span className="hidden sm:inline">{showTranscript ? "Hide" : "Show"} Transcript</span>
              <span className="sm:hidden">{showTranscript ? "Hide" : "Show"} Text</span>
            </button>

            {/* Desktop controls - hidden on mobile */}
            <div className="hidden lg:flex gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition-all backdrop-blur-md border ${
                  isMuted
                    ? "bg-red-500/30 border-red-400/50 hover:bg-red-500/40"
                    : "bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20"
                }`}
              >
                {isMuted ? "🔇 Unmute" : "🎤 Mute"}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition-all backdrop-blur-md border ${
                  !isVideoOn
                    ? "bg-red-500/30 border-red-400/50 hover:bg-red-500/40"
                    : "bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20"
                }`}
              >
                {isVideoOn ? "📹 Video On" : "📹 Video Off"}
              </button>
            </div>

            {error && (
              <div className="px-3 sm:px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 text-xs sm:text-sm font-medium">
                {error}
              </div>
            )}
          </div>

          {/* Bottom row - Main action buttons */}
          <div className="flex gap-2 w-full">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isLoading}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
              >
                <span className="hidden sm:inline">🎙️ Start Answer</span>
                <span className="sm:hidden">🎙️ Answer</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-red-500 text-white font-bold text-sm sm:text-base hover:bg-red-600 transition-all animate-pulse"
              >
                <span className="hidden sm:inline">⏹️ Stop Answer</span>
                <span className="sm:hidden">⏹️ Stop</span>
              </button>
            )}

            <button
              onClick={() => onComplete(conversationHistory)}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-white font-medium text-sm sm:text-base border border-emerald-400/20 transition-all"
            >
              <span className="hidden sm:inline">End Interview</span>
              <span className="sm:hidden">End</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audio element */}
      <audio ref={audioRef} />

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-purple-400 animate-spin"></div>
            </div>
            <p className="text-white mt-4 font-medium">Preparing question...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.5); }
          50% { opacity: 1; transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
