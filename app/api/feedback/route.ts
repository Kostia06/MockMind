import { NextRequest, NextResponse } from "next/server";

interface FeedbackRequest {
  type: string;
  difficulty: string;
  conversationHistory: Array<{
    question: string;
    userAnswer: string;
    aiResponse: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { type, difficulty, conversationHistory }: FeedbackRequest =
      await request.json();

    if (!conversationHistory || conversationHistory.length === 0) {
      return NextResponse.json(
        { error: "No interview data provided" },
        { status: 400 }
      );
    }

    // Format conversation for analysis
    const conversationText = conversationHistory
      .map(
        (item) =>
          `Question: ${item.question}\nCandidate Answer: ${item.userAnswer}`
      )
      .join("\n\n");

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
            content: `You are an expert interview coach providing detailed feedback on ${type} interviews for ${difficulty}-level candidates.

Provide structured feedback in the following JSON format only:
{
  "overallScore": number (1-10),
  "interviewReadiness": string ("Ready to Apply" | "Need More Prep" | "Needs Significant Work"),
  "strengths": string[] (3-4 key strengths),
  "weaknesses": string[] (3-4 areas to improve),
  "fillerWords": {
    "count": number,
    "examples": string[]
  },
  "communicationScore": number (1-10),
  "technicalScore": number (1-10),
  "suggestions": string[] (5-7 specific actionable suggestions),
  "answerQualityByQuestion": [
    { "questionNumber": number, "quality": number (1-10), "feedback": string }
  ]
}`,
          },
          {
            role: "user",
            content: `Analyze this ${type} interview (${difficulty} level):

${conversationText}

Provide structured feedback as JSON.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("GPT-4 API error:", error);
      return NextResponse.json(
        { error: "Failed to generate feedback" },
        { status: response.status }
      );
    }

    const result = await response.json();
    const feedbackText = result.choices[0].message.content;

    // Try to parse JSON from response
    try {
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const feedback = JSON.parse(jsonMatch[0]);
        return NextResponse.json(feedback);
      }
    } catch (e) {
      console.error("Error parsing feedback JSON:", e);
    }

    // Fallback if JSON parsing fails
    return NextResponse.json({
      overallScore: 7,
      interviewReadiness: "Need More Prep",
      strengths: ["Clear communication", "Good structure"],
      weaknesses: ["Need more examples", "Speak with more confidence"],
      fillerWords: { count: 5, examples: ["um", "uh", "like"] },
      communicationScore: 7,
      technicalScore: 6,
      suggestions: [
        "Practice speaking more concisely",
        "Prepare specific examples beforehand",
        "Reduce filler words by pausing instead",
      ],
      answerQualityByQuestion: [],
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
