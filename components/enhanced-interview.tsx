"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { analyzeSpeech, SpeechMetrics } from "@/lib/audio-utils";
import SpeechAnalysisDashboard from "./speech-analysis";
import { PracticeMode } from "./practice-mode-selector";

interface ConversationItem {
  question: string;
  userAnswer: string;
  aiResponse: string;
  metrics?: SpeechMetrics;
}

interface EnhancedInterviewProps {
  type: "technical" | "behavioral" | "mixed";
  difficulty: "entry" | "mid" | "senior";
  practiceMode: PracticeMode;
  companyName?: string;
  timeLimit?: number;
  onComplete: (conversation: ConversationItem[]) => void;
}

export default function EnhancedInterview({
  type,
  difficulty,
  practiceMode,
  companyName,
  timeLimit,
  onComplete,
}: EnhancedInterviewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(7);
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [error, setError] = useState("");
  const [lastMetrics, setLastMetrics] = useState<SpeechMetrics | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Initialize interview
  useEffect(() => {
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
        setAiResponse(response.data.aiResponse);
        setQuestionIndex(0);
        setTotalQuestions(response.data.totalQuestions);

        // Play AI response
        await playAIResponse(response.data.aiResponse);
      } catch (err) {
        console.error("Failed to initialize interview:", err);
        setError("Failed to start interview. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeInterview();
  }, [type, difficulty]);

  // Timer for time limit
  useEffect(() => {
    if (!timeLimit || !isRecording) return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1 && isRecording) {
          stopRecording();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording, timeLimit]);

  const playAIResponse = async (text: string): Promise<void> => {
    try {
      const response = await axios.post("/api/tts", {
        text,
        voice: "nova",
      });

      await new Promise((resolve) => {
        const audio = new Audio(response.data.audio);
        audio.onended = resolve;
        audio.play();
      });
    } catch (error) {
      console.error("TTS error:", error);
      // Fallback to browser speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      setError("");
      setTranscript("");

      if (timeLimit) {
        setSecondsLeft(timeLimit);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      const duration = (Date.now() - recordingStartTimeRef.current) / 1000;

      // Transcribe audio
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const transcriptionResponse = await axios.post("/api/transcribe", formData);
      const userAnswer = transcriptionResponse.data.text;
      setTranscript(userAnswer);

      // Analyze speech
      const metrics = analyzeSpeech(userAnswer, duration);
      setLastMetrics(metrics);

      // Get next AI response
      const interviewResponse = await axios.post("/api/interview", {
        type,
        difficulty,
        isFirstQuestion: false,
        questionIndex,
        conversationHistory: [...conversationHistory],
        userTranscript: userAnswer,
      });

      const newAiResponse = interviewResponse.data.aiResponse;
      const nextQuestion = interviewResponse.data.nextQuestion;
      const isComplete = interviewResponse.data.isComplete;

      // Update conversation history
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

      // Update UI
      setAiResponse(newAiResponse);
      setCurrentQuestion(nextQuestion || currentQuestion);
      setQuestionIndex(interviewResponse.data.questionIndex);

      // Play AI response
      await playAIResponse(newAiResponse);

      if (isComplete) {
        setTimeout(() => onComplete(newConversation), 1000);
      }
    } catch (err) {
      console.error("Error processing audio:", err);
      setError("Failed to process your answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-green-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {type.charAt(0).toUpperCase() + type.slice(1)} Interview
            </h1>
            <p className="text-sm text-gray-600">
              {difficulty.toUpperCase()} • {practiceMode.charAt(0).toUpperCase() + practiceMode.slice(1)} Mode
              {companyName && ` • ${companyName}`}
            </p>
          </div>

          {/* Timer */}
          {timeLimit && secondsLeft > 0 && (
            <div className={`text-3xl font-bold ${secondsLeft < 30 ? "text-red-600" : "text-green-600"}`}>
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-600 ml-2 min-w-fit">
              {questionIndex + 1}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {error && (
          <div className="apple-card p-4 bg-red-50 border-l-4 border-red-500 text-red-700 slide-up">
            {error}
          </div>
        )}

        {isLoading && !transcript ? (
          <div className="apple-card p-12 text-center">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
            </div>
            <p className="text-gray-600">Processing your response...</p>
          </div>
        ) : (
          <>
            {/* Current Question */}
            <div className="glass p-8 min-h-32 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-4">Question {questionIndex + 1}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
                  {currentQuestion}
                </h2>
              </div>
            </div>

            {/* AI Response */}
            {aiResponse && (
              <div className="apple-card p-6 bg-blue-50 border-l-4 border-blue-500 slide-up">
                <p className="text-sm font-medium text-gray-600 mb-2">Interviewer</p>
                <p className="text-gray-800 text-lg leading-relaxed">{aiResponse}</p>
              </div>
            )}

            {/* User Transcript */}
            {transcript && (
              <div className="apple-card p-6 bg-green-50 border-l-4 border-green-500 slide-up">
                <p className="text-sm font-medium text-gray-600 mb-2">Your Response</p>
                <p className="text-gray-800">{transcript}</p>
              </div>
            )}

            {/* Speech Analysis */}
            {lastMetrics && (
              <div className="slide-up">
                <SpeechAnalysisDashboard metrics={lastMetrics} showDetailed={true} />
              </div>
            )}

            {/* Recording Button */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isLoading}
                    className="btn-record-circle !w-32 !h-32 bg-gradient-to-br from-green-400 to-emerald-500 text-white text-5xl hover:shadow-lg disabled:opacity-50"
                  >
                    🎤
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="btn-record-circle !w-32 !h-32 recording text-white text-5xl"
                  >
                    ⏹️
                  </button>
                )}
              </div>

              {isRecording && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 animate-pulse">Recording...</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
