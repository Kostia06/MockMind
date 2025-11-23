// Audio utilities for speech analysis and processing

export interface SpeechMetrics {
  duration: number; // seconds
  wordCount: number;
  wordsPerMinute: number;
  silenceDuration: number;
  fillerWords: { word: string; count: number }[];
  confidenceScore: number; // 0-100
  answerLength: "too-short" | "too-long" | "good";
}

const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you know",
  "basically",
  "actually",
  "honestly",
  "literally",
  "so",
  "i mean",
  "kind of",
  "sort of",
  "well",
];

export function analyzeSpeech(transcript: string, duration: number): SpeechMetrics {
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const wordsPerMinute = Math.round((wordCount / duration) * 60);

  // Detect filler words
  const fillerWordCounts: { [key: string]: number } = {};
  FILLER_WORDS.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = transcript.match(regex);
    if (matches && matches.length > 0) {
      fillerWordCounts[filler] = matches.length;
    }
  });

  const fillerWords = Object.entries(fillerWordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate answer length category
  let answerLength: "too-short" | "too-long" | "good" = "good";
  if (duration < 30) answerLength = "too-short";
  if (duration > 180) answerLength = "too-long";

  // Calculate confidence score (0-100)
  let confidenceScore = 75;

  // Deduct points for filler words
  const totalFillers = fillerWords.reduce((sum, f) => sum + f.count, 0);
  confidenceScore -= Math.min(totalFillers * 2, 20);

  // Deduct points for too-short or too-long answers
  if (answerLength === "too-short") confidenceScore -= 15;
  if (answerLength === "too-long") confidenceScore -= 10;

  // Award points for good pace
  if (wordsPerMinute >= 120 && wordsPerMinute <= 160) {
    confidenceScore += 5;
  }

  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  return {
    duration,
    wordCount,
    wordsPerMinute,
    silenceDuration: 0, // Will be calculated from audio analysis if needed
    fillerWords,
    confidenceScore,
    answerLength,
  };
}

export function getFillerWordAdvice(fillers: { word: string; count: number }[]): string {
  if (fillers.length === 0) {
    return "Excellent! You avoided using filler words.";
  }

  const topFiller = fillers[0];
  const totalFillers = fillers.reduce((sum, f) => sum + f.count, 0);

  if (totalFillers > 10) {
    return `You used ${totalFillers} filler words. Try pausing instead of saying "${topFiller.word}". Silence is powerful!`;
  } else if (totalFillers > 5) {
    return `Good effort! You used ${totalFillers} filler words. Be mindful of "${topFiller.word}" - replace it with brief pauses.`;
  } else {
    return `Great! Only ${totalFillers} filler words used. Keep reducing them for even more polished delivery.`;
  }
}

export function getPaceAdvice(wpm: number): string {
  if (wpm < 100) {
    return "You're speaking a bit slowly. Try to pick up the pace slightly to maintain engagement.";
  } else if (wpm > 180) {
    return "You're speaking quite fast. Slow down a bit to ensure clarity and give yourself time to think.";
  } else {
    return "Your speaking pace is excellent - natural and engaging.";
  }
}

export function getAnswerLengthAdvice(duration: number): string {
  if (duration < 30) {
    return "Your answer was brief. Provide more detail and examples to fully address the question.";
  } else if (duration > 180) {
    return "Your answer was lengthy. Try to be more concise while still covering key points.";
  } else {
    return "Great answer length - concise yet detailed.";
  }
}

export function playAudioFromBase64(base64String: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(base64String);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Failed to play audio"));
      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

// Conversation fillers for natural AI responses
export const AI_ACKNOWLEDGMENTS = [
  "I see, that makes sense.",
  "That's interesting.",
  "Got it.",
  "I understand.",
  "Okay, great point.",
  "That's a good observation.",
  "I hear you.",
  "Absolutely.",
  "Thanks for sharing that.",
  "That's a thoughtful approach.",
];

export const AI_TRANSITIONS = [
  "Building on that...",
  "Let's shift gears a bit...",
  "Great, now let me ask you about...",
  "That's helpful context. Here's my next question...",
  "I appreciate that. Let me dig a little deeper...",
  "Interesting perspective. Let me follow up...",
  "I see. Now, tell me about...",
  "Thanks. Let me explore that further...",
];

export function getRandomAcknowledgment(): string {
  return AI_ACKNOWLEDGMENTS[Math.floor(Math.random() * AI_ACKNOWLEDGMENTS.length)];
}

export function getRandomTransition(): string {
  return AI_TRANSITIONS[Math.floor(Math.random() * AI_TRANSITIONS.length)];
}
