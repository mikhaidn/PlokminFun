import { useState } from 'react';
import { useInstructions } from '../hooks/useInstructions';
import { useDailyLog } from '../hooks/useDailyLog';
import { Task, CATEGORY_EMOJIS, PRIORITY_EMOJIS, PERIOD_LABELS, PERIOD_EMOJIS } from '../types';
import { ShareLogButton } from './ShareLogButton';

export function CaretakerView() {
  const { instructions } = useInstructions();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { log, toggleTaskCompletion, updateTaskCompletion, updateGeneralNotes } = useDailyLog(
    selectedDate,
    instructions?.id || 'placeholder'
  );

  if (!instructions) {
    return <div>No instructions available</div>;
  }

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

  const getTaskCompletion = (taskId: string) => {
    return log.completions.find((c) => c.taskId === taskId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = selectedDate === today;

  return (
    <div className="caretaker-view">
      <div className="date-selector">
        <button
          onClick={() => {
            const date = new Date(selectedDate + 'T00:00:00');
            date.setDate(date.getDate() - 1);
            setSelectedDate(date.toISOString().split('T')[0]);
          }}
        >
          ←
        </button>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        <button
          onClick={() => {
            const date = new Date(selectedDate + 'T00:00:00');
            date.setDate(date.getDate() + 1);
            setSelectedDate(date.toISOString().split('T')[0]);
          }}
        >
          →
        </button>
        {!isToday && (
          <button onClick={() => setSelectedDate(today)} className="today-button">
            Today
          </button>
        )}
      </div>

      <div className="pet-header">
        <h2>Care Log for {instructions.petName}</h2>
        <p className="date-display">{formatDate(selectedDate)}</p>
      </div>

      {instructions.generalNotes && (
        <div className="general-notes-display">
          <h4>📋 General Notes from Owner:</h4>
          <p>{instructions.generalNotes}</p>
        </div>
      )}

      {(['morning', 'afternoon', 'evening', 'anytime'] as const).map((period) => {
        const tasks = tasksByPeriod[period];
        if (tasks.length === 0) return null;

        return (
          <div key={period} className="period-section">
            <h3>
              {PERIOD_EMOJIS[period]} {PERIOD_LABELS[period]}
            </h3>
            <div className="tasks-checklist">
              {tasks.map((task) => {
                const completion = getTaskCompletion(task.id);
                const isCompleted = completion?.completed || false;

                return (
                  <div key={task.id} className={`task-checkbox ${isCompleted ? 'completed' : ''}`}>
                    <label>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleTaskCompletion(task.id)}
                      />
                      <span className="task-content">
                        <span className="task-icons">
                          {PRIORITY_EMOJIS[task.priority]}
                          {CATEGORY_EMOJIS[task.category]}
                        </span>
                        <span className="task-title">{task.title}</span>
                      </span>
                    </label>
                    {task.description && <p className="task-description">{task.description}</p>}
                    {isCompleted && (
                      <div className="task-notes-input">
                        <textarea
                          value={completion?.notes || ''}
                          onChange={(e) =>
                            updateTaskCompletion(task.id, {
                              notes: e.target.value,
                              completed: true,
                            })
                          }
                          placeholder="Add notes about this task (optional)..."
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="daily-summary">
        <h4>Daily Summary</h4>
        <textarea
          value={log.generalNotes}
          onChange={(e) => updateGeneralNotes(e.target.value)}
          placeholder="Add any overall notes for the day..."
          rows={4}
        />
      </div>

      <div className="action-bar">
        <ShareLogButton log={log} instructions={instructions} />
      </div>
    </div>
  );
}
