# Architecture - Light VOD Editor

This document explains the modular architecture designed to break up the monolithic 2000-line HTML file.

## 🎯 Goals

1. **Reduce context overload** - Each module has a single responsibility
2. **Improve maintainability** - Changes are isolated to relevant modules
3. **Enable testing** - Pure functions can be unit tested
4. **Support collaboration** - Multiple devs can work on different modules
5. **Gradual migration** - Can migrate piece by piece to React later

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                          │
│                   (Main Entry Point)                     │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼──────┐    ┌─────▼─────┐
   │  State  │      │  Timeline  │    │ Segments  │
   │ Manager │◄─────┤  Component │◄───┤  Manager  │
   └────┬────┘      └─────┬──────┘    └─────┬─────┘
        │                 │                  │
        │           ┌─────▼──────┐    ┌─────▼─────┐
        └───────────┤  Commands  │    │  Markers  │
                    │  Generator │    │  Manager  │
                    └────────────┘    └─────┬─────┘
                           │                │
                     ┌─────▼──────┐  ┌─────▼─────┐
                     │  Voiceover │  │   Utils   │
                     │   Manager  │  │  (Helpers)│
                     └────────────┘  └───────────┘
```

## 📦 Module Structure

### Core Modules

#### 1. **state.js** - State Management
**Purpose:** Centralized state store with getters/setters

**Responsibilities:**
- Hold all application state
- Provide safe getters/setters
- Prevent direct state mutation
- Enable state debugging

**State Schema:**
```javascript
{
  // Video
  currentFile: File | null,
  videoDuration: number,

  // Segments
  segments: [{ start: number, end: number }],
  selectedSegmentIndex: number | null,
  exportMode: 'concat' | 'split',

  // Dragging
  isDragging: boolean,
  dragSegmentIndex: number | null,
  dragHandleType: 'start' | 'end' | 'segment' | null,
  dragStartX: number | null,
  dragStartSegment: { start, end } | null,

  // Markers
  markers: [{ name: string, time: number }],

  // Voiceover
  voiceoverTracks: [{
    id: number,
    startTime: number,
    startMarker: string | null,
    blob: Blob | null,
    filename: string
  }],
  currentRecordingTrackId: number | null,
  nextTrackId: number
}
```

**API:**
```javascript
// Getters
getSegments()
getMarkers()
getVideoDuration()

// Setters
setVideoDuration(duration)
setExportMode(mode)

