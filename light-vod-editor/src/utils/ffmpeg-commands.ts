import { formatTimeFFmpeg } from './formatters';

export interface Segment {
  start: number;
  end: number;
  name?: string;
}

/**
 * Generate FFmpeg concat command to merge multiple segments
 * For single segment: uses fast -c copy (no re-encoding)
 * For multiple segments: uses filter_complex (requires re-encoding)
 */
export function generateConcatCommand(inputFile: string, segments: Segment[], outputName?: string): string {
  if (segments.length === 0) {
    throw new Error('Cannot generate command: no segments provided');
  }

  const baseName = inputFile.replace(/\.[^/.]+$/, '');
  const ext = inputFile.match(/\.[^/.]+$/)?.[0] || '.mp4';

  // Use custom name, or first segment name, or default to baseName_merged
  let finalName: string;
  if (outputName) {
    finalName = outputName;
  } else if (segments[0]?.name) {
    finalName = segments[0].name;
  } else {
    finalName = segments.length === 1 ? baseName : `${baseName}_merged`;
  }

  // OPTIMIZATION: Single segment = use fast stream copy (no re-encoding)
  if (segments.length === 1) {
    const seg = segments[0];
    const duration = seg.end - seg.start;
    return `ffmpeg -ss ${formatTimeFFmpeg(seg.start)} -t ${duration.toFixed(2)} -i "${inputFile}" -c copy "${finalName}${ext}"`;
  }

  // Multiple segments: use filter_complex to merge
  // Video filters: trim each segment
  const videoFilters = segments
    .map((seg, i) => `[0:v]trim=start=${seg.start.toFixed(2)}:end=${seg.end.toFixed(2)},setpts=PTS-STARTPTS[v${i}]`)
    .join('; ');

  // Audio filters: trim each segment
  const audioFilters = segments
    .map((seg, i) => `[0:a]atrim=start=${seg.start.toFixed(2)}:end=${seg.end.toFixed(2)},asetpts=PTS-STARTPTS[a${i}]`)
    .join('; ');

  // Concat filter: combine all segments
  const concatInputs = segments.map((_, i) => `[v${i}][a${i}]`).join('');
  const concatFilter = `${concatInputs}concat=n=${segments.length}:v=1:a=1[outv][outa]`;

  return `ffmpeg -i "${inputFile}" -filter_complex "${videoFilters}; ${audioFilters}; ${concatFilter}" -map "[outv]" -map "[outa]" "${finalName}${ext}"`;
}

/**
 * Generate FFmpeg split commands to extract segments as separate files
 */
export function generateSplitCommands(inputFile: string, segments: Segment[], outputPrefix?: string): string[] {
  if (segments.length === 0) {
    throw new Error('Cannot generate command: no segments provided');
  }

  const baseName = inputFile.replace(/\.[^/.]+$/, '');
  const ext = inputFile.match(/\.[^/.]+$/)?.[0] || '.mp4';
  const prefix = outputPrefix || baseName;

  return segments.map((seg, i) => {
    const duration = seg.end - seg.start;

    // Use segment name if available, otherwise use numbered format
    const outputName = seg.name
      ? seg.name
      : `${prefix}_segment${i + 1}`;

    return `ffmpeg -ss ${formatTimeFFmpeg(seg.start)} -t ${duration.toFixed(2)} -i "${inputFile}" -c copy "${outputName}${ext}"`;
  });
}
