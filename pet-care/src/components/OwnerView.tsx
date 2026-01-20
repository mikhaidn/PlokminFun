import { useState } from 'react';
import { useInstructions } from '../hooks/useInstructions';
import { createEmptyTask, CATEGORY_EMOJIS, PRIORITY_EMOJIS, PERIOD_LABELS } from '../types';
import { TaskEditor } from './TaskEditor';
import { getExampleInstructions } from '../utils/examples';
import { ShareInstructionsButton } from './ShareInstructionsButton';
import { ImportInstructionsButton } from './ImportInstructionsButton';

export function OwnerView() {
  const {
    instructions,
    createInstructions,
    updateInstructions,
    addTask,
    updateTask,
    deleteTask,
    importInstructions,
  } = useInstructions();

  const [petName, setPetName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleCreateInstructions = (e: React.FormEvent) => {
    e.preventDefault();
    if (petName.trim()) {
      createInstructions(petName.trim());
    }
  };

  const handleAddTask = () => {
    const newTask = createEmptyTask();
    addTask(newTask);
    setEditingTaskId(newTask.id);
  };

  const handleLoadExample = () => {
    const example = getExampleInstructions();
    importInstructions(example);
  };

  if (!instructions) {
    return (
      <div className="setup-form">
        <h2>Set Up Pet Care Instructions</h2>
        <form onSubmit={handleCreateInstructions}>
          <label>
            Pet's Name:
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Enter pet name"
              autoFocus
            />
          </label>
          <button type="submit" disabled={!petName.trim()}>
            Create Instructions
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>Or try an example:</p>
          <button type="button" onClick={handleLoadExample} className="secondary">
            Load Example Instructions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-view">
      <div className="pet-info">
        <h2>Instructions for {instructions.petName}</h2>
        <div className="form-group">
          <label>
            Owner Name (optional):
            <input
              type="text"
              value={instructions.ownerName || ''}
              onChange={(e) => updateInstructions({ ownerName: e.target.value })}
              placeholder="Your name"
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            General Notes:
            <textarea
              value={instructions.generalNotes}
              onChange={(e) => updateInstructions({ generalNotes: e.target.value })}
              placeholder="Important info about your pet (e.g., can be alone for 8-9 hours when needed...)"
              rows={3}
            />
          </label>
        </div>
      </div>

      <div className="tasks-section">
        <div className="section-header">
          <h3>Daily Tasks</h3>
          <button onClick={handleAddTask} className="add-button">
            + Add Task
          </button>
        </div>

        {instructions.tasks.length === 0 ? (
          <p className="empty-message">No tasks yet. Click "Add Task" to create one.</p>
        ) : (
          <div className="tasks-list">
            {instructions.tasks.map((task) => (
              <div key={task.id} className="task-item">
                {editingTaskId === task.id ? (
                  <TaskEditor
                    task={task}
                    onSave={(updates) => {
                      updateTask(task.id, updates);
                      setEditingTaskId(null);
                    }}
                    onCancel={() => setEditingTaskId(null)}
                    onDelete={() => {
                      deleteTask(task.id);
                      setEditingTaskId(null);
                    }}
                  />
                ) : (
                  <div className="task-display" onClick={() => setEditingTaskId(task.id)}>
                    <div className="task-header">
                      <span className="task-icons">
                        {PRIORITY_EMOJIS[task.priority]}
                        {CATEGORY_EMOJIS[task.category]}
                      </span>
                      <span className="task-title">{task.title}</span>
                      {task.period && (
                        <span className="task-period">{PERIOD_LABELS[task.period]}</span>
                      )}
                    </div>
                    {task.description && <p className="task-description">{task.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="action-bar">
        <ShareInstructionsButton instructions={instructions} />
        <ImportInstructionsButton onImport={importInstructions} />
      </div>
    </div>
  );
}