// CRUD
addSegment(segment)
updateSegment(index, updates)
removeSegment(index)
```

---

#### 2. **segments.js** - Segment Management
**Purpose:** Business logic for segment CRUD and rendering

**Responsibilities:**
- Create/update/delete segments
- Validate segment boundaries
- Detect overlaps
- Render segment list UI
- Handle segment interactions

**API:**
```javascript
createSegmentAtTime(currentTime, duration)
createSegmentCentered(currentTime, duration)
updateSegmentStart(index, start)
updateSegmentEnd(index, end)
moveSegment(index, newStart)
deleteSegment(index)
renderSegmentsList(container, callbacks)
detectOverlaps()
getTotalDuration()
```

---

#### 3. **timeline.js** - Timeline Component *(TODO)*
**Purpose:** Render and manage timeline UI

**Responsibilities:**
- Render timeline track
- Draw segment regions
- Draw drag handles
- Handle mouse/touch events
- Update playhead position
- Render markers on timeline

**API:**
```javascript
renderTimeline(container)
attachEventListeners(video, callbacks)
updatePlayhead(time)
handleDragStart(event)
handleDragMove(event)
handleDragEnd(event)
```

---

#### 4. **markers.js** - Marker Management *(TODO)*
**Purpose:** Manage labeled timestamp markers

**Responsibilities:**
- Create/update/delete markers
- Render marker UI
- Jump to marker time
- Export/import markers

**API:**
```javascript
createMarker(name, time)
deleteMarker(index)
jumpToMarker(index)
renderMarkers(container, callbacks)
exportMarkers() // JSON
importMarkers(json)
```

---

#### 5. **voiceover.js** - Voiceover Recording *(TODO)*
**Purpose:** Handle audio recording and track management

**Responsibilities:**
- Record audio via MediaRecorder
- Manage multiple voiceover tracks
- Handle recording state
- Render voiceover UI
- Download audio files

**API:**
```javascript
startRecording(trackId)
stopRecording()
downloadTrack(trackId)
renderVoiceoverTracks(container, callbacks)
```

---

#### 6. **commands.js** - FFmpeg Command Generator
**Purpose:** Generate optimized FFmpeg commands

**Responsibilities:**
- Build concat commands (merge)
- Build split commands (separate files)
- Build voiceover mix commands
- Handle filter chains

**API:**
```javascript
generateConcatCommand()
generateSplitCommands()
generateVoiceoverCommand()
getCommand(mode)
```

---

#### 7. **utils.js** - Utility Functions
**Purpose:** Shared helper functions

**Responsibilities:**
- Format times (display, FFmpeg)
- Format file sizes
- Clipboard operations
- Blob downloads
- Debouncing, clamping, etc.

**API:**
```javascript
formatTime(seconds)
formatTimeFFmpeg(seconds)
formatBytes(bytes)
copyToClipboard(text)
downloadBlob(blob, filename)
clamp(value, min, max)
debounce(func, wait)
```

---

### UI Modules

#### 8. **ui.js** - Shared UI Utilities *(TODO)*
**Purpose:** Common UI patterns and components

**Responsibilities:**
- Show toast notifications
- Confirm dialogs
- Loading states
- Button feedback (copied, loading, etc.)

**API:**
```javascript
showToast(message, type)
showConfirm(message)
setButtonState(button, state) // loading, success, error
```

---

## 📂 File Structure

```
light-vod-editor/
├── index.html                     # New modular entry point
├── trimmer-multi.html             # Legacy monolithic version (keep for reference)
│
├── modules/
│   ├── state.js                   # ✅ State management
│   ├── utils.js                   # ✅ Utilities
│   ├── commands.js                # ✅ FFmpeg command generation
│   ├── segments.js                # ✅ Segment CRUD
│   ├── timeline.js                # TODO: Timeline rendering
│   ├── markers.js                 # TODO: Marker management
│   ├── voiceover.js               # TODO: Audio recording
│   └── ui.js                      # TODO: Shared UI utilities
│
├── styles/
│   ├── main.css                   # TODO: Base styles
│   ├── timeline.css               # TODO: Timeline-specific styles
│   └── components.css             # TODO: Buttons, cards, inputs
│
├── README.md
├── ROADMAP.md
├── ARCHITECTURE.md                # This file
└── DEVELOPMENT_NOTES.md
```

## 🔄 Data Flow

### 1. User adds a segment

```
User clicks "Add Segment"
   ↓
segments.createSegmentAtTime(currentTime)
   ↓
state.addSegment({ start, end })
   ↓
segments.renderSegmentsList(container)
timeline.renderTimeline(container)
commands.updateCommands()
```

### 2. User drags segment handle

```
User mousedown on handle
   ↓
timeline.handleDragStart(event)
   ↓
state.setDragState({ isDragging: true, ... })
   ↓
User mousemove
   ↓
timeline.handleDragMove(event)
   ↓
segments.updateSegmentStart(index, newTime)
   ↓
state.updateSegment(index, { start: newTime })
   ↓
timeline.renderTimeline()
video.currentTime = newTime (scrub)
```

### 3. User copies command

```
User clicks "Copy Command"
   ↓
commands.getCommand(exportMode)
   ↓
utils.copyToClipboard(command)
   ↓
ui.showToast('Copied!')
```

## 🎨 Design Patterns

### 1. **Module Pattern**
Each module exports a public API and keeps internals private.

```javascript
// state.js
const state = { /* private */ };

export function getSegments() {
  return state.segments; // public API
}
```

### 2. **Observer Pattern** (Future)
State changes trigger UI updates automatically.

```javascript
// Future: state.js
const listeners = [];

export function subscribe(callback) {
  listeners.push(callback);
}

