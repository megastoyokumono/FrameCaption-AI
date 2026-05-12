import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";

const TMP_DIR = path.join(os.tmpdir(), "framecaption");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const safeId = path.basename(id);

  if (!fs.existsSync(TMP_DIR)) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

  const files = fs.readdirSync(TMP_DIR);
  const videoFile = files.find(
    (f) => f.startsWith(safeId) && !f.includes("_rendered") && !f.endsWith(".mp3")
  );

  if (!videoFile) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

  const filePath = path.join(TMP_DIR, videoFile);
  const stat = fs.statSync(filePath);
  const ext = path.extname(videoFile).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
  };
  const mime = mimeTypes[ext] || "video/mp4";

  const range = _request.headers.get("range");
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });
    return new Response(fileStream as unknown as ReadableStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": mime,
      },
    });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new Response(fileBuffer, {
    headers: {
      "Content-Type": mime,
      "Content-Length": stat.size.toString(),
      "Accept-Ranges": "bytes",
    },
  });
}
