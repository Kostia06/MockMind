"use client";

import { SpeechMetrics, getPaceAdvice, getAnswerLengthAdvice, getFillerWordAdvice } from "@/lib/audio-utils";

interface SpeechAnalysisDashboardProps {
  metrics: SpeechMetrics;
  showDetailed?: boolean;
}

export default function SpeechAnalysisDashboard({ metrics, showDetailed = false }: SpeechAnalysisDashboardProps) {
  const getConfidenceColor = () => {
    if (metrics.confidenceScore >= 80) return "text-green-600";
    if (metrics.confidenceScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getWPMColor = () => {
    if (metrics.wordsPerMinute >= 120 && metrics.wordsPerMinute <= 160) return "text-green-600";
    return "text-yellow-600";
  };

  const getAnswerLengthIcon = () => {
    switch (metrics.answerLength) {
      case "too-short":
        return "📍";
      case "too-long":
        return "📚";
      case "good":
        return "✓";
    }
  };

  return (
    <div className="space-y-4">
      {/* Confidence Score */}
      <div className="apple-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confidence Score</h3>
          <div className={`text-4xl font-bold ${getConfidenceColor()}`}>
            {metrics.confidenceScore}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 h-3 rounded-full transition-all"
            style={{ width: `${metrics.confidenceScore}%` }}
          ></div>
        </div>
      </div>

      {/* Speaking Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Words Per Minute */}
        <div className="apple-card p-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Speaking Pace</div>
          <div className={`text-2xl font-bold ${getWPMColor()}`}>
            {metrics.wordsPerMinute} WPM
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {metrics.wordsPerMinute < 120 ? "Too slow" : metrics.wordsPerMinute > 160 ? "Too fast" : "Perfect"}
          </div>
        </div>

        {/* Answer Length */}
        <div className="apple-card p-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Answer Length</div>
          <div className="text-2xl font-bold">
            {Math.floor(metrics.duration)}s {getAnswerLengthIcon()}
          </div>
          <div className="text-xs text-gray-500 mt-2 capitalize">
            {metrics.answerLength === "good" ? "Good length" : metrics.answerLength}
          </div>
        </div>

        {/* Word Count */}
        <div className="apple-card p-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Word Count</div>
          <div className="text-2xl font-bold text-blue-600">{metrics.wordCount}</div>
          <div className="text-xs text-gray-500 mt-2">words spoken</div>
        </div>

        {/* Filler Words */}
        <div className="apple-card p-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Filler Words</div>
          <div className="text-2xl font-bold text-purple-600">
            {metrics.fillerWords.reduce((sum, f) => sum + f.count, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-2">detected</div>
        </div>
      </div>

      {/* Filler Words Detail */}
      {metrics.fillerWords.length > 0 && (
        <div className="apple-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filler Words Detected</h3>
          <div className="space-y-2">
            {metrics.fillerWords.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">"{f.word}"</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(f.count / Math.max(...metrics.fillerWords.map(x => x.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-8 text-right">{f.count}x</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-purple-50 rounded-lg text-sm text-gray-700">
            💡 {getFillerWordAdvice(metrics.fillerWords)}
          </div>
        </div>
      )}

      {/* Detailed Advice */}
      {showDetailed && (
        <div className="space-y-3">
          <div className="apple-card p-4 bg-blue-50 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-900 mb-1">Pace Feedback</div>
            <div className="text-sm text-gray-700">{getPaceAdvice(metrics.wordsPerMinute)}</div>
          </div>

          <div className="apple-card p-4 bg-amber-50 border-l-4 border-amber-500">
            <div className="text-sm font-medium text-gray-900 mb-1">Answer Length Feedback</div>
            <div className="text-sm text-gray-700">{getAnswerLengthAdvice(metrics.duration)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