function notifyListeners() {
  listeners.forEach(cb => cb(state));
}
```

### 3. **Dependency Injection**
Modules accept callbacks instead of hardcoding dependencies.

```javascript
// segments.js
renderSegmentsList(container, {
  onSelect: (index) => { /* caller decides */ },
  onDelete: (index) => { /* caller decides */ }
});
```

### 4. **Pure Functions**
Utils are stateless and testable.

```javascript
// utils.js
export function formatTime(seconds) {
  // No side effects, same input = same output
  return /* formatted time */;
}
```

## 🧪 Testing Strategy

### Unit Tests (Future)
```javascript
// __tests__/utils.test.js
import { formatTime } from '../modules/utils.js';

test('formats time correctly', () => {
  expect(formatTime(3661)).toBe('01:01:01.0');
  expect(formatTime(0)).toBe('00:00:00.0');
});
```

```javascript
// __tests__/segments.test.js
import { getTotalDuration } from '../modules/segments.js';
import { setSegments } from '../modules/state.js';

test('calculates total duration', () => {
  setSegments([
    { start: 0, end: 10 },
    { start: 20, end: 30 }
  ]);
  expect(getTotalDuration()).toBe(20);
});
```

### Integration Tests
- Load a video file
- Add segments via UI
- Verify FFmpeg command is correct
- Run command, verify output plays

## 🔄 Migration Plan

### Phase 1: Extract Core Logic (Current)
- [x] state.js
- [x] utils.js
- [x] commands.js
- [x] segments.js
- [ ] timeline.js
- [ ] markers.js
- [ ] voiceover.js

### Phase 2: Build Modular HTML
- [ ] index.html using ES6 modules
- [ ] Extract CSS to separate files
- [ ] Wire up modules
- [ ] Test feature parity

### Phase 3: Add Tests
- [ ] Unit tests for utils
- [ ] Unit tests for commands
- [ ] Integration tests
- [ ] E2E tests

### Phase 4: React Migration (Future)
- [ ] Keep modular vanilla version as v1.x
- [ ] Build React version as v2.x
- [ ] Reuse business logic modules (state, commands, etc.)
- [ ] Add React components for UI

## 🚀 Benefits

### Before (Monolithic)
```
trimmer-multi.html (2000 lines)
   ├── State variables mixed with logic
   ├── Event handlers everywhere
   ├── FFmpeg logic scattered
   ├── Hard to test
   └── Context overload
```

### After (Modular)
```
modules/
   ├── state.js         (150 lines) - Clear state management
   ├── utils.js         (100 lines) - Pure, testable functions
   ├── commands.js      (120 lines) - FFmpeg logic isolated
   ├── segments.js      (200 lines) - Segment business logic
   ├── timeline.js      (250 lines) - UI rendering
   ├── markers.js       (150 lines) - Marker logic
   └── voiceover.js     (200 lines) - Audio recording

index.html (300 lines) - Just wiring
```

**Result:**
- ✅ Each file < 300 lines
- ✅ Clear separation of concerns
- ✅ Easy to find and fix bugs
- ✅ Can test modules independently
- ✅ Multiple devs can work in parallel
- ✅ Easier to onboard new contributors

## 📝 Conventions

### File Naming
- `camelCase.js` for modules
- `UPPERCASE.md` for docs
- `kebab-case.css` for styles

### Function Naming
- `getX()` - Read state
- `setX()` - Write state
- `createX()` - Create new entity
- `updateX()` - Modify existing entity
- `deleteX()` - Remove entity
- `renderX()` - Update DOM
- `handleX()` - Event handler

### Comments
- JSDoc for all exported functions
- Section comments: `// ============`
- Inline comments for complex logic only

### Exports
- Named exports only (no default exports)
- Export functions, not classes (functional style)

## 🔮 Future Improvements

1. **TypeScript** - Add type safety
2. **Build step** - Bundle for production
3. **State management library** - Zustand or Redux
4. **Component library** - Web Components or React
5. **Hot reload** - Vite dev server
6. **Service Worker** - Offline support

---

**This architecture is designed for gradual adoption.** You can start using modules one at a time while keeping the monolithic version as a fallback.

**Next step:** Complete the remaining modules (timeline.js, markers.js, voiceover.js) and create index.html.
