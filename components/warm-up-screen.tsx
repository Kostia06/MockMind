"use client";

import { useState, useEffect } from "react";

interface WarmUpScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function WarmUpScreen({ onComplete, onSkip }: WarmUpScreenProps) {
  const [step, setStep] = useState<"breathing" | "tips" | "test">("breathing");
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");

  // 4-7-8 breathing animation
  useEffect(() => {
    if (step !== "breathing") return;

    const phases = [
      { phase: "inhale", duration: 4000 },
      { phase: "hold", duration: 7000 },
      { phase: "exhale", duration: 8000 },
    ];

    let currentPhase = 0;
    let phaseStartTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - phaseStartTime;
      const currentPhaseData = phases[currentPhase];

      if (elapsed >= currentPhaseData.duration) {
        currentPhase = (currentPhase + 1) % phases.length;
        phaseStartTime = Date.now();

        if (currentPhase === 0) {
          setBreathingCycle(c => c + 1);
        }

        setBreathingPhase(phases[currentPhase].phase as any);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [step]);

  const getBreathingSize = () => {
    switch (breathingPhase) {
      case "inhale":
        return "scale-100";
      case "hold":
        return "scale-125";
      case "exhale":
        return "scale-75";
    }
  };

  const getBreathingText = () => {
    switch (breathingPhase) {
      case "inhale":
        return "Breathe In (4s)";
      case "hold":
        return "Hold (7s)";
      case "exhale":
        return "Breathe Out (8s)";
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "breathing" && (
          <div className="apple-card p-8 text-center slide-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Warm Up</h2>
            <p className="text-gray-600 mb-8">Let's calm your mind before you begin</p>

            {/* Breathing Circle Animation */}
            <div className="flex justify-center mb-8">
              <div
                className={`w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-400 transition-transform duration-1000 ${getBreathingSize()}`}
              ></div>
            </div>

            <div className="text-2xl font-semibold text-gray-900 mb-4">
              {getBreathingText()}
            </div>

            <p className="text-gray-600 mb-6">
              Cycle {breathingCycle + 1} of 3
            </p>

            {breathingCycle >= 2 && (
              <button
                onClick={() => setStep("tips")}
                className="btn-primary w-full"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {step === "tips" && (
          <div className="apple-card p-8 slide-up space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Interview Tips</h2>

            <div className="space-y-4">
              {[
                { icon: "🎤", title: "Speak Clearly", desc: "Enunciate each word and avoid mumbling" },
                { icon: "⏸️", title: "Take Your Time", desc: "It's okay to pause and think before responding" },
                { icon: "📝", title: "Use Examples", desc: "Support your answers with specific, real examples" },
                { icon: "😊", title: "Stay Calm", desc: "You've prepared well. Trust yourself!" },
              ].map((tip, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl">{tip.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{tip.title}</div>
                    <div className="text-sm text-gray-600">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("test")}
                className="btn-primary flex-1"
              >
                Next
              </button>
              <button
                onClick={onSkip}
                className="btn-secondary flex-1"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {step === "test" && (
          <div className="apple-card p-8 text-center slide-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Audio Test</h2>
            <p className="text-gray-600 mb-8">Quick test to ensure your microphone works</p>

            <div className="py-8">
              <div className="text-5xl mb-4">🎧</div>
              <p className="text-gray-600 mb-4">
                Try recording a few seconds to test your setup
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                Say: "Hello, I'm ready for the interview"
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onComplete}
                className="btn-primary flex-1"
              >
                Ready to Start
              </button>
              <button
                onClick={onSkip}
                className="btn-secondary flex-1"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
