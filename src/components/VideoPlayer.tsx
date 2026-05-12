"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { SubtitleSegment } from "@/lib/srt";

interface VideoPlayerProps {
  file: File | null;
  videoUrl: string | null;
  videoId: string | null;
  segments: SubtitleSegment[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  subtitleFontSize?: number;
  subtitleColor?: string;
  subtitleBackgroundPill?: boolean;
  subtitleBackgroundColor?: string;
  subtitlePosition?: "bottom" | "middle" | "top";
  subtitleFontFamily?: string;
  subtitleStroke?: boolean;
  subtitleStrokeColor?: string;
  subtitleStrokeWidth?: number;
}

export default function VideoPlayer({
  file,
  videoUrl,
  videoId,
  segments,
  currentTime,
  onTimeUpdate,
  onDurationChange,
  subtitleFontSize = 34,
  subtitleColor = "#FFFFFF",
  subtitleBackgroundPill = true,
  subtitleBackgroundColor = "#000000",
  subtitlePosition = "bottom",
  subtitleFontFamily = "Inter",
  subtitleStroke = true,
  subtitleStrokeColor = "#000000",
  subtitleStrokeWidth = 2,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setBlobUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setBlobUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const revealedText = useMemo(() => {
    const seg = segments.find(
      (s) => currentTime >= s.start && currentTime <= s.end
    );
    if (!seg) return "";

    const words = seg.text.split(/\s+/);
    if (words.length <= 1) return seg.text;

    const segDuration = seg.end - seg.start;
    if (segDuration <= 0) return seg.text;

    const elapsedInSeg = currentTime - seg.start;
    const fraction = elapsedInSeg / segDuration;

    const wordCount = Math.max(1, Math.ceil(fraction * words.length));
    return words.slice(0, wordCount).join(" ");
  }, [currentTime, segments]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onDurationChange(videoRef.current.duration);
    }
  };

  const src = videoUrl || (videoId ? `/api/video/${videoId}` : null) || blobUrl;

  if (!src) {
    return (
      <div className="card" style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#9CA3AF" }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: "0 auto 16px", opacity: 0.4 }}>
            <rect x="8" y="8" width="32" height="32" rx="6" stroke="#9CA3AF" strokeWidth="2" />
            <path d="M20 18L30 24L20 30V18Z" fill="#9CA3AF" fillOpacity="0.5" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Upload a video to begin</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Supports MP4, MOV, WEBM</div>
        </div>
      </div>
    );
  }

  const posStyle =
    subtitlePosition === "top"
      ? { top: "8%", bottom: "auto" }
      : subtitlePosition === "middle"
        ? { top: "50%", bottom: "auto", transform: "translate(-50%, -50%)" }
        : { bottom: "8%", top: "auto" };

  const strokeShadow = subtitleStroke
    ? `0 0 ${subtitleStrokeWidth * 2}px ${subtitleStrokeColor},
       ${subtitleStrokeWidth}px 0 0 ${subtitleStrokeColor},
       -${subtitleStrokeWidth}px 0 0 ${subtitleStrokeColor},
       0 ${subtitleStrokeWidth}px 0 ${subtitleStrokeColor},
       0 -${subtitleStrokeWidth}px 0 ${subtitleStrokeColor}`
    : "0 3px 12px rgba(0,0,0,0.8)";

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ position: "relative" }}>
        <video
          key={src}
          ref={videoRef}
          src={src}
          className="video-preview"
          controls
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          style={{ borderRadius: 22, display: "block", maxHeight: "70vh", width: "100%" }}
        />
        {revealedText && (
          <div
            className="subtitle-overlay"
            style={{
              fontFamily: subtitleFontFamily,
              fontSize: subtitleFontSize,
              fontWeight: 800,
              color: subtitleColor,
              textShadow: strokeShadow,
              backgroundColor: subtitleBackgroundPill ? `${subtitleBackgroundColor}99` : "transparent",
              padding: subtitleBackgroundPill ? "8px 18px" : "4px 8px",
              borderRadius: subtitleBackgroundPill ? 14 : 0,
              ...posStyle,
            }}
          >
            {revealedText}
          </div>
        )}
      </div>
    </div>
  );
}
