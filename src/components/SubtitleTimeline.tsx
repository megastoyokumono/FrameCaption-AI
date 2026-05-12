"use client";

import { SubtitleSegment } from "@/lib/srt";

interface SubtitleTimelineProps {
  segments: SubtitleSegment[];
  currentTime: number;
  onUpdate: (segments: SubtitleSegment[]) => void;
  readOnly?: boolean;
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

function parseTime(str: string): number {
  const parts = str.split(/[:.]/);
  if (parts.length === 3) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 100;
  }
  return 0;
}

export default function SubtitleTimeline({
  segments,
  currentTime,
  onUpdate,
  readOnly,
}: SubtitleTimelineProps) {
  const activeIndex = segments.findIndex(
    (s) => currentTime >= s.start && currentTime <= s.end
  );

  const handleTextChange = (index: number, text: string) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], text };
    onUpdate(updated);
  };

  const handleStartChange = (index: number, value: string) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], start: parseTime(value) };
    onUpdate(updated);
  };

  const handleEndChange = (index: number, value: string) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], end: parseTime(value) };
    onUpdate(updated);
  };

  if (!segments || segments.length === 0) {
    return (
      <div className="card">
        <div className="section-label">Subtitles</div>
        <div style={{ color: "#9CA3AF", fontSize: 14 }}>
          No subtitles yet. Transcribe your video to generate them.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-label">
        Subtitle Timeline
        <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 8, fontSize: 12 }}>
          ({segments.length} lines)
        </span>
      </div>

      <div className="subtitle-timeline panel-scroll" style={{ maxHeight: 300 }}>
        {segments.map((seg, i) => (
          <div
            key={seg.id}
            className={`subtitle-row ${i === activeIndex ? "active" : ""}`}
          >
            <input
              type="text"
              value={fmt(seg.start)}
              onChange={(e) => handleStartChange(i, e.target.value)}
              className="subtitle-editor-input"
              style={{ fontFamily: "monospace", fontSize: 12, textAlign: "center" }}
              disabled={readOnly}
            />
            <input
              type="text"
              value={fmt(seg.end)}
              onChange={(e) => handleEndChange(i, e.target.value)}
              className="subtitle-editor-input"
              style={{ fontFamily: "monospace", fontSize: 12, textAlign: "center" }}
              disabled={readOnly}
            />
            <input
              type="text"
              value={seg.text}
              onChange={(e) => handleTextChange(i, e.target.value)}
              className="subtitle-editor-input"
              disabled={readOnly}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
