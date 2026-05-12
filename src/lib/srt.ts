export interface SubtitleSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export function segmentsToSRT(segments: SubtitleSegment[]): string {
  return segments
    .map((seg) => {
      const start = formatTime(seg.start);
      const end = formatTime(seg.end);
      return `${seg.id}\n${start} --> ${end}\n${seg.text}\n`;
    })
    .join("\n");
}

export function segmentsToASS(
  segments: SubtitleSegment[],
  style: SubtitleStyle
): string {
  const fontName = style.fontFamily || "Inter";
  const fontSize = style.fontSize || 34;
  const color = hexToASS(style.textColor || "#FFFFFF");
  const borderColor = hexToASS(style.strokeColor || "#000000");
  const borderWidth = style.strokeWidth || 2;

  let alignment = 2;
  if (style.position === "top") alignment = 8;
  else if (style.position === "middle") alignment = 5;

  const bgColor = style.backgroundPill
    ? hexToASS(style.backgroundColor || "#000000")
    : "&H00000000";

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${color},${color},${borderColor},${bgColor},-1,0,0,0,100,100,0,0,1,${borderWidth},0,${alignment},10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = segments
    .map((seg) => {
      const start = formatASS(seg.start);
      const end = formatASS(seg.end);
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${seg.text}`;
    })
    .join("\n");

  return header + events;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ms = Math.round((s - Math.floor(s)) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(Math.floor(s))},${pad3(ms)}`;
}

function formatASS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const cs = Math.round((s - Math.floor(s)) * 100);
  return `${h}:${pad(m)}:${pad(Math.floor(s))}.${pad2(cs)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function pad3(n: number): string {
  return n.toString().padStart(3, "0");
}

function hexToASS(hex: string): string {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `&H00${b.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${r.toString(16).padStart(2, "0")}`;
}

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundPill: boolean;
  backgroundColor: string;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  position: "bottom" | "middle" | "top";
}
