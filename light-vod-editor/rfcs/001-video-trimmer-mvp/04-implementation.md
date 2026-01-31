# 04. Implementation Plan

## Overview

Total estimated time: **3-4 days for MVP**, 6-8 days for full v1.0 with export.

**Development approach:**
- TDD where applicable (core engines)
- Component-driven development (Storybook-style isolation)
- Ship MVP fast, iterate based on user feedback

---

## Phase 1: Core Video Player (Day 1, 6-8 hours)

### Goals
- Load and display video
- Basic playback controls
- Video metadata extraction

### Tasks

#### 1.1 Video Loading Component (2 hours)
```typescript
// src/components/VideoLoader.tsx
- Drag-and-drop zone with visual feedback
- File picker fallback (<input type="file">)
- File validation (size, format)
- Error handling (unsupported format, too large)
```

**Tests:**
- Accepts valid video files
- Rejects non-video files
- Shows error for files >500MB
- Displays loading state

#### 1.2 Video Player Component (2 hours)
```typescript
// src/components/VideoPlayer.tsx
- <video> element with custom controls
- Play/pause button
- Current time display
- Duration display
- Basic seeking with <input type="range">
```

**Tests:**
- Video plays/pauses on button click
- Time updates during playback
- Seeking updates currentTime

#### 1.3 Video Engine (2 hours)
```typescript
// src/core/VideoEngine.ts
class VideoEngine {
  loadVideo(file: File): Promise<VideoMetadata>
  play(): void
  pause(): void
  seek(time: number): void
  getCurrentTime(): number
  getDuration(): number
  on(event: 'timeupdate' | 'ended', handler: () => void): void
}
```

**Tests:**
- Loads video and extracts metadata
- Emits timeupdate events
- Handles seek edge cases (negative, beyond duration)

#### 1.4 State Management Hook (2 hours)
```typescript
// src/hooks/useVideoEditor.ts
const useVideoEditor = () => {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const loadVideo = async (file: File) => { /* ... */ };
  const play = () => { /* ... */ };
  const pause = () => { /* ... */ };
  const seek = (time: number) => { /* ... */ };

  return { videoFile, isPlaying, currentTime, duration, loadVideo, play, pause, seek };
};
```

**Deliverables:**
- ✅ Users can load and play video files
- ✅ Basic playback controls work
- ✅ Time displays update in real-time

---

## Phase 2: Timeline & Trim Controls (Day 2, 6-8 hours)

### Goals
- Visual timeline with playhead
- Draggable trim handles (in/out points)
- Click-to-seek on timeline

### Tasks

#### 2.1 Timeline Canvas Renderer (3 hours)
```typescript
// src/components/Timeline.tsx
- Canvas element sized to container
- Draw timeline track (horizontal bar)
- Draw playhead indicator (vertical line)
- Draw trim handles (draggable markers)
- Draw time labels (every 10 seconds)
- Handle window resize
```

**Tests:**
- Renders timeline at correct scale
- Playhead position matches currentTime
- Resizes correctly on window resize

#### 2.2 Trim Handle Interaction (2 hours)
```typescript
// src/components/Timeline/TrimHandle.tsx
- Draggable handle component
- Constraint: trimStart < trimEnd
- Constraint: handles stay within 0-duration
- Visual feedback on hover/drag
- Snap to playhead (within 100ms)
```

**Tests:**
- Trim start can't exceed trim end
- Handles can't go outside video bounds
- Drag updates state correctly

#### 2.3 Click-to-Seek (1 hour)
```typescript
// Timeline onClick handler
const handleTimelineClick = (e: MouseEvent) => {
  const rect = canvasRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const time = (x / rect.width) * duration;
  seek(time);
};
```

**Tests:**
- Clicking timeline seeks to correct time
- Works across different canvas widths

