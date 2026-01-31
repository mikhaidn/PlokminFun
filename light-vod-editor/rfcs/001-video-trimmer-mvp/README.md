# RFC-001: Video Trimmer MVP

**Status:** PROPOSED
**Author:** AI Design Assistant
**Created:** 2026-01-30
**Updated:** 2026-01-30
**Target Version:** 0.1.0

---

## TL;DR

**Problem:** Users need a simple, browser-based tool to trim videos and overlay audio without installing heavy desktop software like Premiere or DaVinci Resolve.

**Solution:** Build a lightweight web app using modern Web APIs (MediaRecorder, Web Audio, Canvas) that handles video loading, trimming via draggable handles, audio overlay with independent volume control, and a visual timeline with waveforms.

**Impact:** Fast, accessible video editing for quick social media clips, stream highlights, and personal videos. Zero install, works offline as PWA, exports browser-encoded MP4/WebM.

**Effort:** MVP = 3-4 days. Full feature set = 6-8 days total.

---

## Quick Navigation

- **[01-motivation.md](01-motivation.md)** - Why build this? User pain points and use cases.
- **[02-solution.md](02-solution.md)** - Technical approach and architecture.
- **[03-alternatives.md](03-alternatives.md)** - Libraries considered (ffmpeg.wasm, remotion, etc).
- **[04-implementation.md](04-implementation.md)** - Step-by-step build plan (MVP + follow-ups).
- **[05-testing.md](05-testing.md)** - Test strategy for video processing.
- **[06-risks.md](06-risks.md)** - Browser limits, performance, codec support.

---

## Key Metrics

**Estimated effort:**
- MVP: 3-4 days
- Full v1.0: 6-8 days

**Lines of code:** ~1,500-2,000 (MVP)
**Risk level:** Medium (browser API compatibility, performance on large files)
**Breaking changes:** No (greenfield project)

---

## Core Features (MVP)

### Must-Have
1. ✅ **Video Loading** - Drag/drop or file picker
2. ✅ **Trim Controls** - Draggable in/out handles on timeline
3. ✅ **Audio Overlay** - Second audio track synchronized with video
4. ✅ **Volume Control** - Independent sliders for video and audio tracks
5. ✅ **Timeline** - Visual playhead, click-to-seek, waveform display

### Follow-Up Features (v1.1+)
- Export/Download trimmed video
- Multiple audio tracks
- Fade in/out transitions
- Text overlays
- Thumbnail preview scrubbing
- Keyboard shortcuts (Space=play/pause, arrows=seek)
- Undo/redo system
- Project save/restore (localStorage)

---

## Success Criteria

**MVP (v0.1.0)**
- ✅ Load video files up to 500MB
- ✅ Trim with <100ms precision
- ✅ Audio overlay plays in sync (±50ms tolerance)
- ✅ Volume control 0-200% range
- ✅ Timeline updates at 60fps during playback
- ✅ Works on Chrome/Edge/Safari latest

**v1.0**
- ✅ Export video without re-encoding (trim only)
- ✅ Export with re-encoding for audio overlay
- ✅ 30fps minimum during export on mid-range laptops
- ✅ Mobile support (iOS Safari, Chrome Android)

---

## Related

- **GitHub Issues:** (TBD - create after approval)
- **Design mockups:** (TBD - Figma/sketches)
- **Tech research:** Web Codecs API, MediaRecorder API, ffmpeg.wasm benchmarks
