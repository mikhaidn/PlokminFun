export type Period = 'morning' | 'afternoon' | 'night';

export interface PeriodLog {
  pee: boolean;
  poop: boolean;
  walk: boolean;
  notes: string;
}

export interface DayLog {
  date: string; // ISO date: '2026-01-11'
  periods: {
    morning: PeriodLog;
    afternoon: PeriodLog;
    night: PeriodLog;
  };
  summary?: string; // Day-level notes
  photoUrl?: string; // External photo link (iCloud, Google Photos, etc.)
}

export const PERIOD_EMOJIS: Record<Period, string> = {
  morning: '🌅',
  afternoon: '☀️',
  night: '🌙',
};

export const PERIOD_LABELS: Record<Period, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
};

export const createEmptyPeriodLog = (): PeriodLog => ({
  pee: false,
  poop: false,
  walk: false,
  notes: '',
});

export const createEmptyDayLog = (date: string): DayLog => ({
  date,
  periods: {
    morning: createEmptyPeriodLog(),
    afternoon: createEmptyPeriodLog(),
    night: createEmptyPeriodLog(),
  },
});
