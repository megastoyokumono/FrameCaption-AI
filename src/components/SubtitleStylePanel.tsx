"use client";

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

interface SubtitleStylePanelProps {
  style: StyleState;
  onChange: (style: StyleState) => void;
  onRender: () => void;
  isRendering: boolean;
  hasSegments: boolean;
}

interface PresetDef {
  key: string;
  label: string;
  font: string;
  size: number;
  pill: boolean;
  stroke: boolean;
  pos: "bottom" | "middle" | "top";
  color: string;
  bg: string;
  strokeColor: string;
  strokeWidth: number;
}

const presets: PresetDef[] = [
  {
    key: "tiktok",
    label: "TikTok Bold",
    font: "Montserrat",
    size: 46,
    pill: true,
    stroke: true,
    pos: "bottom",
    color: "#FFFFFF",
    bg: "#000000",
    strokeColor: "#000000",
    strokeWidth: 4,
  },
  {
    key: "youtube",
    label: "YouTube Clean",
    font: "Inter",
    size: 24,
    pill: false,
    stroke: true,
    pos: "bottom",
    color: "#FFFFFF",
    bg: "#000000",
    strokeColor: "#000000",
    strokeWidth: 3,
  },
  {
    key: "minimal",
    label: "Minimal White",
    font: "Inter",
    size: 28,
    pill: false,
    stroke: false,
    pos: "middle",
    color: "#FFFFFF",
    bg: "#000000",
    strokeColor: "#000000",
    strokeWidth: 0,
  },
  {
    key: "luxury",
    label: "Luxury Gold",
    font: "Georgia",
    size: 36,
    pill: true,
    stroke: true,
    pos: "bottom",
    color: "#FBBF24",
    bg: "#0B0F19",
    strokeColor: "#7C3AED",
    strokeWidth: 3,
  },
];

export default function SubtitleStylePanel({
  style,
  onChange,
  onRender,
  isRendering,
  hasSegments,
}: SubtitleStylePanelProps) {
  const applyPreset = (preset: PresetDef) => {
    onChange({
      ...style,
      preset: preset.key,
      fontFamily: preset.font,
      fontSize: preset.size,
      textColor: preset.color,
      backgroundPill: preset.pill,
      backgroundColor: preset.bg,
      stroke: preset.stroke,
      strokeColor: preset.strokeColor,
      strokeWidth: preset.strokeWidth,
      position: preset.pos,
    });
  };

  const update = (partial: Partial<StyleState>) => {
    onChange({ ...style, ...partial });
  };

  return (
    <div className="card">
      <div className="section-label">Subtitle Style</div>

      <div style={{ marginBottom: 16 }}>
        <div className="style-control-label">Presets</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {presets.map((p) => (
            <button
              key={p.key}
              className={`preset-btn ${style.preset === p.key ? "active" : ""}`}
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="style-control-group" style={{ marginBottom: 16 }}>
        <div>
          <label className="style-control-label">Font</label>
          <select
            value={style.fontFamily}
            onChange={(e) => update({ fontFamily: e.target.value })}
          >
            <option value="Inter">Inter</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Impact">Impact</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>
        <div>
          <label className="style-control-label">
            Size: {style.fontSize}px
          </label>
          <input
            type="range"
            min="16"
            max="72"
            value={style.fontSize}
            onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="style-control-group" style={{ marginBottom: 16 }}>
        <div>
          <label className="style-control-label">Text Color</label>
          <input
            type="color"
            value={style.textColor}
            onChange={(e) => update({ textColor: e.target.value })}
          />
        </div>
        <div>
          <label className="style-control-label">Position</label>
          <select
            value={style.position}
            onChange={(e) =>
              update({ position: e.target.value as "bottom" | "middle" | "top" })
            }
          >
            <option value="bottom">Bottom</option>
            <option value="middle">Middle</option>
            <option value="top">Top</option>
          </select>
        </div>
      </div>

      <div>
        <div className="toggle-row">
          <span style={{ fontSize: 14, color: "#9CA3AF" }}>Background Pill</span>
          <div
            className={`toggle-switch ${style.backgroundPill ? "active" : ""}`}
            onClick={() => update({ backgroundPill: !style.backgroundPill })}
          />
        </div>
        <div className="toggle-row">
          <span style={{ fontSize: 14, color: "#9CA3AF" }}>Stroke / Outline</span>
          <div
            className={`toggle-switch ${style.stroke ? "active" : ""}`}
            onClick={() => update({ stroke: !style.stroke })}
          />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          className="btn-primary"
          onClick={onRender}
          disabled={!hasSegments || isRendering}
          style={{ width: "100%", padding: "14px" }}
        >
          {isRendering ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <span className="spinner" style={{ width: 16, height: 16 }} />
              Rendering Subtitles...
            </span>
          ) : (
            "Burn Subtitles into Video"
          )}
        </button>
      </div>
    </div>
  );
}
