import { FFmpeg } from '@ffmpeg/ffmpeg';
import type { Segment } from './ffmpeg-commands';

export interface ProcessingProgress {
  phase: 'loading' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  eta?: number; // seconds remaining
}

let ffmpegInstance: FFmpeg | null = null;

/**
 * Initialize FFmpeg.wasm instance (loads ~31MB of WASM files)
 */
export async function loadFFmpeg(
  onProgress?: (progress: ProcessingProgress) => void
): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    onProgress?.({
      phase: 'processing',
      progress: Math.round(progress * 100),
      message: `Processing... ${time}μs`,
      eta: undefined,
    });
  });

  onProgress?.({
    phase: 'loading',
    progress: 0,
    message: 'Loading FFmpeg (downloading ~31MB)...',
  });

  try {
    // Use single-threaded version to avoid SharedArrayBuffer CORS issues
    // Use jsDelivr CDN which has proper CORS headers
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });
  } catch (error) {
    console.error('FFmpeg load error:', error);
    onProgress?.({
      phase: 'error',
      progress: 0,
      message: `Failed to load FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    throw error;
  }

  ffmpegInstance = ffmpeg;

  onProgress?.({
    phase: 'loading',
    progress: 100,
    message: 'FFmpeg loaded',
  });

  return ffmpeg;
}

/**
 * Process video segments and merge them into a single output file
 * Single segment: uses -c copy (fast, no re-encoding)
 * Multiple segments: uses filter_complex (slower, re-encoding required)
 */
export async function processConcatMode(
  videoFile: File,
  segments: Segment[],
  _outputName: string,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg(onProgress);

  try {
    onProgress?.({
      phase: 'processing',
      progress: 0,
      message: 'Reading video file...',
    });

    // Write input file to FFmpeg virtual filesystem
    const inputData = new Uint8Array(await videoFile.arrayBuffer());
    await ffmpeg.writeFile('input.mp4', inputData);

    onProgress?.({
      phase: 'processing',
      progress: 10,
      message: segments.length === 1 ? 'Extracting segment (fast mode)...' : 'Building filter chain...',
    });

    // OPTIMIZATION: Single segment uses stream copy (no re-encoding)
    if (segments.length === 1) {
      const seg = segments[0];
      const duration = seg.end - seg.start;

      onProgress?.({
        phase: 'processing',
        progress: 20,
        message: 'Processing with stream copy (fast!)...',
      });

      await ffmpeg.exec([
        '-ss', seg.start.toFixed(2),
        '-t', duration.toFixed(2),
        '-i', 'input.mp4',
        '-c', 'copy',
        'output.mp4',
      ]);
    } else {
      // Multiple segments: use filter_complex
      const videoFilters = segments
        .map((seg, i) => `[0:v]trim=start=${seg.start.toFixed(2)}:end=${seg.end.toFixed(2)},setpts=PTS-STARTPTS[v${i}]`)
        .join('; ');

      const audioFilters = segments
        .map((seg, i) => `[0:a]atrim=start=${seg.start.toFixed(2)}:end=${seg.end.toFixed(2)},asetpts=PTS-STARTPTS[a${i}]`)
        .join('; ');

      const concatInputs = segments.map((_, i) => `[v${i}][a${i}]`).join('');
      const concatFilter = `${concatInputs}concat=n=${segments.length}:v=1:a=1[outv][outa]`;

      const filterComplex = `${videoFilters}; ${audioFilters}; ${concatFilter}`;

      onProgress?.({
        phase: 'processing',
        progress: 20,
        message: 'Processing video (re-encoding, this may take a while)...',
      });

      // Execute FFmpeg command
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '[outa]',
        'output.mp4',
      ]);
    }

    onProgress?.({
      phase: 'processing',
      progress: 90,
      message: 'Reading output file...',
    });

    // Read output file
    const outputData = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([new Uint8Array(outputData as Uint8Array)], { type: 'video/mp4' });

    // Cleanup
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile('output.mp4');

    onProgress?.({
      phase: 'complete',
      progress: 100,
      message: 'Complete! Ready to download.',
    });

    return blob;
  } catch (error) {
    onProgress?.({
      phase: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Processing failed',
    });
    throw error;
  }
}

/**
 * Process video segments and split them into separate files
 */
export async function processSplitMode(
  videoFile: File,
  segments: Segment[],
  _outputPrefix: string,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<Blob[]> {
  const ffmpeg = await loadFFmpeg(onProgress);

  try {
    onProgress?.({
      phase: 'processing',
      progress: 0,
      message: 'Reading video file...',
    });

    // Write input file to FFmpeg virtual filesystem
    const inputData = new Uint8Array(await videoFile.arrayBuffer());
    await ffmpeg.writeFile('input.mp4', inputData);

    const outputs: Blob[] = [];
    const totalSegments = segments.length;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const duration = seg.end - seg.start;
      const outputName = `output_${i}.mp4`;

      const baseProgress = (i / totalSegments) * 100;
      onProgress?.({
        phase: 'processing',
        progress: Math.round(baseProgress),
        message: `Processing segment ${i + 1} of ${totalSegments}...`,
      });

      // Use -c copy for fast extraction (no re-encoding)
      await ffmpeg.exec([
        '-ss', seg.start.toFixed(2),
        '-t', duration.toFixed(2),
        '-i', 'input.mp4',
        '-c', 'copy',
        outputName,
      ]);

      // Read output
      const outputData = await ffmpeg.readFile(outputName);
      outputs.push(new Blob([new Uint8Array(outputData as Uint8Array)], { type: 'video/mp4' }));

      // Cleanup this output
      await ffmpeg.deleteFile(outputName);
    }

    // Cleanup input
    await ffmpeg.deleteFile('input.mp4');

    onProgress?.({
      phase: 'complete',
      progress: 100,
      message: `Complete! ${outputs.length} files ready to download.`,
    });

    return outputs;
  } catch (error) {
    onProgress?.({
      phase: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Processing failed',
    });
    throw error;
  }
}

/**
 * Trigger browser download for a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
