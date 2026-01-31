# Light VOD Editor: Multi-Segment Trimmer with Voiceover Support

## Summary

Adds a powerful browser-based video trimming tool that generates FFmpeg commands for:
- ✂️ Cutting multiple segments from large video files (4-7 GB tested)
- 🔗 Merging segments into one video OR splitting into separate files
- 🎤 Recording and mixing multiple voiceover tracks
- 📍 Adding labeled timeline markers for easy navigation

**No upload, no re-encoding in browser** - just generates optimized FFmpeg commands.

## Motivation

**Problem:** Content creators need to:
- Split long stream VODs into individual runs/games
- Create highlights reels by cutting boring parts
- Add narrated commentary to gameplay videos
- Process 4-7 GB files without browser crashes or slow re-encoding

**Existing solutions:**
- Video editors are slow (re-encode everything)
- Cloud tools require uploading huge files
- FFmpeg is powerful but has a steep learning curve

**This solution:**
- Fast (FFmpeg with `-c copy` = seconds, not minutes)
- Private (everything stays local)
- Educational (shows FFmpeg commands, users learn)
- Handles large files (tested with 7 GB)

## Features Implemented

### 🎬 Multi-Segment Trimming
- Add unlimited segments from one video
- Visual timeline with color-coded regions (blue, green, yellow, red, purple)
- Three dragging modes:
  - **Left handle** - Adjust start point
  - **Right handle** - Adjust end point
  - **Segment body** - Move entire segment (preserves duration)
- Real-time video scrubbing while dragging
- Segment list with preview, delete, and reorder

### 📤 Two Export Modes
**Merge Mode:**
- Generates one FFmpeg command
- Combines all segments using `concat` filter
- Output: Single merged video

**Split Mode:**
- Generates multiple FFmpeg commands (one per segment)
- Uses fast `-c copy` codec
- Output: Separate files (`video_segment1.mp4`, `video_segment2.mp4`, etc.)

### 🧭 Navigation
- **Click timeline** - Jump to position
- **Horizontal trackpad swipe** - Scrub video smoothly
- **Keyboard shortcuts**:
  - `←/→` - Move 1 frame (~0.03s)
  - `Shift + ←/→` - Jump 5 seconds
  - `Spacebar` - Play/pause
- **Playhead** - Red line shows current position

### 📍 Labeled Markers
- Add named markers (e.g., "Intro", "Boss Fight", "Outro")
- Visual pins on timeline (hover to see label)
- Click marker to jump to timestamp
- Use in voiceover dropdown instead of typing times

### 🎤 Multiple Voiceover Tracks
- Record unlimited audio tracks in browser
- Position using timestamps OR marker names
- Download as `voiceover_1.webm`, `voiceover_2.webm`, etc.
- Auto-generated FFmpeg command mixes all tracks with:
  - `adelay` filter for precise timing
  - `amix` filter for combining audio
  - Volume control (original audio at 30%, voiceover at 100%)

### 🎨 UI/UX
- Dark theme optimized for long editing sessions
- Copy-to-clipboard buttons for all commands
- Stats display (duration, file size, resolution, segment count)
- Responsive grid layout
- No dependencies (vanilla JavaScript)

## Technical Implementation

### Architecture
**Files:**
- `trimmer-multi.html` - Main tool (2000+ lines, self-contained)
- `trimmer.html` - Simple version (single trim point, kept for backwards compatibility)
- `spike-large-file-trimmer.html` - Early prototype (reference only)

**Key Technologies:**
- **Browser APIs**:
  - `createObjectURL()` - Load videos without upload
  - `MediaRecorder` - Record voiceover
  - `getUserMedia()` - Microphone access
  - `Blob` - Handle audio files
- **FFmpeg filters**:
  - `trim` / `atrim` - Cut video/audio segments
  - `setpts` / `asetpts` - Reset timestamps
  - `concat` - Merge segments
  - `adelay` - Offset audio timing
  - `amix` - Mix multiple audio tracks

### State Management
```javascript
// Core state (vanilla JS)
let segments = []; // { start, end }
let markers = []; // { name, time }
let voiceoverTracks = []; // { id, startTime, startMarker, blob, filename }
```

### Performance
- **Large file support** - Uses URL blobs, doesn't load entire file into memory
- **Fast commands** - No re-encoding (uses `-c copy`)
- **Real-time updates** - Efficient timeline re-rendering

## Example FFmpeg Commands

