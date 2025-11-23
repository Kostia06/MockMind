import { NextRequest, NextResponse } from "next/server";
import { getRandomAcknowledgment, getRandomTransition } from "@/lib/audio-utils";

const TECHNICAL_QUESTIONS = [
  "Explain how you would optimize a slow database query. Walk me through your debugging process.",
  "Describe a challenging production bug you've encountered. How did you approach fixing it?",
  "Design a system to handle millions of concurrent users. What are the key considerations?",
  "Explain the difference between SQL and NoSQL databases. When would you use each?",
  "Walk me through your approach to code review and maintaining code quality in a team.",
];

const BEHAVIORAL_QUESTIONS = [
  "Tell me about a time you disagreed with a team member. How did you handle it?",
  "Describe a challenging project you completed and the obstacles you overcame.",
  "Give me an example of when you showed leadership outside of your formal role.",
  "Tell me about a time you failed. What did you learn from it?",
  "How do you prioritize your work when you have multiple competing deadlines?",
];

const MIXED_QUESTIONS = [
  "Explain a recent technical project and the leadership decisions you made.",
  "Describe how you debug complex issues and communicate findings to your team.",
  "Tell me about a time you had to learn a new technology. How did you approach it?",
  "Design and discuss a system you've built, focusing on your decision-making process.",
  "How do you balance technical excellence with business needs in your work?",
];

interface InterviewRequest {
  type?: "technical" | "behavioral" | "mixed";
  difficulty?: "entry" | "mid" | "senior";
  jobRole?: string;
  jobLevel?: string;
  questions?: string[];
  userTranscript: string;
  conversationHistory: Array<{ role: string; content: string }>;
  questionIndex: number;
  isFirstQuestion?: boolean;
}

function getSystemPrompt(
  type: string,
  difficulty: string,
  questionIndex: number,
  totalQuestions: number,
  jobRole?: string,
  jobLevel?: string,
  conversationHistory?: Array<{ role: string; content: string }>
): string {
  const difficultyContext =
    difficulty === "entry"
      ? "You are interviewing a junior developer. Keep questions straightforward but insightful. Ask questions that help them learn."
      : difficulty === "mid"
      ? "You are interviewing a mid-level developer. Ask deeper follow-up questions that probe their decision-making and experience."
      : "You are interviewing a senior developer. Challenge their thinking with trade-off questions and architectural decisions.";

  const responseGuidance =
    difficulty === "entry"
      ? "If their answer is vague, ask for concrete examples. Be encouraging and help them articulate their thoughts."
      : difficulty === "mid"
      ? "Dig deeper into their experience. Ask about what they learned, what they'd do differently, and their decision-making process."
      : "Ask about trade-offs, scalability concerns, and how they'd mentor others. Challenge assumptions thoughtfully.";

  const conversationContext = conversationHistory && conversationHistory.length > 2
    ? `Previous conversation shows the candidate has experience with: ${conversationHistory.slice(-2).map(m => m.content.substring(0, 100)).join(" | ")}`
    : "";

  const jobRoleContext = jobRole ? `You are conducting an interview for the position of ${jobRole}${jobLevel ? ` (${jobLevel} level)` : ""}.` : "";

  return `You are a professional interviewer conducting a realistic voice interview. Your responses will be converted to speech, so write EXACTLY how a real person would speak out loud.

${jobRoleContext}
${difficultyContext}

This is question ${questionIndex + 1} of ${totalQuestions}.

CRITICAL RULES FOR VOICE OUTPUT:
- Write like you're speaking, NOT writing an email
- Use contractions: "I'd", "you're", "that's", "let's"
- Keep it VERY SHORT: 1-2 sentences only
- Sound natural and human, not robotic
- Don't use formal written language
- Use brief acknowledgments: "Got it", "I see", "Interesting", "Makes sense"
- DO NOT ask new questions - just briefly acknowledge their answer

Your ONLY job is to:
1. Give a BRIEF acknowledgment (5-10 words max)
2. ${responseGuidance}
3. Keep it conversational and SHORT
4. After the final answer, just say something like "Perfect, thanks for sharing that with me today"

${conversationContext ? `Context: ${conversationContext}` : ""}

EXAMPLES OF GOOD RESPONSES (brief acknowledgments):
"Got it. That makes sense."
"Interesting approach there."
"I see what you mean."
"Nice, that's solid."
"Cool, thanks for explaining that."

BAD (too long/asking another question): "That's interesting. Can you walk me through how you'd handle scaling that?"
GOOD (brief): "Makes sense. Appreciate that."`;
}

export async function POST(request: NextRequest) {
  try {
    const {
      type,
      difficulty,
      jobRole,
      jobLevel,
      questions,
      userTranscript,
      conversationHistory,
      questionIndex,
      isFirstQuestion,
    }: InterviewRequest = await request.json();

    // Use provided questions (from job posting) or fall back to static banks
    let questionBank = questions;

    if (!questionBank || questionBank.length === 0) {
      // Fallback to static banks if no questions provided
      if (!type || !difficulty) {
        return NextResponse.json(
          { error: "Missing interview parameters" },
          { status: 400 }
        );
      }

      questionBank = TECHNICAL_QUESTIONS;
      if (type === "behavioral") {
        questionBank = BEHAVIORAL_QUESTIONS;
      } else if (type === "mixed") {
        questionBank = MIXED_QUESTIONS;
      }
    }

    const totalQuestions = questionBank.length;
    const systemPrompt = getSystemPrompt(type || "mixed", difficulty || "mid", questionIndex, totalQuestions, jobRole, jobLevel, conversationHistory);

    // Build messages for GPT-4
    const messages: Array<{ role: string; content: string }> = [
      ...conversationHistory,
    ];

    // Add user's latest response if not first question
    if (!isFirstQuestion && userTranscript) {
      messages.push({
        role: "user",
        content: userTranscript,
      });
    }

    // First question - ask from the bank
    if (isFirstQuestion) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `Say this question naturally as if speaking: "${questionBank[0]}"`,
            },
          ],
          temperature: 0.8,
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("GPT-4 API error:", error);
        return NextResponse.json(
          { error: "Failed to generate interview response" },
          { status: response.status }
        );
      }

      const result = await response.json();
      const aiResponse = result.choices[0].message.content;

      return NextResponse.json({
        question: questionBank[0],
        aiResponse,
        questionIndex: 0,
        totalQuestions,
      });
    }

    // Don't add pre-canned follow-ups, let AI respond naturally to what they said
    // Filter and validate messages
    const validMessages = messages.filter(m => m.role && m.content && (m.role === "user" || m.role === "assistant"));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...validMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        temperature: 0.9,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("GPT-4 API error:", error);
      return NextResponse.json(
        { error: "Failed to generate interview response" },
        { status: response.status }
      );
    }

    const result = await response.json();
    let aiResponse = result.choices[0].message.content;

    // Determine if we should ask next question or continue current
    const nextQuestionIndex = Math.min(
      questionIndex + 1,
      questionBank.length - 1
    );
    const nextQuestion =
      nextQuestionIndex < questionBank.length
        ? questionBank[nextQuestionIndex]
        : null;

    return NextResponse.json({
      aiResponse,
      nextQuestion,
      questionIndex: nextQuestionIndex,
      totalQuestions,
      isComplete: nextQuestionIndex >= totalQuestions - 1,
    });
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
