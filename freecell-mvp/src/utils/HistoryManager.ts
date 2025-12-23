/**
 * Generic history manager for implementing undo/redo functionality.
 * Uses immutable state snapshots with a simple array-based approach.
 *
 * @template TState - The type of state being managed
 */
export class HistoryManager<TState> {
  private states: TState[] = [];
  private currentIndex: number = -1;
  private maxSize: number;

  constructor(options: { maxSize?: number } = {}) {
    this.maxSize = options.maxSize ?? 100;
  }

  /**
   * Pushes a new state onto the history stack.
   * Removes any redo history (like browser history behavior).
   *
   * @param state - The new state to add
   */
  push(state: TState): void {
    // Remove any redo history (user made a new move after undoing)
    this.states = this.states.slice(0, this.currentIndex + 1);

    // Add new state
    this.states.push(state);
    this.currentIndex++;

    // Enforce size limit (FIFO - remove oldest)
    if (this.states.length > this.maxSize) {
      this.states.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undoes the last move by returning the previous state.
   *
   * @returns The previous state, or null if cannot undo
   */
  undo(): TState | null {
    if (!this.canUndo()) return null;
    this.currentIndex--;
    return this.states[this.currentIndex];
  }

  /**
   * Redoes the last undone move.
   *
   * @returns The next state, or null if cannot redo
   */
  redo(): TState | null {
    if (!this.canRedo()) return null;
    this.currentIndex++;
    return this.states[this.currentIndex];
  }

  /**
   * Checks if undo is available.
   *
   * @returns true if there is a previous state to undo to
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Checks if redo is available.
   *
   * @returns true if there is a next state to redo to
   */
  canRedo(): boolean {
    return this.currentIndex < this.states.length - 1;
  }

  /**
   * Gets the current state without modifying history.
   *
   * @returns The current state
   * @throws Error if history is empty
   */
  getCurrentState(): TState {
    if (this.currentIndex < 0) {
      throw new Error('History is empty');
    }
    return this.states[this.currentIndex];
  }

  /**
   * Gets the full history array (read-only).
   * Useful for debugging and dev tools.
   *
   * @returns A readonly copy of the history
   */
  getHistory(): readonly TState[] {
    return this.states;
  }

  /**
   * Jumps to a specific index in history.
   * Useful for time-travel debugging.
   *
   * @param index - The history index to jump to
   * @returns The state at that index
   * @throws Error if index is out of bounds
   */
  jumpToIndex(index: number): TState {
    if (index < 0 || index >= this.states.length) {
      throw new Error(`Invalid history index: ${index}`);
    }
    this.currentIndex = index;
    return this.states[index];
  }

  /**
   * Serializes the history to a JSON string for persistence.
   *
   * @returns JSON string representation of history
   */
  serialize(): string {
    return JSON.stringify({
      states: this.states,
      currentIndex: this.currentIndex,
    });
  }

  /**
   * Deserializes history from a JSON string.
   *
   * @param data - JSON string to deserialize
   * @param maxSize - Optional max size for the new manager
   * @returns A new HistoryManager instance
   */
  static deserialize<T>(data: string, maxSize?: number): HistoryManager<T> {
    const { states, currentIndex } = JSON.parse(data);
    const manager = new HistoryManager<T>({ maxSize });
    manager.states = states;
    manager.currentIndex = currentIndex;
    return manager;
  }

  /**
   * Clears all history.
   */
  clear(): void {
    this.states = [];
    this.currentIndex = -1;
  }

  /**
   * Gets the current history size (number of states).
   *
   * @returns Number of states in history
   */
  size(): number {
    return this.states.length;
  }
}
