# Light VOD Editor

A browser-based video trimming tool that generates FFmpeg commands. Fast, local, and private - your videos never leave your computer.

**Part of the Plokmin Consortium collection.**

## 🎯 What It Does

Generate FFmpeg commands to:
- ✂️ **Trim videos** - Cut multiple segments from large video files (4-7 GB tested)
- 🔗 **Merge segments** - Combine multiple clips into one video
- 📦 **Split segments** - Export each clip as a separate file
- 🎤 **Add voiceovers** - Record and mix multiple audio tracks
- 📍 **Mark timestamps** - Add labeled markers for easy navigation

**No upload, no re-encoding in the browser** - just generates the commands you need.

## 🚀 Quick Start

### Option 1: Use the HTML Files Directly (Recommended for now)

1. **Open** `trimmer-multi.html` in any modern browser
2. **Load** your video file (works with any size - tested with 4-7 GB files)
3. **Add segments** and adjust by dragging handles on the timeline
4. **Copy** the generated FFmpeg command
5. **Run** the command in your terminal

**That's it!** Processing takes seconds, not minutes, because FFmpeg does the heavy lifting.

### Option 2: Run as React App (Future)

```bash
# From repo root
npm install
npm run dev:light-vod-editor
```

## ✨ Features

### Video Trimming & Segmentation
- **Multiple trim segments** - Mark as many clips as you need from one video
- **Visual timeline** - See all your segments at a glance with color-coded regions
- **Draggable handles** - Fine-tune start/end points with real-time video scrubbing
- **Drag entire segments** - Click and drag the middle to reposition clips
- **Two export modes**:
  - **Merge** - Combine all segments into one video
  - **Split** - Export each segment as a separate file

### Navigation & Controls
- **Click timeline** - Jump to any position instantly
- **Horizontal scroll** - Scrub video with trackpad/magic mouse swipe
- **Keyboard shortcuts**:
  - `←/→` - Move 1 frame backward/forward
  - `Shift + ←/→` - Jump 5 seconds
  - `Spacebar` - Play/pause
- **Real-time scrubbing** - Video updates as you drag handles

### Markers & Labels
- **Add labeled markers** - Name important moments (e.g., "Intro", "Boss Fight", "Outro")
- **Timeline breadcrumbs** - Visual markers on timeline you can click to jump
- **Marker dropdown** - Select markers by name instead of typing timestamps

### Voiceover Recording
- **Multiple audio tracks** - Record different commentary for different sections
- **Browser-based recording** - No external software needed
- **Timestamp or marker-based** - Position voiceovers using markers or exact times
- **Automatic mixing** - Generated FFmpeg command mixes all tracks with proper delays
- **Individual downloads** - Save each track separately

## Development

```bash
# Install dependencies (from repo root)
npm install

# Start dev server
npm run dev:light-vod-editor

# Build for production
npm run build -w light-vod-editor

# Type checking
npm run typecheck
```

## 📋 Files

```
light-vod-editor/
├── README.md                          # This file
├── ROADMAP.md                         # Future features and improvements
├── trimmer-multi.html                 # Main tool (multiple segments + voiceovers + markers)
├── trimmer.html                       # Simple version (single trim point)
├── spike-large-file-trimmer.html     # Early prototype (reference only)
└── src/                               # Future React implementation
```

## 🎮 Common Workflows

### 1. Split One VOD into Multiple Runs
**Use case:** You streamed 4 Slay the Spire runs and want 4 separate videos

1. Load your 2-hour VOD
2. Click "Add New Segment" and drag handles to mark Run #1
3. Repeat for Runs #2, #3, #4
4. Switch to "📦 Split Into Separate Files" mode
5. Copy all commands and run in terminal
6. Get `vod_segment1.mp4`, `vod_segment2.mp4`, `vod_segment3.mp4`, `vod_segment4.mp4`

### 2. Create Highlights Reel
**Use case:** Cut boring parts, merge the exciting moments

1. Load your stream VOD
2. Mark segments for all exciting moments (kills, wins, funny moments)
3. Stay in "🔗 Merge All Segments" mode
4. Copy command and run
5. Get one highlights video with all the good stuff

### 3. Add Narrated Commentary
**Use case:** Record voiceover explaining what's happening

1. Load your gameplay video
2. Add markers: "Intro" (0:05), "Strategy Explanation" (1:30), "Outro" (5:00)
3. Expand voiceover section, add 3 tracks
4. Select markers from dropdown and record each commentary
5. Download all voiceover files
6. Copy mix command and run
7. Get video with commentary mixed in at the right times

## 🛠️ Technical Details

### How It Works

1. **Video loads locally** - Uses `createObjectURL()` for instant playback
2. **User marks segments** - JavaScript tracks timestamps
3. **FFmpeg commands generated** - Complex filter chains built automatically
4. **User runs commands** - FFmpeg processes video on their machine

### Why FFmpeg Commands Instead of Browser Processing?

- ✅ **Fast** - No re-encoding, uses copy codec (`-c copy`)
- ✅ **Scalable** - Works with any file size (browser crashes on large files)
- ✅ **Quality** - No quality loss
- ✅ **Educational** - Users learn FFmpeg
- ✅ **Flexible** - Commands can be tweaked

### FFmpeg Installation

**Mac:** `brew install ffmpeg`
**Linux:** `sudo apt install ffmpeg`
**Windows:** Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## 🐛 Known Limitations

- **Browser memory** - Very large files (>10 GB) may be slow to preview
- **Voiceover format** - Records as WebM
- **Keyframe accuracy** - Trim points may shift slightly to nearest keyframe
- **Horizontal scroll** - Works best with trackpad

## 🚦 Next Steps

See [ROADMAP.md](ROADMAP.md) for planned features and improvements.

## Architecture (Future React Version)

- **React + TypeScript**: Type-safe component architecture
- **Vite**: Fast dev server and optimized builds
- **PWA**: Installable, offline-capable progressive web app

**Live at**: https://mikhaidn.github.io/CardGames/light-vod-editor/
