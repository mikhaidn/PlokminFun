import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager } from '../HistoryManager';

interface TestState {
  value: number;
  name: string;
}

describe('HistoryManager', () => {
  let manager: HistoryManager<TestState>;

  beforeEach(() => {
    manager = new HistoryManager<TestState>({ maxSize: 5 });
  });

  describe('push', () => {
    it('should add state to history', () => {
      const state1 = { value: 1, name: 'first' };
      manager.push(state1);
      expect(manager.getCurrentState()).toEqual(state1);
      expect(manager.size()).toBe(1);
    });

    it('should add multiple states', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.push({ value: 3, name: 'third' });
      expect(manager.getCurrentState()).toEqual({ value: 3, name: 'third' });
      expect(manager.size()).toBe(3);
    });

    it('should remove redo history when pushing after undo', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.push({ value: 3, name: 'third' });
      manager.undo();
      manager.undo();
      // Now at state 1, push new state
      manager.push({ value: 99, name: 'new' });
      expect(manager.getCurrentState()).toEqual({ value: 99, name: 'new' });
      expect(manager.canRedo()).toBe(false);
      expect(manager.size()).toBe(2);
    });

    it('should enforce max size limit', () => {
      // Max size is 5
      for (let i = 1; i <= 10; i++) {
        manager.push({ value: i, name: `state${i}` });
      }
      expect(manager.size()).toBe(5);
      // Oldest states should be removed
      expect(manager.getCurrentState()).toEqual({ value: 10, name: 'state10' });
    });
  });

  describe('undo', () => {
    it('should return null when no previous state', () => {
      manager.push({ value: 1, name: 'first' });
      expect(manager.undo()).toBe(null);
      expect(manager.getCurrentState()).toEqual({ value: 1, name: 'first' });
    });

    it('should move to previous state', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      const result = manager.undo();
      expect(result).toEqual({ value: 1, name: 'first' });
      expect(manager.getCurrentState()).toEqual({ value: 1, name: 'first' });
    });

    it('should allow multiple undos', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.push({ value: 3, name: 'third' });
      manager.undo();
      expect(manager.getCurrentState()).toEqual({ value: 2, name: 'second' });
      manager.undo();
      expect(manager.getCurrentState()).toEqual({ value: 1, name: 'first' });
      expect(manager.canUndo()).toBe(false);
    });
  });

  describe('redo', () => {
    it('should return null when no redo available', () => {
      manager.push({ value: 1, name: 'first' });
      expect(manager.redo()).toBe(null);
    });

    it('should move to next state after undo', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.undo();
      const result = manager.redo();
      expect(result).toEqual({ value: 2, name: 'second' });
      expect(manager.getCurrentState()).toEqual({ value: 2, name: 'second' });
    });

    it('should allow multiple redos', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.push({ value: 3, name: 'third' });
      manager.undo();
      manager.undo();
      expect(manager.getCurrentState()).toEqual({ value: 1, name: 'first' });
      manager.redo();
      expect(manager.getCurrentState()).toEqual({ value: 2, name: 'second' });
      manager.redo();
      expect(manager.getCurrentState()).toEqual({ value: 3, name: 'third' });
      expect(manager.canRedo()).toBe(false);
    });
  });

  describe('canUndo', () => {
    it('should return false when at first state', () => {
      manager.push({ value: 1, name: 'first' });
      expect(manager.canUndo()).toBe(false);
    });

    it('should return true when there is a previous state', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      expect(manager.canUndo()).toBe(true);
    });
  });

  describe('canRedo', () => {
    it('should return false when at latest state', () => {
      manager.push({ value: 1, name: 'first' });
      expect(manager.canRedo()).toBe(false);
    });

    it('should return true after undo', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.undo();
      expect(manager.canRedo()).toBe(true);
    });
  });

  describe('getCurrentState', () => {
    it('should throw error when history is empty', () => {
      expect(() => manager.getCurrentState()).toThrow('History is empty');
    });

    it('should return current state without modifying history', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      const state = manager.getCurrentState();
      expect(state).toEqual({ value: 2, name: 'second' });
      expect(manager.size()).toBe(2);
    });
  });

  describe('getHistory', () => {
    it('should return readonly history array', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      const history = manager.getHistory();
      expect(history.length).toBe(2);
      expect(history[0]).toEqual({ value: 1, name: 'first' });
      expect(history[1]).toEqual({ value: 2, name: 'second' });
    });
  });

  describe('jumpToIndex', () => {
    it('should throw error for invalid index', () => {
      manager.push({ value: 1, name: 'first' });
      expect(() => manager.jumpToIndex(-1)).toThrow('Invalid history index');
      expect(() => manager.jumpToIndex(10)).toThrow('Invalid history index');
    });

    it('should jump to specific index', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.push({ value: 3, name: 'third' });
      const state = manager.jumpToIndex(1);
      expect(state).toEqual({ value: 2, name: 'second' });
      expect(manager.getCurrentState()).toEqual({ value: 2, name: 'second' });
    });
  });

  describe('serialize and deserialize', () => {
    it('should serialize and deserialize history', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.push({ value: 3, name: 'third' });
      manager.undo();

      const serialized = manager.serialize();
      const restored = HistoryManager.deserialize<TestState>(serialized, 5);

      expect(restored.getCurrentState()).toEqual({ value: 2, name: 'second' });
      expect(restored.canUndo()).toBe(true);
      expect(restored.canRedo()).toBe(true);
      expect(restored.size()).toBe(3);
    });

    it('should preserve history after deserialization', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });

      const serialized = manager.serialize();
      const restored = HistoryManager.deserialize<TestState>(serialized, 5);

      restored.undo();
      expect(restored.getCurrentState()).toEqual({ value: 1, name: 'first' });
      restored.redo();
      expect(restored.getCurrentState()).toEqual({ value: 2, name: 'second' });
    });
  });

  describe('clear', () => {
    it('should clear all history', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.clear();
      expect(manager.size()).toBe(0);
      expect(() => manager.getCurrentState()).toThrow('History is empty');
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      expect(manager.size()).toBe(0);
      manager.push({ value: 1, name: 'first' });
      expect(manager.size()).toBe(1);
      manager.push({ value: 2, name: 'second' });
      expect(manager.size()).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid push after undo/redo cycles', () => {
      manager.push({ value: 1, name: 'first' });
      manager.push({ value: 2, name: 'second' });
      manager.push({ value: 3, name: 'third' });
      manager.undo();
      manager.undo();
      manager.redo();
      manager.push({ value: 99, name: 'new' });
      expect(manager.getCurrentState()).toEqual({ value: 99, name: 'new' });
      expect(manager.canRedo()).toBe(false);
    });

    it('should handle max size with undo/redo', () => {
      // Fill to max
      for (let i = 1; i <= 5; i++) {
        manager.push({ value: i, name: `state${i}` });
      }
      // Undo a few times
      manager.undo();
      manager.undo();
      // Push more (should still respect max)
      manager.push({ value: 100, name: 'new' });
      expect(manager.size()).toBe(4);
    });
  });
});
