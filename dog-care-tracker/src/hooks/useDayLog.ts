import { useLocalStorage } from './useLocalStorage';
import { DayLog, Period, PeriodLog, createEmptyDayLog } from '../types';

/**
 * Hook for managing today's dog care log
 * Persists to localStorage automatically
 */
export function useDayLog() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const [dayLog, setDayLog] = useLocalStorage<DayLog>(
    `dog-log-${today}`,
    createEmptyDayLog(today)
  );

  const updatePeriod = (period: Period, updates: Partial<PeriodLog>) => {
    setDayLog((prev) => ({
      ...prev,
      periods: {
        ...prev.periods,
        [period]: {
          ...prev.periods[period],
          ...updates,
        },
      },
    }));
  };

  const importLog = (importedLog: DayLog) => {
    // Merge imported data with today's date
    setDayLog({
      ...importedLog,
      date: today,
    });
  };

  return {
    dayLog,
    updatePeriod,
    importLog,
  };
}
