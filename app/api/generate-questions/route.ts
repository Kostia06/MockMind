import { NextRequest, NextResponse } from "next/server";

interface GenerateQuestionsRequest {
  jobPosting: string;
}

interface GeneratedQuestions {
  role: string;
  questions: string[];
  skills: string[];
  company?: string;
  jobLevel?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { jobPosting }: GenerateQuestionsRequest = await request.json();

    if (!jobPosting || jobPosting.trim().length === 0) {
      return NextResponse.json(
        { error: "Job posting is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a friendly, professional technical interviewer conducting a real interview conversation.

Your task is to:
1. Extract the key skills, requirements, and role details from the job posting
2. Generate 6-7 conversational interview questions that feel natural and human
3. Mix question types: warm-up, technical depth, behavioral, and real-world scenarios

IMPORTANT: Make questions conversational and natural:
- Start with a warm greeting: "Hi! Thanks for joining today. How are you doing?"
- Use phrases like "Tell me about...", "Walk me through...", "Can you describe...", "I'd love to hear about..."
- Include follow-up style questions like "That's interesting - how did you approach that?"
- Make questions feel like a real conversation, not a robotic quiz
- Reference specific technologies from the job posting naturally

Format your response as JSON with this exact structure:
{
  "role": "Job title from the posting",
  "company": "Company name if mentioned",
  "jobLevel": "junior/mid/senior based on requirements",
  "skills": ["skill1", "skill2", "skill3", ...],
  "questions": [
    "Hi! Thanks for joining today. How are you doing?",
    "Great to meet you! Tell me a bit about yourself and what drew you to this position.",
    "I'd love to hear about a recent project you worked on that you're proud of. What made it challenging?",
    ...more conversational questions...
  ]
}

Make the conversation flow naturally from greeting → introduction → experience → technical → wrap-up.`;

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
            content: `Please analyze this job posting and generate interview questions:\n\n${jobPosting}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("GPT-4 API error:", error);
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: response.status }
      );
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;

    console.log("GPT-4 Response:", aiResponse);

    // Parse the JSON response from GPT-4
    let generatedData: GeneratedQuestions;
    try {
      // First try to parse directly as JSON
      generatedData = JSON.parse(aiResponse);
    } catch (directParseError) {
      // If that fails, try to extract JSON from the response
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("No JSON found in response:", aiResponse);
          throw new Error("No JSON found in response");
        }
        generatedData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Raw response:", aiResponse);
        return NextResponse.json(
          { error: "Failed to parse generated questions" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(generatedData);
  } catch (error) {
    console.error("Generate questions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
