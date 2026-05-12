import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import os from "os";
import { SubtitleSegment, SubtitleStyle } from "./srt";

const FFMPEG = "C:\\Users\\megas\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe";
const FFPROBE = "C:\\Users\\megas\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffprobe.exe";

const execAsync = promisify(exec);

export async function extractAudio(videoPath: string, outputPath: string): Promise<string> {
  const cmd = `"${FFMPEG}" -y -i "${videoPath}" -vn -acodec libmp3lame -ab 128k "${outputPath}"`;
  await execAsync(cmd);
  return outputPath;
}

function hexToASS(hex: string): string {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `&H00${b.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${r.toString(16).padStart(2, "0")}`;
}

export async function burnSubtitles(
  videoPath: string,
  segments: SubtitleSegment[],
  style: SubtitleStyle,
  outputPath: string
): Promise<string> {
  const fontName = style.fontFamily || "Inter";
  const fontSize = style.fontSize || 34;
  const color = hexToASS(style.textColor || "#FFFFFF");
  const borderColor = hexToASS(style.strokeColor || "#000000");
  const borderWidth = style.stroke ? (style.strokeWidth || 2) : 0;

  let alignment = 2;
  if (style.position === "top") alignment = 8;
  else if (style.position === "middle") alignment = 5;

  const bgColor = style.backgroundPill
    ? hexToASS(style.backgroundColor || "#000000")
    : "&H00000000";

  const ass = [
    "[Script Info]",
    "ScriptType: v4.00+",
    "PlayResX: 1920",
    "PlayResY: 1080",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: Default,${fontName},${fontSize},${color},${color},${borderColor},${bgColor},-1,0,0,0,100,100,0,0,1,${borderWidth},0,${alignment},10,10,10,1`,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ];

  for (const seg of segments) {
    const start = fmtASS(seg.start);
    const end = fmtASS(seg.end);
    ass.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${seg.text}`);
  }

  const videoDir = path.dirname(videoPath);
  const assFileName = `sub_${Date.now()}.ass`;
  const assPath = path.join(videoDir, assFileName);
  fs.writeFileSync(assPath, ass.join("\n"), "utf-8");

  // Use filenames only, set CWD to video directory
  const videoFile = path.basename(videoPath);
  const outputFile = path.basename(outputPath);

  const cmd = `"${FFMPEG}" -y -i "${videoFile}" -vf "ass=${assFileName}" -c:a aac -b:a 192k "${outputFile}"`;

  await execAsync(cmd, { cwd: videoDir });

  try { fs.unlinkSync(assPath); } catch {}
  return outputPath;
}

function fmtASS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const cs = Math.round((s - Math.floor(s)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(Math.floor(s)).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

interface StreamInfo {
  codec_type: string;
  width?: number;
  height?: number;
}

interface FFProbeResult {
  streams?: StreamInfo[];
  format?: { duration?: string };
}

export function getVideoInfo(videoPath: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    exec(
      `"${FFPROBE}" -v quiet -print_format json -show_format -show_streams "${videoPath}"`,
      (err: Error | null, stdout: string) => {
        if (err) return reject(err);
        const info: FFProbeResult = JSON.parse(stdout);
        const videoStream = info.streams?.find((s) => s.codec_type === "video");
        resolve({
          duration: parseFloat(info.format?.duration || "0"),
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
        });
      }
    );
  });
}
