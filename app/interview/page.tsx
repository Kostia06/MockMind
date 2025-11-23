"use client";

import { Suspense } from "react";
import InterviewContent from "./interview-content";

export default function InterviewPage() {
  return (
    <Suspense fallback={<InterviewLoading />}>
      <InterviewContent />
    </Suspense>
  );
}

function InterviewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 text-center border border-white/10 relative z-10">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
        </div>
        <p className="text-gray-200 mt-4 font-medium">Loading interview...</p>
      </div>
    </div>
  );
}
