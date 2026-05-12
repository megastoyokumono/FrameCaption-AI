# FrameCaption AI

Intelligent video captioning and subtitle burning tool. Upload a video, transcribe the speech, generate captions, edit subtitles, and burn them directly into the video frame-by-frame.

## Features

- **Video Upload** — Drag-and-drop MP4, MOV, or WEBM files with live preview
- **Automatic Transcription** — Extract audio and transcribe using OpenAI Whisper with timestamped segments
- **AI Caption Generator** — Generate social-media-style captions via GPT-4o-mini
- **Subtitle Editor** — Edit subtitle text and adjust timing per segment with synced video preview
- **Burn Subtitles** — Render subtitles directly into the video using FFmpeg with full style control
- **Style Controls** — Font family, size, text color, background pill, stroke/outline, position (bottom/middle/top)
- **Style Presets** — TikTok Bold, YouTube Clean, Minimal White, Luxury Gold
- **Word-by-Word Reveal** — Subtitles appear one word at a time synced to the speaker
- **Download Export** — Download the final rendered MP4 with burned-in subtitles

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Video Processing**: FFmpeg (audio extraction, subtitle burning via ASS format)
- **Transcription**: OpenAI Whisper API (`whisper-1`)
- **Caption Generation**: OpenAI GPT-4o-mini
- **Styling**: Custom CSS with glassmorphism design

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [FFmpeg](https://ffmpeg.org/) installed and available in PATH
- [OpenAI API key](https://platform.openai.com/api-keys) with available credits

### Installation

```bash
git clone https://github.com/megastoyokumono/FrameCaption-AI.git
cd FrameCaption-AI
npm install
```

### Configuration

Set your OpenAI API key. You can either:

1. Click **Settings** in the app navbar and enter your key (saved locally in localStorage), or
2. Create a `.env.local` file:

```
OPENAI_API_KEY=sk-your-key-here
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Upload** a video file (MP4, MOV, or WEBM)
2. **Transcribe** — FFmpeg extracts the audio track, then OpenAI Whisper transcribes it with word-level timestamps
3. **Caption** — GPT-4o-mini generates a short social-media caption from the transcript
4. **Edit** — Adjust subtitle text and timing in the timeline editor
5. **Style** — Choose fonts, colors, position, and toggle background pill / stroke
6. **Render** — FFmpeg burns the styled subtitles directly into the video
7. **Download** — Save the final MP4 with burned-in subtitles

## Project Structure

```
src/
├── app/
│   ├── globals.css              # Premium dark-theme styling
│   ├── layout.tsx               # Root layout with Inter & Montserrat fonts
│   ├── page.tsx                 # Main dashboard page
│   └── api/
│       ├── upload/route.ts      # Video upload handler
│       ├── transcribe/route.ts  # Audio extraction + transcription
│       ├── caption/route.ts     # AI caption generation
│       ├── render/route.ts      # Subtitle burning via FFmpeg
│       ├── download/[id]/route.ts  # Rendered video download
│       └── video/[id]/route.ts     # Uploaded video streaming
├── components/
│   ├── Navbar.tsx               # Top navigation with settings
│   ├── UploadPanel.tsx          # Drag-and-drop video upload
│   ├── VideoPlayer.tsx          # Video player with live subtitle overlay
│   ├── CaptionPanel.tsx         # Editable AI caption
│   ├── SubtitleTimeline.tsx     # Editable subtitle rows
│   └── SubtitleStylePanel.tsx   # Font, color, position, presets
└── lib/
    ├── ffmpeg.ts                # FFmpeg processing utilities
    ├── transcription.ts         # OpenAI API wrapper
    └── srt.ts                   # SRT/ASS subtitle format helpers
```

## Design

Built with a premium dark theme:

| Property | Value |
|---|---|
| Background | `#0B0F19` → `#111827` (gradient) |
| Primary Card | `rgba(17, 24, 39, 0.85)` |
| Accent | `#7C3AED` |
| Text | `#F9FAFB` |
| Muted Text | `#9CA3AF` |
| Success | `#22C55E` |
| Error | `#EF4444` |
| Font | Inter & Montserrat |

## License

MIT
