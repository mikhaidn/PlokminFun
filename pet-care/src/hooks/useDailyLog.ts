import { useLocalStorage } from './useLocalStorage';
import { DailyLog, TaskCompletion, createEmptyDailyLog } from '../types';

export function useDailyLog(date: string, instructionSetId: string) {
  const [log, setLog] = useLocalStorage<DailyLog>(
    `pet-care-log-${date}`,
    createEmptyDailyLog(date, instructionSetId)
  );

  const toggleTaskCompletion = (taskId: string) => {
    const existingCompletion = log.completions.find(c => c.taskId === taskId);

    if (existingCompletion) {
      // Toggle completion
      setLog({
        ...log,
        completions: log.completions.map(c =>
          c.taskId === taskId ? { ...c, completed: !c.completed } : c
        ),
      });
    } else {
      // Add new completion
      setLog({
        ...log,
        completions: [
          ...log.completions,
          {
            taskId,
            completed: true,
            time: new Date().toISOString(),
          },
        ],
      });
    }
  };

  const updateTaskCompletion = (taskId: string, updates: Partial<TaskCompletion>) => {
    const existingCompletion = log.completions.find(c => c.taskId === taskId);

    if (existingCompletion) {
      setLog({
        ...log,
        completions: log.completions.map(c =>
          c.taskId === taskId ? { ...c, ...updates } : c
        ),
      });
    } else {
      setLog({
        ...log,
        completions: [
          ...log.completions,
          {
            taskId,
            completed: false,
            ...updates,
          },
        ],
      });
    }
  };

  const updateGeneralNotes = (notes: string) => {
    setLog({
      ...log,
      generalNotes: notes,
    });
  };

  const getTaskCompletion = (taskId: string): TaskCompletion | undefined => {
    return log.completions.find(c => c.taskId === taskId);
  };

  const clearLog = () => {
    setLog(createEmptyDailyLog(date, instructionSetId));
  };

  return {
    log,
    toggleTaskCompletion,
    updateTaskCompletion,
    updateGeneralNotes,
    getTaskCompletion,
    clearLog,
  };
}