#### 2.4 State Integration (2 hours)
```typescript
// Add to useVideoEditor hook
const [trimStart, setTrimStart] = useState(0);
const [trimEnd, setTrimEnd] = useState(0);

const updateTrimPoints = (start: number, end: number) => {
  if (start >= end) throw new Error('Invalid trim points');
  setTrimStart(start);
  setTrimEnd(end);
};

// Auto-set trimEnd when video loads
useEffect(() => {
  if (duration > 0) setTrimEnd(duration);
}, [duration]);
```

**Deliverables:**
- ✅ Visual timeline shows video progress
- ✅ Users can drag trim handles to set in/out points
- ✅ Click timeline to seek
- ✅ Trim region visually highlighted

---

## Phase 3: Audio Overlay (Day 3, 6-8 hours)

### Goals
- Load audio file (drag-drop or picker)
- Synchronize audio playback with video
- Maintain sync during seek/pause

### Tasks

#### 3.1 Audio Loader Component (1 hour)
```typescript
// src/components/AudioOverlay.tsx
- File picker for audio (MP3, WAV, OGG)
- Display audio filename and duration
- Remove audio button
```

#### 3.2 Audio Engine (3 hours)
```typescript
// src/core/AudioEngine.ts
class AudioEngine {
  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer | null;
  private source: AudioBufferSourceNode | null;
  private gainNode: GainNode;

  async loadAudio(file: File): Promise<void>
  play(startTime: number): void
  pause(): void
  setVolume(volume: number): void
  getCurrentTime(): number
}
```

**Key challenge:** Synchronizing Web Audio API (does not have built-in seek) with video.

**Solution:**
```typescript
play(videoCurrentTime: number) {
  if (this.source) this.source.stop();

  this.source = this.audioContext.createBufferSource();
  this.source.buffer = this.audioBuffer;
  this.source.connect(this.gainNode);
  this.gainNode.connect(this.audioContext.destination);

  // Start audio at same position as video
  const offset = videoCurrentTime - trimStart;
  this.source.start(0, Math.max(0, offset));
}
```

**Tests:**
- Loads audio and decodes correctly
- Starts at correct offset when video plays mid-trim
- Stops when video pauses
- Re-syncs after seek

#### 3.3 Audio Sync Logic (2 hours)
```typescript
// src/core/SyncEngine.ts
class SyncEngine {
  constructor(videoEngine: VideoEngine, audioEngine: AudioEngine) {}

  play(): void {
    const currentTime = this.videoEngine.getCurrentTime();
    this.videoEngine.play();
    this.audioEngine.play(currentTime);
  }

  pause(): void {
    this.videoEngine.pause();
    this.audioEngine.pause();
  }

  seek(time: number): void {
    this.videoEngine.seek(time);
    if (this.videoEngine.isPlaying) {
      this.audioEngine.pause();
      this.audioEngine.play(time);
    }
  }
}
```

**Tests:**
- Audio and video start in sync
- Seeking re-syncs audio
- Pausing stops both tracks

#### 3.4 Video Audio Track Control (2 hours)
Handle original video audio alongside overlay:
```typescript
// Mute original video audio, route through Web Audio
const videoElement = videoRef.current;
videoElement.muted = true; // Mute native audio

const videoSource = audioContext.createMediaElementSource(videoElement);
const videoGainNode = audioContext.createGain();
videoSource.connect(videoGainNode);
videoGainNode.connect(audioContext.destination);
```

**Deliverables:**
- ✅ Users can add audio overlay
- ✅ Audio plays in sync with video
- ✅ Seeking/pausing maintains sync
- ✅ Both video and overlay audio play simultaneously

---

## Phase 4: Volume Controls (Day 3 afternoon, 2-3 hours)

### Goals
- Independent volume sliders for video and audio
- Real-time volume adjustment during playback
- Visual feedback (percentage, mute button)

### Tasks

#### 4.1 Volume Slider Components (1 hour)
```typescript
// src/components/VolumeControl.tsx
interface VolumeControlProps {
  label: string; // "Video" or "Audio"
  volume: number; // 0.0 - 2.0
  onChange: (volume: number) => void;
}

- <input type="range" min="0" max="2" step="0.01">
- Display percentage (0% - 200%)
- Mute button (quick 0% toggle)
```

