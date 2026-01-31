# Light VOD Editor - Roadmap

This document outlines planned features, improvements, and known issues for future development.

## 🎯 Current State (v0.1.0)

**Working Features:**
- ✅ Multiple segment trimming with visual timeline
- ✅ Draggable handles for precise segment boundaries
- ✅ Drag entire segments to reposition
- ✅ Two export modes (merge/split)
- ✅ Labeled markers/breadcrumbs
- ✅ Multiple voiceover track recording
- ✅ Real-time video scrubbing
- ✅ Keyboard shortcuts and trackpad navigation
- ✅ FFmpeg command generation (trim, concat, audio mix)

## 🚀 Phase 1: Polish & UX (High Priority)

### Navigation Improvements
- [ ] **Timeline zoom** - Zoom in/out for fine-tuning on long videos
- [ ] **Minimap** - Small overview timeline showing full video with zoom window
- [ ] **Snap to markers** - Segment handles snap to nearby markers when dragging
- [ ] **Segment overlap detection** - Visual warning when segments overlap
- [ ] **Keyboard shortcuts help** - Toggle panel showing all shortcuts

### Segment Management
- [ ] **Segment reordering** - Drag segments in the list to change output order
- [ ] **Segment naming** - Give segments custom names (e.g., "Run 1", "Funny Moment")
- [ ] **Segment duplication** - Copy a segment to quickly create similar ones
- [ ] **Smart segment suggestions** - Detect scene changes automatically
- [ ] **Undo/Redo** - History stack for segment changes

### Markers
- [ ] **Marker categories** - Color-code markers (blue=intro, green=gameplay, red=outro)
- [ ] **Bulk marker import** - Paste timestamp list from YouTube/Twitch comments
- [ ] **Export markers** - Save markers to CSV/JSON for reuse
- [ ] **Marker notes** - Add description text to each marker

### Command Generation
- [ ] **Command preview with color syntax** - Highlight different parts of command
- [ ] **Command breakdown explanation** - Expandable section explaining each filter
- [ ] **Save command presets** - Save frequently used filter combinations
- [ ] **Batch processing script** - Generate shell script for multiple files

## 🎨 Phase 2: Video Filters (Medium Priority)

### Basic Filters
- [ ] **Color correction** - Brightness, contrast, saturation sliders
  - Uses `eq` filter: `eq=brightness=0.2:contrast=1.2:saturation=1.3`
  - Real-time preview (tricky - may need to show examples instead)
- [ ] **Filter presets** - One-click: "Brighten", "High Contrast", "Desaturate", "Vintage"
- [ ] **Crop/Resize** - Adjust video dimensions
- [ ] **Rotate/Flip** - 90° rotation, horizontal/vertical flip

### Text Overlays
- [ ] **Add text overlays** - Position, font, color, size
  - Uses `drawtext` filter
  - Time-based visibility (show text from 10s-20s)
- [ ] **Text templates** - Intro cards, lower thirds, watermarks
- [ ] **Multiple text layers** - Stack multiple text elements

### Transitions (Complex)
- [ ] **Crossfade between segments** - Smooth blending
  - Uses `xfade` filter with 40+ transition types
  - Duration slider (0.5s - 3s)
- [ ] **Transition previews** - Show examples of each type

## 🎤 Phase 3: Audio Enhancements (Medium Priority)

### Voiceover Improvements
- [ ] **Waveform visualization** - See audio levels while recording/playback
- [ ] **Volume per track** - Individual volume sliders for each voiceover
- [ ] **Fade in/out** - Smooth audio transitions
- [ ] **Audio ducking** - Auto-reduce original audio when voiceover plays
- [ ] **Noise reduction** - Basic background noise filtering

### Advanced Audio
- [ ] **Background music track** - Add music with volume control
- [ ] **Audio sync adjustment** - Fine-tune voiceover offset (+/- milliseconds)
- [ ] **Audio export** - Save audio-only version
- [ ] **Multiple audio sources** - Mix game audio, music, and voiceover separately

## 🔧 Phase 4: Advanced Features (Low Priority)

### Performance
- [ ] **Keyframe visualization** - Show keyframe positions on timeline
- [ ] **Keyframe snapping** - Auto-snap trim points to keyframes
- [ ] **Progress estimation** - Estimate FFmpeg processing time
- [ ] **Thumbnail strip** - Show video thumbnails along timeline

### File Management
- [ ] **Project save/load** - Save entire project (segments, markers, settings) to JSON
- [ ] **Batch processing** - Process multiple videos with same settings
- [ ] **Cloud storage integration** - Save projects to Google Drive/Dropbox

