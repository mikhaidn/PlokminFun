import { DayLog, Period, PERIOD_EMOJIS, PERIOD_LABELS } from '../types';

// Period abbreviations for URL params
const PERIOD_ABBREV: Record<Period, string> = {
  morning: 'm',
  afternoon: 'a',
  night: 'n',
};

/**
 * Encode DayLog to human-readable URL params
 * Omits empty periods to keep URLs shorter
 * Example: ?d=2026-01-11&m=pee,poop,walk&m_notes=Good+walk&s=Vet+visit
 */
export function generateShareUrl(log: DayLog): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();

  // Add date
  params.set('d', log.date);

  // Add period data (omit if completely empty)
  const periods: Period[] = ['morning', 'afternoon', 'night'];
  periods.forEach((period) => {
    const periodLog = log.periods[period];
    const abbrev = PERIOD_ABBREV[period];

    // Build activity list
    const activities = [];
    if (periodLog.pee) activities.push('pee');
    if (periodLog.poop) activities.push('poop');
    if (periodLog.walk) activities.push('walk');

    // Only include period if it has activities OR notes
    if (activities.length > 0 || periodLog.notes) {
      params.set(abbrev, activities.length > 0 ? activities.join(',') : 'none');

      // Add notes if present
      if (periodLog.notes) {
        params.set(`${abbrev}_notes`, periodLog.notes);
      }
    }
  });

  // Add day summary if present
  if (log.summary) {
    params.set('s', log.summary);
  }

  // Add photo URL if present
  if (log.photoUrl) {
    params.set('photo', log.photoUrl);
  }

  return `${baseUrl}?${params.toString()}`;
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

  // Add day summary if present
  if (log.summary) {
    lines.push('');
    lines.push(`📝 ${log.summary}`);
  }

  // Add photo if present
  if (log.photoUrl) {
    lines.push('');
    lines.push(`📷 ${log.photoUrl}`);
  }

  // Add shareable URL at the end
  const url = generateShareUrl(log);
  lines.push('');
  lines.push(`Share: ${url}`);

  return lines.join('\n');
}

/**
 * Parse share URL or text back to DayLog
 */
export function parseShareText(text: string): DayLog | null {
  try {
    // Extract URL from text if present
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    const urlString = urlMatch ? urlMatch[0] : text;

    // Parse URL params
    const url = new URL(urlString.includes('?') ? urlString : `http://dummy${urlString}`);
    const params = new URLSearchParams(url.search);

    const date = params.get('d');
    if (!date) return null;

    // Parse periods
    const periods: Period[] = ['morning', 'afternoon', 'night'];
    const dayLog: DayLog = {
      date,
      periods: {
        morning: { pee: false, poop: false, walk: false, notes: '' },
        afternoon: { pee: false, poop: false, walk: false, notes: '' },
        night: { pee: false, poop: false, walk: false, notes: '' },
      },
    };

    periods.forEach((period) => {
      const abbrev = PERIOD_ABBREV[period];
      const activitiesParam = params.get(abbrev);
      const notesParam = params.get(`${abbrev}_notes`);

      if (activitiesParam && activitiesParam !== 'none') {
        const activities = activitiesParam.split(',');
        dayLog.periods[period].pee = activities.includes('pee');
        dayLog.periods[period].poop = activities.includes('poop');
        dayLog.periods[period].walk = activities.includes('walk');
      }

      if (notesParam) {
        dayLog.periods[period].notes = notesParam;
      }
    });

    // Parse day summary
    const summary = params.get('s');
    if (summary) {
      dayLog.summary = summary;
    }

    // Parse photo URL
    const photoUrl = params.get('photo');
    if (photoUrl) {
      dayLog.photoUrl = photoUrl;
    }

    return dayLog;
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
  const date = params.get('d');
  if (!date) return null;

  // Reuse the parser with current URL
  return parseShareText(window.location.href);
}
