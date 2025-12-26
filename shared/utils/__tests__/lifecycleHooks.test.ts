/**
 * Tests for Lifecycle Hooks Integration
 *
 * RFC-005 Phase 2 Week 3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  LifecycleHookExecutor,
  createHookExecutor,
  executeMoveWithHooks,
  initializeGameWithHooks,
  undoWithHooks,
  redoWithHooks,
} from '../lifecycleHooks';
import { AnimationQueue } from '../animationQueue';
import type { GameLifecycleHooks } from '../../types/GameConfig';
import type { GameLocation } from '../../types/GameLocation';

// Mock game state for testing
interface MockGameState {
  value: number;
}

describe('LifecycleHookExecutor', () => {
  let executor: LifecycleHookExecutor<MockGameState>;
  let hooks: GameLifecycleHooks<MockGameState>;
  let animationQueue: AnimationQueue;

  beforeEach(() => {
    hooks = {
      onBeforeMove: vi.fn(),
      onAfterMove: vi.fn(),
      onInvalidMove: vi.fn(),
      onCardFlip: vi.fn(),
      onGameWon: vi.fn(),
      onGameStart: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
    };

    animationQueue = new AnimationQueue();
    executor = new LifecycleHookExecutor(hooks, animationQueue);
  });

  it('should call onBeforeMove hook', async () => {
    const state: MockGameState = { value: 1 };
    const from: GameLocation = { type: 'tableau', index: 0 };
    const to: GameLocation = { type: 'foundation', index: 0 };

    await executor.beforeMove(state, from, to);

    expect(hooks.onBeforeMove).toHaveBeenCalledWith(state, from, to);
  });

  it('should call onAfterMove hook', async () => {
    const oldState: MockGameState = { value: 1 };
    const newState: MockGameState = { value: 2 };
    const from: GameLocation = { type: 'tableau', index: 0 };
    const to: GameLocation = { type: 'foundation', index: 0 };

    await executor.afterMove(oldState, newState, from, to);

    expect(hooks.onAfterMove).toHaveBeenCalledWith(oldState, newState, from, to);
  });

  it('should call onInvalidMove hook', async () => {
    const state: MockGameState = { value: 1 };
    const from: GameLocation = { type: 'tableau', index: 0 };
    const to: GameLocation = { type: 'foundation', index: 0 };

    await executor.invalidMove(state, from, to);

    expect(hooks.onInvalidMove).toHaveBeenCalledWith(state, from, to);
  });

  it('should call onCardFlip hook', async () => {
    const state: MockGameState = { value: 1 };
    const location: GameLocation = { type: 'tableau', index: 0 };

    await executor.cardFlip(state, location, 5, true);

    expect(hooks.onCardFlip).toHaveBeenCalledWith(state, location, 5, true);
  });

  it('should call onGameWon hook', async () => {
    const state: MockGameState = { value: 1 };

    await executor.gameWon(state);

    expect(hooks.onGameWon).toHaveBeenCalledWith(state);
  });

  it('should call onGameStart hook', async () => {
    const state: MockGameState = { value: 1 };

    await executor.gameStart(state);

    expect(hooks.onGameStart).toHaveBeenCalledWith(state);
  });

  it('should call onUndo hook', async () => {
    const oldState: MockGameState = { value: 1 };
    const newState: MockGameState = { value: 0 };

    await executor.undo(oldState, newState);

    expect(hooks.onUndo).toHaveBeenCalledWith(oldState, newState);
  });

  it('should call onRedo hook', async () => {
    const oldState: MockGameState = { value: 0 };
    const newState: MockGameState = { value: 1 };

    await executor.redo(oldState, newState);

    expect(hooks.onRedo).toHaveBeenCalledWith(oldState, newState);
  });

  it('should handle missing hooks gracefully', async () => {
    const executorWithoutHooks = new LifecycleHookExecutor<MockGameState>();
    const state: MockGameState = { value: 1 };

    // Should not throw
    await expect(executorWithoutHooks.gameWon(state)).resolves.not.toThrow();
  });

  it('should catch and log errors in hooks', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const errorHooks: GameLifecycleHooks<MockGameState> = {
      onGameWon: () => {
        throw new Error('Hook error');
      },
    };

    const errorExecutor = new LifecycleHookExecutor(errorHooks);
    const state: MockGameState = { value: 1 };

    await errorExecutor.gameWon(state);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should control animation queue', () => {
    const spy = vi.spyOn(animationQueue, 'clear');

    executor.clearAnimations(true);

    expect(spy).toHaveBeenCalledWith(true);
  });
});

describe('createHookExecutor', () => {
  it('should create executor with hooks and animation queue', () => {
    const hooks: GameLifecycleHooks<MockGameState> = {
      onGameWon: vi.fn(),
    };
    const animationQueue = new AnimationQueue();

    const executor = createHookExecutor(hooks, animationQueue);

    expect(executor).toBeInstanceOf(LifecycleHookExecutor);
  });
});

describe('executeMoveWithHooks', () => {
  it('should execute valid move with hooks', async () => {
    const state: MockGameState = { value: 1 };
    const newState: MockGameState = { value: 2 };
    const from: GameLocation = { type: 'tableau', index: 0 };
    const to: GameLocation = { type: 'foundation', index: 0 };

    const validateMove = vi.fn(() => true);
    const executeMove = vi.fn(() => newState);
    const onBeforeMove = vi.fn();
    const onAfterMove = vi.fn();

    const result = await executeMoveWithHooks({
      state,
      from,
      to,
      validateMove,
      executeMove,
      hooks: { onBeforeMove, onAfterMove },
    });

    expect(result.success).toBe(true);
    expect(result.newState).toEqual(newState);
    expect(onBeforeMove).toHaveBeenCalled();
    expect(onAfterMove).toHaveBeenCalled();
  });

  it('should handle invalid move', async () => {
    const state: MockGameState = { value: 1 };
    const from: GameLocation = { type: 'tableau', index: 0 };
    const to: GameLocation = { type: 'foundation', index: 0 };

    const validateMove = vi.fn(() => false);
    const executeMove = vi.fn();
    const onInvalidMove = vi.fn();

    const result = await executeMoveWithHooks({
      state,
      from,
      to,
      validateMove,
      executeMove,
      hooks: { onInvalidMove },
    });

    expect(result.success).toBe(false);
    expect(onInvalidMove).toHaveBeenCalled();
    expect(executeMove).not.toHaveBeenCalled();
  });

  it('should detect win condition', async () => {
    const state: MockGameState = { value: 1 };
    const newState: MockGameState = { value: 2 };
    const from: GameLocation = { type: 'tableau', index: 0 };
    const to: GameLocation = { type: 'foundation', index: 0 };

    const validateMove = vi.fn(() => true);
    const executeMove = vi.fn(() => newState);
    const isGameWon = vi.fn(() => true);
    const onGameWon = vi.fn();

    const result = await executeMoveWithHooks({
      state,
      from,
      to,
      validateMove,
      executeMove,
      isGameWon,
      hooks: { onGameWon },
    });

    expect(result.success).toBe(true);
    expect(result.isWon).toBe(true);
    expect(onGameWon).toHaveBeenCalled();
  });
});

describe('initializeGameWithHooks', () => {
  it('should initialize game and call onGameStart', async () => {
    const seed = 12345;
    const initialState: MockGameState = { value: 0 };
    const initializeGame = vi.fn(() => initialState);
    const onGameStart = vi.fn();
    const animationQueue = new AnimationQueue();

    const result = await initializeGameWithHooks({
      seed,
      initializeGame,
      hooks: { onGameStart },
      animationQueue,
    });

    expect(result).toEqual(initialState);
    expect(initializeGame).toHaveBeenCalledWith(seed);
    expect(onGameStart).toHaveBeenCalledWith(initialState);
  });

  it('should clear animation queue on new game', async () => {
    const seed = 12345;
    const initialState: MockGameState = { value: 0 };
    const initializeGame = vi.fn(() => initialState);
    const animationQueue = new AnimationQueue();

    const spy = vi.spyOn(animationQueue, 'clear');

    await initializeGameWithHooks({
      seed,
      initializeGame,
      animationQueue,
    });

    expect(spy).toHaveBeenCalledWith(true);
  });
});

describe('undoWithHooks', () => {
  it('should undo and call onUndo hook', async () => {
    const currentState: MockGameState = { value: 2 };
    const previousState: MockGameState = { value: 1 };
    const getPreviousState = vi.fn(() => previousState);
    const onUndo = vi.fn();

    const result = await undoWithHooks({
      currentState,
      getPreviousState,
      hooks: { onUndo },
    });

    expect(result).toEqual(previousState);
    expect(onUndo).toHaveBeenCalledWith(currentState, previousState);
  });

  it('should return null if no previous state', async () => {
    const currentState: MockGameState = { value: 1 };
    const getPreviousState = vi.fn(() => null);

    const result = await undoWithHooks({
      currentState,
      getPreviousState,
    });

    expect(result).toBeNull();
  });
});

describe('redoWithHooks', () => {
  it('should redo and call onRedo hook', async () => {
    const currentState: MockGameState = { value: 1 };
    const nextState: MockGameState = { value: 2 };
    const getNextState = vi.fn(() => nextState);
    const onRedo = vi.fn();

    const result = await redoWithHooks({
      currentState,
      getNextState,
      hooks: { onRedo },
    });

    expect(result).toEqual(nextState);
    expect(onRedo).toHaveBeenCalledWith(currentState, nextState);
  });

  it('should return null if no next state', async () => {
    const currentState: MockGameState = { value: 1 };
    const getNextState = vi.fn(() => null);

    const result = await redoWithHooks({
      currentState,
      getNextState,
    });

    expect(result).toBeNull();
  });
});
