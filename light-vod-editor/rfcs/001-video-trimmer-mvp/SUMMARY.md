# RFC-001: Video Trimmer MVP - Executive Summary

## Quick Overview

**Goal:** Build a browser-based video editor for quick trim + audio overlay tasks.

**Timeline:**
- **MVP (no export):** 3-4 days
- **v1.0 (with export):** 5-6 days
- **v1.1+ (polish):** 7-8 days

**Tech Stack:** React + TypeScript + Web APIs (Canvas, Web Audio, MediaRecorder)

---

## Core Features (MVP)

### What You Can Do
1. ✅ **Load video** - Drag/drop or file picker
2. ✅ **Trim** - Draggable handles on timeline set in/out points
3. ✅ **Add audio** - Overlay track plays in sync
4. ✅ **Volume control** - Independent sliders (0-200%)
5. ✅ **Timeline** - Visual playhead, click-to-seek, waveform display

### What's Coming After MVP
- 🔜 **Export** - Download trimmed video (v1.0)
- 🔜 **Keyboard shortcuts** - Space, arrows, I/O keys (v1.1)
- 🔜 **Undo/redo** - Ctrl+Z/Y (v1.1)
- 🔜 **Project save** - LocalStorage persistence (v1.1)
- 🔜 **Mobile support** - Touch-optimized (v1.2)
- 🔜 **Multiple audio tracks** - Stack music + voiceover (v1.3)

---

## Why This Approach?

### Problem We're Solving
- **Desktop apps** (Premiere) = Overkill for simple tasks
- **Online services** (Kapwing) = Privacy concerns + slow uploads
- **Mobile apps** = Limited features + small screen

### Our Solution
- **100% browser-based** - No uploads, no servers
- **Fast** - No waiting for uploads/downloads
- **Private** - Files never leave your device
- **Simple** - 5 controls, not 500

---

## Architecture

```
User Interface (React Components)
   ↓
State Management (useVideoEditor hook)
   ↓
Core Engines (VideoEngine, AudioEngine, SyncEngine)
   ↓
Web APIs (HTMLVideoElement, Web Audio, Canvas, MediaRecorder)
```

**Key Design Decisions:**

1. **Canvas + MediaRecorder** (not ffmpeg.wasm)
   - Pros: Small bundle, broad browser support, fast trim-only
   - Cons: Re-encoding slower than native tools
   - Decision: Best for MVP, add ffmpeg.wasm in v1.5+

2. **Web Audio API** (for sync)
   - Pros: Low-latency mixing, hardware acceleration
   - Cons: No built-in seek (manual sync required)
   - Mitigation: Periodic drift correction every 5s

3. **Vanilla Web APIs** (not heavy libraries)
   - Smaller bundle (<50KB vs ffmpeg's 31MB)
   - Faster initial load
   - More control over implementation

---

## Development Phases

### Phase 1: Core Video Player (Day 1, 6-8h)
- Load video files
- Play/pause/seek controls
- Display metadata (duration, resolution)

### Phase 2: Timeline & Trim (Day 2, 6-8h)
- Canvas-rendered timeline
- Draggable trim handles
- Click-to-seek
- Visual playhead indicator

### Phase 3: Audio Overlay (Day 3 morning, 6-8h)
- Load audio file
- Synchronize with video playback
- Handle seek/pause edge cases

### Phase 4: Volume Controls (Day 3 afternoon, 2-3h)
- Slider for video track (0-200%)
- Slider for audio track (0-200%)
- Mute buttons

### Phase 5: Waveform Viz (Day 4 morning, 3-4h)
- Extract audio data
- Downsample to canvas width
- Render bars on timeline

**MVP Complete!** 🎉 (end of Day 4)

### Phase 6: Export System (Days 5-6, FOLLOW-UP)
- Fast path: Trim-only (no re-encode)
- Slow path: Re-encode with audio overlay
- Progress bar + download link

### Phase 7: Polish (Days 7-8, FOLLOW-UP)
- Keyboard shortcuts
- Undo/redo
- Project persistence
- Mobile optimization

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Codec incompatibility** (VP9 in Safari) | HIGH | Detect formats, show warnings, docs |
| **Audio sync drift** | MEDIUM | Re-sync every 5s, use RAF |
| **Large files** (>500MB crash) | HIGH | Warnings, MSE for streaming (v1.2) |
| **Export slow** (real-time only) | HIGH | Fast path for trim-only, ffmpeg.wasm (v1.5) |
| **Mobile limits** (iOS Safari) | MEDIUM | Disable export on mobile for MVP |

**Overall risk: MEDIUM** - Most risks have viable workarounds.

---

## Success Metrics

### MVP (v0.1.0)
- ✅ Load files up to 500MB
- ✅ Trim with <100ms precision
- ✅ Audio sync ±50ms tolerance
- ✅ 60fps timeline during playback
- ✅ Works on Chrome/Edge/Safari

### v1.0
- ✅ Export trim-only in <5s (1min video)
- ✅ Export re-encode in <60s (1min video)
- ✅ 30fps minimum during export

### User Adoption (Month 1)
- 100+ weekly active users
- 50%+ task completion rate
- "Faster than Premiere" feedback

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Primary target |
| Edge | ✅ Full | Chromium-based |
| Firefox | ✅ Good | Test MediaRecorder output |
| Safari | ⚠️ Limited | H.264 only, no VP9 |
| Mobile | 🔜 v1.2 | Preview works, export disabled |

---

## File Size Limits

**MVP:**
- Max size: 500MB (browser memory limits)
- Max duration: 2 hours
- Recommended: 720p, <15 minutes

**Future:**
- v1.2: Streaming for 1GB+ files (MSE)
- v2.0: Cloud export for 4K/long videos

---

## Tech Stack Details

### Core
- React 18 (UI framework)
- TypeScript (type safety)
- Vite (build tool)

### Web APIs
- `HTMLVideoElement` - Video playback
- `Web Audio API` - Audio mixing
- `Canvas API` - Timeline rendering
- `MediaRecorder API` - Export (v1.0)
- `File API` - File handling

### Optional Libraries
- Wavesurfer.js - Waveform rendering (13KB, optional)
- ffmpeg.wasm - Advanced export (v1.5+, 31MB)

### Testing
- Vitest - Unit/integration tests
- Testing Library - Component tests
- Playwright - E2E tests (v1.0+)

---

## Next Steps

### To Approve This RFC:
1. Review [README.md](README.md) for high-level overview
2. Check [04-implementation.md](04-implementation.md) for detailed plan
3. Assess [06-risks.md](06-risks.md) for gotchas
4. Update RFC status to "APPROVED" if good to go

### To Start Implementation:
1. Set up React + TypeScript project structure
2. Implement Phase 1 (Core Video Player)
3. Daily check-ins to track progress
4. Ship MVP at end of Day 4

### To Iterate Post-MVP:
1. Gather user feedback (5-10 beta testers)
2. Prioritize features based on usage data
3. Implement Phase 6 (Export) for v1.0
4. Add polish features (Phase 7) for v1.1+

---

## Questions? Concerns?

**Read the detailed sections:**
- [01-motivation.md](01-motivation.md) - User pain points, market opportunity
- [02-solution.md](02-solution.md) - Technical architecture, data flow
- [03-alternatives.md](03-alternatives.md) - Why not ffmpeg.wasm? Remotion? Web Codecs?
- [04-implementation.md](04-implementation.md) - Step-by-step build plan
- [05-testing.md](05-testing.md) - Unit, integration, E2E test strategy
- [06-risks.md](06-risks.md) - All potential issues + mitigations

**Ready to build!** 🚀
