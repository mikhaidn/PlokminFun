import { useLocalStorage } from './useLocalStorage';
import { DayLog, Period, PeriodLog, createEmptyDayLog } from '../types';

/**
 * Hook for managing a dog care log for a specific date
 * Persists to localStorage automatically
 */
export function useDayLog(date: string) {
  const [dayLog, setDayLog] = useLocalStorage<DayLog>(
    `dog-log-${date}`,
    createEmptyDayLog(date)
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
    // Merge imported data with current date
    setDayLog({
      ...importedLog,
      date: date,
    });
  };

  const clearLog = () => {
    // Reset to empty log for current date
    setDayLog(createEmptyDayLog(date));
  };

  return {
    dayLog,
    updatePeriod,
    importLog,
    clearLog,
  };
}
