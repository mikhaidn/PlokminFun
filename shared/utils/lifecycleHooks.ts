/**
 * Lifecycle Hook Integration Patterns
 *
 * Provides utilities for integrating GameLifecycleHooks with animations,
 * state management, and UI updates.
 *
 * Phase 2 Week 3 of RFC-005
 */

import type { GameLifecycleHooks } from '../types/GameConfig';
import type { GameLocation } from '../types/GameLocation';
import { AnimationQueue } from './animationQueue';

/**
 * Hook executor that safely calls lifecycle hooks if they exist
 *
 * @template TState - Game state type
 */
export class LifecycleHookExecutor<TState> {
  private hooks?: GameLifecycleHooks<TState>;
  private animationQueue?: AnimationQueue;

  constructor(hooks?: GameLifecycleHooks<TState>, animationQueue?: AnimationQueue) {
    this.hooks = hooks;
    this.animationQueue = animationQueue;
  }

  /**
   * Execute onBeforeMove hook
   */
  async beforeMove(state: TState, from: GameLocation, to: GameLocation): Promise<void> {
    if (this.hooks?.onBeforeMove) {
      try {
        this.hooks.onBeforeMove(state, from, to);
      } catch (error) {
        console.error('Error in onBeforeMove hook:', error);
      }
    }
  }

  /**
   * Execute onAfterMove hook
   */
  async afterMove(
    oldState: TState,
    newState: TState,
    from: GameLocation,
    to: GameLocation
  ): Promise<void> {
    if (this.hooks?.onAfterMove) {
      try {
        this.hooks.onAfterMove(oldState, newState, from, to);
      } catch (error) {
        console.error('Error in onAfterMove hook:', error);
      }
    }
  }

  /**
   * Execute onInvalidMove hook
   */
  async invalidMove(state: TState, from: GameLocation, to: GameLocation): Promise<void> {
    if (this.hooks?.onInvalidMove) {
      try {
        this.hooks.onInvalidMove(state, from, to);
      } catch (error) {
        console.error('Error in onInvalidMove hook:', error);
      }
    }
  }

  /**
   * Execute onCardFlip hook
   */
  async cardFlip(state: TState, location: GameLocation, index: number, faceUp: boolean): Promise<void> {
    if (this.hooks?.onCardFlip) {
      try {
        this.hooks.onCardFlip(state, location, index, faceUp);
      } catch (error) {
        console.error('Error in onCardFlip hook:', error);
      }
    }
  }

  /**
   * Execute onGameWon hook
   */
  async gameWon(state: TState): Promise<void> {
    if (this.hooks?.onGameWon) {
      try {
        this.hooks.onGameWon(state);
      } catch (error) {
        console.error('Error in onGameWon hook:', error);
      }
    }
  }

  /**
   * Execute onGameStart hook
   */
  async gameStart(state: TState): Promise<void> {
    if (this.hooks?.onGameStart) {
      try {
        this.hooks.onGameStart(state);
      } catch (error) {
        console.error('Error in onGameStart hook:', error);
      }
    }
  }

  /**
   * Execute onUndo hook
   */
  async undo(oldState: TState, newState: TState): Promise<void> {
    if (this.hooks?.onUndo) {
      try {
        this.hooks.onUndo(oldState, newState);
      } catch (error) {
        console.error('Error in onUndo hook:', error);
      }
    }
  }

  /**
   * Execute onRedo hook
   */
  async redo(oldState: TState, newState: TState): Promise<void> {
    if (this.hooks?.onRedo) {
      try {
        this.hooks.onRedo(oldState, newState);
      } catch (error) {
        console.error('Error in onRedo hook:', error);
      }
    }
  }

  /**
   * Clear the animation queue (if provided)
   */
  clearAnimations(cancelCurrent = false): void {
    this.animationQueue?.clear(cancelCurrent);
  }

  /**
   * Pause animations (if animation queue provided)
   */
  pauseAnimations(): void {
    this.animationQueue?.pause();
  }

  /**
   * Resume animations (if animation queue provided)
   */
  resumeAnimations(): void {
    this.animationQueue?.resume();
  }
}

/**
 * Create a lifecycle hook executor with animation queue integration
 *
 * @template TState - Game state type
 * @param hooks - Optional lifecycle hooks
 * @param animationQueue - Optional animation queue for coordinating animations
 * @returns LifecycleHookExecutor instance
 *
 * @example
 * const executor = createHookExecutor(config.hooks, animationQueue);
 *
 * // Before executing a move
 * await executor.beforeMove(state, from, to);
 *
 * // Execute the move
 * const newState = executeMove(state, from, to);
 *
 * // After executing a move
 * await executor.afterMove(state, newState, from, to);
 */
export function createHookExecutor<TState>(
  hooks?: GameLifecycleHooks<TState>,
  animationQueue?: AnimationQueue
): LifecycleHookExecutor<TState> {
  return new LifecycleHookExecutor(hooks, animationQueue);
}

