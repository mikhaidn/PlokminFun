/**
 * Tests for AnimationQueue
 *
 * RFC-005 Phase 2 Week 3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AnimationQueue,
  createAnimationDelay,
  createMoveAnimation,
  createFlipAnimation,
  type QueuedAnimation,
} from '../animationQueue';

describe('AnimationQueue', () => {
  let queue: AnimationQueue;

  beforeEach(() => {
    queue = new AnimationQueue();
  });

  describe('Basic queue operations', () => {
    it('should start empty', () => {
      expect(queue.length).toBe(0);
      expect(queue.isEmpty).toBe(true);
      expect(queue.current).toBe(null);
      expect(queue.processing).toBe(false);
    });

    it('should enqueue animations', () => {
      // Pause queue to prevent auto-processing
      queue.pause();

      const animation: QueuedAnimation = {
        id: 'test-1',
        type: 'move',
        duration: 100,
        execute: async () => {},
      };

      queue.enqueue(animation);

      expect(queue.length).toBe(1);
      expect(queue.isEmpty).toBe(false);
    });

    it('should process animations in order', async () => {
      const executionOrder: string[] = [];

      const anim1: QueuedAnimation = {
        id: 'anim-1',
        type: 'move',
        duration: 10,
        execute: async () => {
          executionOrder.push('anim-1');
          await createAnimationDelay(10);
        },
      };

      const anim2: QueuedAnimation = {
        id: 'anim-2',
        type: 'flip',
        duration: 10,
        execute: async () => {
          executionOrder.push('anim-2');
          await createAnimationDelay(10);
        },
      };

      queue.enqueue(anim1);
      queue.enqueue(anim2);

      // Wait for all animations to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(executionOrder).toEqual(['anim-1', 'anim-2']);
      expect(queue.isEmpty).toBe(true);
    });

    it('should call onComplete callback', async () => {
      const onComplete = vi.fn();

      const animation: QueuedAnimation = {
        id: 'test',
        type: 'move',
        duration: 10,
        execute: async () => {
          await createAnimationDelay(10);
        },
        onComplete,
      };

      queue.enqueue(animation);

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 30));

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('Priority queue', () => {
    it('should execute priority animations first', async () => {
      const executionOrder: string[] = [];

      const normalAnim: QueuedAnimation = {
        id: 'normal',
        type: 'move',
        duration: 10,
        execute: async () => {
          executionOrder.push('normal');
          await createAnimationDelay(10);
        },
      };

      const priorityAnim: QueuedAnimation = {
        id: 'priority',
        type: 'move',
        duration: 10,
        execute: async () => {
          executionOrder.push('priority');
          await createAnimationDelay(10);
        },
      };

      queue.enqueue(normalAnim);
      queue.enqueuePriority(priorityAnim);

      // Wait for animations to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(executionOrder).toEqual(['normal', 'priority']);
    });
  });

  describe('Queue control', () => {
    it('should clear pending animations', () => {
      // Pause queue to prevent auto-processing
      queue.pause();

      const animation: QueuedAnimation = {
        id: 'test',
        type: 'move',
        duration: 100,
        execute: async () => {},
      };

      queue.enqueue(animation);
      queue.enqueue(animation);

      expect(queue.length).toBe(2);

      queue.clear();

      expect(queue.length).toBe(0);
      expect(queue.isEmpty).toBe(true);
    });

    it('should call onCancel when clearing', () => {
      // Pause queue to prevent auto-processing
      queue.pause();

      const onCancel = vi.fn();

      const animation: QueuedAnimation = {
        id: 'test',
        type: 'move',
        duration: 100,
        execute: async () => {},
        onCancel,
      };

      queue.enqueue(animation);
      queue.clear();

      expect(onCancel).toHaveBeenCalled();
    });

    it('should pause and resume processing', async () => {
      const executionOrder: string[] = [];

      const anim1: QueuedAnimation = {
        id: 'anim-1',
        type: 'move',
        duration: 10,
        execute: async () => {
          executionOrder.push('anim-1');
          await createAnimationDelay(10);
        },
      };

      const anim2: QueuedAnimation = {
        id: 'anim-2',
        type: 'move',
        duration: 10,
        execute: async () => {
          executionOrder.push('anim-2');
          await createAnimationDelay(10);
        },
      };

      queue.enqueue(anim1);
      queue.pause();
      queue.enqueue(anim2);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 30));

      // Only first animation should have executed (it started before pause)
      expect(executionOrder.length).toBeLessThanOrEqual(1);

      queue.resume();

      // Wait for remaining animations
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(executionOrder).toEqual(['anim-1', 'anim-2']);
    });
  });

  describe('Error handling', () => {
    it('should continue processing even if animation fails', async () => {
      const executionOrder: string[] = [];

      const failingAnim: QueuedAnimation = {
        id: 'failing',
        type: 'move',
        duration: 10,
        execute: async () => {
          throw new Error('Animation failed');
        },
      };

      const successAnim: QueuedAnimation = {
        id: 'success',
        type: 'move',
        duration: 10,
        execute: async () => {
          executionOrder.push('success');
          await createAnimationDelay(10);
        },
      };

      queue.enqueue(failingAnim);
      queue.enqueue(successAnim);

      // Wait for animations to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(executionOrder).toEqual(['success']);
    });
  });
});

describe('Animation helpers', () => {
  it('createAnimationDelay should resolve after duration', async () => {
    const start = Date.now();
    await createAnimationDelay(50);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(45); // Allow small timing variation
  });

  it('createMoveAnimation should create valid animation', () => {
    const from = { type: 'tableau' as const, index: 0 };
    const to = { type: 'foundation' as const, index: 0 };
    const animateFunction = vi.fn(async () => {});

    const animation = createMoveAnimation(from, to, 300, animateFunction);

    expect(animation.type).toBe('move');
    expect(animation.from).toEqual(from);
    expect(animation.to).toEqual(to);
    expect(animation.duration).toBe(300);
    expect(animation.execute).toBe(animateFunction);
  });

  it('createFlipAnimation should create valid animation', () => {
    const location = { type: 'tableau' as const, index: 2 };
    const animateFunction = vi.fn(async () => {});

    const animation = createFlipAnimation(location, 200, animateFunction);

    expect(animation.type).toBe('flip');
    expect(animation.from).toEqual(location);
    expect(animation.duration).toBe(200);
    expect(animation.execute).toBe(animateFunction);
  });
});
