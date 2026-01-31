# 01. Motivation

## Problem Statement

Users frequently need to make quick edits to videos:
- Trim a 2-hour stream down to a 30-second highlight
- Add background music to a social media clip
- Remove intro/outro from recorded gameplay
- Adjust audio levels between video and overlay track

**Current solutions require:**
1. **Desktop software** (Premiere, DaVinci) - Overkill for simple tasks, expensive, slow to launch
2. **Online services** (Kapwing, Clideo) - Upload privacy concerns, file size limits, paywalls
3. **Mobile apps** - Limited features, small screen, awkward UI

## User Pain Points

### 1. Friction to Start Editing
- Desktop apps: 30+ seconds to launch, complex UI intimidates beginners
- Online services: Upload time (5+ minutes for 500MB video)
- Both: Context switching from browser where video was found

### 2. Privacy Concerns
- Uploading sensitive content (family videos, private streams) to third-party servers
- No guarantee of deletion after processing
- Metadata exposure

### 3. Feature Bloat
- 99% of features in Premiere go unused for simple trim+audio tasks
- Learning curve discourages casual users
- Performance overhead from unused features

### 4. Accessibility
- Expensive software locks out hobbyists ($240/year for Premiere)
- Mobile-first users lack desktop access
- No offline capability for existing web tools

## Who Benefits?

### Primary Users
1. **Streamers** - Clip highlights from VODs for social media
2. **Content Creators** - Quick edits for TikTok/YouTube Shorts
3. **Casual Users** - Family videos, vacation clips, meme creation

### Use Cases
- **5-minute edit:** Trim 10-minute video to 30 seconds + add music
- **Stream highlight:** Cut funny moment from 3-hour stream
- **Social media:** Add trending audio to video clip
- **Podcast editing:** Remove intro music, adjust levels

## Why Now?

### Technical Enablers
1. **Web Codecs API** (2023) - Hardware-accelerated video processing in browser
2. **ffmpeg.wasm** - Full ffmpeg power via WebAssembly
3. **MediaRecorder API** - Mature, cross-browser support
4. **PWA maturity** - Offline, installable, near-native performance

### Market Opportunity
- Growing creator economy demands accessible tools
- Privacy-conscious users seeking local-first software
- Mobile users need browser-based alternatives

### Competitive Landscape
- Existing tools either too simple (iMovie clips) or too complex (Premiere)
- No dominant browser-based trimmer with audio overlay
- Opportunity to be the "Figma of video editing" (browser-first, collaborative-ready)

## Success Metrics

**Adoption:**
- 100+ weekly active users in first month
- 50%+ task completion rate (users who export)

**Performance:**
- <3 seconds to load 100MB video
- <5 seconds to export 1-minute trim-only edit
- Works on 3-year-old mid-range laptops

**User Satisfaction:**
- "This is faster than opening Premiere" - target feedback
- Net Promoter Score > 40

---

## Non-Goals (What We're NOT Building)

❌ **Multi-track video editing** - Keep it simple, single video + audio overlay only
❌ **Advanced effects** - No chroma key, color grading, stabilization (yet)
❌ **Collaboration** - Single-user tool for MVP
❌ **Cloud storage** - All processing local, no backend (yet)
❌ **Mobile video capture** - Import only, not recording

These may be future features but are explicitly out of scope for MVP.