**Tests:**
- Slider updates volume in real-time
- Mute button toggles between 0% and previous value
- Displays correct percentage

#### 4.2 Volume Engine Integration (1 hour)
```typescript
// Update AudioEngine
setVolume(volume: number) {
  this.gainNode.gain.value = volume;
}

// Update VideoEngine (uses Web Audio GainNode)
setVolume(volume: number) {
  this.videoGainNode.gain.value = volume;
}
```

**Tests:**
- Changing slider updates audio output
- Volume changes persist across play/pause/seek

#### 4.3 State Management (1 hour)
```typescript
// Add to useVideoEditor
const [videoVolume, setVideoVolume] = useState(1.0);
const [audioVolume, setAudioVolume] = useState(1.0);

const updateVolume = (track: 'video' | 'audio', volume: number) => {
  if (track === 'video') {
    setVideoVolume(volume);
    videoEngine.setVolume(volume);
  } else {
    setAudioVolume(volume);
    audioEngine.setVolume(volume);
  }
};
```

**Deliverables:**
- ✅ Independent volume controls for video and audio
- ✅ Range: 0% (mute) to 200% (boost)
- ✅ Real-time updates during playback

---

## Phase 5: Waveform Visualization (Day 4 morning, 3-4 hours)

### Goals
- Display audio waveform on timeline
- Visual feedback for audio levels
- Helps users align audio with video

### Tasks

#### 5.1 Waveform Data Extraction (2 hours)
```typescript
// src/core/WaveformEngine.ts
class WaveformEngine {
  async generateWaveform(
    audioBuffer: AudioBuffer,
    width: number // Canvas width in pixels
  ): Promise<Float32Array> {
    const samples = audioBuffer.getChannelData(0); // Mono or left channel
    const samplesPerPixel = Math.floor(samples.length / width);
    const waveform = new Float32Array(width);

    for (let i = 0; i < width; i++) {
      const start = i * samplesPerPixel;
      const end = start + samplesPerPixel;
      let max = 0;

      for (let j = start; j < end; j++) {
        max = Math.max(max, Math.abs(samples[j]));
      }

      waveform[i] = max;
    }

    return waveform;
  }
}
```

**Tests:**
- Generates correct number of samples
- Handles mono and stereo audio
- Downsamples correctly

#### 5.2 Waveform Rendering (1-2 hours)
```typescript
// src/components/Timeline/WaveformRenderer.ts
const drawWaveform = (
  ctx: CanvasRenderingContext2D,
  waveform: Float32Array,
  width: number,
  height: number
) => {
  ctx.fillStyle = 'rgba(66, 153, 225, 0.3)'; // Semi-transparent blue

  for (let i = 0; i < waveform.length; i++) {
    const barHeight = waveform[i] * height;
    const x = (i / waveform.length) * width;
    const y = (height - barHeight) / 2;

    ctx.fillRect(x, y, width / waveform.length, barHeight);
  }
};
```

**Tests:**
- Renders waveform bars correctly
- Scales to canvas dimensions
- Updates when canvas resizes

**Deliverables:**
- ✅ Waveform displays on timeline
- ✅ Visual representation of audio levels
- ✅ Helps users identify audio peaks

---

## MVP Complete! 🎉

At this point (end of Day 4), all core features are functional:
- ✅ Video loading and playback
- ✅ Trim controls with draggable handles
- ✅ Audio overlay synchronized with video
- ✅ Independent volume controls
- ✅ Timeline with waveform visualization

**User can:** Load a video, trim it, add background music, adjust volumes, preview result.

**Missing:** Export functionality (save edited video to disk).

---

## Phase 6: Export System (Days 5-6, FOLLOW-UP)

