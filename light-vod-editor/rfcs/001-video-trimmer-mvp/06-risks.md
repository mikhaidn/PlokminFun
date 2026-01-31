# 06. Risks & Mitigations

## High-Risk Issues

### 1. Browser Codec Incompatibility

**Risk:** Users upload videos in formats their browser can't decode (e.g., VP9 in Safari, H.265 in Firefox).

**Impact:** App unusable for affected videos (could be 20-30% of uploads).

**Likelihood:** HIGH

**Mitigation:**
1. **Detect codec support** on page load:
   ```typescript
   const canPlay = video.canPlayType('video/mp4; codecs="hvc1"'); // H.265
   // 'probably', 'maybe', or '' (no support)
   ```
2. **Show warning** before upload: "This browser may not support all video formats. Chrome recommended."
3. **Fallback to ffmpeg.wasm** (v1.1+): Transcode unsupported formats client-side.
4. **Documentation:** List supported formats per browser.

**Example error handling:**
```typescript
videoElement.onerror = (e) => {
  showToast({
    type: 'error',
    message: 'Video format not supported. Try converting to MP4 (H.264) first.',
    action: 'Learn More',
  });
};
```

---

### 2. Audio/Video Sync Drift

**Risk:** Web Audio API doesn't have built-in seek, so manual sync can drift over time.

**Impact:** Audio overlay out of sync by >200ms after 1 minute of playback.

**Likelihood:** MEDIUM

**Mitigation:**
1. **Periodic re-sync** every 5 seconds:
   ```typescript
   setInterval(() => {
     const drift = videoElement.currentTime - audioStartTime;
     if (Math.abs(drift) > 0.1) {
       audioEngine.restart(videoElement.currentTime);
     }
   }, 5000);
   ```
2. **Use requestAnimationFrame** for frame-accurate timing.
3. **Test with long videos** (>10 minutes) to detect drift early.
4. **Future:** Use Web Codecs API for perfect frame-level sync (Chrome/Edge only).

**Acceptance criteria:** <100ms drift over 5 minutes of playback.

---

### 3. Large File Memory Issues

**Risk:** Loading 500MB+ videos exhausts browser memory (especially on mobile).

**Impact:** Tab crashes, app becomes unresponsive.

**Likelihood:** MEDIUM (on mobile), LOW (on desktop)

**Mitigation:**
1. **File size warnings:**
   ```typescript
   if (file.size > 500 * 1024 * 1024) {
     confirm('This file is very large. Continue? (May cause slowness)');
   }
   ```
