import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";

const TMP_DIR = path.join(os.tmpdir(), "framecaption");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!fs.existsSync(TMP_DIR)) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    const files = fs.readdirSync(TMP_DIR);
    const renderedFile = files.find(
      (f) => f.startsWith(id) && f.endsWith("_rendered.mp4")
    );

    if (!renderedFile) {
      return Response.json({ error: "Video not yet rendered" }, { status: 404 });
    }

    const filePath = path.join(TMP_DIR, renderedFile);
    const fileBuffer = fs.readFileSync(filePath);
    const originalName = renderedFile.replace("_rendered", "");

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${originalName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    console.error("Download error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