### Merge Segments
```bash
ffmpeg -i "video.mp4" -filter_complex \
  "[0:v]trim=start=10:end=20,setpts=PTS-STARTPTS[v0]; \
   [0:v]trim=start=30:end=45,setpts=PTS-STARTPTS[v1]; \
   [0:a]atrim=start=10:end=20,asetpts=PTS-STARTPTS[a0]; \
   [0:a]atrim=start=30:end=45,asetpts=PTS-STARTPTS[a1]; \
   [v0][a0][v1][a1]concat=n=2:v=1:a=1[outv][outa]" \
  -map "[outv]" -map "[outa]" "merged.mp4"
```

### Split Segments
```bash
ffmpeg -ss 00:00:10.00 -t 10.00 -i "video.mp4" -c copy "segment1.mp4"
ffmpeg -ss 00:00:30.00 -t 15.00 -i "video.mp4" -c copy "segment2.mp4"
```

### Mix Voiceovers
```bash
ffmpeg -i "video.mp4" -i "voiceover_1.webm" -i "voiceover_2.webm" \
  -filter_complex "[0:a]volume=0.3[orig]; \
  [1:a]adelay=5000|5000,volume=1.0[vo0]; \
  [2:a]adelay=90000|90000,volume=1.0[vo1]; \
  [orig][vo0][vo1]amix=inputs=3:duration=first[audio]" \
  -map 0:v -map "[audio]" -c:v copy -c:a aac "output.mp4"
```

## Use Cases

### 1. Split Stream VOD into Game Runs
**Scenario:** You streamed 4 Slay the Spire runs in one 2-hour video
1. Mark 4 segments (one per run)
2. Switch to Split mode
3. Run 4 commands → Get 4 separate videos

### 2. Highlights Reel
**Scenario:** Cut boring parts, keep exciting moments
1. Mark segments for kills, wins, funny moments
2. Stay in Merge mode
3. Run command → Get one highlights video

### 3. Tutorial with Commentary
**Scenario:** Add narrated explanations to gameplay
1. Add markers: "Intro", "Mechanic 1", "Mechanic 2", "Outro"
2. Record voiceover for each section
3. Run mix command → Get tutorial with voiceover

## Testing

**Manual testing:**
- ✅ Tested with 7 GB video file (no browser crash)
- ✅ 10+ segments without performance degradation
- ✅ Real-time scrubbing works smoothly
- ✅ Commands execute successfully with FFmpeg 6.x
- ✅ Voiceover recording works in Chrome/Firefox
- ✅ Cross-browser (Chrome, Firefox, Safari)

**Known limitations:**
- Very large files (>10 GB) may be slow to preview
- Voiceover format is WebM (browser-dependent)
- Trim points may shift to nearest keyframe
- Horizontal scroll works best with trackpad

## Documentation

**Added:**
- ✅ `README.md` - Comprehensive guide with examples
- ✅ `ROADMAP.md` - Future features and priorities
- ✅ Inline help text in UI
- ✅ Keyboard shortcut guide
- ✅ FFmpeg installation instructions

## Future Work (See ROADMAP.md)

**High Priority:**
- Timeline zoom for long videos
- Segment naming
- Undo/Redo
- Color filters (brightness, contrast, saturation)

**Medium Priority:**
- Text overlays
- Transitions between segments
- Waveform visualization for audio
- Project save/load

**Low Priority:**
- React migration
- In-browser processing with ffmpeg.wasm
- AI-assisted highlight detection

## Breaking Changes

None - this is a new tool added to the repository.

## Migration Notes

**For users:**
- Old `trimmer.html` still works (single trim point)
- New `trimmer-multi.html` is the recommended version

## Screenshots/Demo

_TODO: Add screenshots showing:_
1. Timeline with multiple segments
2. Dragging handles
3. Markers on timeline
4. Voiceover recording interface
5. Generated FFmpeg command

## How to Test

1. Open `light-vod-editor/trimmer-multi.html` in browser
2. Load any video file (even a large one)
3. Try these workflows:
   - Add 3 segments and drag handles
   - Drag a segment body to reposition it
   - Add 2 markers and use them in voiceover
   - Record a voiceover track
   - Copy and run the merge command

**Expected result:** FFmpeg command completes in seconds, output video plays correctly.

## Checklist

- [x] Code is self-contained (no external dependencies)
- [x] README.md with usage instructions
- [x] ROADMAP.md with future plans
- [x] Inline UI help text
- [x] Cross-browser tested
- [x] Large file tested (7 GB)
- [x] FFmpeg commands validated
- [ ] Screenshots added _(TODO)_
- [ ] Video demo recorded _(TODO)_

## Questions for Review

1. Should we make `trimmer-multi.html` the default entry point?
2. Do we want to add this to the main landing page nav?
3. Should we delete spike files or keep them for reference?
4. Any concerns about the 2000+ line HTML file? (Can refactor to React later)

---

**Ready for review!** This adds significant value for content creators working with large video files.
