# Migration Guide: Monolithic → Modular

Step-by-step guide to complete the modularization of Light VOD Editor.

## ✅ What's Done

- [x] `modules/state.js` - State management with getters/setters
- [x] `modules/utils.js` - Formatting and helper functions
- [x] `modules/commands.js` - FFmpeg command generation
- [x] `modules/segments.js` - Segment CRUD and rendering
- [x] `ARCHITECTURE.md` - Complete architecture documentation

## 🚧 What's Left

- [ ] `modules/timeline.js` - Timeline rendering and dragging
- [ ] `modules/markers.js` - Marker management
- [ ] `modules/voiceover.js` - Audio recording
- [ ] `modules/ui.js` - Shared UI utilities
- [ ] `styles/*.css` - Extract CSS
- [ ] `index.html` - New modular entry point
- [ ] Testing and validation

## 📋 Step-by-Step Migration

### Step 1: Extract Timeline Module (~1-2 hours)

**File:** `modules/timeline.js`

**What to extract from `trimmer-multi.html`:**
```javascript
// Lines ~1200-1350 (timeline rendering)
function renderTimeline() { ... }
function attachDragListeners() { ... }

// Mouse event handlers
document.addEventListener('mousemove', ...)
document.addEventListener('mouseup', ...)

// Timeline click handler
timeline.addEventListener('click', ...)
timeline.addEventListener('wheel', ...)
```

**Module structure:**
```javascript
// modules/timeline.js
import { getSegments, getVideoDuration, getMarkers } from './state.js';

export function renderTimeline(container) {
  // Draw segments, handles, markers
}

export function attachEventListeners(timelineEl, videoEl, callbacks) {
  // Mouse/touch events for dragging
  // Wheel event for scrubbing
  // Click event for seeking
}

export function updatePlayhead(playheadEl, currentTime) {
  // Update red playhead position
}
```

**Callbacks:**
```javascript
{
  onSegmentDrag: (index, newStart, newEnd) => {},
  onHandleDrag: (index, type, newValue) => {},
  onSeek: (time) => {},
  onScrub: (delta) => {}
}
```

---

### Step 2: Extract Markers Module (~30 min)

**File:** `modules/markers.js`

**What to extract:**
```javascript
// Lines ~1370-1425 (marker functions)
window.addMarker = () => { ... }
function removeMarker(index) { ... }
function jumpToMarker(index) { ... }
function renderMarkers() { ... }
```

**Module structure:**
```javascript
// modules/markers.js
import { addMarker as addMarkerToState, getMarkers } from './state.js';
import { formatTime } from './utils.js';

export function createMarker(name, time) {
  return addMarkerToState({ name, time });
}

export function deleteMarker(index) { ... }

export function renderMarkersList(container, callbacks) {
  // Render marker list UI
}

export function renderMarkersOnTimeline(timelineEl, videoDuration) {
  // Draw pins on timeline
}

export function jumpToMarker(index, videoEl) {
  const markers = getMarkers();
  videoEl.currentTime = markers[index].time;
}
```

---

### Step 3: Extract Voiceover Module (~1 hour)

**File:** `modules/voiceover.js`

**What to extract:**
```javascript
// Lines ~1425-1630 (voiceover functions)
window.addVoiceoverTrack = () => { ... }
window.startRecordingTrack = async (trackId) => { ... }
window.stopRecordingTrack = (trackId) => { ... }
function renderVoiceoverTracks() { ... }
```

**Module structure:**
```javascript
// modules/voiceover.js
import {
  addVoiceoverTrack,
  getVoiceoverTrack,
  updateVoiceoverTrack,
  setCurrentRecordingTrackId
} from './state.js';
import { downloadBlob } from './utils.js';

let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;

export async function startRecording(trackId) {
  // Request microphone access
  // Start MediaRecorder
  // Update UI
}

export function stopRecording() {
  // Stop recording
  // Save blob to track
}

export function downloadTrack(trackId) {
  const track = getVoiceoverTrack(trackId);
  downloadBlob(track.blob, track.filename);
}

export function renderVoiceoverTracks(container, callbacks) {
  // Render voiceover UI
}
```