2. **Lazy-load waveform** (don't generate until timeline visible).
3. **Use Media Source Extensions** (MSE) for streaming large files (v1.2+).
4. **Downsample video preview** (show 720p preview even if source is 4K).
5. **Release memory** aggressively:
   ```typescript
   URL.revokeObjectURL(oldVideoUrl); // Free blob memory
   audioBuffer = null; // Allow GC
   ```

**Monitoring:** Track crashes via analytics (Sentry, LogRocket).

---

### 4. Export Performance (Re-Encoding)

**Risk:** Exporting 5-minute video with audio overlay takes >10 minutes (MediaRecorder is real-time only).

**Impact:** Users abandon export, poor reviews.

**Likelihood:** HIGH (for re-encode path)

**Mitigation:**
1. **Fast path for trim-only** (no re-encode):
   ```typescript
   if (!hasAudioOverlay) {
     return trimWithoutReencode(videoFile, trimStart, trimEnd);
   }
   ```
2. **Use ffmpeg.wasm** for faster-than-realtime encoding (multi-threaded).
3. **Show accurate time estimate:**
   ```typescript
   const duration = trimEnd - trimStart;
   const estimatedSeconds = duration * 1.2; // 20% overhead
   showToast(`Export will take ~${formatTime(estimatedSeconds)}`);
   ```
4. **Background export with Web Worker** (don't block UI).
5. **Cancel button** for long exports.

**Benchmark:** Test 1-minute, 5-minute, and 10-minute exports on mid-range laptop.

---

### 5. Mobile Browser Limitations

**Risk:** iOS Safari has restrictions on audio playback, file pickers, and background processing.

**Impact:** Features work on desktop but fail on mobile (50% of traffic could be mobile).

**Likelihood:** HIGH

**Mitigation:**
1. **Test early on iOS Safari** (most restrictive browser).
2. **Disable export on mobile for MVP** (show "Desktop-only feature" banner).
3. **Use progressive enhancement:**
   ```typescript
   const isMobile = /iPhone|iPad|Android/.test(navigator.userAgent);
   if (isMobile) {
     disableFeature('export');
     showToast('Export coming soon for mobile!');
   }
   ```
4. **Audio restrictions:** iOS requires user gesture to play audio.
   - Don't auto-play on load.
   - Require tap/click to start.

**Future:** Build mobile-optimized export in v1.3.

---

## Medium-Risk Issues

### 6. Timeline Performance (Canvas Rendering)

**Risk:** Rendering waveform + playhead at 60fps drops to <30fps on low-end devices.

**Impact:** Janky timeline, poor UX during playback.

**Likelihood:** MEDIUM

**Mitigation:**
1. **Debounce renders** (only redraw when needed):
   ```typescript
   let rafId: number;
   const scheduleRender = () => {
     if (rafId) return;
     rafId = requestAnimationFrame(() => {
       renderTimeline();
       rafId = 0;
     });
   };
   ```
2. **Downsample waveform** (1 sample per 2 pixels on low-end devices).
3. **Use OffscreenCanvas** (render in Web Worker for v1.2+).
4. **Profile with Chrome DevTools** on low-end devices (throttle CPU 4x).

**Target:** 60fps on 3-year-old mid-range laptop.

---

### 7. Cross-Browser Export Format Differences

**Risk:** Chrome exports WebM, Safari exports MP4 → inconsistent user experience.

**Impact:** Users confused why formats differ, some can't play exported files.

**Likelihood:** MEDIUM

**Mitigation:**
1. **Detect supported output formats:**
   ```typescript
   const supports = MediaRecorder.isTypeSupported('video/mp4');
   const format = supports ? 'video/mp4' : 'video/webm';
   ```
2. **Show format in UI:** "Export as WebM" vs "Export as MP4".
3. **Transcode to common format** with ffmpeg.wasm (v1.2+).
4. **Document limitations** in help section.

---

### 8. Undo/Redo Complexity

**Risk:** Implementing undo/redo for video state (trim points, audio overlay, volumes) is complex.

**Impact:** Users can't revert mistakes, frustrating UX.

**Likelihood:** MEDIUM (if implemented poorly)

**Mitigation:**
1. **Defer to v1.1** (not MVP blocker).
2. **Use immutable state** for easy history tracking:
   ```typescript
   type EditorState = { trimStart: number; trimEnd: number; ... };
   const history: EditorState[] = [];
   ```
3. **Reuse pattern from CardGames** (useGameHistory hook).
4. **Limit history size** (max 50 states to avoid memory bloat).

---

## Low-Risk Issues

### 9. Accessibility Gaps

**Risk:** Keyboard shortcuts conflict with browser defaults, screen readers don't announce states.

**Impact:** Inaccessible to disabled users, legal risk (ADA compliance).

**Likelihood:** LOW (if planned proactively)

**Mitigation:**
1. **Follow WCAG 2.1 AA guidelines** from start.
2. **Test with screen reader** (NVDA, VoiceOver).
3. **Avoid conflicting shortcuts:**
   - Use Shift/Alt modifiers (e.g., `Shift+Space` instead of `Space`).
4. **ARIA live regions** for time updates:
   ```typescript
   <div role="status" aria-live="polite">
     Current time: {formatTime(currentTime)}
   </div>
   ```

---

### 10. Project Scope Creep

**Risk:** Users request features beyond MVP (multi-track editing, effects, filters).

**Impact:** Development time balloons, MVP delayed.

**Likelihood:** HIGH (feature requests inevitable)

**Mitigation:**
1. **Define MVP boundaries clearly** (see RFC-001 README.md).
2. **Say "no" to feature requests** until MVP ships.
3. **Maintain public roadmap** (show "Coming in v1.1" vs "Not planned").
4. **Track requests in GitHub Issues** (prioritize post-MVP).

**Mantra:** "Ship simple, iterate fast."

---

### 11. Incorrect Waveform Rendering

**Risk:** Waveform doesn't match actual audio (downsampling bug).

**Impact:** Misleading visualization, users can't align audio properly.

**Likelihood:** LOW (easy to test)

**Mitigation:**
1. **Test with known audio files** (sine wave, white noise).
2. **Visual comparison** with Audacity waveform.
3. **Unit tests** for downsampling logic (see 05-testing.md).

---

### 12. Privacy Concerns (Local Processing)

**Risk:** Users worry files are uploaded to servers.

**Impact:** Distrust, users avoid app.

**Likelihood:** LOW (if communicated clearly)

**Mitigation:**
1. **Prominent "100% Local" badge** on landing page.
2. **Open source code** (build trust via transparency).
3. **Privacy policy:** "We never see your files. All processing happens in your browser."
4. **No analytics on file content** (only usage stats).

---

## Dependency Risks

### External Libraries

| Library | Risk | Mitigation |
|---------|------|------------|
| None (vanilla Web APIs) | Browsers deprecate APIs | Monitor web-platform-tests, use polyfills |
| Wavesurfer.js (optional) | Maintenance停止 | Fork if needed, small library |
| ffmpeg.wasm (v1.1+) | Large bundle size | Lazy-load, only when needed |

**Decision:** Minimize dependencies, use native APIs where possible.

---

## Monitoring & Alerts

### Production Metrics (v1.0+)

Track in analytics dashboard:
- **Error rate:** Video load failures, export crashes
- **Performance:** p50/p95 load times, export times
- **Browser distribution:** Identify unsupported browsers
- **File sizes:** Average upload size (optimize limits)

### Error Tracking

Use Sentry (or similar) for:
- Uncaught exceptions
- Video/audio decode errors
- Export failures
- Memory crashes

---

## Contingency Plans

### If MVP Takes Longer Than 4 Days
1. **Cut waveform visualization** (ship in v0.2).
2. **Simplify timeline** (basic scrubber, no fancy rendering).
3. **Defer volume controls** (use fixed 100% volume).

### If Browser Support Is Worse Than Expected
1. **Add browser requirement banner:** "Works best in Chrome/Edge."
2. **Build ffmpeg.wasm fallback** (v0.1.5 hotfix).
3. **Document workarounds** (convert files externally).

### If Export Performance Is Unacceptable
1. **Ship without export** (preview-only tool).
2. **Add "Copy trim times" feature** (users can trim in VLC/ffmpeg manually).
3. **Explore server-side export** (future v2.0, requires backend).

---

## Risk Summary

| Risk | Impact | Likelihood | Priority | Mitigation |
|------|--------|-----------|----------|-----------|
| Codec incompatibility | HIGH | HIGH | P0 | Format detection + docs |
| Audio sync drift | MEDIUM | MEDIUM | P1 | Periodic re-sync |
| Large file memory | HIGH | MEDIUM | P1 | Size warnings + MSE |
| Export performance | HIGH | HIGH | P0 | Fast path + ffmpeg.wasm |
| Mobile limitations | MEDIUM | HIGH | P1 | Test early + disable export |
| Timeline performance | MEDIUM | MEDIUM | P2 | Debounce + downsample |
| Format differences | LOW | MEDIUM | P2 | Format detection |
| Scope creep | MEDIUM | HIGH | P0 | Clear boundaries |

**Overall risk level:** MEDIUM. Most risks have viable mitigations.

---

**Next:** Review [README.md](README.md) for implementation timeline and approval.
