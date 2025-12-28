/**
 * Shared auto-move hook
 * Provides unified auto-move functionality for all card games
 *
 * Automatically executes safe moves to foundations when:
 * - Auto-move is enabled in settings
 * - User is not currently interacting (dragging/selecting)
 * - A valid auto-move is available
 *
 * @example
 * ```tsx
 * useAutoMove({
 *   gameState,
 *   findAutoMove: (state) => findSafeAutoMove(state),
 *   executeMove: (state, move) => {
 *     // Execute the move and return new state
 *     return moveCardToFoundation(state, move.from, move.to);
 *   },
 *   onStateChange: pushState,
 *   isInteracting: draggingCard || selectedCard,
 *   enabled: settings.autoComplete,
 *   debounceMs: 300,
 * });
 * ```
 */

import { useEffect, useRef } from 'react';

export interface AutoMoveOptions<TState, TMove> {
  /**
   * Current game state
   */
  gameState: TState;

  /**
   * Function to find the next safe auto-move
   * Returns null if no safe moves available
   */
  findAutoMove: (state: TState) => TMove | null;

  /**
   * Function to execute a move and return new state
   * Should return new state if successful
   */
  executeMove: (state: TState, move: TMove) => TState | null;

  /**
   * Callback to update game state after auto-move
   */
  onStateChange: (newState: TState) => void;

  /**
   * Whether user is currently interacting (dragging, selecting)
   * Auto-move is paused during interaction to avoid conflicts
   */
  isInteracting?: boolean;

  /**
   * Whether auto-move is enabled (from settings)
   * Default: true
   */
  enabled?: boolean;

  /**
   * Debounce delay in milliseconds
   * Prevents rapid re-execution after state changes
   * Default: 300ms
   */
  debounceMs?: number;
}

/**
 * Hook that automatically executes safe moves when conditions are met
 *
 * Features:
 * - Debounced execution (prevents rapid loops)
 * - Pauses during user interaction
 * - Respects settings toggle
 * - Proper cleanup on unmount
 */
export function useAutoMove<TState, TMove>(options: AutoMoveOptions<TState, TMove>): void {
  const {
    gameState,
    findAutoMove,
    executeMove,
    onStateChange,
    isInteracting = false,
    enabled = true,
    debounceMs = 300,
  } = options;

  // Use ref to track timer ID for cleanup
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip if disabled or user is interacting
    if (!enabled || isInteracting) {
      return;
    }

    // Clear any pending timer
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    // Debounce auto-move execution
    timerRef.current = window.setTimeout(() => {
      // Find next safe auto-move
      const autoMove = findAutoMove(gameState);

      if (autoMove) {
        // Execute the move
        const newState = executeMove(gameState, autoMove);

        // Update state if move was successful
        if (newState && newState !== gameState) {
          onStateChange(newState);
        }
      }

      timerRef.current = null;
    }, debounceMs);

    // Cleanup on unmount or dependency change
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, findAutoMove, executeMove, onStateChange, isInteracting, enabled, debounceMs]);
}
