import { useRef, useEffect, useState } from 'react';
import type { Segment } from '../types';

interface TimelineProps {
  duration: number;
  currentTime: number;
  segments: Segment[];
  selectedIndex: number | null;
  onSeek: (time: number) => void;
  onSegmentUpdate: (index: number, start: number, end: number) => void;
  onAddSegment: (start: number, end: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const SEGMENT_COLORS = ['#4a9eff', '#3fb950', '#d29922', '#f85149', '#bc8cff'];

type DragType = 'start' | 'end' | 'segment' | null;

export function Timeline({
  duration,
  currentTime,
  segments,
  selectedIndex,
  onSeek,
  onSegmentUpdate,
  onAddSegment,
  videoRef,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    segmentIndex: number;
    type: DragType;
    startX: number;
    startSegment: Segment | null;
  } | null>(null);
  const [seekingTimeline, setSeekingTimeline] = useState(false);

  // Handle timeline click/drag (seeking)
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't seek if clicking on handles or regions
    if ((e.target as HTMLElement).classList.contains('trim-handle')) return;
    if ((e.target as HTMLElement).classList.contains('trim-region')) return;

    const rect = timelineRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = percent * duration;
    onSeek(time);
  };

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't seek if clicking on handles or regions
    if ((e.target as HTMLElement).classList.contains('trim-handle')) return;
    if ((e.target as HTMLElement).classList.contains('trim-region')) return;

    setSeekingTimeline(true);
    const rect = timelineRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = percent * duration;
    onSeek(time);
  };

  const handleTimelineDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't add segment if clicking on handles or regions
    if ((e.target as HTMLElement).classList.contains('trim-handle')) return;
    if ((e.target as HTMLElement).classList.contains('trim-region')) return;

    const rect = timelineRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = percent * duration;

    // Create 10-second segment centered at click position
    const start = Math.max(0, time - 5);
    const end = Math.min(duration, time + 5);

    onAddSegment(start, end);
  };

  // Handle wheel event for horizontal scrolling
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const handleWheel = (e: WheelEvent) => {
      const video = videoRef.current;
      if (!duration || !video) return;

      // Detect horizontal scroll (shift+scroll or trackpad horizontal swipe)
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;

      if (delta !== 0) {
        e.preventDefault();

        // Scroll sensitivity: 1 pixel = 0.1 seconds (inverted for natural scrolling)
        const scrollSpeed = 0.1;
        const timeChange = (-delta / 10) * scrollSpeed;

        video.currentTime = Math.max(0, Math.min(duration, video.currentTime + timeChange));
      }
    };

    timeline.addEventListener('wheel', handleWheel, { passive: false });
    return () => timeline.removeEventListener('wheel', handleWheel);
  }, [duration, videoRef]);

  // Handle mouse move (dragging or seeking)
  useEffect(() => {
    if (!dragging && !seekingTimeline) return;

    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!timelineRef.current || !video) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percent = x / rect.width;
      const time = percent * duration;

      // If just seeking the timeline (not dragging segments)
      if (seekingTimeline && !dragging) {
        onSeek(time);
        return;
      }

      if (!dragging) return;

      const segment = segments[dragging.segmentIndex];

      if (dragging.type === 'start') {
        // Dragging start handle
        if (time < segment.end - 0.5) {
          const newStart = Math.max(0, time);
          onSegmentUpdate(dragging.segmentIndex, newStart, segment.end);
          video.currentTime = newStart; // Real-time scrub!
        }
      } else if (dragging.type === 'end') {
        // Dragging end handle
        if (time > segment.start + 0.5) {
          const newEnd = Math.min(duration, time);
          onSegmentUpdate(dragging.segmentIndex, segment.start, newEnd);
          video.currentTime = newEnd; // Real-time scrub!
        }
      } else if (dragging.type === 'segment' && dragging.startSegment) {
        // Dragging entire segment
        const deltaX = e.clientX - dragging.startX;
        const deltaPercent = deltaX / rect.width;
        const deltaTime = deltaPercent * duration;

        const segmentDuration = dragging.startSegment.end - dragging.startSegment.start;
        let newStart = dragging.startSegment.start + deltaTime;
        let newEnd = dragging.startSegment.end + deltaTime;

        // Keep segment within bounds
        if (newStart < 0) {
          newStart = 0;
          newEnd = segmentDuration;
        } else if (newEnd > duration) {
          newEnd = duration;
          newStart = duration - segmentDuration;
        }

        onSegmentUpdate(dragging.segmentIndex, newStart, newEnd);

        // Scrub to start if moving left, end if moving right
        if (deltaTime < 0) {
          video.currentTime = newStart; // Moving left -> preview start
        } else {
          video.currentTime = newEnd; // Moving right -> preview end
        }
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setSeekingTimeline(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, seekingTimeline, duration, segments, onSegmentUpdate, onSeek, videoRef]);

  const playheadPercent = (currentTime / duration) * 100;

  return (
    <div
      className="timeline"
      ref={timelineRef}
      onClick={handleTimelineClick}
      onMouseDown={handleTimelineMouseDown}
      onDoubleClick={handleTimelineDoubleClick}
    >
      <div className="timeline-track" />
      <div className="playhead" style={{ left: `${playheadPercent}%` }} />
      <div id="timelineRegions">
        {segments.map((seg, i) => {
          const startPercent = (seg.start / duration) * 100;
          const endPercent = (seg.end / duration) * 100;
          const widthPercent = endPercent - startPercent;
          const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
          const isSelected = selectedIndex === i;
          const isDraggingThis = dragging?.segmentIndex === i;

          return (
            <div key={i}>
              {/* Segment body */}
              <div
                className={`trim-region ${isSelected ? 'selected' : ''} ${isDraggingThis && dragging.type === 'segment' ? 'dragging' : ''}`}
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  borderColor: color,
                  background: `${color}33`,
                  color: color,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDragging({
                    segmentIndex: i,
                    type: 'segment',
                    startX: e.clientX,
                    startSegment: { start: seg.start, end: seg.end },
                  });
                }}
              >
                {i + 1}
              </div>

              {/* Start handle - extends left from segment start */}
              <div
                className={`trim-handle trim-handle-start ${isDraggingThis && dragging.type === 'start' ? 'dragging' : ''}`}
                style={{
                  left: `${startPercent}%`,
                  transform: 'translate(-100%, -50%)', // Shift left by full width
                  background: color,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDragging({
                    segmentIndex: i,
                    type: 'start',
                    startX: e.clientX,
                    startSegment: null,
                  });
                }}
              />

              {/* End handle - extends right from segment end */}
              <div
                className={`trim-handle trim-handle-end ${isDraggingThis && dragging.type === 'end' ? 'dragging' : ''}`}
                style={{
                  left: `${endPercent}%`,
                  transform: 'translate(0%, -50%)', // No horizontal shift (extends right)
                  background: color,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDragging({
                    segmentIndex: i,
                    type: 'end',
                    startX: e.clientX,
                    startSegment: null,
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
