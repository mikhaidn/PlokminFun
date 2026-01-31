# 05. Testing Strategy

## Overview

Video editing involves complex state management, timing synchronization, and browser APIs. Testing strategy focuses on:
1. **Unit tests** for core engines (deterministic logic)
2. **Integration tests** for component interactions
3. **Manual tests** for browser compatibility and real-world files
4. **Performance tests** for large files and long operations

**Tools:**
- Vitest (unit/integration tests)
- Testing Library (React component tests)
- Playwright (E2E, optional for v1.0+)
- Manual testing matrix (browsers/devices)

---

## Unit Tests

### VideoEngine (`src/core/VideoEngine.ts`)

**Goal:** Ensure video loading, playback, and seeking work correctly.

```typescript
describe('VideoEngine', () => {
  it('loads video and extracts metadata', async () => {
    const file = createMockVideoFile(); // Helper: creates Blob with video/mp4 MIME
    const engine = new VideoEngine();
    const metadata = await engine.loadVideo(file);

    expect(metadata.duration).toBeGreaterThan(0);
    expect(metadata.width).toBeGreaterThan(0);
    expect(metadata.codec).toBeDefined();
  });

  it('emits timeupdate events during playback', async () => {
    const engine = new VideoEngine();
    await engine.loadVideo(createMockVideoFile());

    const times: number[] = [];
    engine.on('timeupdate', () => {
      times.push(engine.getCurrentTime());
    });

    engine.play();
    await wait(1000); // Wait 1 second
    engine.pause();

    expect(times.length).toBeGreaterThan(5); // Should emit ~10-30 times/sec
    expect(times[times.length - 1]).toBeGreaterThan(0.5); // Played ~1 second
  });

  it('seeks to correct position', async () => {
    const engine = new VideoEngine();
    await engine.loadVideo(createMockVideoFile());

    engine.seek(5.5);
    expect(engine.getCurrentTime()).toBeCloseTo(5.5, 1); // ±0.1s tolerance
  });

  it('clamps seek beyond duration', async () => {
    const engine = new VideoEngine();
    await engine.loadVideo(createMockVideoFile()); // 10s duration

    engine.seek(999);
    expect(engine.getCurrentTime()).toBeLessThanOrEqual(10);
  });
});
```

**Coverage target:** >95% for core logic paths.

---

### AudioEngine (`src/core/AudioEngine.ts`)

**Goal:** Ensure audio decoding, volume control, and sync logic work.

```typescript
describe('AudioEngine', () => {
  it('decodes audio file to AudioBuffer', async () => {
    const file = createMockAudioFile(); // MP3 blob
    const engine = new AudioEngine();
    await engine.loadAudio(file);

    const buffer = engine.getAudioBuffer();
    expect(buffer).toBeDefined();
    expect(buffer.duration).toBeGreaterThan(0);
  });

  it('sets volume via GainNode', async () => {
    const engine = new AudioEngine();
    await engine.loadAudio(createMockAudioFile());

    engine.setVolume(0.5);
    expect(engine.getVolume()).toBe(0.5);

    engine.setVolume(1.5);
    expect(engine.getVolume()).toBe(1.5);
  });

  it('plays audio at correct offset', async () => {
    const engine = new AudioEngine();
    await engine.loadAudio(createMockAudioFile()); // 30s audio

    engine.play(10); // Start at 10 seconds
    await wait(1000);

    // After playing 1 second from offset 10, current time should be ~11
    expect(engine.getCurrentTime()).toBeCloseTo(11, 1);
  });
});
```

**Mocking:** Use `AudioContext` mock or real Web Audio API (supported in jsdom with polyfill).

---

### SyncEngine (`src/core/SyncEngine.ts`)

**Goal:** Ensure video and audio stay synchronized.

```typescript
describe('SyncEngine', () => {
  it('starts video and audio in sync', async () => {
    const videoEngine = new VideoEngine();
    const audioEngine = new AudioEngine();
    await videoEngine.loadVideo(createMockVideoFile());
    await audioEngine.loadAudio(createMockAudioFile());

    const syncEngine = new SyncEngine(videoEngine, audioEngine);
    syncEngine.play();

    await wait(500);

    const videoTime = videoEngine.getCurrentTime();
    const audioTime = audioEngine.getCurrentTime();
    expect(Math.abs(videoTime - audioTime)).toBeLessThan(0.1); // <100ms drift
  });

  it('re-syncs audio after seek', async () => {
    // ... setup ...
    syncEngine.play();
    await wait(1000);

    syncEngine.seek(5);
    await wait(100); // Brief delay for sync

    const videoTime = videoEngine.getCurrentTime();
    const audioTime = audioEngine.getCurrentTime();
    expect(videoTime).toBeCloseTo(5, 1);
    expect(audioTime).toBeCloseTo(5, 1);
  });
});
```

