import { useRef, useEffect } from 'react';
import type { VideoFile } from '../types';

interface VideoPlayerProps {
  videoFile: VideoFile | null;
  onTimeUpdate: (time: number) => void;
  onVideoRef: (ref: HTMLVideoElement | null) => void;
}

export function VideoPlayer({ videoFile, onTimeUpdate, onVideoRef }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    onVideoRef(videoRef.current);
  }, [onVideoRef]);

  useEffect(() => {
    if (videoRef.current && videoFile) {
      videoRef.current.src = videoFile.url;
    }
  }, [videoFile]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  if (!videoFile) {
    return null;
  }

  return <video ref={videoRef} controls onTimeUpdate={handleTimeUpdate} />;
}
