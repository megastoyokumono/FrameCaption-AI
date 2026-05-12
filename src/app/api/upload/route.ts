import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import os from "os";

const TMP_DIR = path.join(os.tmpdir(), "framecaption");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: "Invalid file type. Allowed: MP4, MOV, WEBM" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const ext = path.extname(file.name) || ".mp4";
    const fileName = `${id}${ext}`;
    const filePath = path.join(TMP_DIR, fileName);

    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return Response.json({
      id,
      fileName: file.name,
      fileSize: file.size,
      filePath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Upload error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
