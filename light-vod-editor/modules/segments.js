/**
 * Segment Management Module
 *
 * Handles CRUD operations for video segments and UI rendering.
 */

import {
  getSegments,
  getSelectedSegmentIndex,
  addSegment as addSegmentToState,
  updateSegment as updateSegmentInState,
  removeSegment as removeSegmentFromState,
  setSelectedSegmentIndex,
  getVideoDuration,
} from './state.js';
import { formatTime } from './utils.js';

/**
 * Create a new segment at current video time
 * @param {number} currentTime - Current video position
 * @param {number} duration - Default segment duration (seconds)
 * @returns {number} Index of new segment
 */
export function createSegmentAtTime(currentTime, duration = 10) {
  const videoDuration = getVideoDuration();
  const startTime = Math.max(0, currentTime);
  const endTime = Math.min(videoDuration, startTime + duration);

  return addSegmentToState({ start: startTime, end: endTime });
}

/**
 * Create a segment centered on current time
 * @param {number} currentTime - Current video position
 * @param {number} duration - Segment duration (seconds)
 * @returns {number} Index of new segment
 */
export function createSegmentCentered(currentTime, duration = 10) {
  const videoDuration = getVideoDuration();
  const halfDuration = duration / 2;
  let startTime = Math.max(0, currentTime - halfDuration);
  let endTime = Math.min(videoDuration, startTime + duration);

  // Adjust if we hit the end boundary
  if (endTime >= videoDuration) {
    endTime = videoDuration;
    startTime = Math.max(0, videoDuration - duration);
  }

  return addSegmentToState({ start: startTime, end: endTime });
}

/**
 * Create a segment with manual start/end times
 * @param {number} start - Start time in seconds
 * @param {number} end - End time in seconds
 * @returns {number} Index of new segment
 */
export function createSegmentManual(start, end) {
  const videoDuration = getVideoDuration();

  if (isNaN(start) || isNaN(end)) {
    throw new Error('Invalid segment times');
  }

  if (start < 0 || end > videoDuration || start >= end) {
    throw new Error('Segment times out of bounds');
  }

  return addSegmentToState({ start, end });
}

/**
 * Update segment start time
 * @param {number} index - Segment index
 * @param {number} start - New start time
 */
export function updateSegmentStart(index, start) {
  const segments = getSegments();
  const segment = segments[index];

  if (!segment) return;

  // Ensure start doesn't go past end
  if (start < segment.end - 0.5) {
    updateSegmentInState(index, { start: Math.max(0, start) });
  }
}

/**
 * Update segment end time
 * @param {number} index - Segment index
 * @param {number} end - New end time
 */
export function updateSegmentEnd(index, end) {
  const segments = getSegments();
  const segment = segments[index];
  const videoDuration = getVideoDuration();

  if (!segment) return;

  // Ensure end doesn't go before start
  if (end > segment.start + 0.5) {
    updateSegmentInState(index, { end: Math.min(videoDuration, end) });
  }
}

/**
 * Move entire segment (preserves duration)
 * @param {number} index - Segment index
 * @param {number} newStart - New start time
 */
export function moveSegment(index, newStart) {
  const segments = getSegments();
  const segment = segments[index];
  const videoDuration = getVideoDuration();

  if (!segment) return;

  const duration = segment.end - segment.start;
  let start = newStart;
  let end = newStart + duration;

  // Keep segment within bounds
  if (start < 0) {
    start = 0;
    end = duration;
  } else if (end > videoDuration) {
    end = videoDuration;
    start = videoDuration - duration;
  }

  updateSegmentInState(index, { start, end });
}

/**
 * Delete a segment
 * @param {number} index - Segment index
 * @returns {boolean} Success status
 */
export function deleteSegment(index) {
  removeSegmentFromState(index);
  return true;
}

/**
 * Select a segment
 * @param {number} index - Segment index
 */
export function selectSegment(index) {
  setSelectedSegmentIndex(index);
}

/**
 * Render segments list UI
 * @param {HTMLElement} container - Container element
 * @param {Object} callbacks - Event callbacks
 */
export function renderSegmentsList(container, callbacks = {}) {
  const segments = getSegments();
  const selectedIndex = getSelectedSegmentIndex();

  if (segments.length === 0) {
    container.innerHTML =
      '<p style="color: #8b949e; text-align: center; padding: 20px;">No segments added yet. Mark start and end points above.</p>';
    return;
  }

  container.innerHTML = segments
    .map((seg, i) => {
      const duration = seg.end - seg.start;
      const isSelected = selectedIndex === i;

      return `
      <div class="segment-item ${isSelected ? 'selected' : ''}" data-segment-index="${i}">
        <div class="segment-number">${i + 1}</div>
        <div class="segment-info">
          <div>
            <div class="segment-time">Start: ${formatTime(seg.start)}</div>
            <small class="segment-duration">${seg.start.toFixed(2)}s</small>
          </div>
          <div>
            <div class="segment-time">End: ${formatTime(seg.end)}</div>
            <small class="segment-duration">${seg.end.toFixed(2)}s</small>
          </div>
          <div>
            <div class="segment-time">Duration: ${formatTime(duration)}</div>
            <small class="segment-duration">${duration.toFixed(2)}s</small>
          </div>
        </div>
        <div class="segment-actions">
          <button class="secondary small" data-action="preview" data-index="${i}">▶️</button>
          <button class="danger small" data-action="delete" data-index="${i}">🗑️</button>
        </div>
      </div>
    `;
    })
    .join('');

  // Attach event listeners
  container.querySelectorAll('[data-segment-index]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (!e.target.closest('[data-action]')) {
        const index = parseInt(el.dataset.segmentIndex);
        if (callbacks.onSelect) callbacks.onSelect(index);
      }
    });
  });

  container.querySelectorAll('[data-action="preview"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      if (callbacks.onPreview) callbacks.onPreview(index);
    });
  });

  container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      if (callbacks.onDelete) callbacks.onDelete(index);
    });
  });
}

/**
 * Get segment at specific time
 * @param {number} time - Time in seconds
 * @returns {number|null} Segment index or null
 */
export function getSegmentAtTime(time) {
  const segments = getSegments();
  return segments.findIndex((seg) => time >= seg.start && time <= seg.end);
}

/**
 * Check if segments overlap
 * @returns {Array} Array of overlapping segment pairs
 */
export function detectOverlaps() {
  const segments = getSegments();
  const overlaps = [];

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const seg1 = segments[i];
      const seg2 = segments[j];

      if (seg1.start < seg2.end && seg1.end > seg2.start) {
        overlaps.push([i, j]);
      }
    }
  }

  return overlaps;
}

/**
 * Get total duration of all segments
 * @returns {number} Total duration in seconds
 */
export function getTotalDuration() {
  const segments = getSegments();
  return segments.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
}