/**
 * Integration pattern for move execution with hooks and animations
 *
 * @example
 * const result = await executeMoveWithHooks({
 *   state,
 *   from,
 *   to,
 *   validateMove: (state, from, to) => gameActions.validateMove(state, from, to),
 *   executeMove: (state, from, to) => gameActions.executeMove(state, from, to),
 *   isGameWon: (state) => gameActions.isGameWon(state),
 *   hooks: config.hooks,
 *   animationQueue,
 * });
 *
 * if (result.success) {
 *   setState(result.newState);
 * }
 */
export async function executeMoveWithHooks<TState>(params: {
  state: TState;
  from: GameLocation;
  to: GameLocation;
  validateMove: (state: TState, from: GameLocation, to: GameLocation) => boolean;
  executeMove: (state: TState, from: GameLocation, to: GameLocation) => TState | null;
  isGameWon?: (state: TState) => boolean;
  hooks?: GameLifecycleHooks<TState>;
  animationQueue?: AnimationQueue;
}): Promise<{ success: boolean; newState?: TState; isWon?: boolean }> {
  const { state, from, to, validateMove, executeMove, isGameWon, hooks, animationQueue } = params;

  const executor = createHookExecutor(hooks, animationQueue);

  // Validate move
  if (!validateMove(state, from, to)) {
    await executor.invalidMove(state, from, to);
    return { success: false };
  }

  // Execute onBeforeMove hook
  await executor.beforeMove(state, from, to);

  // Execute the move
  const newState = executeMove(state, from, to);

  if (!newState) {
    await executor.invalidMove(state, from, to);
    return { success: false };
  }

  // Execute onAfterMove hook
  await executor.afterMove(state, newState, from, to);

  // Check if game is won
  let won = false;
  if (isGameWon && isGameWon(newState)) {
    won = true;
    await executor.gameWon(newState);
  }

  return { success: true, newState, isWon: won };
}

/**
 * Integration pattern for new game initialization with hooks
 *
 * @example
 * const initialState = await initializeGameWithHooks({
 *   seed: Date.now(),
 *   initializeGame: (seed) => gameActions.initializeGame(seed),
 *   hooks: config.hooks,
 *   animationQueue,
 * });
 *
 * setState(initialState);
 */
export async function initializeGameWithHooks<TState>(params: {
  seed: number;
  initializeGame: (seed: number) => TState;
  hooks?: GameLifecycleHooks<TState>;
  animationQueue?: AnimationQueue;
}): Promise<TState> {
  const { seed, initializeGame, hooks, animationQueue } = params;

  const executor = createHookExecutor(hooks, animationQueue);

  // Clear any pending animations from previous game
  executor.clearAnimations(true);

  // Initialize the game
  const state = initializeGame(seed);

  // Execute onGameStart hook
  await executor.gameStart(state);

  return state;
}

/**
 * Integration pattern for undo with hooks
 *
 * @example
 * const result = await undoWithHooks({
 *   currentState: state,
 *   historyManager,
 *   hooks: config.hooks,
 *   animationQueue,
 * });
 *
 * if (result) {
 *   setState(result);
 * }
 */
export async function undoWithHooks<TState>(params: {
  currentState: TState;
  getPreviousState: () => TState | null;
  hooks?: GameLifecycleHooks<TState>;
  animationQueue?: AnimationQueue;
}): Promise<TState | null> {
  const { currentState, getPreviousState, hooks, animationQueue } = params;

  const executor = createHookExecutor(hooks, animationQueue);

  const previousState = getPreviousState();

  if (!previousState) {
    return null;
  }

  // Pause animations during undo
  executor.pauseAnimations();

  // Execute onUndo hook
  await executor.undo(currentState, previousState);

  // Resume animations
  executor.resumeAnimations();

  return previousState;
}

/**
 * Integration pattern for redo with hooks
 *
 * @example
 * const result = await redoWithHooks({
 *   currentState: state,
 *   historyManager,
 *   hooks: config.hooks,
 *   animationQueue,
 * });
 *
 * if (result) {
 *   setState(result);
 * }
 */
export async function redoWithHooks<TState>(params: {
  currentState: TState;
  getNextState: () => TState | null;
  hooks?: GameLifecycleHooks<TState>;
  animationQueue?: AnimationQueue;
}): Promise<TState | null> {
  const { currentState, getNextState, hooks, animationQueue } = params;

  const executor = createHookExecutor(hooks, animationQueue);

  const nextState = getNextState();

  if (!nextState) {
    return null;
  }

  // Pause animations during redo
  executor.pauseAnimations();

  // Execute onRedo hook
  await executor.redo(currentState, nextState);

  // Resume animations
  executor.resumeAnimations();

  return nextState;
}
