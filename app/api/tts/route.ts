import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      voice = "alloy",
      speed = 0.95,
      model = "tts-1-hd" // tts-1-hd for high quality, tts-1 for lower latency
    } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    // Validate voice
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    if (!validVoices.includes(voice)) {
      return NextResponse.json(
        { error: "Invalid voice. Must be one of: " + validVoices.join(", ") },
        { status: 400 }
      );
    }

    // Call OpenAI TTS API with HD quality
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model, // Use tts-1-hd for better quality
        input: text,
        voice: voice,
        speed: Math.max(0.25, Math.min(4.0, speed)), // Clamp between 0.25 and 4.0
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("TTS API error:", error);
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: response.status }
      );
    }

    // Get audio data as buffer
    const audioBuffer = await response.arrayBuffer();

    // Return as base64 audio
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({
      audio: `data:audio/mp3;base64,${base64Audio}`,
      duration: calculateDuration(text), // Rough estimate
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Rough duration calculation in seconds
function calculateDuration(text: string): number {
  // Average speech is about 150 words per minute = 2.5 words per second
  const wordCount = text.trim().split(/\s+/).length;
  const durationSeconds = (wordCount / 2.5) * 0.95; // Apply 0.95 speed factor
  return Math.round(durationSeconds * 1000) / 1000;
}
