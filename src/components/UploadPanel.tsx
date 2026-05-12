"use client";

import { useState, useRef, DragEvent } from "react";

interface UploadPanelProps {
  onFileSelected: (file: File) => void;
  file: File | null;
  isProcessing: boolean;
  progress: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function UploadPanel({
  onFileSelected,
  file,
  isProcessing,
  progress,
}: UploadPanelProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && ["video/mp4", "video/quicktime", "video/webm"].includes(f.type)) {
      onFileSelected(f);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelected(f);
  };

  return (
    <div className="card">
      <div className="section-label">Video Upload</div>

      <input
        ref={inputRef}
        type="file"
        accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {!file ? (
        <div
          className={`upload-box ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            style={{ marginBottom: 16, opacity: 0.5 }}
          >
            <path
              d="M24 32V16M24 16L18 22M24 16L30 22"
              stroke="#9CA3AF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="4"
              y="4"
              width="40"
              height="40"
              rx="8"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </svg>
          <div style={{ fontSize: 15, color: "#9CA3AF", fontWeight: 500 }}>
            Drop your video here
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              marginTop: 8,
            }}
          >
            or click to browse (MP4, MOV, WEBM)
          </div>
        </div>
      ) : (
        <div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <video
              src={URL.createObjectURL(file)}
              className="video-preview"
              controls
              style={{ maxHeight: 200 }}
            />
          </div>
          <div className="file-info">
            <span className="name">{file.name}</span>
            <span className="size">{formatSize(file.size)}</span>
          </div>
          {progress && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#9CA3AF",
                  marginBottom: 8,
                }}
              >
                <span>{progress}</span>
                {isProcessing && <span className="spinner" />}
              </div>
            </div>
          )}
          {!isProcessing && (
            <button
              className="btn-secondary"
              onClick={() => {
                const change = new Event("change", { bubbles: true });
                inputRef.current?.dispatchEvent(change);
                inputRef.current?.click();
              }}
              style={{ marginTop: 12, width: "100%" }}
            >
              Change Video
            </button>
          )}
        </div>
      )}
    </div>
  );
}
