import {
  InstructionSet,
  DailyLog,
  Task,
  Period,
  TaskCategory,
  Priority,
  CATEGORY_EMOJIS,
  PRIORITY_EMOJIS,
  PERIOD_LABELS,
} from '../types';

/**
 * Convert instruction set to shareable text format
 */
export function instructionsToText(instructions: InstructionSet): string {
  let text = `🐾 Pet Care Instructions for ${instructions.petName}\n\n`;

  if (instructions.ownerName) {
    text += `👤 Owner: ${instructions.ownerName}\n\n`;
  }

  if (instructions.generalNotes) {
    text += `📋 General Notes:\n${instructions.generalNotes}\n\n`;
  }

  if (instructions.tasks.length > 0) {
    text += `Tasks:\n`;
    instructions.tasks.forEach((task) => {
      const priority = PRIORITY_EMOJIS[task.priority];
      const category = CATEGORY_EMOJIS[task.category];
      const period = task.period ? ` (${PERIOD_LABELS[task.period]})` : '';

      text += `${priority}${category} ${task.title}${period}\n`;
      if (task.description) {
        text += `  ${task.description}\n`;
      }
      text += '\n';
    });
  }

  text += `\nCreated: ${new Date(instructions.created).toLocaleDateString()}\n`;

  return text;
}

/**
 * Convert daily log to shareable text format
 */
export function dailyLogToText(log: DailyLog, instructions: InstructionSet): string {
  const date = new Date(log.date + 'T00:00:00');
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  let text = `🐾 Care Log for ${instructions.petName} - ${dateStr}\n\n`;

  // Group tasks by period
  const tasksByPeriod: Record<string, Task[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    anytime: [],
  };

  instructions.tasks.forEach((task) => {
    const period = task.period || 'anytime';
    tasksByPeriod[period].push(task);
  });

  // Show tasks by period
  (['morning', 'afternoon', 'evening', 'anytime'] as const).forEach((period) => {
    const tasks = tasksByPeriod[period];
    if (tasks.length === 0) return;

    const periodLabels = {
      morning: '🌅 Morning',
      afternoon: '☀️ Afternoon',
      evening: '🌙 Evening',
      anytime: '⏰ Anytime',
    };

    text += `${periodLabels[period]}:\n`;

    tasks.forEach((task) => {
      const completion = log.completions.find((c) => c.taskId === task.id);
      const checkbox = completion?.completed ? '✅' : '❌';
      const priority = PRIORITY_EMOJIS[task.priority];
      const category = CATEGORY_EMOJIS[task.category];

      text += `${checkbox} ${priority}${category} ${task.title}\n`;
      if (completion?.notes) {
        text += `   Notes: ${completion.notes}\n`;
      }
    });
    text += '\n';
  });

  if (log.generalNotes) {
    text += `📝 Daily Summary:\n${log.generalNotes}\n`;
  }

  return text;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Encode instruction set to URL parameters
 */
export function instructionsToURL(instructions: InstructionSet): string {
  const params = new URLSearchParams();
  params.set('pet', instructions.petName);

  if (instructions.ownerName) {
    params.set('owner', instructions.ownerName);
  }

  if (instructions.generalNotes) {
    params.set('notes', instructions.generalNotes);
  }

  // Encode tasks as JSON
  const tasksData = instructions.tasks.map((task) => ({
    title: task.title,
    desc: task.description || '',
    period: task.period || '',
    cat: task.category,
    pri: task.priority,
    rec: task.recurring ? '1' : '0',
  }));

  params.set('tasks', JSON.stringify(tasksData));

  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Parse instruction set from URL parameters
 */
export function instructionsFromURL(searchParams: URLSearchParams): InstructionSet | null {
  try {
    const petName = searchParams.get('pet');
    if (!petName) return null;

    const tasksJson = searchParams.get('tasks');
    if (!tasksJson) return null;

    const tasksData = JSON.parse(tasksJson) as Array<{
      title: string;
      desc: string;
      period: string;
      cat: string;
      pri: string;
      rec: string;
    }>;

    const tasks: Task[] = tasksData.map((t) => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.desc,
      period: (t.period as Period) || undefined,
      category: t.cat as TaskCategory,
      priority: t.pri as Priority,
      recurring: t.rec === '1',
    }));

    const now = new Date().toISOString();

    return {
      id: crypto.randomUUID(),
      petName,
      ownerName: searchParams.get('owner') || undefined,
      created: now,
      updated: now,
      tasks,
      generalNotes: searchParams.get('notes') || '',
    };
  } catch (error) {
    console.error('Failed to parse instructions from URL:', error);
    return null;
  }
}
