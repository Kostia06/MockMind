"use client";

import CircularProgress from "./circular-progress";

interface Feedback {
  overallScore: number;
  interviewReadiness: string;
  strengths: string[];
  weaknesses: string[];
  fillerWords: { count: number; examples: string[] };
  communicationScore: number;
  technicalScore: number;
  suggestions: string[];
  answerQualityByQuestion: Array<{
    questionNumber: number;
    quality: number;
    feedback: string;
  }>;
}

interface EnhancedFeedbackProps {
  feedback: Feedback;
  onStartNew: () => void;
  onViewHistory: () => void;
}

export default function EnhancedFeedback({
  feedback,
  onStartNew,
  onViewHistory,
}: EnhancedFeedbackProps) {
  const getReadinessIcon = () => {
    if (feedback.interviewReadiness === "Ready to Apply") return "✅";
    if (feedback.interviewReadiness === "Need More Prep") return "⚠️";
    return "❌";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12 slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Interview Complete! 🎉
          </h1>
          <p className="text-gray-600 text-lg">Here's your detailed performance analysis</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="apple-card p-8 flex flex-col items-center justify-center text-center slide-up">
            <CircularProgress
              score={feedback.overallScore}
              max={10}
              label="Overall Score"
              size={140}
              strokeWidth={10}
            />
          </div>

          {/* Communication */}
          <div className="apple-card p-8 flex flex-col items-center justify-center text-center slide-up">
            <CircularProgress
              score={feedback.communicationScore}
              max={10}
              label="Communication"
              size={140}
              strokeWidth={10}
              color="#3B82F6"
            />
          </div>

          {/* Technical */}
          <div className="apple-card p-8 flex flex-col items-center justify-center text-center slide-up">
            <CircularProgress
              score={feedback.technicalScore}
              max={10}
              label="Technical"
              size={140}
              strokeWidth={10}
              color="#8B5CF6"
            />
          </div>
        </div>

        {/* Interview Readiness */}
        <div className="apple-card p-8 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 slide-up">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{getReadinessIcon()}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {feedback.interviewReadiness}
              </h2>
              <p className="text-gray-600 mt-1">
                {feedback.interviewReadiness === "Ready to Apply"
                  ? "You're well-prepared for real interviews. Apply confidently!"
                  : feedback.interviewReadiness === "Need More Prep"
                  ? "With more practice, you'll be ready for interviews soon."
                  : "Focus on the suggestions below before applying."}
              </p>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="apple-card p-6 slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              ✨ Your Strengths
            </h3>
            <div className="space-y-3">
              {feedback.strengths.map((strength, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="apple-card p-6 slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎯 Areas to Improve
            </h3>
            <div className="space-y-3">
              {feedback.weaknesses.map((weakness, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 text-xl">→</span>
                  <span className="text-gray-700">{weakness}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Speech Analysis */}
        <div className="apple-card p-6 slide-up">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Speech Pattern Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-2">Filler Words Detected</div>
              <div className="text-4xl font-bold text-purple-600">{feedback.fillerWords.count}</div>
              {feedback.fillerWords.examples.length > 0 && (
                <div className="text-sm text-gray-600 mt-3">
                  Examples: <span className="font-medium">{feedback.fillerWords.examples.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-2">Recommendation</div>
              <p className="text-gray-700">
                {feedback.fillerWords.count > 10
                  ? "Focus on reducing filler words. Practice pausing instead."
                  : feedback.fillerWords.count > 5
                  ? "Good progress! Keep working on minimizing filler words."
                  : "Excellent! Very few filler words detected."}
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="apple-card p-6 slide-up">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Actionable Suggestions</h3>
          <div className="space-y-4">
            {feedback.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-l-4 border-green-500">
                <div className="text-2xl font-bold text-green-600 min-w-8">{idx + 1}</div>
                <p className="text-gray-700 leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Answer Quality */}
        {feedback.answerQualityByQuestion.length > 0 && (
          <div className="apple-card p-6 slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Answer Quality Breakdown</h3>
            <div className="space-y-4">
              {feedback.answerQualityByQuestion.map((item) => (
                <div key={item.questionNumber} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900">
                      Question {item.questionNumber}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-green-400"
                          style={{ width: `${(item.quality / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-900 min-w-12">{item.quality}/10</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{item.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12 slide-up">
          <button
            onClick={onStartNew}
            className="btn-primary flex-1 py-4 text-lg font-semibold rounded-xl"
          >
            Practice Another Interview
          </button>
          <button
            onClick={onViewHistory}
            className="btn-secondary flex-1 py-4 text-lg font-semibold rounded-xl"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
