/**
 * FFmpeg Command Generation Module
 *
 * Generates FFmpeg commands for trimming, merging, and mixing audio.
 */

import { formatTimeFFmpeg } from './utils.js';
import { getSegments, getCurrentFile, getVoiceoverTracks } from './state.js';

/**
 * Generate concat command (merge all segments into one video)
 * @returns {string} FFmpeg command
 */
export function generateConcatCommand() {
  const segments = getSegments();
  const currentFile = getCurrentFile();

  if (!currentFile || segments.length === 0) {
    return '// Add segments to generate command';
  }

  const inputFile = currentFile.name;
  const baseName = inputFile.replace(/\.[^/.]+$/, '');
  const ext = inputFile.match(/\.[^/.]+$/)?.[0] || '.mp4';

  // Build video filters
  const videoFilters = segments
    .map(
      (seg, i) =>
        `[0:v]trim=start=${seg.start.toFixed(2)}:end=${seg.end.toFixed(2)},setpts=PTS-STARTPTS[v${i}]`
    )
    .join('; ');

  // Build audio filters
  const audioFilters = segments
    .map(
      (seg, i) =>
        `[0:a]atrim=start=${seg.start.toFixed(2)}:end=${seg.end.toFixed(2)},asetpts=PTS-STARTPTS[a${i}]`
    )
    .join('; ');

  // Build concat filter
  const concatInputs = segments.map((_, i) => `[v${i}][a${i}]`).join('');
  const concatFilter = `${concatInputs}concat=n=${segments.length}:v=1:a=1[outv][outa]`;

  // Final command
  return `ffmpeg -i "${inputFile}" -filter_complex "${videoFilters}; ${audioFilters}; ${concatFilter}" -map "[outv]" -map "[outa]" "${baseName}_merged${ext}"`;
}

/**
 * Generate split commands (each segment as separate file)
 * @returns {string} Multiple FFmpeg commands (one per segment)
 */
export function generateSplitCommands() {
  const segments = getSegments();
  const currentFile = getCurrentFile();

  if (!currentFile || segments.length === 0) {
    return '// Add segments to generate commands';
  }

  const inputFile = currentFile.name;
  const baseName = inputFile.replace(/\.[^/.]+$/, '');
  const ext = inputFile.match(/\.[^/.]+$/)?.[0] || '.mp4';

  return segments
    .map((seg, i) => {
      const duration = seg.end - seg.start;
      return `ffmpeg -ss ${formatTimeFFmpeg(seg.start)} -t ${duration.toFixed(2)} -i "${inputFile}" -c copy "${baseName}_segment${i + 1}${ext}"`;
    })
    .join('\n\n');
}

/**
 * Generate voiceover mix command (mix all voiceover tracks with video)
 * @returns {string} FFmpeg command
 */
export function generateVoiceoverCommand() {
  const currentFile = getCurrentFile();
  const allTracks = getVoiceoverTracks();
  const recordedTracks = allTracks.filter((t) => t.blob !== null);

  if (!currentFile || recordedTracks.length === 0) {
    return '// Add voiceover tracks first';
  }

  const inputFile = currentFile.name;
  const baseName = inputFile.replace(/\.[^/.]+$/, '');
  const ext = inputFile.match(/\.[^/.]+$/)?.[0] || '.mp4';

  // Build input list
  const inputs = [`-i "${inputFile}"`, ...recordedTracks.map((t) => `-i "${t.filename}"`)].join(
    ' '
  );

  // Build filter complex
  const filters = [];

  // Original audio at reduced volume
  filters.push('[0:a]volume=0.3[orig]');

  // Each voiceover track with delay
  recordedTracks.forEach((track, i) => {
    const delayMs = Math.round(track.startTime * 1000);
    const inputIndex = i + 1; // +1 because input 0 is the video
    filters.push(`[${inputIndex}:a]adelay=${delayMs}|${delayMs},volume=1.0[vo${i}]`);
  });

  // Mix all audio tracks
  const mixInputs = ['[orig]', ...recordedTracks.map((_, i) => `[vo${i}]`)].join('');
  const mixCount = recordedTracks.length + 1;
  filters.push(`${mixInputs}amix=inputs=${mixCount}:duration=first[audio]`);

  const filterComplex = filters.join(';');

  return `ffmpeg ${inputs} -filter_complex "${filterComplex}" -map 0:v -map "[audio]" -c:v copy -c:a aac "${baseName}_with_voiceovers${ext}"`;
}

/**
 * Get all commands based on current export mode
 * @param {string} mode - 'concat', 'split', or 'voiceover'
 * @returns {string} FFmpeg command(s)
 */
export function getCommand(mode) {
  switch (mode) {
    case 'concat':
      return generateConcatCommand();
    case 'split':
      return generateSplitCommands();
    case 'voiceover':
      return generateVoiceoverCommand();
    default:
      return '';
  }
}
