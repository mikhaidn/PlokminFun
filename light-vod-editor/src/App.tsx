import { useState, useRef } from 'react';
import './styles/app.css';
import { VideoPlayer } from './components/VideoPlayer';
import { Timeline } from './components/Timeline';
import { SegmentList } from './components/SegmentList';
import { ProgressIndicator } from './components/ProgressIndicator';
import { useKeyboardShortcuts } from './hooks/useKeyboard';
import { generateConcatCommand, generateSplitCommands } from './utils/ffmpeg-commands';
import { formatBytes, formatTime } from './utils/formatters';
import { processConcatMode, processSplitMode, downloadBlob, type ProcessingProgress } from './utils/ffmpeg-wasm';
import type { Segment, VideoFile, ExportMode } from './types';

function App() {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [exportMode, setExportMode] = useState<ExportMode>('concat');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [exportName, setExportName] = useState('');
  const [useInAppProcessing, setUseInAppProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleVideoLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;

    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });

    setVideoFile({
      file,
      url,
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    });
  };

  const addSegment = (start: number, end: number) => {
    setSegments([...segments, { start, end }]);
  };

  const handleAddSegmentAtCurrent = () => {
    if (!videoFile) return;
    const start = Math.max(0, currentTime);
    const end = Math.min(videoFile.duration, start + 10);
    addSegment(start, end);
    setSelectedIndex(segments.length);
  };

  const handleDeleteSegment = (index: number) => {
    if (!confirm(`Delete segment ${index + 1}?`)) return;
    const newSegments = segments.filter((_, i) => i !== index);
    setSegments(newSegments);
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleSelectSegment = (index: number) => {
    setSelectedIndex(index);
    if (videoRef.current) {
      videoRef.current.currentTime = segments[index].start;
    }
  };

  const handlePreviewSegment = (index: number) => {
    const segment = segments[index];
    if (!videoRef.current) return;

    videoRef.current.currentTime = segment.start;
    videoRef.current.play();

    const checkEnd = setInterval(() => {
      if (videoRef.current && videoRef.current.currentTime >= segment.end) {
        videoRef.current.pause();
        clearInterval(checkEnd);
      }
    }, 100);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSegmentUpdate = (index: number, start: number, end: number) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], start, end };
    setSegments(newSegments);
  };

  const handleSegmentFieldUpdate = (index: number, updates: Partial<Segment>) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], ...updates };
    setSegments(newSegments);
  };

  const handleCopyCommand = async (type: ExportMode) => {
    if (!videoFile || segments.length === 0) return;

    let command: string;
    if (type === 'concat') {
      command = generateConcatCommand(videoFile.file.name, segments, exportName || undefined);
    } else {
      command = generateSplitCommands(videoFile.file.name, segments, exportName || undefined).join('\n\n');
    }

    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(type);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      alert('Failed to copy: ' + (err as Error).message);
    }
  };

  const handleInAppExport = async () => {
    if (!videoFile || segments.length === 0) return;

    setProcessingProgress({
      phase: 'loading',
      progress: 0,
      message: 'Starting...',
    });

    try {
      if (exportMode === 'concat') {
        const outputName = exportName || segments[0]?.name || `${videoFile.file.name.replace(/\.[^/.]+$/, '')}_merged`;
        const blob = await processConcatMode(
          videoFile.file,
          segments,
          outputName,
          setProcessingProgress
        );
        downloadBlob(blob, `${outputName}.mp4`);
      } else {
        const outputPrefix = exportName || videoFile.file.name.replace(/\.[^/.]+$/, '');
        const blobs = await processSplitMode(
          videoFile.file,
          segments,
          outputPrefix,
          setProcessingProgress
        );

        // Download all segments
        blobs.forEach((blob, i) => {
          const name = segments[i]?.name || `${outputPrefix}_segment${i + 1}`;
          downloadBlob(blob, `${name}.mp4`);
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + (err as Error).message);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFrameBack: () => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 0.033);
      }
    },
    onFrameForward: () => {
      if (videoRef.current && videoFile) {
        videoRef.current.currentTime = Math.min(videoFile.duration, videoRef.current.currentTime + 0.033);
      }
    },
    onJumpBack: () => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      }
    },
    onJumpForward: () => {
      if (videoRef.current && videoFile) {
        videoRef.current.currentTime = Math.min(videoFile.duration, videoRef.current.currentTime + 5);
      }
    },
    onPlayPause: () => {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    },
  }, !!videoFile);

  return (
    <div>
      <h1>🎬 Light VOD Editor - Multi-Segment</h1>
      <p className="subtitle">
        Cut multiple segments and merge into one video or export as separate files. Fast, local, private.
      </p>

      {/* Step 1: Load Video */}
      <div className="section">
        <h2>📂 Step 1: Load Your Video</h2>
        <p>No upload needed - file stays on your computer. Works with any size (tested with 4-7 GB files).</p>
        <input type="file" accept="video/*" onChange={handleVideoLoad} />
      </div>

      {videoFile && (
        <>
          {/* Stats */}
          <div className="section">
            <h2>📊 Video Information</h2>
            <div className="stats">
              <div className="stat-card">
                <div className="stat-value">{formatTime(videoFile.duration)}</div>
                <div className="stat-label">Duration</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatBytes(videoFile.file.size)}</div>
                <div className="stat-label">File Size</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{videoFile.width}x{videoFile.height}</div>
                <div className="stat-label">Resolution</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{segments.length}</div>
                <div className="stat-label">Segments</div>
              </div>
            </div>
          </div>

          {/* Step 2: Preview */}
          <div className="section">
            <h2>👁️ Step 2: Preview & Find Trim Points</h2>
            <p>Scrub through your video to find the perfect start and end points for each segment.</p>
            <VideoPlayer
              videoFile={videoFile}
              onTimeUpdate={setCurrentTime}
              onVideoRef={(ref) => { videoRef.current = ref; }}
            />
          </div>

          {/* Step 3: Mark Segments */}
          <div className="section">
            <h2>✂️ Step 3: Mark Segments</h2>
            <p>Click timeline to seek, use buttons to capture start/end points.</p>

            <Timeline
              duration={videoFile.duration}
              currentTime={currentTime}
              segments={segments}
              selectedIndex={selectedIndex}
              onSeek={handleSeek}
              onSegmentUpdate={handleSegmentUpdate}
              onAddSegment={(start, end) => {
                addSegment(start, end);
                setSelectedIndex(segments.length);
              }}
              videoRef={videoRef}
            />

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <button onClick={handleAddSegmentAtCurrent} className="success">
                ➕ Add Segment at Current Time
              </button>
            </div>

            <div style={{ margin: '20px 0' }}>
              <h3 style={{ color: '#6ab7ff', marginBottom: '10px', fontSize: '1.2em' }}>💡 Navigation Tips</h3>
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#c9d1d9', fontSize: '13px' }}>
                <li><strong>Double-click timeline</strong> - Create 10s segment at position</li>
                <li><strong>Click timeline</strong> - Jump to position</li>
                <li><strong>Click and drag timeline</strong> - Scrub continuously</li>
                <li><strong>Drag handles</strong> - Adjust start/end (video scrubs in real-time!)</li>
                <li><strong>Drag segment body</strong> - Move entire segment</li>
                <li><strong>Horizontal trackpad swipe</strong> - Scrub video smoothly</li>
                <li><strong>← / →</strong> - 1 frame back/forward</li>
                <li><strong>Shift + ← / →</strong> - Jump 5 seconds</li>
                <li><strong>Spacebar</strong> - Play/pause</li>
              </ul>
            </div>

            <SegmentList
              segments={segments}
              selectedIndex={selectedIndex}
              onSelect={handleSelectSegment}
              onPreview={handlePreviewSegment}
              onDelete={handleDeleteSegment}
              onUpdate={handleSegmentFieldUpdate}
            />
          </div>

          {/* Step 4: Export */}
          {segments.length > 0 && (
            <div className="section">
                <h2>🚀 Step 4: Choose Export Mode</h2>

                {/* Processing method toggle */}
                <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px', border: '1px solid #444' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#c9d1d9', opacity: 0.5 }}>
                  <input
                  type="checkbox"
                  checked={useInAppProcessing}
                  onChange={(e) => setUseInAppProcessing(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'not-allowed' }}
                  disabled
                  />
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>
                  ⚡ Process in Browser (Coming Soon)
                  </span>
                </label>
                <p style={{ margin: '8px 0 0 28px', color: '#8b949e', fontSize: '13px' }}>
                  Browser processing not yet supported. Use FFmpeg commands via terminal for now.
                </p>
                </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#c9d1d9', fontWeight: 600 }}>
                  Output Name (optional)
                </label>
                <input
                  type="text"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  placeholder={
                    exportMode === 'concat'
                      ? segments[0]?.name || `${videoFile.file.name.replace(/\.[^/.]+$/, '')}_merged`
                      : `${videoFile.file.name.replace(/\.[^/.]+$/, '')}_segment#`
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: '#e0e0e0',
                    fontSize: '15px',
                  }}
                />
                <small style={{ display: 'block', marginTop: '6px', color: '#8b949e', fontSize: '13px' }}>
                  {exportMode === 'concat'
                    ? 'Leave blank to use first segment name or default to "_merged"'
                    : 'Leave blank to use segment names or default to "_segment#"'}
                </small>
              </div>

              {/* Only show mode selector if multiple segments */}
              {segments.length > 1 && (
                <div className="mode-selector">
                  <div
                    className={`mode-option ${exportMode === 'concat' ? 'active' : ''}`}
                    onClick={() => setExportMode('concat')}
                  >
                    <h4>🔗 Merge All Segments</h4>
                    <p>Combine all segments into one video file</p>
                  </div>
                  <div
                    className={`mode-option ${exportMode === 'split' ? 'active' : ''}`}
                    onClick={() => setExportMode('split')}
                  >
                    <h4>📦 Split Into Separate Files</h4>
                    <p>Export each segment as its own file</p>
                  </div>
                </div>
              )}

              {/* Single segment info */}
              {segments.length === 1 && (
                <div style={{
                  padding: '15px',
                  background: '#1a4d2e',
                  border: '2px solid #2d7a4f',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <p style={{ margin: 0, color: '#a7f3d0', fontSize: '14px' }}>
                    ⚡ <strong>Fast mode:</strong> Single segment will use stream copy (no re-encoding) for instant export!
                  </p>
                </div>
              )}

              {useInAppProcessing ? (
                <>
                  {/* In-app processing mode */}
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                      onClick={handleInAppExport}
                      disabled={processingProgress !== null && processingProgress.phase !== 'complete' && processingProgress.phase !== 'error'}
                      style={{
                        padding: '15px 30px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        backgroundColor: processingProgress !== null && processingProgress.phase !== 'complete' && processingProgress.phase !== 'error' ? '#6b7280' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: processingProgress !== null && processingProgress.phase !== 'complete' && processingProgress.phase !== 'error' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {segments.length === 1
                        ? '🚀 Export Segment'
                        : exportMode === 'concat'
                          ? '🚀 Merge & Download'
                          : '🚀 Split & Download All'}
                    </button>
                  </div>

                  {processingProgress && (
                    <ProgressIndicator
                      progress={processingProgress}
                      onCancel={() => {
                        setProcessingProgress(null);
                        // Note: FFmpeg.wasm doesn't support cancellation easily
                        // We'll need to reload the page to cancel
                        if (confirm('Cancel processing? This will reload the page and lose your current work.')) {
                          window.location.reload();
                        }
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  {/* Copy/paste mode */}
                  {(segments.length === 1 || exportMode === 'concat') && (
                    <div className="command-output">
                      <div className="command-header">
                        <h3>
                          {segments.length === 1
                            ? 'Export Single Segment (Fast - Stream Copy)'
                            : 'Merge Segments (Re-encoding Required)'}
                        </h3>
                        <button
                          className={`copy-btn ${copiedCommand === 'concat' ? 'copied' : ''}`}
                          onClick={() => handleCopyCommand('concat')}
                        >
                          {copiedCommand === 'concat' ? '✅ Copied!' : '📋 Copy Command'}
                        </button>
                      </div>
                      <pre>{generateConcatCommand(videoFile.file.name, segments, exportName || undefined)}</pre>
                    </div>
                  )}

                  {segments.length > 1 && exportMode === 'split' && (
                    <div className="command-output">
                      <div className="command-header">
                        <h3>Split Into Separate Files (Fast - Stream Copy)</h3>
                        <button
                          className={`copy-btn ${copiedCommand === 'split' ? 'copied' : ''}`}
                          onClick={() => handleCopyCommand('split')}
                        >
                          {copiedCommand === 'split' ? '✅ Copied!' : '📋 Copy All Commands'}
                        </button>
                      </div>
                      <pre>{generateSplitCommands(videoFile.file.name, segments, exportName || undefined).join('\n\n')}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