---

### Step 4: Extract Shared UI Module (~30 min)

**File:** `modules/ui.js`

**What to create:**
```javascript
// modules/ui.js

export function showToast(message, type = 'info') {
  // Show temporary notification
  // Auto-dismiss after 3 seconds
}

export function showConfirm(message) {
  // Better than window.confirm()
  // Return Promise<boolean>
}

export async function showPrompt(message, defaultValue = '') {
  // Better than window.prompt()
  // Return Promise<string | null>
}

export function setButtonState(button, state) {
  // state: 'loading', 'success', 'error', 'normal'
  // Update button text/icon/disabled
}

export function updateStats(stats) {
  // Update stat cards (duration, size, segments, etc.)
}
```

---

### Step 5: Extract CSS (~30 min)

**Create:** `styles/main.css`, `styles/timeline.css`, `styles/components.css`

**Extract from `<style>` tag in trimmer-multi.html:**

**main.css** - Base styles:
```css
/* Reset, typography, layout */
* { box-sizing: border-box; }
body { ... }
h1, h2 { ... }
.section { ... }
```

**timeline.css** - Timeline-specific:
```css
.timeline { ... }
.playhead { ... }
.trim-region { ... }
.trim-handle { ... }
.marker { ... }
```

**components.css** - Reusable components:
```css
button { ... }
.segment-item { ... }
.stat-card { ... }
.command-output { ... }
.voiceover-track { ... }
```

---

### Step 6: Create New index.html (~1 hour)

**File:** `index.html` (new modular version)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Light VOD Editor - Multi-Segment</title>

  <!-- Styles -->
  <link rel="stylesheet" href="styles/main.css">
  <link rel="stylesheet" href="styles/timeline.css">
  <link rel="stylesheet" href="styles/components.css">
</head>
<body>
  <h1>🎬 Light VOD Editor</h1>
  <p class="subtitle">Fast, local, private video trimming.</p>

  <!-- Same HTML structure as trimmer-multi.html -->
  <div class="section" id="loadSection">...</div>
  <div class="section" id="previewSection">...</div>
  <div class="section" id="trimSection">...</div>
  <!-- etc. -->

  <!-- Main app script -->
  <script type="module">
    import * as State from './modules/state.js';
    import * as Utils from './modules/utils.js';
    import * as Segments from './modules/segments.js';
    import * as Commands from './modules/commands.js';
    import * as Timeline from './modules/timeline.js';
    import * as Markers from './modules/markers.js';
    import * as Voiceover from './modules/voiceover.js';
    import * as UI from './modules/ui.js';

    // DOM elements
    const videoInput = document.getElementById('videoInput');
    const preview = document.getElementById('preview');
    const timelineEl = document.getElementById('timeline');
    // etc.

    // Initialize app
    function init() {
      setupVideoLoader();
      setupTimeline();
      setupSegments();
      setupMarkers();
      setupVoiceover();
      setupKeyboardShortcuts();
    }

    function setupVideoLoader() {
      videoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        State.setCurrentFile(file);
        preview.src = URL.createObjectURL(file);

        await new Promise(resolve => {
          preview.onloadedmetadata = resolve;
        });

        State.setVideoDuration(preview.duration);
        showSections();
        updateUI();
      });
    }

    function setupTimeline() {
      Timeline.attachEventListeners(timelineEl, preview, {
        onSegmentDrag: (index, start, end) => {
          Segments.updateSegmentStart(index, start);
          Segments.updateSegmentEnd(index, end);
          updateUI();
        },
        onSeek: (time) => {
          preview.currentTime = time;
        }
      });

      preview.addEventListener('timeupdate', () => {
        Timeline.updatePlayhead(
          document.getElementById('playhead'),
          preview.currentTime
        );
      });
    }

    function setupSegments() {
      // "Add Segment" button
      document.getElementById('addSegmentBtn').addEventListener('click', () => {
        const index = Segments.createSegmentAtTime(preview.currentTime);
        State.setSelectedSegmentIndex(index);
        updateUI();
      });
    }

    function setupMarkers() {
      document.getElementById('addMarkerBtn').addEventListener('click', () => {
        const name = prompt('Marker name:');
        if (!name) return;

        Markers.createMarker(name, preview.currentTime);
        updateUI();
      });
    }

    function setupVoiceover() {
      // Voiceover UI setup
    }

    function setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            preview.currentTime -= e.shiftKey ? 5 : 0.033;
            break;
          case 'ArrowRight':
            e.preventDefault();
            preview.currentTime += e.shiftKey ? 5 : 0.033;
            break;
          case ' ':
            e.preventDefault();
            preview.paused ? preview.play() : preview.pause();
            break;
        }
      });
    }

    function updateUI() {
      // Render everything
      Segments.renderSegmentsList(
        document.getElementById('segmentList'),
        {
          onSelect: (index) => {
            State.setSelectedSegmentIndex(index);
            preview.currentTime = State.getSegment(index).start;
            updateUI();
          },
          onDelete: (index) => {
            if (confirm('Delete segment?')) {
              Segments.deleteSegment(index);
              updateUI();
            }
          },
          onPreview: (index) => {
            const seg = State.getSegment(index);
            preview.currentTime = seg.start;
            preview.play();
            setTimeout(() => {
              if (preview.currentTime >= seg.end) {
                preview.pause();
              }
            }, (seg.end - seg.start) * 1000);
          }
        }
      );

      Timeline.renderTimeline(timelineEl);
      Markers.renderMarkersList(document.getElementById('markersList'));

      updateCommands();
      updateStats();
    }

    function updateCommands() {
      const mode = State.getExportMode();
      const command = Commands.getCommand(mode);
      document.getElementById(`${mode}Command`).textContent = command;
    }

    function updateStats() {
      UI.updateStats({
        duration: State.getVideoDuration(),
        segments: State.getSegments().length,
        markers: State.getMarkers().length,
        totalDuration: Segments.getTotalDuration()
      });
    }

    // Start app
    init();
  </script>
