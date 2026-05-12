"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import UploadPanel from "@/components/UploadPanel";
import VideoPlayer from "@/components/VideoPlayer";
import CaptionPanel from "@/components/CaptionPanel";
import SubtitleTimeline from "@/components/SubtitleTimeline";
import SubtitleStylePanel from "@/components/SubtitleStylePanel";
import { SubtitleSegment } from "@/lib/srt";

export interface StyleState {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundPill: boolean;
  backgroundColor: string;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  position: "bottom" | "middle" | "top";
  preset: string;
}

interface UploadResult {
  id: string;
  fileName: string;
  fileSize: number;
  filePath: string;
}

interface CaptionResult {
  caption: string;
}

interface RenderResult {
  downloadUrl: string;
  outputPath: string;
  outputFileName: string;
}

const defaultStyle: StyleState = {
  fontFamily: "Montserrat",
  fontSize: 46,
  textColor: "#FFFFFF",
  backgroundPill: true,
  backgroundColor: "#000000",
  stroke: true,
  strokeColor: "#000000",
  strokeWidth: 4,
  position: "bottom",
  preset: "tiktok",
};

function loadApiKey(): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem("openai_api_key") || ""; } catch { return ""; }
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [caption, setCaption] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState("");
  const [subtitleStyle, setSubtitleStyle] = useState(defaultStyle);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    setApiKey(loadApiKey());
  }, []);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("openai_api_key", key); } catch {}
    }
  }, []);

  const handleFileSelected = useCallback(async (f: File) => {
    setFile(f);
    setUploadResult(null);
    setSegments([]);
    setCaption("");
    setFinalVideoUrl(null);
    setError(null);
    setRenderProgress("");
    setCurrentTime(0);

    setIsProcessing(true);
    setRenderProgress("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", f);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json() as { error?: string };
        throw new Error(errData.error || "Upload failed");
      }

      const uploadData: UploadResult = await uploadRes.json();
      setUploadResult(uploadData);
      setRenderProgress("Upload complete. Starting transcription...");

      setIsTranscribing(true);
      setRenderProgress("Extracting audio and transcribing...");

      const key = loadApiKey();
      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: uploadData.filePath, apiKey: key || undefined }),
      });

      if (!transcribeRes.ok) {
        const errData = await transcribeRes.json() as { error?: string };
        throw new Error(errData.error || "Transcription failed");
      }

      const transcribeData = await transcribeRes.json() as {
        segments: { start: number; end: number; text: string }[];
      };
      const mapped: SubtitleSegment[] = transcribeData.segments.map(
        (s, i: number) => ({
          id: i + 1,
          start: s.start,
          end: s.end,
          text: s.text,
        })
      );
      setSegments(mapped);
      setIsTranscribing(false);
      setRenderProgress("Transcription complete. Generating caption...");

      setIsGeneratingCaption(true);

      const captionRes = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: transcribeData.segments, apiKey: key || undefined }),
      });

      if (!captionRes.ok) {
        const errData = await captionRes.json() as { error?: string };
        throw new Error(errData.error || "Caption generation failed");
      }

      const captionData: CaptionResult = await captionRes.json();
      setCaption(captionData.caption);
      setIsGeneratingCaption(false);
      setRenderProgress("");
      setIsProcessing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      setIsProcessing(false);
      setIsTranscribing(false);
      setIsGeneratingCaption(false);
      setRenderProgress("");
    }
  }, []);

  const handleRegenerateCaption = useCallback(async () => {
    if (!segments.length) return;
    setIsGeneratingCaption(true);
    setError(null);

    try {
      const key = loadApiKey();
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: segments.map((s) => ({
            start: s.start,
            end: s.end,
            text: s.text,
          })),
          apiKey: key || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error || "Caption regeneration failed");
      }

      const data: CaptionResult = await res.json();
      setCaption(data.caption);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Caption regeneration failed";
      setError(message);
    } finally {
      setIsGeneratingCaption(false);
    }
  }, [segments]);

  const handleRender = useCallback(async () => {
    if (!uploadResult || !segments.length) return;
    setIsRendering(true);
    setError(null);
    setRenderProgress("Rendering subtitles into video...");

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: uploadResult.filePath,
          segments: segments.map((s) => ({
            id: s.id,
            start: s.start,
            end: s.end,
            text: s.text,
          })),
          style: subtitleStyle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error || "Rendering failed");
      }

      const data: RenderResult = await res.json();
      setFinalVideoUrl(data.downloadUrl);
      setRenderProgress("");
      setIsRendering(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rendering failed";
      setError(message);
      setRenderProgress("");
      setIsRendering(false);
    }
  }, [uploadResult, segments, subtitleStyle]);

  const handleDownload = useCallback(() => {
    if (uploadResult) {
      const a = document.createElement("a");
      a.href = `/api/download/${uploadResult.id}`;
      a.download = `FrameCaption_${uploadResult.fileName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [uploadResult]);

  const progressMessage =
    renderProgress ||
    (isTranscribing
      ? "Transcribing..."
      : isGeneratingCaption
        ? "Generating caption..."
        : isRendering
          ? "Rendering..."
          : "");

  return (
    <>
      <Navbar
        onExport={handleDownload}
        hasVideo={!!file}
        isProcessing={isProcessing}
        hasRender={!!finalVideoUrl}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />

      <div className="main-container">
        {error && (
          <div
            className="card"
            style={{
              borderColor: "rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ marginTop: 2 }}
              >
                <circle cx="10" cy="10" r="9" stroke="#EF4444" strokeWidth="1.5" />
                <path
                  d="M10 6V11M10 14V14.01"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#EF4444", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  {error.includes("429") || error.includes("quota") || error.includes("Insufficient quota")
                    ? "OpenAI Quota Exceeded"
                    : error.includes("Command failed")
                      ? "FFmpeg Error"
                      : "Error"}
                </div>
                <div style={{ color: "#9CA3AF", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {error}
                </div>
                {(error.includes("429") || error.includes("quota") || error.includes("Insufficient quota")) && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>
                    Your OpenAI account has no remaining credits. To fix this:
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      <li style={{ marginBottom: 4 }}>
                        Add billing at <a href="https://platform.openai.com/account/billing" target="_blank" style={{ color: "#8B5CF6" }}>platform.openai.com/account/billing</a>
                      </li>
                      <li style={{ marginBottom: 4 }}>
                        Or use a different API key with available credits
                      </li>
                      <li>
                        Click <span style={{ color: "#8B5CF6", cursor: "pointer", textDecoration: "underline" }} onClick={() => { const btn = document.querySelector('.btn-secondary') as HTMLButtonElement; btn?.click(); }}>Settings</span> in the navbar to enter a new key
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <button
                className="btn-danger"
                style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {progressMessage && (
          <div
            className="card"
            style={{
              borderColor: "rgba(139,92,246,0.3)",
              background: "rgba(139,92,246,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="spinner" />
              <span style={{ fontSize: 14, color: "#8B5CF6" }}>
                {progressMessage}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: "100%", animation: "progressPulse 2s ease-in-out infinite" }} />
            </div>
          </div>
        )}

        <div className="grid-panels">
          <div className="panel-scroll">
            <UploadPanel
              onFileSelected={handleFileSelected}
              file={file}
              isProcessing={isProcessing}
              progress={progressMessage}
            />

            <div style={{ marginTop: 24 }}>
              <CaptionPanel
                caption={caption}
                onChange={setCaption}
                onRegenerate={handleRegenerateCaption}
                isGenerating={isGeneratingCaption}
              />
            </div>
          </div>

          <div>
            <VideoPlayer
              file={file}
              videoUrl={null}
              videoId={uploadResult?.id || null}
              segments={segments}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              onDurationChange={() => {}}
              subtitleFontSize={subtitleStyle.fontSize}
              subtitleColor={subtitleStyle.textColor}
              subtitleBackgroundPill={subtitleStyle.backgroundPill}
              subtitleBackgroundColor={subtitleStyle.backgroundColor}
              subtitlePosition={subtitleStyle.position}
              subtitleFontFamily={subtitleStyle.fontFamily}
              subtitleStroke={subtitleStyle.stroke}
              subtitleStrokeColor={subtitleStyle.strokeColor}
              subtitleStrokeWidth={subtitleStyle.strokeWidth}
            />

            <div style={{ marginTop: 24 }}>
              <SubtitleTimeline
                segments={segments}
                currentTime={currentTime}
                onUpdate={setSegments}
              />
            </div>
          </div>

          <div className="panel-scroll">
            <SubtitleStylePanel
              style={subtitleStyle}
              onChange={setSubtitleStyle}
              onRender={handleRender}
              isRendering={isRendering}
              hasSegments={segments.length > 0}
            />

            {finalVideoUrl && (
              <div className="card" style={{ marginTop: 24, borderColor: "rgba(34,197,94,0.3)" }}>
                <div className="section-label" style={{ color: "#22C55E" }}>
                  Export Complete
                </div>
                <div style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 16 }}>
                  Your video with burned-in subtitles is ready to download.
                </div>
                <button
                  className="btn-success"
                  onClick={handleDownload}
                  style={{ width: "100%", padding: 14 }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Final Video
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
