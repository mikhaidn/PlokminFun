import { DayLog, Period, PERIOD_EMOJIS, PERIOD_LABELS } from '../types';

/**
 * Encode DayLog to base64 for URL sharing
 */
export function encodeDayLog(log: DayLog): string {
  const json = JSON.stringify(log);
  return btoa(json);
}

/**
 * Decode base64 string to DayLog
 */
export function decodeDayLog(encoded: string): DayLog | null {
  try {
    const json = atob(encoded);
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode day log:', error);
    return null;
  }
}

/**
 * Generate shareable URL with encoded data
 */
export function generateShareUrl(log: DayLog): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const encoded = encodeDayLog(log);
  return `${baseUrl}?data=${encoded}`;
}

/**
 * Generate Wordle-style text summary
 */
export function generateShareText(log: DayLog): string {
  const date = new Date(log.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const lines = ['🐕 Dog Log: ' + date, ''];

  const periods: Period[] = ['morning', 'afternoon', 'night'];
  periods.forEach((period) => {
    const periodLog = log.periods[period];
    const emoji = PERIOD_EMOJIS[period];
    const label = PERIOD_LABELS[period];

    // Build activity string
    const activities = [];
    if (periodLog.pee) activities.push('💧');
    if (periodLog.poop) activities.push('💩');
    if (periodLog.walk) activities.push('🚶');

    const activityStr = activities.length > 0 ? activities.join('') : '—';
    const noteStr = periodLog.notes ? ` "${periodLog.notes}"` : '';

    lines.push(`${emoji} ${label}: ${activityStr}${noteStr}`);
  });

  return lines.join('\n');
}

/**
 * Parse share text back to DayLog (for import)
 * Returns null if parsing fails
 */
export function parseShareText(text: string): DayLog | null {
  try {
    // Very simple parser - look for emojis and extract data
    // For MVP, we'll just extract the encoded URL if present
    const urlMatch = text.match(/\?data=([A-Za-z0-9+/=]+)/);
    if (urlMatch) {
      return decodeDayLog(urlMatch[1]);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse share text:', error);
    return null;
  }
}

/**
 * Get shared log from URL parameters
 */
export function getSharedLogFromUrl(): DayLog | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('data');
  if (!encoded) return null;
  return decodeDayLog(encoded);
}
