import { useState, useRef, useEffect, useCallback } from 'react';
import { HistoryManager } from '../utils/HistoryManager.ts';

export interface UseGameHistoryOptions<TState> {
  /** Initial state to start with */
  initialState: TState;
  /** Maximum number of states to keep in history (default: 100) */
  maxHistorySize?: number;
  /** localStorage key for persistence (optional) */
  persistKey?: string;
  /** Callback when state changes */
  onStateChange?: (state: TState) => void;
}

export interface UseGameHistoryResult<TState> {
  /** The current game state */
  currentState: TState;
  /** Push a new state onto the history */
  pushState: (state: TState) => void;
  /** Undo to previous state */
  undo: () => void;
  /** Redo to next state */
  redo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Reset history to initial state or a new state */
  reset: (newInitialState?: TState) => void;
  /** Access to underlying history manager (for dev tools) */
  history: HistoryManager<TState> | undefined;
}

/**
 * React hook for managing game state with undo/redo functionality.
 * Supports localStorage persistence and provides a clean API for state management.
 *
 * @template TState - The type of game state being managed
 * @param options - Configuration options
 * @returns Object with state and history control methods
 *
 * @example
 * ```typescript
 * const {
 *   currentState,
 *   pushState,
 *   undo,
 *   redo,
 *   canUndo,
 *   canRedo,
 * } = useGameHistory({
 *   initialState: initializeGame(seed),
 *   persistKey: 'freecell-game',
 * });
 *
 * // When user makes a move
 * const newState = applyMove(currentState, from, to);
 * if (newState) {
 *   pushState(newState);
 * }
 * ```
 */
export function useGameHistory<TState>({
  initialState,
  maxHistorySize = 100,
  persistKey,
  onStateChange,
}: UseGameHistoryOptions<TState>): UseGameHistoryResult<TState> {
  const historyRef = useRef<HistoryManager<TState> | null>(null);
  const [currentState, setCurrentState] = useState<TState>(initialState);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize history manager (runs only once on mount)
  useEffect(() => {
    // Try to restore from localStorage if persistKey is provided
    if (persistKey) {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
          historyRef.current = HistoryManager.deserialize<TState>(saved, maxHistorySize);
          const restoredState = historyRef.current.getCurrentState();
          setCurrentState(restoredState);
          updateFlags();
          onStateChange?.(restoredState);
          return;
        }
      } catch (error) {
        console.warn('Failed to restore game history from localStorage:', error);
        // Fall through to create new history
      }
    }

    // Create new history manager
    historyRef.current = new HistoryManager<TState>({ maxSize: maxHistorySize });
    historyRef.current.push(initialState);
    updateFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Persist to localStorage when state changes
  useEffect(() => {
    if (persistKey && historyRef.current) {
      try {
        localStorage.setItem(persistKey, historyRef.current.serialize());
      } catch (error) {
        console.warn('Failed to save game history to localStorage:', error);
      }
    }
  }, [currentState, persistKey]);

  // Helper to update undo/redo flags
  const updateFlags = () => {
    if (!historyRef.current) return;
    setCanUndo(historyRef.current.canUndo());
    setCanRedo(historyRef.current.canRedo());
  };

  /**
   * Push a new state onto the history stack.
   * This removes any redo history (like browser behavior).
   */
  const pushState = useCallback(
    (newState: TState) => {
      if (!historyRef.current) return;
      historyRef.current.push(newState);
      setCurrentState(newState);
      updateFlags();
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  /**
   * Undo to the previous state.
   * Does nothing if undo is not available.
   */
  const undo = useCallback(() => {
    if (!historyRef.current) return;
    const prevState = historyRef.current.undo();
    if (prevState) {
      setCurrentState(prevState);
      updateFlags();
      onStateChange?.(prevState);
    }
  }, [onStateChange]);

  /**
   * Redo to the next state.
   * Does nothing if redo is not available.
   */
  const redo = useCallback(() => {
    if (!historyRef.current) return;
    const nextState = historyRef.current.redo();
    if (nextState) {
      setCurrentState(nextState);
      updateFlags();
      onStateChange?.(nextState);
    }
  }, [onStateChange]);

  /**
   * Reset history to the initial state or a new state.
   * Clears all undo/redo history.
   *
   * @param newInitialState - Optional new initial state to reset to
   */
  const reset = useCallback((newInitialState?: TState) => {
    if (!historyRef.current) return;
    const stateToUse = newInitialState ?? initialState;
    historyRef.current.clear();
    historyRef.current.push(stateToUse);
    setCurrentState(stateToUse);
    updateFlags();
    onStateChange?.(stateToUse);
  }, [initialState, onStateChange]);

  return {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    history: historyRef.current ?? undefined,
  };
}
