import { useState } from 'react';
import { Task, Period, TaskCategory, Priority } from '../types';

interface TaskEditorProps {
  task: Task;
  onSave: (updates: Partial<Task>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function TaskEditor({ task, onSave, onCancel, onDelete }: TaskEditorProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [period, setPeriod] = useState<Period | ''>(task.period || '');
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [priority, setPriority] = useState<Priority>(task.priority);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      period: period || undefined,
      category,
      priority,
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      onDelete();
    }
  };

  return (
    <div className="task-editor">
      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
        />
      </div>

      <div className="form-group">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>
            Category:
            <select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
              <option value="medication">💊 Medication</option>
              <option value="feeding">🍖 Feeding</option>
              <option value="bathroom">🚽 Bathroom</option>
              <option value="activity">🎾 Activity</option>
              <option value="other">📝 Other</option>
            </select>
          </label>
        </div>

        <div className="form-group">
          <label>
            When:
            <select value={period} onChange={(e) => setPeriod(e.target.value as Period | '')}>
              <option value="">Anytime</option>
              <option value="morning">🌅 Morning</option>
              <option value="afternoon">☀️ Afternoon</option>
              <option value="evening">🌙 Evening</option>
            </select>
          </label>
        </div>

        <div className="form-group">
          <label>
            Priority:
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleSave} disabled={!title.trim()}>
          Save
        </button>
        <button onClick={onCancel} className="secondary">
          Cancel
        </button>
        <button onClick={handleDelete} className="danger">
          Delete
        </button>
      </div>
    </div>
  );
}
