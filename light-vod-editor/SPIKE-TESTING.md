# Testing the Large File Trimmer Spike

## 🎯 What This Spike Tests

This proof-of-concept validates that we can:
1. ✅ Load 4-7 GB video files without crashing the browser
2. ✅ Parse metadata (duration, resolution, keyframes) without loading the full file
3. ✅ Display keyframe positions on a timeline
4. ✅ Trim video and download the result

## 🚀 How to Test

### Quick Start
```bash
# Open the spike in your browser
open spike-large-file-trimmer.html

# Or if already in the directory:
cd /Users/danmikhail/git/mikhaidn/CardGames/light-vod-editor
open spike-large-file-trimmer.html
```

### Step-by-Step Testing

1. **Load a Large Video File**
   - Click "Choose File" button
   - Select one of your 4-7 GB video files
   - Watch the status log for parsing progress

2. **Check Metadata**
   - Verify duration is correct
   - Check keyframe count (should be hundreds/thousands)
   - Note average keyframe interval (usually 1-5 seconds)

3. **Scrub the Timeline**
   - Click anywhere on the timeline to seek
   - Video should jump to that position
   - Check if seeking is responsive

4. **Set Trim Points**
   - **Option A:** Drag the blue handles on the timeline
   - **Option B:** Type times into "Trim Start" and "Trim End" inputs
   - Handles should snap to nearest keyframe (yellow markers)

5. **Preview Trim Region**
   - Click "▶️ Preview Trim Region"
   - Video should play from start to end point, then stop

6. **Trim & Download**
   - Click "⬇️ Trim & Download"
   - Wait for processing (will re-encode, so expect ~1-2 min for 1 min clip)
   - Download should start automatically

## 📊 What to Look For

### ✅ Success Indicators
- File loads without browser crash
- Metadata shows correct duration and resolution
- Keyframes are detected (check status log)
- Timeline is interactive (click to seek works)
- Trim handles are draggable
- Download produces playable video

### ⚠️ Known Limitations (Spike Only)
- **Re-encodes video** (slow) - Production will extract bytes directly (fast)
- **Output is WebM** not MP4 - Production will preserve format
- **Loads full file in memory** for trimming - Production will use streaming
- **Safari may not work** - MediaRecorder codec support varies

### ❌ Red Flags
- Browser tab crashes when loading file → Memory issue
- Metadata parsing fails → mp4box.js compatibility issue
- No keyframes detected → Video format not supported
- Trim hangs/crashes → Need different approach

## 🧪 Test Cases

### Test 1: Small File (Baseline)
- File: 100-500 MB video
- Expected: Everything works smoothly
- Purpose: Validate basic functionality

### Test 2: Large File (4-7 GB)
- File: Your actual STS VOD files
- Expected: Loads without crash, trims successfully
- Purpose: Validate approach for your use case

### Test 3: Different Formats
- Files: MP4, MOV, MKV if available
- Expected: MP4 works, others may fail
- Purpose: Determine format support

### Test 4: Different Codecs
- Files: H.264, H.265, VP9 if available
- Expected: H.264 most compatible
- Purpose: Identify codec limitations

## 📝 Report Results

After testing, note:

1. **File size tested:** _____ GB
2. **Browser used:** Chrome / Firefox / Safari
3. **Metadata parsing:** ✅ / ❌
4. **Keyframes detected:** _____ frames
5. **Timeline interactive:** ✅ / ❌
6. **Trim successful:** ✅ / ❌
7. **Processing time:** _____ seconds for _____ second clip
8. **Memory usage:** _____ MB (check browser task manager)

## 🔍 Debugging Tips

### If file won't load:
- Check browser console (F12) for errors
- Try smaller file first (100 MB)
- Ensure file is valid MP4 (try playing in VLC)

### If metadata parsing fails:
- File format may not be MP4
- Try converting to standard MP4 with: `ffmpeg -i input.mov -c copy output.mp4`

### If browser crashes:
- File is too large for current approach
- Confirms we need Media Source Extensions for production

### If trim is too slow:
- This is expected! Spike re-encodes.
- Production will extract bytes (100x faster)

## 🎯 Success Criteria for Spike

To proceed with full implementation, we need:
- ✅ Can load 4-7 GB file without crash
- ✅ Can parse metadata from your actual files
- ✅ Can detect keyframes (confirms format compatible)
- ✅ Timeline interaction is smooth
- ✅ Trim produces valid output (even if slow)

If all ✅ → Proceed to production implementation
If any ❌ → Investigate issue, may need alternative approach

## 📸 Screenshot Checklist

If possible, screenshot:
1. Metadata panel showing file details
2. Timeline with keyframe markers visible
3. Status log showing successful trim
4. Browser memory usage during processing

This helps document what's working for your specific files.

## 🚧 Next Steps After Spike

**If successful:**
1. Implement production byte-extraction approach (no re-encode)
2. Add Media Source Extensions for true streaming
3. Build React components around proven approach
4. Deploy to GitHub Pages

**If issues found:**
- Large files crash → Add chunk-based streaming
- Format not supported → Add format conversion step
- Keyframes too sparse → Warn user about precision limits
- Performance poor → Consider Electron app alternative

---

**Let me know how it goes!** 🚀

Share results in the format above and I'll help troubleshoot any issues or proceed to production build.
