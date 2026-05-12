import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";
import { burnSubtitles } from "@/lib/ffmpeg";
import { SubtitleSegment, SubtitleStyle } from "@/lib/srt";

const TMP_DIR = path.join(os.tmpdir(), "framecaption");

export async function POST(request: NextRequest) {
  try {
    const { filePath, segments, style } = await request.json();

    if (!filePath || !fs.existsSync(filePath)) {
      return Response.json({ error: "Video file not found" }, { status: 400 });
    }

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return Response.json({ error: "No subtitle segments" }, { status: 400 });
    }

    const defaultStyle: SubtitleStyle = {
      fontFamily: "Inter",
      fontSize: 34,
      textColor: "#FFFFFF",
      backgroundPill: true,
      backgroundColor: "#000000",
      stroke: true,
      strokeColor: "#000000",
      strokeWidth: 2,
      position: "bottom",
    };

    const subtitleStyle: SubtitleStyle = { ...defaultStyle, ...style };

    const outputFileName = `${path.basename(filePath, path.extname(filePath))}_rendered.mp4`;
    const outputPath = path.join(TMP_DIR, outputFileName);

    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    await burnSubtitles(filePath, segments as SubtitleSegment[], subtitleStyle, outputPath);

    return Response.json({
      downloadUrl: `/api/download/${path.basename(filePath, path.extname(filePath))}`,
      outputPath,
      outputFileName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rendering failed";
    console.error("Render error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
