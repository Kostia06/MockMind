"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface ConversationItem {
  question: string;
  userAnswer: string;
  aiResponse: string;
}

export default function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "technical";
  const difficulty = searchParams.get("difficulty") || "mid";

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(7);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationItem[]
  >([]);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize interview on mount
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

        // Speak the first question
        speakText(response.data.aiResponse);
      } catch (err) {
        console.error("Failed to initialize interview:", err);
        setError("Failed to start interview. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeInterview();
  }, [type, difficulty]);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

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

      // Transcribe audio
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const transcriptionResponse = await axios.post("/api/transcribe", formData);
      const userAnswer = transcriptionResponse.data.text;
      setTranscript(userAnswer);

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
        },
      ];
      setConversationHistory(newConversation);

      // Update UI
      setAiResponse(newAiResponse);
      setCurrentQuestion(nextQuestion || currentQuestion);
      setQuestionIndex(interviewResponse.data.questionIndex);

      // Speak AI response
      speakText(newAiResponse);

      if (isComplete) {
        setInterviewComplete(true);
      }
    } catch (err) {
      console.error("Error processing audio:", err);
      setError("Failed to process your answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishEarly = () => {
    setInterviewComplete(true);
  };

  const handleGoToFeedback = () => {
    // Store interview data in sessionStorage temporarily
    sessionStorage.setItem(
      "lastInterview",
      JSON.stringify({
        type,
        difficulty,
        conversationHistory,
      })
    );
    router.push("/feedback");
  };

  if (interviewComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Interview Complete!
          </h1>
          <p className="text-gray-600 mb-6">
            Great job! You've completed the interview. Let's review your
            performance and get detailed feedback.
          </p>

          {conversationHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3">
                Interview Summary
              </h3>
              <div className="space-y-3 text-left">
                {conversationHistory.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium text-gray-900">
                      Q{idx + 1}: {item.question}
                    </p>
                    <p className="text-gray-600 mt-1">
                      Your answer: {item.userAnswer.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleGoToFeedback}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
          >
            View Feedback & Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {type.charAt(0).toUpperCase() + type.slice(1)} Interview
            </h1>
            <span className="text-sm font-medium text-gray-600">
              {difficulty.toUpperCase()} Level
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((questionIndex + 1) / totalQuestions) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Current Question */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Current Question
          </h2>
          <p className="text-gray-800 text-base leading-relaxed">
            {currentQuestion}
          </p>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Interviewer
            </h3>
            <p className="text-gray-800">{aiResponse}</p>
          </div>
        )}

        {/* User Transcript */}
        {transcript && (
          <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Your Response (Transcribed)
            </h3>
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}

        {/* Recording Button */}
        <div className="flex gap-3 mb-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">🎤</span> Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 pulse-recording"
            >
              <span className="text-lg">🔴</span> Stop Recording
            </button>
          )}

          <button
            onClick={handleFinishEarly}
            disabled={isLoading || isRecording}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-all"
          >
            Finish Interview
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-2">Processing your response...</p>
          </div>
        )}

        {/* Tips */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Interview Tips</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✓ Speak clearly and naturally</li>
            <li>✓ Take time to think before answering</li>
            <li>✓ Provide specific examples when possible</li>
            <li>✓ Ask clarifying questions if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