</body>
</html>
```

---

### Step 7: Testing (~1-2 hours)

**Manual Testing Checklist:**
- [ ] Load video file
- [ ] Add 3+ segments
- [ ] Drag handles (start, end, whole segment)
- [ ] Add markers
- [ ] Use marker in voiceover
- [ ] Record voiceover
- [ ] Copy commands
- [ ] Keyboard shortcuts work
- [ ] Horizontal scroll works
- [ ] Export mode toggle works

**Cross-browser:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari

**Compare:**
- [ ] Feature parity with `trimmer-multi.html`
- [ ] Performance is similar or better
- [ ] No regressions

---

## 🎯 Benefits After Migration

### Before
```
trimmer-multi.html (2000 lines, 54 KB)
❌ Hard to navigate
❌ Can't test logic
❌ One person at a time
❌ Merge conflicts likely
```

### After
```
index.html (300 lines, 10 KB)
modules/*.js (1200 lines total, 40 KB)
styles/*.css (400 lines, 14 KB)

✅ Easy to find code
✅ Unit testable
✅ Parallel development
✅ Smaller files
```

## 🚀 Next Steps After Migration

1. **Add unit tests** - Start with utils.js and commands.js
2. **TypeScript** - Add type safety
3. **Build step** - Vite for bundling
4. **State observers** - Auto-update UI on state changes
5. **Web Components** - Encapsulate UI components
6. **React version** - Reuse all business logic modules

---

## 💡 Tips

**Don't migrate everything at once:**
- Start with one module at a time
- Keep `trimmer-multi.html` as reference
- Test after each module is integrated

**Preserve git history:**
```bash
git mv trimmer-multi.html trimmer-multi-legacy.html
git commit -m "chore: rename monolithic version to legacy"
```

**Use feature flags:**
```javascript
const USE_MODULAR_VERSION = true;
if (USE_MODULAR_VERSION) {
  // Load modules
} else {
  // Fallback to monolithic
}
```

---

**Estimated total time:** 4-6 hours for complete migration + testing

**Current progress:** ~30% complete (state, utils, commands, segments)

**Next step:** Create `modules/timeline.js` (highest priority, most complex)