### 6.1 Trim-Only Export (Fast Path, 4 hours)
For videos with NO audio overlay, use direct file slicing (no re-encode).

```typescript
// src/core/Exporter.ts
async exportTrimOnly(
  videoFile: File,
  trimStart: number,
  trimEnd: number
): Promise<Blob> {
  // Use ffmpeg.wasm or Web Codecs for precise trimming without re-encode
  // Falls back to MediaRecorder if neither available
}
```

### 6.2 Full Re-Encode Export (Slow Path, 8 hours)
For videos with audio overlay, use MediaRecorder to capture canvas + mixed audio.

```typescript
async exportWithAudio(
  videoElement: HTMLVideoElement,
  audioContext: AudioContext,
  trimStart: number,
  trimEnd: number
): Promise<Blob> {
  // 1. Create canvas, draw video frames
  // 2. Capture canvas + audio with MediaRecorder
  // 3. Play trimmed region, record output
  // 4. Return recorded Blob
}
```

**Challenges:**
- Real-time playback required (can't encode faster than 1x speed with MediaRecorder)
- Progress indication (show % complete)
- Handle errors (browser codec limitations)

### 6.3 Export UI (2 hours)
- Export button
- Format selection (WebM vs MP4)
- Quality selection (low/medium/high)
- Progress bar during export
- Download link when complete

---

## Phase 7: Polish & Features (Days 7-8, FOLLOW-UP)

### 7.1 Keyboard Shortcuts (2 hours)
- Space: Play/Pause
- Arrow Left/Right: Seek ±5 seconds
- I: Set trim start to current time
- O: Set trim end to current time
- Shift+Delete: Clear audio overlay

### 7.2 Project Persistence (2 hours)
- Save state to localStorage
- Restore on page load
- "Continue editing" vs "New project" dialog

### 7.3 Undo/Redo (3 hours)
- Track state history
- Ctrl+Z / Ctrl+Y shortcuts
- Undo trim point changes, audio overlay, volume adjustments

### 7.4 Mobile Support (6 hours)
- Touch-friendly timeline scrubbing
- Responsive layout for small screens
- iOS Safari compatibility testing
- File picker on mobile (camera roll access)

### 7.5 Performance Optimization (3 hours)
- Debounce timeline rendering
- Lazy-load waveform generation
- Web Worker for audio decoding
- IndexedDB for large file caching

---

## Summary: Effort Breakdown

| Phase | Feature | Effort | Priority |
|-------|---------|--------|----------|
| 1 | Core Video Player | 6-8 hours | P0 (MVP) |
| 2 | Timeline & Trim | 6-8 hours | P0 (MVP) |
| 3 | Audio Overlay | 6-8 hours | P0 (MVP) |
| 4 | Volume Controls | 2-3 hours | P0 (MVP) |
| 5 | Waveform Viz | 3-4 hours | P0 (MVP) |
| 6 | Export System | 12-16 hours | P1 (v1.0) |
| 7 | Polish & Features | 16-20 hours | P2 (v1.1+) |

**Total:**
- **MVP (no export):** 23-31 hours (3-4 days)
- **v1.0 (with export):** 35-47 hours (5-6 days)
- **v1.1+ (polish):** 51-67 hours (7-8 days)

---

## Testing Strategy

See [05-testing.md](05-testing.md) for detailed test plan.

**Quick summary:**
- Unit tests: Core engines (VideoEngine, AudioEngine, SyncEngine)
- Integration tests: Component interactions (Timeline ↔ Player)
- E2E tests: Full user workflows (load → trim → overlay → export)
- Manual tests: Cross-browser compatibility, mobile devices

---

## Next Steps After MVP

1. **User Testing** - Share with 5-10 users, gather feedback
2. **Analytics** - Track feature usage, identify pain points
3. **Performance Profiling** - Optimize slow parts
4. **Export Implementation** - High user demand, ship in v1.0
5. **Mobile Optimization** - If >30% of users on mobile

**Iterate based on data, not assumptions.**
