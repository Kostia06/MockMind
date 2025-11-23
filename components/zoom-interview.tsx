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
  type: "technical" | "behavioral" | "mixed";
  difficulty: "entry" | "mid" | "senior";
  selectedVoice: "alloy" | "echo" | "nova" | "shimmer";
  practiceMode: string;
  onComplete: (conversation: ConversationItem[]) => void;
}

type Speaker = "ai" | "user" | "none";

export default function ZoomInterview({
  type,
  difficulty,
  selectedVoice,
  practiceMode,
  onComplete,
}: ZoomInterviewProps) {
  // Video refs
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
  const [isInterviewRecording, setIsInterviewRecording] = useState(true);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(7);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationItem[]
  >([]);
  const [showTranscript, setShowTranscript] = useState(true);
  const [transcriptLines, setTranscriptLines] = useState<
    Array<{ speaker: "ai" | "user"; text: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionQuality, setConnectionQuality] = useState(3); // 0-3 bars

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

        // Initialize interview
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
      const response = await axios.post("/api/interview", {
        type,
        difficulty,
        isFirstQuestion: true,
        questionIndex: 0,
        conversationHistory: [],
        userTranscript: "",
      });

      setCurrentQuestion(response.data.question);
      setQuestionIndex(0);
      setTotalQuestions(response.data.totalQuestions);

      // Add AI question to transcript
      setTranscriptLines((prev) => [
        ...prev,
        { speaker: "ai", text: response.data.question },
      ]);

      // Play AI response with HD quality
      await playAIResponse(response.data.aiResponse);
    } catch (err) {
      console.error("Interview init error:", err);
      setError("Failed to start interview");
    } finally {
      setIsLoading(false);
    }
  };

  // Play AI response with TTS HD
  const playAIResponse = async (text: string) => {
    try {
      setCurrentSpeaker("ai");

      const response = await axios.post("/api/tts", {
        text,
        voice: selectedVoice,
        speed: 0.95,
        model: "tts-1-hd", // Use HD quality
      });

      if (audioRef.current) {
        audioRef.current.src = response.data.audio;
        await audioRef.current.play();

        // Wait for audio to finish
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

  // Start recording user answer
  const startRecording = async () => {
    try {
      setError("");
      setTranscript("");
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

      const duration = (Date.now() - (Date.now() - 45 * 1000)) / 1000;

      // Transcribe
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const transcriptionResponse = await axios.post("/api/transcribe", formData);
      const userAnswer = transcriptionResponse.data.text;
      setTranscript(userAnswer);

      // Add to transcript
      setTranscriptLines((prev) => [
        ...prev,
        { speaker: "user", text: userAnswer },
      ]);

      // Analyze speech
      const metrics = analyzeSpeech(userAnswer, duration);

      // Get AI response
      const interviewResponse = await axios.post("/api/interview", {
        type,
        difficulty,
        isFirstQuestion: false,
        questionIndex,
        conversationHistory,
        userTranscript: userAnswer,
      });

      const newAiResponse = interviewResponse.data.aiResponse;
      const isComplete = interviewResponse.data.isComplete;

      // Update history
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
        // Add AI response to transcript
        setTranscriptLines((prev) => [
          ...prev,
          { speaker: "ai", text: newAiResponse },
        ]);

        setCurrentQuestion(interviewResponse.data.nextQuestion || currentQuestion);
        setQuestionIndex(interviewResponse.data.questionIndex);

        // Play next response
        await playAIResponse(newAiResponse);
      } else {
        // Interview complete
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

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-screen h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="bg-black border-b border-gray-700 px-6 py-3 flex justify-between items-center">
        {/* Left: Timer */}
        <div className="flex items-center gap-4">
          <div className="text-white font-mono text-lg">{formatTime(duration)}</div>
          <div className="w-6 h-6 bg-red-600 rounded-full animate-pulse flex items-center justify-center">
            <span className="text-white text-xs font-bold">REC</span>
          </div>
        </div>

        {/* Center: Question counter */}
        <div className="text-gray-400 text-sm">
          Question {questionIndex + 1} of {totalQuestions}
        </div>

        {/* Right: Connection quality */}
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-3 rounded-sm ${
                i < connectionQuality ? "bg-green-500" : "bg-gray-600"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Main video grid */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* AI Interviewer (60%) */}
        <div className="w-3/5 relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-2 transition-colors" style={{borderColor: currentSpeaker === "ai" ? "#34C759" : "#404040"}}>
          <div className="w-full h-full flex items-center justify-center">
            {/* AI Avatar with animations */}
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
              {/* Animated avatar background */}
              <div className="text-center">
                <div className="text-9xl mb-4">👨‍💼</div>
                <p className="text-gray-400 font-medium">AI Interviewer</p>
              </div>

              {/* Speaking animation */}
              {currentSpeaker === "ai" && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-6 bg-green-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Label */}
          <div className="absolute bottom-3 left-3 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
            AI Interviewer
          </div>
        </div>

        {/* Your Video (40%) */}
        <div className="w-2/5 relative rounded-lg overflow-hidden bg-black border-2 transition-colors" style={{borderColor: currentSpeaker === "user" ? "#34C759" : "#404040"}}>
          <video
            ref={userVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />

          {/* Video off overlay */}
          {!isVideoOn && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-gray-400">Video Off</p>
              </div>
            </div>
          )}

          {/* Label */}
          <div className="absolute bottom-3 left-3 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
            You (Host)
          </div>

          {/* Mute indicator */}
          {isMuted && (
            <div className="absolute top-3 right-3 bg-red-600 rounded-full p-2">
              <span className="text-white text-xl">🔇</span>
            </div>
          )}
        </div>
      </div>

      {/* Transcript (if shown) */}
      {showTranscript && (
        <div className="bg-gray-900 border-t border-gray-700 px-6 py-4 max-h-32 overflow-y-auto">
          <div className="space-y-2">
            {transcriptLines.slice(-5).map((line, idx) => (
              <div
                key={idx}
                className={`text-sm ${
                  line.speaker === "ai"
                    ? "text-blue-400"
                    : "text-gray-300"
                }`}
              >
                <span className="font-bold">
                  {line.speaker === "ai" ? "Interviewer:" : "You:"}{" "}
                </span>
                {line.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-6 py-4 flex justify-between items-center">
        {/* Left controls */}
        <div className="flex gap-4">
          {/* Microphone */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full transition-all ${
              isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            <span className="text-white text-lg">{isMuted ? "🔇" : "🎤"}</span>
          </button>

          {/* Video */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-full transition-all ${
              !isVideoOn
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
            title={isVideoOn ? "Stop Video" : "Start Video"}
          >
            <span className="text-white text-lg">{isVideoOn ? "📹" : "📹"}</span>
          </button>

          {/* Security (disabled) */}
          <button
            disabled
            className="p-3 rounded-full bg-gray-700 opacity-50 cursor-not-allowed"
            title="Security (unavailable)"
          >
            <span className="text-gray-400 text-lg">🔒</span>
          </button>

          {/* Participants (disabled) */}
          <button
            disabled
            className="p-3 rounded-full bg-gray-700 opacity-50 cursor-not-allowed"
            title="Participants"
          >
            <span className="text-gray-400 text-lg">👥</span>
          </button>
        </div>

        {/* Center: End Interview */}
        <button
          onClick={() => onComplete(conversationHistory)}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-all"
        >
          End Interview
        </button>

        {/* Right controls */}
        <div className="flex gap-4">
          {/* Reactions (disabled) */}
          <button
            disabled
            className="p-3 rounded-full bg-gray-700 opacity-50 cursor-not-allowed"
            title="Reactions"
          >
            <span className="text-gray-400 text-lg">👍</span>
          </button>

          {/* Chat (disabled) */}
          <button
            disabled
            className="p-3 rounded-full bg-gray-700 opacity-50 cursor-not-allowed"
            title="Chat"
          >
            <span className="text-gray-400 text-lg">💬</span>
          </button>

          {/* Recording (active) */}
          <button
            className="p-3 rounded-full bg-red-600 hover:bg-red-700"
            title="Recording"
          >
            <span className="text-white text-lg animate-pulse">⚫</span>
          </button>

          {/* Transcript toggle */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`p-3 rounded-full transition-all ${
              showTranscript
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
            title="Toggle Transcript"
          >
            <span className="text-white text-lg">📝</span>
          </button>
        </div>
      </div>

      {/* Recording controls overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {!isRecording && !isLoading && currentSpeaker === "none" && (
          <button
            onClick={startRecording}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-lg pointer-events-auto"
          >
            🎤 Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-lg pointer-events-auto animate-pulse"
          >
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}