### Collaboration
- [ ] **Share project URL** - Generate shareable link with all settings
- [ ] **Export settings** - Share segment list without video file

### In-Browser Processing (Experimental)
- [ ] **ffmpeg.wasm integration** - Process video in browser (slow but convenient)
  - Pro: No terminal needed
  - Con: Much slower, memory intensive
  - Use case: Quick previews, small files

## 🐛 Bug Fixes & Quality of Life

### Known Issues
- [ ] **Fix horizontal scroll sensitivity** - Make it more responsive
- [ ] **Improve handle z-index** - Handles should always be on top
- [ ] **Segment dragging precision** - Better snap behavior near boundaries
- [ ] **Mobile support** - Touch events for mobile browsers
- [ ] **Safari audio recording** - Test and fix MediaRecorder issues

### Polish
- [ ] **Loading states** - Show loading spinner when video loads
- [ ] **Error handling** - Better error messages for common issues
- [ ] **Tooltips** - Add helpful tooltips to all buttons
- [ ] **Dark/Light mode toggle** - User preference
- [ ] **Keyboard shortcut customization** - Let users remap keys

## 📱 Phase 5: React Migration (Future)

**Why migrate to React:**
- Better state management for complex UI
- Component reusability
- Type safety with TypeScript
- Easier testing
- Better performance for large number of segments

**Migration Plan:**
1. Keep HTML version as v1.x
2. Build React version in parallel as v2.x
3. Feature parity first, then new features
4. Both versions maintained (HTML for simplicity, React for power users)

**React-specific features:**
- [ ] Proper state management (Zustand/Redux)
- [ ] Component library (segment list, timeline, markers)
- [ ] Unit tests for core logic
- [ ] E2E tests with Playwright
- [ ] PWA support for offline use

## 🎓 Documentation & Examples

- [ ] **Video tutorial** - Record walkthrough of common workflows
- [ ] **Example projects** - Sample VODs with pre-made segments/markers
- [ ] **FFmpeg guide** - Explain common filter chains
- [ ] **Troubleshooting guide** - Common issues and solutions
- [ ] **API documentation** - For React version

## 💡 Ideas for Exploration

### AI-Assisted Features
- [ ] **Auto-highlight detection** - Use ML to find exciting moments
- [ ] **Speech-to-text markers** - Auto-generate markers from spoken words
- [ ] **Auto-trimming** - Remove silence/pauses automatically

### Integration
- [ ] **Twitch/YouTube integration** - Import VODs directly from platforms
- [ ] **OBS integration** - Trigger markers during live recording
- [ ] **Discord bot** - Share clips to Discord channels

### Creative Tools
- [ ] **Meme generator** - Quick templates for common meme formats
- [ ] **Slow motion** - Change playback speed of segments
- [ ] **Reverse playback** - Play segments backwards
- [ ] **Picture-in-picture** - Overlay webcam/facecam

## 📊 Metrics & Analytics

Track (privacy-preserving, local only):
- [ ] Number of projects created
- [ ] Most used features
- [ ] Average segment count per project
- [ ] Most common export mode

## 🎯 Success Criteria

**v1.0 Release Checklist:**
- [ ] All Phase 1 features complete
- [ ] Zero critical bugs
- [ ] Comprehensive documentation
- [ ] 10+ example workflows
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile-friendly (basic support)

**v2.0 Release (React):**
- [ ] Feature parity with v1.0
- [ ] At least 3 Phase 2 features
- [ ] PWA installable
- [ ] Offline mode
- [ ] Full test coverage (>80%)

## 📝 Notes for Next Session

### Quick Wins (Do These First)
1. **Timeline zoom** - Users will want this for long videos
2. **Segment naming** - Easy to implement, high value
3. **Undo/Redo** - Critical for UX
4. **Command syntax highlighting** - Makes commands more readable
5. **Keyboard shortcuts help panel** - Users keep asking what shortcuts exist

### Architecture Decisions Needed
1. **State management** - Keep using vanilla JS or migrate to React soon?
2. **File format** - JSON schema for project saves?
3. **Versioning** - How to handle backwards compatibility?
4. **Performance** - Max number of segments before perf degrades?

### Technical Debt
- Refactor `renderTimeline()` - Getting too complex
- Extract FFmpeg command generation into separate module
- Add JSDoc comments throughout
- Consider TypeScript migration for vanilla version

### User Feedback Needed
- Is horizontal scroll direction correct? (we inverted it)
- Should segments auto-snap to markers?
- What's the most common workflow? (optimize for that)
- Do users prefer merge or split mode?

---

**Last Updated:** 2025-01-31
**Version:** 0.1.0 (Pre-release)
