import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameHistory } from '../useGameHistory';

interface TestState {
  value: number;
  name: string;
}

describe('useGameHistory', () => {
  const initialState: TestState = { value: 0, name: 'initial' };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with initial state', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      expect(result.current.currentState).toEqual(initialState);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('should respect maxHistorySize option', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState, maxHistorySize: 3 })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
        result.current.pushState({ value: 2, name: 'second' });
        result.current.pushState({ value: 3, name: 'third' });
        result.current.pushState({ value: 4, name: 'fourth' });
      });

      // Should have max 3 states
      expect(result.current.history?.size()).toBe(3);
    });
  });

  describe('pushState', () => {
    it('should push new state and update current state', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
      });

      expect(result.current.currentState).toEqual({ value: 1, name: 'first' });
      expect(result.current.canUndo).toBe(true);
    });

    it('should call onStateChange callback', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useGameHistory({ initialState, onStateChange })
      );

      const newState = { value: 1, name: 'first' };
      act(() => {
        result.current.pushState(newState);
      });

      expect(onStateChange).toHaveBeenCalledWith(newState);
    });

    it('should remove redo history after push', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
        result.current.pushState({ value: 2, name: 'second' });
        result.current.undo();
        result.current.pushState({ value: 99, name: 'new' });
      });

      expect(result.current.canRedo).toBe(false);
      expect(result.current.currentState).toEqual({ value: 99, name: 'new' });
    });
  });

  describe('undo', () => {
    it('should undo to previous state', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
        result.current.pushState({ value: 2, name: 'second' });
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.currentState).toEqual({ value: 1, name: 'first' });
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(true);
    });

    it('should do nothing when undo not available', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      act(() => {
        result.current.undo();
      });

      expect(result.current.currentState).toEqual(initialState);
      expect(result.current.canUndo).toBe(false);
    });

    it('should call onStateChange callback', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useGameHistory({ initialState, onStateChange })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
        onStateChange.mockClear();
        result.current.undo();
      });

      expect(onStateChange).toHaveBeenCalledWith(initialState);
    });
  });

  describe('redo', () => {
    it('should redo to next state', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
        result.current.pushState({ value: 2, name: 'second' });
        result.current.undo();
      });

      act(() => {
        result.current.redo();
      });

      expect(result.current.currentState).toEqual({ value: 2, name: 'second' });
      expect(result.current.canRedo).toBe(false);
    });

    it('should do nothing when redo not available', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      const state1 = { value: 1, name: 'first' };
      act(() => {
        result.current.pushState(state1);
        result.current.redo();
      });

      expect(result.current.currentState).toEqual(state1);
      expect(result.current.canRedo).toBe(false);
    });

    it('should call onStateChange callback', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useGameHistory({ initialState, onStateChange })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
        result.current.undo();
        onStateChange.mockClear();
        result.current.redo();
      });

      expect(onStateChange).toHaveBeenCalledWith({ value: 1, name: 'first' });
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
        result.current.pushState({ value: 2, name: 'second' });
        result.current.reset();
      });

      expect(result.current.currentState).toEqual(initialState);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('should call onStateChange callback', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useGameHistory({ initialState, onStateChange })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
        onStateChange.mockClear();
        result.current.reset();
      });

      expect(onStateChange).toHaveBeenCalledWith(initialState);
    });
  });

  describe('persistence', () => {
    const persistKey = 'test-game-history';

    it('should save to localStorage on state change', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState, persistKey })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
      });

      const saved = localStorage.getItem(persistKey);
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.states).toHaveLength(2); // initial + first
    });

    it('should restore from localStorage on mount', () => {
      // First, create some history
      const { result: result1 } = renderHook(() =>
        useGameHistory({ initialState, persistKey })
      );

      act(() => {
        result1.current.pushState({ value: 1, name: 'first' });
        result1.current.pushState({ value: 2, name: 'second' });
        result1.current.undo();
      });

      // Now create a new hook instance, should restore state
      const { result: result2 } = renderHook(() =>
        useGameHistory({ initialState, persistKey })
      );

      expect(result2.current.currentState).toEqual({ value: 1, name: 'first' });
      expect(result2.current.canUndo).toBe(true);
      expect(result2.current.canRedo).toBe(true);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem(persistKey, 'invalid json');

      const { result } = renderHook(() =>
        useGameHistory({ initialState, persistKey })
      );

      // Should fall back to initial state
      expect(result.current.currentState).toEqual(initialState);
      expect(result.current.canUndo).toBe(false);
    });

    it('should work without persistKey', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
      });

      // Should not save to localStorage
      expect(localStorage.getItem('test-game-history')).toBe(null);
      expect(result.current.currentState).toEqual({ value: 1, name: 'first' });
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple undo/redo cycles', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
        result.current.pushState({ value: 2, name: 'second' });
        result.current.pushState({ value: 3, name: 'third' });
      });

      act(() => {
        result.current.undo();
        result.current.undo();
      });

      expect(result.current.currentState).toEqual({ value: 1, name: 'first' });

      act(() => {
        result.current.redo();
      });

      expect(result.current.currentState).toEqual({ value: 2, name: 'second' });

      act(() => {
        result.current.pushState({ value: 99, name: 'new' });
      });

      expect(result.current.currentState).toEqual({ value: 99, name: 'new' });
      expect(result.current.canRedo).toBe(false);
    });

    it('should maintain proper flags throughout operations', () => {
      const { result } = renderHook(() =>
        useGameHistory({ initialState })
      );

      // Initial state
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);

      // After push
      act(() => {
        result.current.pushState({ value: 1, name: 'first' });
      });
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);

      // After undo
      act(() => {
        result.current.undo();
      });
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);

      // After redo
      act(() => {
        result.current.redo();
      });
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });
  });
});
