import OpenAI from "openai";
import fs from "fs";

function getOpenAI(apiKey?: string): OpenAI {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("No OpenAI API key found. Please set an API key in Settings or set the OPENAI_API_KEY environment variable.");
  }
  return new OpenAI({ apiKey: key });
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export async function transcribeAudio(audioPath: string, apiKey?: string): Promise<TranscriptionSegment[]> {
  const audioFile = fs.createReadStream(audioPath);

  const transcription = await getOpenAI(apiKey).audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const segments = transcription.segments || [];

  return segments.map((seg) => ({
    start: Math.round(seg.start * 100) / 100,
    end: Math.round(seg.end * 100) / 100,
    text: seg.text.trim(),
  }));
}

export async function generateCaption(segments: TranscriptionSegment[], apiKey?: string): Promise<string> {
  const fullText = segments.map((s) => s.text).join(" ");

  const response = await getOpenAI(apiKey).chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a social media caption writer. Given a video transcript, generate a short, engaging caption (max 280 characters) that summarizes the video. Return ONLY the caption text, no quotes or labels.",
      },
      {
        role: "user",
        content: fullText,
      },
    ],
    max_tokens: 150,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || fullText.slice(0, 280);
}
