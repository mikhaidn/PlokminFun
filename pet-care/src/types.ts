export type Period = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type TaskCategory = 'medication' | 'feeding' | 'bathroom' | 'activity' | 'other';
export type Priority = 'high' | 'medium' | 'low';

// Owner-defined instructions
export interface Task {
  id: string;
  title: string;
  description?: string;
  period?: Period;
  category: TaskCategory;
  recurring: boolean; // Daily task vs one-time
  priority: Priority;
}

export interface InstructionSet {
  id: string;
  petName: string;
  ownerName?: string;
  created: string; // ISO date
  updated: string;
  tasks: Task[];
  generalNotes: string;
}

// Caretaker daily log
export interface TaskCompletion {
  taskId: string;
  completed: boolean;
  notes?: string;
  time?: string; // When it was done
}

export interface DailyLog {
  date: string; // ISO date
  instructionSetId: string;
  completions: TaskCompletion[];
  generalNotes: string;
}

// UI helpers
export const PERIOD_LABELS: Record<Period, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  anytime: 'Anytime',
};

export const PERIOD_EMOJIS: Record<Period, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌙',
  anytime: '⏰',
};

export const CATEGORY_EMOJIS: Record<TaskCategory, string> = {
  medication: '💊',
  feeding: '🍖',
  bathroom: '🚽',
  activity: '🎾',
  other: '📝',
};

export const PRIORITY_EMOJIS: Record<Priority, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

// Factory functions
export function createEmptyTask(): Task {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    period: 'anytime',
    category: 'other',
    recurring: true,
    priority: 'medium',
  };
}

export function createEmptyInstructionSet(petName: string = ''): InstructionSet {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    petName,
    ownerName: '',
    created: now,
    updated: now,
    tasks: [],
    generalNotes: '',
  };
}

export function createEmptyDailyLog(date: string, instructionSetId: string): DailyLog {
  return {
    date,
    instructionSetId,
    completions: [],
    generalNotes: '',
  };
}
