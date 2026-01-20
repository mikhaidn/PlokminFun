import { useLocalStorage } from './useLocalStorage';
import { InstructionSet, Task, createEmptyInstructionSet } from '../types';

const STORAGE_KEY = 'pet-care-instructions';

export function useInstructions() {
  const [instructions, setInstructions] = useLocalStorage<InstructionSet | null>(STORAGE_KEY, null);

  const createInstructions = (petName: string) => {
    const newInstructions = createEmptyInstructionSet(petName);
    setInstructions(newInstructions);
    return newInstructions;
  };

  const updateInstructions = (updates: Partial<InstructionSet>) => {
    if (!instructions) return;

    setInstructions({
      ...instructions,
      ...updates,
      updated: new Date().toISOString(),
    });
  };

  const addTask = (task: Task) => {
    if (!instructions) return;

    setInstructions({
      ...instructions,
      tasks: [...instructions.tasks, task],
      updated: new Date().toISOString(),
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (!instructions) return;

    setInstructions({
      ...instructions,
      tasks: instructions.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
      updated: new Date().toISOString(),
    });
  };

  const deleteTask = (taskId: string) => {
    if (!instructions) return;

    setInstructions({
      ...instructions,
      tasks: instructions.tasks.filter((task) => task.id !== taskId),
      updated: new Date().toISOString(),
    });
  };

  const importInstructions = (imported: InstructionSet) => {
    setInstructions({
      ...imported,
      updated: new Date().toISOString(),
    });
  };

  const clearInstructions = () => {
    setInstructions(null);
  };

  return {
    instructions,
    createInstructions,
    updateInstructions,
    addTask,
    updateTask,
    deleteTask,
    importInstructions,
    clearInstructions,
  };
}
