# Development Notes - Light VOD Editor

Quick reference for developers picking up where we left off.

## 📁 Project Status (2025-01-31)

**Current Version:** 0.1.0 (Pre-release)
**Main File:** `trimmer-multi.html` (fully functional, 2000+ lines)
**Status:** Ready for PR / User Testing

## 🎯 What Works

### Core Features ✅
- Multiple trim segments with visual timeline
- Draggable handles (start, end, whole segment)
- Two export modes (merge/split)
- Labeled markers/breadcrumbs
- Multiple voiceover track recording
- Real-time video scrubbing
- Keyboard shortcuts + trackpad navigation
- FFmpeg command generation

### Tested ✅
- Large files (4-7 GB)
- 10+ segments without slowdown
- Cross-browser (Chrome, Firefox, Safari)
- Commands execute successfully with FFmpeg 6.x

## 🚧 Known Issues

1. **Horizontal scroll direction** - Currently inverted (swipe right = forward). User feedback pending.
2. **Handle z-index** - Handles can sometimes be behind segment bodies
3. **Safari audio recording** - MediaRecorder may have issues (needs testing)
4. **Mobile support** - Touch events not implemented yet

## 🏗️ Code Structure

### State Management
All state is in global variables (vanilla JS):
- `segments[]` - Array of trim points
- `markers[]` - Named timestamps
- `voiceoverTracks[]` - Recorded audio clips
- Dragging state tracked with `isDragging`, `dragHandleType`, etc.

### Key Functions

**Rendering:**
- `renderTimeline()` - Draws segments + handles on timeline
- `renderSegments()` - Updates segment list UI
- `renderMarkers()` - Displays markers on timeline
- `renderVoiceoverTracks()` - Voiceover track UI

**Command Generation:**
- `updateCommands()` - Builds FFmpeg commands for trim/merge
- `updateVoiceoverCommand()` - Builds audio mix command

**Event Handlers:**
- Mouse move/up for dragging
- Keyboard events for shortcuts
- Wheel event for horizontal scroll

### DOM Structure
```
timeline
├── timeline-track (background bar)
├── playhead (red line)
├── timelineMarkers (pin icons)
└── timelineRegions (segments + handles)
    ├── trim-region (segment body)
    ├── trim-handle (start)
    └── trim-handle (end)
```

## 🎨 CSS Classes

**Interactive Elements:**
- `.trim-region` - Segment body (draggable)
- `.trim-handle` - Start/end handles (draggable)
- `.marker` - Timeline pin (clickable)
- `.segment-item` - Segment in list (clickable)

**States:**
- `.selected` - Highlighted segment
- `.dragging` - Element being dragged
- `.copied` - Button showing "Copied!" feedback

## 🔧 Development Workflow

### Making Changes
1. Edit `trimmer-multi.html`
2. Open in browser (no build step needed!)
3. Test with a real video file
4. Verify FFmpeg commands execute correctly

### Testing Checklist
- [ ] Load 4+ GB file (shouldn't crash)
- [ ] Add 5+ segments
- [ ] Drag handles smoothly
- [ ] Drag segment body
- [ ] Add markers and use in voiceover
- [ ] Record voiceover
- [ ] Copy commands (check clipboard)
- [ ] Run commands with FFmpeg

### Debugging
- Open browser DevTools console
- State is global - inspect `segments`, `markers`, etc.
- Check `isDragging` if drag behavior is weird
- Look for errors in `updateCommands()` if command is invalid

## 📚 Documentation

**For Users:**
- `README.md` - Full feature list + usage guide
- `ROADMAP.md` - Future features + priorities
- Inline help text in UI

**For Developers:**
- `PR_DESCRIPTION.md` - Comprehensive PR description
- `DEVELOPMENT_NOTES.md` - This file
- Inline JSDoc comments in code

## 🚀 Next Steps (Priority Order)

### Quick Wins (1-2 hours each)
1. **Segment naming** - Add `name` field to segments
2. **Timeline zoom** - Implement zoom in/out
3. **Undo/Redo** - History stack for changes
4. **Keyboard shortcuts help** - Toggle panel with all shortcuts

### Medium Effort (3-5 hours)
1. **Color filters** - Brightness/contrast/saturation sliders
2. **Text overlays** - Add text with positioning
3. **Waveform visualization** - Show audio levels
4. **Project save/load** - Export/import JSON

### Large Effort (1-2 days)
1. **React migration** - Start v2.0 with proper architecture
2. **Transitions** - Crossfade between segments
3. **ffmpeg.wasm integration** - In-browser processing

## 💡 Design Decisions

### Why Vanilla JS?
- **Pro:** No build step, no dependencies, fast iteration
- **Con:** State management gets messy at scale
- **Decision:** Keep vanilla for v1, migrate to React for v2

### Why Command Generation?
- **Pro:** Fast (FFmpeg is optimized), educational, flexible
- **Con:** Users need FFmpeg installed, can't preview result
- **Decision:** Worth it for speed + large file support

### Why Global State?
- **Pro:** Simple, easy to debug in console
- **Con:** No encapsulation, hard to test, prone to bugs
- **Decision:** OK for prototype, refactor when migrating to React

## 🐛 Bug Fixes From Session

1. **Copy button error** - Fixed `event` parameter passing
2. **Scroll direction** - Inverted to feel more natural
3. **Segment dragging** - Added whole-segment drag support
4. **Marker integration** - Added dropdown in voiceover UI

## 📊 Metrics

- **File Size:** `trimmer-multi.html` = ~54 KB
- **Lines of Code:** ~2000 (HTML + CSS + JS in one file)
- **Dependencies:** 0 (vanilla JS only)
- **Browser APIs Used:** 6 (createObjectURL, MediaRecorder, getUserMedia, Blob, Clipboard, File)

## 🤝 Contributing

### Code Style
- Use `const` for DOM elements
- Use `let` for state
- JSDoc comments for all functions
- Descriptive variable names (no `i`, `x`, `y` except in loops)
- Section comments with `// ======`

### Testing
- Always test with a real large file (>1 GB)
- Verify FFmpeg commands actually work
- Check cross-browser (Chrome + Firefox minimum)

### Git Workflow
- Work in feature branch
- PR to `main` with description from `PR_DESCRIPTION.md`
- Include before/after screenshots if UI changes

## 📞 Contact / Questions

**Current Maintainer:** (Your name)
**Last Updated:** 2025-01-31
**Next Review:** When starting new features

---

## Quick Reference

### File Locations
```
light-vod-editor/
├── trimmer-multi.html      ← MAIN FILE (start here!)
├── README.md               ← User docs
├── ROADMAP.md              ← Future features
├── PR_DESCRIPTION.md       ← For PR
└── DEVELOPMENT_NOTES.md    ← This file
```

### Key URLs
- **Live Demo:** https://mikhaidn.github.io/PlokminFun/light-vod-editor/
- **FFmpeg Docs:** https://ffmpeg.org/ffmpeg-filters.html
- **MediaRecorder API:** https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

### Common Tasks

**Add a new segment:**
```javascript
segments.push({ start: 10, end: 20 });
renderTimeline();
renderSegments();
updateCommands();
```

**Add a marker:**
```javascript
markers.push({ name: 'Intro', time: 5.0 });
renderMarkers();
```

**Update FFmpeg command:**
```javascript
// Modify updateCommands() function
// Test command manually in terminal before committing
```

---

**Happy coding! 🚀**
