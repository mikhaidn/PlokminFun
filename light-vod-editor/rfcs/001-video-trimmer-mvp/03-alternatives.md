# 03. Alternatives Considered

## Option 1: ffmpeg.wasm (Full FFmpeg in Browser)

### What It Is
WebAssembly port of FFmpeg, giving full video editing capabilities in the browser.

### Pros
- ✅ Unlimited format support (all codecs FFmpeg supports)
- ✅ Professional-grade processing (same engine as desktop tools)
- ✅ Community support and documentation
- ✅ Proven in production (used by Canva, Cloudinary)

### Cons
- ❌ **Large bundle size** (~31MB core + 10MB per codec)
- ❌ **Slow initial load** (5-10 seconds on slow connections)
- ❌ **Re-encoding required** for all operations (slow, CPU-intensive)
- ❌ **Memory intensive** (500MB video → 1.5GB RAM during processing)
- ❌ Overkill for simple trim operations

### Decision
**Rejected for MVP.** Consider for v1.1+ when advanced features (filters, transitions) are needed.

**Compromise:** Use native Web APIs for MVP, keep ffmpeg.wasm as fallback for unsupported formats.

---

## Option 2: Remotion (Programmatic Video)

### What It Is
React framework for creating videos programmatically (think "video as code").

### Pros
- ✅ React components for video elements
- ✅ Great for templated videos (same structure, different content)
- ✅ Excellent for animations and motion graphics

### Cons
- ❌ **Not designed for user uploads** - Built for rendering pre-defined compositions
- ❌ Requires Node.js for rendering (can't run purely in browser)
- ❌ Steep learning curve for non-programmers
- ❌ Doesn't fit our "trim existing video" use case

### Decision
**Rejected.** Remotion excels at generating videos from scratch, not editing user uploads.

---

## Option 3: Web Codecs API (Low-Level Codec Access)

### What It Is
Modern API for hardware-accelerated video encoding/decoding at the frame level.

### Pros
- ✅ **Blazing fast** - Hardware acceleration (GPU/DSP)
- ✅ Frame-level control for advanced effects
- ✅ Efficient memory usage (stream processing)
- ✅ Future-proof (emerging standard)

### Cons
- ❌ **Limited browser support** (Chrome/Edge only, no Safari/Firefox yet as of 2026)
- ❌ Complex API (requires codec knowledge)
- ❌ Longer development time
- ❌ Polyfills negate performance benefits

### Decision
**Deferred to v1.5+.** Use for export optimization when browser support improves.

**Current approach:** Keep architecture Web Codecs-ready (abstracted VideoEngine layer).

---

## Option 4: Canvas + MediaRecorder (Chosen Approach)

### What It Is
Composite video and audio onto Canvas, capture with MediaRecorder API.

### Pros
- ✅ **Broad browser support** (Chrome, Firefox, Safari, Edge)
- ✅ No large bundle size (native browser APIs)
- ✅ Fast trim operations (no re-encoding for trim-only)
- ✅ Real-time preview (what you see is what you get)
- ✅ Well-documented, mature APIs

### Cons
- ⚠️ Re-encoding required for audio overlay (slower than trim-only)
- ⚠️ Limited codec control (browser decides output format)
- ⚠️ Variable quality across browsers

### Decision
**CHOSEN for MVP.** Best balance of performance, compatibility, and development speed.

**Mitigations:**
- Optimize for trim-only exports (no re-encode)
- Detect browser codec support and adjust quality
- Provide format selection for export (WebM vs MP4 where supported)

---

## Option 5: Media Source Extensions (MSE)

### What It Is
API for streaming video chunks, used by YouTube/Netflix for adaptive streaming.

### Pros
- ✅ Handles large files (>1GB) efficiently
- ✅ No full-file loading required
- ✅ Industry-standard for video platforms

### Cons
- ⚠️ Complex API (requires segment management)
- ⚠️ Better for playback than editing
- ⚠️ Trim operations still require re-muxing

### Decision
**Partial adoption.** Use MSE for loading large files (>500MB) but not for editing logic.

**Implementation:** Lazy-load in v1.2 when users hit 500MB limit.

---

## Option 6: Third-Party Libraries

### video.js / Plyr
**Purpose:** Video player UI
**Decision:** Build custom player for editor-specific needs (trim handles, waveforms)

### Wavesurfer.js
**Purpose:** Audio waveform visualization
**Decision:** Use for waveform rendering (13KB, well-maintained)

### Fabric.js / Konva
**Purpose:** Canvas manipulation
**Decision:** Vanilla Canvas API sufficient for timeline rendering

### ml5.js / TensorFlow.js
**Purpose:** AI features (auto-cropping, scene detection)
**Decision:** Defer to v2.0+ (out of MVP scope)

---

## Comparison Matrix

| Approach | Bundle Size | Browser Support | Performance | Dev Time | Chosen? |
|----------|-------------|-----------------|-------------|----------|---------|
| ffmpeg.wasm | 31MB+ | ★★★★★ | ★★☆☆☆ | Medium | ❌ (Later) |
| Remotion | N/A | ★★☆☆☆ | ★★★☆☆ | High | ❌ |
| Web Codecs | <50KB | ★★☆☆☆ | ★★★★★ | High | ❌ (Later) |
| Canvas + MediaRecorder | <5KB | ★★★★☆ | ★★★★☆ | Low | ✅ **MVP** |
| MSE | <10KB | ★★★★☆ | ★★★★☆ | Medium | ✅ (Large files) |

---

## Final Architecture

**Hybrid approach for maximum flexibility:**

1. **MVP (v0.1):** Canvas + MediaRecorder + Web Audio API
2. **v1.0:** Add MSE for large files
3. **v1.5:** Add Web Codecs for hardware acceleration (Chrome/Edge)
4. **v2.0:** Add ffmpeg.wasm as fallback for exotic codecs

**Progressive enhancement:** Core features work everywhere, advanced features light up on capable browsers.

---

## Rejected Ideas (Why NOT)

### Cloud-Based Processing
**Why not:** Violates privacy-first principle, requires backend infrastructure, slower for simple edits.

### WebRTC for Real-Time Editing
**Why not:** Designed for streaming, not file manipulation. Adds unnecessary complexity.

### WebGL for Video Processing
**Why not:** Canvas 2D sufficient for MVP. WebGL useful for effects (v2.0 feature).

### Electron Desktop App
**Why not:** Web-first approach more accessible. Can always wrap in Electron later if needed.

---

**Next:** See [04-implementation.md](04-implementation.md) for step-by-step build plan.