**Key test:** Drift tolerance <100ms over 30 seconds of playback.

---

### WaveformEngine (`src/core/WaveformEngine.ts`)

**Goal:** Ensure waveform data is generated correctly.

```typescript
describe('WaveformEngine', () => {
  it('generates correct number of samples', async () => {
    const audioBuffer = createMockAudioBuffer(44100, 10); // 10s at 44.1kHz
    const engine = new WaveformEngine();

    const waveform = await engine.generateWaveform(audioBuffer, 1000);
    expect(waveform.length).toBe(1000); // 1000 pixels
  });

  it('downsamples audio correctly', async () => {
    const audioBuffer = createMockAudioBuffer(44100, 1); // 1s
    const engine = new WaveformEngine();

    const waveform = await engine.generateWaveform(audioBuffer, 100);

    // Each sample should be max of ~441 samples (44100 / 100)
    expect(waveform[0]).toBeLessThanOrEqual(1.0); // Normalized
    expect(waveform[50]).toBeLessThanOrEqual(1.0);
  });
});
```

---

## Integration Tests

### Timeline + VideoEngine

**Goal:** Ensure timeline updates when video plays and handles user interactions.

```typescript
describe('Timeline Integration', () => {
  it('updates playhead position during playback', async () => {
    const { getByTestId } = render(<VideoEditorApp />);
    const fileInput = getByTestId('video-input');

    // Upload video
    await uploadFile(fileInput, createMockVideoFile());

    // Play video
    const playButton = getByTestId('play-button');
    fireEvent.click(playButton);

    await wait(1000);

    // Check playhead moved
    const timeline = getByTestId('timeline');
    const playhead = timeline.querySelector('.playhead');
    const position = getComputedStyle(playhead).left;

    expect(parseInt(position)).toBeGreaterThan(0);
  });

  it('seeks video when clicking timeline', async () => {
    const { getByTestId } = render(<VideoEditorApp />);
    await uploadFile(getByTestId('video-input'), createMockVideoFile());

    const timeline = getByTestId('timeline');
    const rect = timeline.getBoundingClientRect();

    // Click at 50% of timeline
    fireEvent.click(timeline, {
      clientX: rect.left + rect.width * 0.5,
    });

    const video = getByTestId('video-player') as HTMLVideoElement;
    expect(video.currentTime).toBeCloseTo(5, 1); // 50% of 10s video
  });
});
```

---

### TrimHandle Constraints

**Goal:** Ensure trim handles can't create invalid states.

```typescript
describe('Trim Handles', () => {
  it('prevents trim start from exceeding trim end', async () => {
    const { getByTestId } = render(<VideoEditorApp />);
    await uploadFile(getByTestId('video-input'), createMockVideoFile());

    const trimStart = getByTestId('trim-start-handle');
    const trimEnd = getByTestId('trim-end-handle');

    // Drag trim start to 8s, trim end at 5s
    dragElement(trimStart, { x: 800 }); // 80% of 10s = 8s
    dragElement(trimEnd, { x: 500 }); // 50% of 10s = 5s

    // Trim start should be clamped to trim end
    const state = getEditorState();
    expect(state.trimStart).toBeLessThan(state.trimEnd);
  });
});
```

---

### Audio Overlay + Volume

**Goal:** Ensure audio overlay loads and volume controls work.

```typescript
describe('Audio Overlay', () => {
  it('loads audio and updates state', async () => {
    const { getByTestId } = render(<VideoEditorApp />);
    await uploadFile(getByTestId('video-input'), createMockVideoFile());

    const audioInput = getByTestId('audio-input');
    await uploadFile(audioInput, createMockAudioFile());

    const state = getEditorState();
    expect(state.audioTrack).toBeDefined();
    expect(state.audioTrack.duration).toBeGreaterThan(0);
  });

  it('adjusts volume in real-time', async () => {
    const { getByTestId } = render(<VideoEditorApp />);
    await setupVideoAndAudio(); // Helper

    const volumeSlider = getByTestId('audio-volume-slider');
    fireEvent.change(volumeSlider, { target: { value: '1.5' } });

    const state = getEditorState();
    expect(state.audioVolume).toBe(1.5);

    // Verify GainNode updated (requires mocking Web Audio API)
    const audioEngine = getAudioEngine();
    expect(audioEngine.getVolume()).toBe(1.5);
  });
});
```

---

## E2E Tests (Optional for v1.0+)

Use Playwright for full user workflows:

```typescript
test('complete editing workflow', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Upload video
  await page.setInputFiles('input[type="file"][accept="video/*"]', 'test-video.mp4');
  await expect(page.locator('video')).toBeVisible();

  // Set trim points
  await page.locator('[data-testid="trim-start-handle"]').dragTo({ x: 100 });
  await page.locator('[data-testid="trim-end-handle"]').dragTo({ x: 500 });

  // Add audio overlay
  await page.setInputFiles('input[accept="audio/*"]', 'test-audio.mp3');
  await expect(page.locator('.waveform')).toBeVisible();

  // Adjust volume
  await page.locator('[data-testid="audio-volume-slider"]').fill('1.2');

  // Play preview
  await page.click('[data-testid="play-button"]');
  await page.waitForTimeout(2000);
  await page.click('[data-testid="pause-button"]');

  // Export (v1.0 feature)
  await page.click('[data-testid="export-button"]');
  await expect(page.locator('.export-progress')).toBeVisible();
  await expect(page.locator('[data-testid="download-link"]')).toBeVisible({ timeout: 30000 });
});
```

---

## Manual Testing Matrix

### Browser Compatibility

Test on latest versions of:

| Browser | Desktop | Mobile | Priority |
|---------|---------|--------|----------|
| Chrome | ✅ Required | ✅ Required | P0 |
| Edge | ✅ Required | N/A | P0 |
| Firefox | ✅ Required | ✅ Optional | P1 |
| Safari | ✅ Required | ✅ Required (iOS) | P0 |
| Samsung Internet | N/A | ⚠️ Optional | P2 |

### Test Videos

Use diverse formats and sizes:

| File | Size | Duration | Codec | Purpose |
|------|------|----------|-------|---------|
| small.mp4 | 5MB | 30s | H.264 | Fast iteration |
| medium.webm | 50MB | 5min | VP9 | Common format |
| large.mov | 500MB | 20min | H.264 | Stress test |
| vertical.mp4 | 10MB | 1min | H.264 | Mobile video |
| audio-only.mp3 | 3MB | 2min | MP3 | Audio overlay |
| 4k.mp4 | 100MB | 1min | H.265 | High resolution |

### Performance Benchmarks

Target metrics:

| Operation | Target | Acceptable | Fail |
|-----------|--------|-----------|------|
| Load 100MB video | <3s | <5s | >10s |
| Generate waveform | <2s | <5s | >10s |
| Seek (any time) | <200ms | <500ms | >1s |
| Playback (60fps) | >55fps | >30fps | <30fps |
| Export trim-only (1min) | <5s | <10s | >30s |
| Export re-encode (1min) | <60s | <120s | >300s |

**Measurement:** Chrome DevTools Performance tab, Network throttling (Fast 3G).

---

## Accessibility Testing

### Keyboard Navigation
- Tab through all controls
- Space bar play/pause
- Arrow keys seek
- I/O keys set trim points

### Screen Reader
- ARIA labels on all buttons
- Announce time updates
- Describe trim region changes

### Visual
- Focus indicators visible
- High contrast mode compatible
- Minimum touch target size: 44x44px

---

## Regression Testing

After each PR, verify:
- [ ] All unit tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Linter passes (`npm run lint`)
- [ ] Manual smoke test (load video, trim, play)
- [ ] Cross-browser check (Chrome + Safari minimum)

---

## Test Data Management

**Mock Files:**
```typescript
// test/mocks/media.ts
export const createMockVideoFile = (durationSeconds = 10): File => {
  // Generate minimal valid MP4 blob
  // Use libraries like `create-test-video` or pre-generated fixtures
};

export const createMockAudioFile = (durationSeconds = 30): File => {
  // Generate minimal valid MP3 blob
};

export const createMockAudioBuffer = (
  sampleRate: number,
  durationSeconds: number
): AudioBuffer => {
  const context = new OfflineAudioContext(1, sampleRate * durationSeconds, sampleRate);
  return context.createBuffer(1, sampleRate * durationSeconds, sampleRate);
};
```

**Fixture Files:**
Store real media files in `test/fixtures/`:
- `test/fixtures/video-short.mp4` (10s, 5MB)
- `test/fixtures/audio-music.mp3` (30s, 3MB)

---

## Coverage Goals

| Layer | Target Coverage |
|-------|----------------|
| Core Engines | >95% |
| Components | >80% |
| Hooks | >90% |
| Integration | >70% |
| Overall | >85% |

**Measure:** `npm run test -- --coverage`

---

## Testing Priorities

**MVP (must have):**
- ✅ Unit tests for all engines
- ✅ Integration tests for timeline + playback
- ✅ Manual browser compatibility tests

**v1.0 (should have):**
- ✅ E2E tests for export workflow
- ✅ Performance benchmarks
- ✅ Cross-browser automated tests (Playwright)

**v1.1+ (nice to have):**
- Visual regression tests (Percy, Chromatic)
- Accessibility audits (axe-core)
- Load testing (concurrent users in PWA mode)

---

**Next:** See [06-risks.md](06-risks.md) for potential issues and mitigations.
