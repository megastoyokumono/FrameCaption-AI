"use client";

import { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  onExport: () => void;
  hasVideo: boolean;
  isProcessing: boolean;
  hasRender: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function Navbar({
  onExport,
  hasVideo,
  isProcessing,
  hasRender,
  apiKey,
  onApiKeyChange,
}: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);

  const handleSave = () => {
    onApiKeyChange(inputKey.trim());
    if (typeof window !== "undefined") {
      try { localStorage.setItem("openai_api_key", inputKey.trim()); } catch {}
    }
    setShowSettings(false);
  };

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="url(#brand_grad)" />
          <path d="M8 20V12L14 16L8 20Z" fill="white" fillOpacity="0.9" />
          <path d="M14 20V12L20 16L14 20Z" fill="white" fillOpacity="0.7" />
          <path d="M20 18V14L24 16L20 18Z" fill="white" fillOpacity="0.5" />
          <defs>
            <linearGradient id="brand_grad" x1="0" y1="0" x2="32" y2="32">
              <stop stopColor="#7C3AED" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        FrameCaption AI
      </Link>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <button
            className="btn-secondary"
            onClick={() => {
              setInputKey(apiKey);
              setShowSettings(!showSettings);
            }}
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            Settings
          </button>
          {showSettings && (
            <>
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99,
                }}
                onClick={() => setShowSettings(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  zIndex: 100,
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: 20,
                  width: 340,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
              >
                <div className="section-label">OpenAI API Key</div>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="sk-..."
                  style={{ marginBottom: 12, fontSize: 13 }}
                />
                <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>
                  Your key is stored locally and sent only to OpenAI. Get a key at{" "}
                  <a href="https://platform.openai.com/api-keys" target="_blank" style={{ color: "#8B5CF6" }}>
                    platform.openai.com
                  </a>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" onClick={handleSave} style={{ flex: 1, fontSize: 13 }}>
                    Save Key
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowSettings(false)}
                    style={{ fontSize: 13 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {hasVideo && !isProcessing && !hasRender && (
          <span className="status-badge idle">Ready</span>
        )}
        {isProcessing && (
          <span className="status-badge loading">
            <span className="spinner" style={{ width: 14, height: 14 }} />
            Processing...
          </span>
        )}
        {hasRender && (
          <span className="status-badge success">Render Complete</span>
        )}
        <button
          className="btn-primary"
          onClick={onExport}
          disabled={!hasRender || isProcessing}
          style={{ padding: "10px 24px" }}
        >
          {hasRender ? "Download Video" : "Export"}
        </button>
      </div>
    </nav>
  );
}
