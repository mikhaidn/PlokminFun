# 02. Solution

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         React App                            │
├─────────────────────────────────────────────────────────────┤
│  VideoPlayer  │  Timeline  │  AudioOverlay  │  VolumeControls│
├─────────────────────────────────────────────────────────────┤
│                     State Management                         │
│  (useVideoEditor hook - trimPoints, audioTrack, volumes)    │
├─────────────────────────────────────────────────────────────┤
│                    Core Engine Layer                         │
│  VideoEngine  │  AudioEngine  │  TimelineEngine │  Exporter  │
├─────────────────────────────────────────────────────────────┤
│                       Web APIs                               │
│  HTMLVideoElement │ Web Audio API │ MediaRecorder │ Canvas  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Video Loading & Display

**Tech:** `<video>` element + File API
```typescript
interface VideoFile {
  file: File;
  url: string; // blob:// URL from URL.createObjectURL()
  duration: number;
  metadata: {
    width: number;
    height: number;
    codec: string;
    bitrate: number;
  };
}
```

**Implementation:**
- Accept files via drag-drop or `<input type="file" accept="video/*">`
- Create object URL: `URL.createObjectURL(file)`
- Load into `<video>` element
- Extract metadata from `video.videoWidth`, `duration`, etc.
- Display with custom controls (hide native controls)

### 2. Timeline Component

**Tech:** Canvas API for rendering, drag handlers
```typescript
interface TimelineState {
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  waveformData: Float32Array; // Audio visualization
}
```

**Visual Layout:**
```
┌─────────────────────────────────────────────────┐
│ [00:05]  ●━━━━━━━━●━━━━━━━━━━━━━━━  [02:30]   │
│          ↑        ↑                            │
│       TrimStart  Playhead            TrimEnd   │
│                                                 │
│ ▁▃▅▇█▇▅▃▁▃▅▇█▇▅▃▁  (Waveform)                 │
└─────────────────────────────────────────────────┘
```

**Features:**
- Canvas-rendered timeline (60fps)
- Draggable trim handles (in/out points)
- Click-to-seek anywhere on timeline
- Visual playhead indicator
- Waveform visualization from Web Audio API
- Time labels (MM:SS format)

### 3. Audio Overlay System

**Tech:** Web Audio API
```typescript
interface AudioTrack {
  file: File;
  audioBuffer: AudioBuffer;
  volumeNode: GainNode;
  startOffset: number; // When audio starts relative to video
}
```

**Audio Graph:**
```
Video Audio → GainNode (videoVolume) →
                                        → MixNode → Destination
Overlay Audio → GainNode (audioVolume) →
```

**Implementation:**
- Load audio file into AudioBuffer via `decodeAudioData()`
- Create audio graph with separate GainNodes for each track
- Synchronize playback with video currentTime
- Handle play/pause events to start/stop audio sources

### 4. Volume Controls

**Tech:** `<input type="range">` + Web Audio GainNode
```typescript
interface VolumeState {
  videoVolume: number; // 0.0 - 2.0 (0% - 200%)
  audioVolume: number; // 0.0 - 2.0
}
```

**UI:**
```
Video:  ├──────●────────┤  100%
Audio:  ├──────────●────┤  150%
        0%            200%
```

### 5. Playback Controls

**Tech:** HTMLVideoElement API
```typescript
interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number; // 0.5x, 1x, 2x
  loop: boolean;
}
```

**Features:**
- Play/Pause toggle
- Seek via timeline click
- Playback speed control (optional for MVP)
- Loop trimmed region (helpful for perfecting edits)

## Data Flow

### User Interaction Flow
```
1. User drops video file
   → VideoEngine.loadVideo(file)
   → Extract metadata, create blob URL
   → Update state: { videoFile, duration }

2. User drags trim handle
   → TimelineEngine.updateTrimPoint(time)
   → Validate: trimStart < trimEnd
   → Update state: { trimStart } or { trimEnd }

3. User adds audio overlay
   → AudioEngine.loadAudioTrack(file)
   → Decode to AudioBuffer
   → Create audio graph with GainNodes
   → Update state: { audioTrack }

4. User adjusts volume
   → AudioEngine.setVolume(track, value)
   → Update GainNode.gain.value
   → Update state: { videoVolume } or { audioVolume }

5. User clicks play
   → VideoEngine.play()
   → AudioEngine.syncAndPlay(video.currentTime)
   → Update state: { isPlaying: true }
```

## State Management

**Single source of truth:** `useVideoEditor` hook
```typescript
interface VideoEditorState {
  // Video
  videoFile: VideoFile | null;
  currentTime: number;
  isPlaying: boolean;

  // Trim
  trimStart: number;
  trimEnd: number;

  // Audio
  audioTrack: AudioTrack | null;
  videoVolume: number;
  audioVolume: number;

  // Timeline
  waveformData: Float32Array | null;
}

const useVideoEditor = () => {
  const [state, setState] = useState<VideoEditorState>(initialState);

  // Actions
  const loadVideo = (file: File) => { /* ... */ };
  const updateTrimPoints = (start: number, end: number) => { /* ... */ };
  const loadAudioOverlay = (file: File) => { /* ... */ };
  const setVolume = (track: 'video' | 'audio', value: number) => { /* ... */ };
  const play = () => { /* ... */ };
  const pause = () => { /* ... */ };
  const seek = (time: number) => { /* ... */ };

  return { state, actions: { loadVideo, updateTrimPoints, ... } };
};
```

## Technical Considerations

### Performance
- **Waveform generation:** Downsample audio to 1 sample per pixel to avoid rendering lag
- **Timeline rendering:** Use requestAnimationFrame for smooth 60fps updates
- **Large files:** Stream processing for files >500MB (use Media Source Extensions)

### Browser Compatibility
- **Chrome/Edge:** Full support for all APIs
- **Firefox:** Good support, test MediaRecorder output
- **Safari:** Limited codec support (VP9 may not work, stick to H.264)
- **Mobile:** Defer to v1.1, focus on desktop MVP

### Accessibility
- Keyboard shortcuts: Space (play/pause), Arrow keys (seek ±5s)
- ARIA labels for all controls
- Focus indicators on draggable elements
- Screen reader announcements for time updates

## File Size Constraints

**MVP Limits:**
- Max video size: 500MB (browser memory limits)
- Max duration: 2 hours
- Recommended: 720p, <15 minutes for best performance

**Future optimizations:**
- Streaming for larger files
- Worker threads for processing
- IndexedDB for temporary storage

## Error Handling

```typescript
type VideoEditorError =
  | { type: 'UNSUPPORTED_FORMAT'; codec: string }
  | { type: 'FILE_TOO_LARGE'; size: number; max: number }
  | { type: 'DECODE_ERROR'; message: string }
  | { type: 'AUDIO_SYNC_FAILED'; drift: number };

const handleError = (error: VideoEditorError) => {
  // Show user-friendly toast notification
  // Log to analytics
  // Provide recovery options (e.g., "Try a different format")
};
```

---

## Summary

This solution leverages mature Web APIs to build a fully client-side video editor:
- No server uploads (privacy + speed)
- Hardware-accelerated where available
- Progressive enhancement (core features work, advanced features degrade gracefully)
- PWA-ready for offline use and installation

**Next:** See [03-alternatives.md](03-alternatives.md) for why we chose this approach over libraries like ffmpeg.wasm or Remotion.
