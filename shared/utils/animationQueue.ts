/**
 * Animation Queue Utility
 *
 * Manages a queue of animations to ensure they execute sequentially
 * without overlapping or interfering with each other.
 *
 * Phase 2 Week 3 of RFC-005
 */

import type { GameLocation } from '../types/GameLocation';

/**
 * Represents a single animation to be executed
 */
export interface QueuedAnimation {
  /** Unique ID for this animation */
  id: string;

  /** Type of animation */
  type: 'move' | 'flip' | 'celebration' | 'auto-complete' | 'custom';

  /** Source location (for move animations) */
  from?: GameLocation;

  /** Destination location (for move animations) */
  to?: GameLocation;

  /** Duration in milliseconds */
  duration: number;

  /** Animation execution function */
  execute: () => Promise<void>;

  /** Optional callback when animation completes */
  onComplete?: () => void;

  /** Optional callback if animation is cancelled */
  onCancel?: () => void;
}

/**
 * Animation Queue Manager
 *
 * Ensures animations execute in order and provides control
 * over the animation pipeline.
 *
 * @example
 * const queue = new AnimationQueue();
 *
 * // Enqueue a move animation
 * queue.enqueue({
 *   id: 'move-1',
 *   type: 'move',
 *   from: { type: 'tableau', index: 0 },
 *   to: { type: 'foundation', index: 0 },
 *   duration: 300,
 *   execute: async () => {
 *     // Perform animation
 *     await animateCardMove(from, to);
 *   },
 *   onComplete: () => console.log('Animation complete'),
 * });
 *
 * // Start processing the queue
 * queue.start();
 */
export class AnimationQueue {
  private queue: QueuedAnimation[] = [];
  private isProcessing = false;
  private currentAnimation: QueuedAnimation | null = null;
  private isPaused = false;

  /**
   * Add an animation to the end of the queue
   */
  enqueue(animation: QueuedAnimation): void {
    this.queue.push(animation);

    // Auto-start processing if not already running
    if (!this.isProcessing && !this.isPaused) {
      this.start();
    }
  }

  /**
   * Add an animation to the front of the queue (priority)
   */
  enqueuePriority(animation: QueuedAnimation): void {
    this.queue.unshift(animation);

    // Auto-start processing if not already running
    if (!this.isProcessing && !this.isPaused) {
      this.start();
    }
  }

  /**
   * Start processing the animation queue
   */
  async start(): Promise<void> {
    if (this.isProcessing || this.isPaused) {
      return;
    }

    this.isProcessing = true;
    await this.executeNext();
  }

  /**
   * Execute the next animation in the queue
   */
  async executeNext(): Promise<void> {
    if (this.isPaused) {
      this.isProcessing = false;
      return;
    }

    const animation = this.queue.shift();

    if (!animation) {
      // Queue is empty
      this.isProcessing = false;
      this.currentAnimation = null;
      return;
    }

    this.currentAnimation = animation;

    try {
      // Execute the animation
      await animation.execute();

      // Call completion callback
      animation.onComplete?.();
    } catch (error) {
      console.error(`Animation ${animation.id} failed:`, error);
      // Continue processing even if animation fails
    }

    this.currentAnimation = null;

    // Process next animation
    await this.executeNext();
  }

  /**
   * Clear all pending animations
   * Optionally cancel the currently running animation
   */
  clear(cancelCurrent = false): void {
    // Clear pending animations
    const cancelled = this.queue.splice(0);

    // Call onCancel callbacks for all cancelled animations
    cancelled.forEach(animation => {
      animation.onCancel?.();
    });

    // Optionally cancel current animation
    if (cancelCurrent && this.currentAnimation) {
      this.currentAnimation.onCancel?.();
      this.currentAnimation = null;
      this.isProcessing = false;
    }
  }

  /**
   * Pause the animation queue
   * Current animation will complete, but no new ones will start
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume processing the animation queue
   */
  resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    // Restart processing if there are queued animations
    if (this.queue.length > 0 && !this.isProcessing) {
      this.start();
    }
  }

  /**
   * Get the number of pending animations
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * Get the currently executing animation
   */
  get current(): QueuedAnimation | null {
    return this.currentAnimation;
  }

  /**
   * Check if the queue is currently processing
   */
  get processing(): boolean {
    return this.isProcessing;
  }

  /**
   * Check if the queue is paused
   */
  get paused(): boolean {
    return this.isPaused;
  }

  /**
   * Check if the queue is empty
   */
  get isEmpty(): boolean {
    return this.queue.length === 0 && !this.currentAnimation;
  }
}

/**
 * Create a simple animation promise that resolves after a duration
 *
 * @param duration - Duration in milliseconds
 * @returns Promise that resolves when animation completes
 */
export function createAnimationDelay(duration: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

/**
 * Helper function to create a move animation
 *
 * @param from - Source location
 * @param to - Destination location
 * @param duration - Animation duration in ms
 * @param animateFunction - Function that performs the animation
 * @returns QueuedAnimation ready to enqueue
 */
export function createMoveAnimation(
  from: GameLocation,
  to: GameLocation,
  duration: number,
  animateFunction: () => Promise<void>
): QueuedAnimation {
  return {
    id: `move-${Date.now()}-${Math.random()}`,
    type: 'move',
    from,
    to,
    duration,
    execute: animateFunction,
  };
}

/**
 * Helper function to create a flip animation
 *
 * @param location - Card location
 * @param duration - Animation duration in ms
 * @param animateFunction - Function that performs the animation
 * @returns QueuedAnimation ready to enqueue
 */
export function createFlipAnimation(
  location: GameLocation,
  duration: number,
  animateFunction: () => Promise<void>
): QueuedAnimation {
  return {
    id: `flip-${Date.now()}-${Math.random()}`,
    type: 'flip',
    from: location,
    duration,
    execute: animateFunction,
  };
}
