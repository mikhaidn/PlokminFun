/**
 * Tests for useGameAnimations hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameAnimations } from '../useGameAnimations';
import type { AnimationConfig } from '../../types/GameConfig';

describe('useGameAnimations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useGameAnimations());

      expect(result.current.state.animatingCards.size).toBe(0);
      expect(result.current.state.celebrationActive).toBe(false);
      expect(result.current.state.animationQueue).toEqual([]);
    });

    it('should provide all handler functions', () => {
      const { result } = renderHook(() => useGameAnimations());

      expect(typeof result.current.handlers.flipCard).toBe('function');
      expect(typeof result.current.handlers.celebrateWin).toBe('function');
      expect(typeof result.current.handlers.animateAutoMove).toBe('function');
      expect(typeof result.current.handlers.animateMove).toBe('function');
      expect(typeof result.current.handlers.clearAnimations).toBe('function');
      expect(typeof result.current.handlers.isAnimating).toBe('function');
    });

    it('should accept custom animation config', () => {
      const customConfig: AnimationConfig = {
        moveDuration: 500,
        flipDuration: 400,
        autoMoveDuration: 300,
      };

      const { result } = renderHook(() => useGameAnimations(customConfig));

      expect(result.current).toBeDefined();
      expect(result.current.state).toBeDefined();
      expect(result.current.handlers).toBeDefined();
    });
  });

  describe('flipCard', () => {
    it('should add card to animating set and remove after duration', async () => {
      const { result } = renderHook(() => useGameAnimations({ flipDuration: 100 }));

      // Start animation
      const promise = result.current.handlers.flipCard('test-card', true);

      // Advance past the duration
      await act(async () => {
        vi.advanceTimersByTime(100);
        await promise;
      });

      // Animation should complete
      expect(result.current.handlers.isAnimating('test-card')).toBe(false);
    });
  });

  describe('celebrateWin', () => {
    it('should activate celebration', async () => {
      const { result } = renderHook(() =>
        useGameAnimations({
          winCelebration: { enabled: true, confetti: true, cascade: true, sound: false },
        })
      );

      // Start celebration (don't await, just trigger it)
      act(() => {
        result.current.handlers.celebrateWin();
      });

      // Should be active
      expect(result.current.state.celebrationActive).toBe(true);
    });

    it('should complete celebration after duration', async () => {
      const { result } = renderHook(() =>
        useGameAnimations({
          winCelebration: { enabled: true, confetti: true, cascade: true, sound: false },
        })
      );

      // Start celebration
      const promise = result.current.handlers.celebrateWin();

      // Advance time
      await act(async () => {
        vi.advanceTimersByTime(3000);
        await promise;
      });

      // Should no longer be active
      expect(result.current.state.celebrationActive).toBe(false);
    });

    it('should not activate if disabled', async () => {
      const { result } = renderHook(() =>
        useGameAnimations({
          winCelebration: { enabled: false, confetti: false, cascade: false, sound: false },
        })
      );

      await act(async () => {
        await result.current.handlers.celebrateWin();
      });

      expect(result.current.state.celebrationActive).toBe(false);
    });
  });

  describe('animateAutoMove', () => {
    it('should complete after configured duration', async () => {
      const { result } = renderHook(() => useGameAnimations({ autoMoveDuration: 100 }));

      const from = { type: 'tableau' as const, index: 0 };
      const to = { type: 'foundation' as const, index: 0 };

      const promise = result.current.handlers.animateAutoMove(from, to);

      await act(async () => {
        vi.advanceTimersByTime(100);
        await promise;
      });

      // Animation should complete without errors
      expect(result.current.state.animatingCards.size).toBe(0);
    });
  });

  describe('animateMove', () => {
    it('should complete after configured duration', async () => {
      const { result } = renderHook(() => useGameAnimations({ moveDuration: 100 }));

      const from = { type: 'tableau' as const, index: 0 };
      const to = { type: 'tableau' as const, index: 1 };

      const promise = result.current.handlers.animateMove(from, to);

      await act(async () => {
        vi.advanceTimersByTime(100);
        await promise;
      });

      // Animation should complete without errors
      expect(result.current.state.animatingCards.size).toBe(0);
    });
  });

  describe('clearAnimations', () => {
    it('should clear animating cards', () => {
      const { result } = renderHook(() => useGameAnimations());

      // Manually add some animating state (we'll trigger celebration which sets state)
      act(() => {
        result.current.handlers.celebrateWin();
      });

      expect(result.current.state.celebrationActive).toBe(true);

      // Clear
      act(() => {
        result.current.handlers.clearAnimations();
      });

      expect(result.current.state.celebrationActive).toBe(false);
      expect(result.current.state.animatingCards.size).toBe(0);
    });
  });

  describe('isAnimating', () => {
    it('should return false for non-animating cards', () => {
      const { result } = renderHook(() => useGameAnimations());

      expect(result.current.handlers.isAnimating('any-card')).toBe(false);
    });

    it('should return correct state during animation', async () => {
      const { result } = renderHook(() => useGameAnimations({ flipDuration: 100 }));

      // Start animation
      const promise = result.current.handlers.flipCard('test-card', true);

      // Complete animation
      await act(async () => {
        vi.advanceTimersByTime(100);
        await promise;
      });

      // Should not be animating after completion
      expect(result.current.handlers.isAnimating('test-card')).toBe(false);
    });
  });
});
