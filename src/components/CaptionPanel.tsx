"use client";

import { useState } from "react";

interface CaptionPanelProps {
  caption: string;
  onChange: (text: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export default function CaptionPanel({
  caption,
  onChange,
  onRegenerate,
  isGenerating,
}: CaptionPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="card">
      <div className="section-label">Video Caption</div>

      {!caption && !isGenerating ? (
        <div style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 1.6 }}>
          Transcribe your video to generate an AI-powered social media caption.
        </div>
      ) : (
        <>
          <textarea
            value={caption}
            onChange={(e) => onChange(e.target.value)}
            placeholder="AI-generated caption will appear here..."
            rows={4}
            style={{ marginBottom: 12 }}
            disabled={isGenerating}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={handleCopy}
              disabled={!caption || isGenerating}
              style={{ flex: 1 }}
            >
              {copied ? "Copied!" : "Copy Caption"}
            </button>
            <button
              className="btn-secondary"
              onClick={onRegenerate}
              disabled={isGenerating}
              style={{ flex: 1 }}
            >
              {isGenerating ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Generating...
                </span>
              ) : (
                "Regenerate"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
