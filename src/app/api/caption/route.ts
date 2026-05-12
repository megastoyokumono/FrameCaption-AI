import { NextRequest } from "next/server";
import { generateCaption } from "@/lib/transcription";

export async function POST(request: NextRequest) {
  try {
    const { segments, apiKey } = await request.json();

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return Response.json(
        { error: "No transcription segments provided" },
        { status: 400 }
      );
    }

    const caption = await generateCaption(segments, apiKey);

    return Response.json({ caption });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Caption generation failed";
    console.error("Caption generation error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
