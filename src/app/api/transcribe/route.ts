import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import { extractAudio } from "@/lib/ffmpeg";
import { transcribeAudio } from "@/lib/transcription";

export async function POST(request: NextRequest) {
  try {
    const { filePath, apiKey } = await request.json();

    if (!filePath || !fs.existsSync(filePath)) {
      return Response.json({ error: "Video file not found" }, { status: 400 });
    }

    const audioPath = filePath.replace(path.extname(filePath), ".mp3");

    await extractAudio(filePath, audioPath);

    const segments = await transcribeAudio(audioPath, apiKey);

    try {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    } catch {}

    return Response.json({ segments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed";
    console.error("Transcription error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
