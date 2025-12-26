/**
 * Shared game animations hook
 * Provides animation functions for card flips, win celebrations, and auto-moves
 * Integrates with GameConfig AnimationConfig and lifecycle hooks
 */

import { useCallback, useRef, useState } from 'react';
import type { AnimationConfig } from '../types/GameConfig';
import type { GameLocation } from '../types/GameLocation';

/**
 * Animation state for tracking active animations
 */
export interface AnimationState {
  /** Cards currently being animated */
  animatingCards: Set<string>;
  /** Whether a win celebration is active */
  celebrationActive: boolean;
  /** Animation queue for sequential animations */
  animationQueue: Array<() => Promise<void>>;
}

/**
 * Animation handlers returned by the hook
 */
export interface AnimationHandlers {
  /** Animate a card flip (3D rotation) */
  flipCard: (cardId: string, faceUp: boolean) => Promise<void>;

  /** Trigger win celebration (confetti + optional cascade) */
  celebrateWin: () => Promise<void>;

  /** Animate an auto-move from one location to another */
  animateAutoMove: (from: GameLocation, to: GameLocation) => Promise<void>;

  /** Animate a card move (drag or click-to-select) */
  animateMove: (from: GameLocation, to: GameLocation) => Promise<void>;

  /** Clear all active animations */
  clearAnimations: () => void;

  /** Check if a card is currently animating */
  isAnimating: (cardId: string) => boolean;
}

/**
 * Return value for useGameAnimations hook
 */
export interface UseGameAnimationsReturn {
  state: AnimationState;
  handlers: AnimationHandlers;
}

/**
 * Default animation configuration
 */
const DEFAULT_CONFIG: Required<AnimationConfig> = {
  moveDuration: 300,
  dragSpring: {
    stiffness: 300,
    damping: 25,
  },
  winCelebration: {
    enabled: true,
    confetti: true,
    cascade: true,
    sound: false,
  },
  flipDuration: 300,
  autoMoveDuration: 200,
};

/**
 * Hook for managing game animations
 *
 * @param config - Animation configuration from GameConfig
 * @returns Animation state and handlers
 *
 * @example
 * ```tsx
 * const { state, handlers } = useGameAnimations(gameConfig.animations);
 *
 * // Flip a card
 * await handlers.flipCard('card-AS', true);
 *
 * // Celebrate win
 * if (isGameWon(gameState)) {
 *   await handlers.celebrateWin();
 * }
 *
 * // Animate auto-move
 * await handlers.animateAutoMove(
 *   { type: 'tableau', index: 3 },
 *   { type: 'foundation', index: 0 }
 * );
 * ```
 */
export function useGameAnimations(
  config: AnimationConfig = {}
): UseGameAnimationsReturn {
  // Merge with defaults
  const animConfig: Required<AnimationConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
    dragSpring: {
      ...DEFAULT_CONFIG.dragSpring,
      ...(config.dragSpring || {}),
    },
    winCelebration: {
      ...DEFAULT_CONFIG.winCelebration,
      ...(config.winCelebration || {}),
    },
  };

  // State
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());
  const [celebrationActive, setCelebrationActive] = useState(false);
  const animationQueueRef = useRef<Array<() => Promise<void>>>([]);

  /**
   * Add a card to the animating set
   */
  const startAnimating = useCallback((cardId: string) => {
    setAnimatingCards(prev => new Set(prev).add(cardId));
  }, []);

  /**
   * Remove a card from the animating set
   */
  const stopAnimating = useCallback((cardId: string) => {
    setAnimatingCards(prev => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
  }, []);

  /**
   * Check if a card is currently animating
   */
  const isAnimating = useCallback((cardId: string): boolean => {
    return animatingCards.has(cardId);
  }, [animatingCards]);

  /**
   * Flip a card with 3D rotation animation
   */
  const flipCard = useCallback(async (cardId: string, faceUp: boolean): Promise<void> => {
    startAnimating(cardId);

    // Create a promise that resolves when animation completes
    return new Promise<void>((resolve) => {
      // The actual animation is handled by CSS/framer-motion in the Card component
      // This just tracks the animation state and timing
      setTimeout(() => {
        stopAnimating(cardId);
        resolve();
      }, animConfig.flipDuration);
    });
  }, [animConfig.flipDuration, startAnimating, stopAnimating]);

  /**
   * Celebrate win with confetti and optional card cascade
   */
  const celebrateWin = useCallback(async (): Promise<void> => {
    if (!animConfig.winCelebration.enabled) {
      return;
    }

    setCelebrationActive(true);

    // Create a promise that resolves when celebration completes
    return new Promise<void>((resolve) => {
      // Confetti duration: 3 seconds
      const confettiDuration = 3000;

      // Card cascade animation if enabled
      if (animConfig.winCelebration.cascade) {
        // Cascade animation is handled by the game component
        // This just tracks the state
      }

      // Play sound if enabled
      if (animConfig.winCelebration.sound) {
        // Sound playback would be implemented here
        // For now, we just track the state
      }

      setTimeout(() => {
        setCelebrationActive(false);
        resolve();
      }, confettiDuration);
    });
  }, [animConfig.winCelebration]);

  /**
   * Animate an auto-move (e.g., auto-complete)
   */
  const animateAutoMove = useCallback(
    async (from: GameLocation, to: GameLocation): Promise<void> => {
      const cardId = `${from.type}-${from.index}`;
      startAnimating(cardId);

      // Create a promise that resolves when animation completes
      return new Promise<void>((resolve) => {
        // The actual animation is handled by the game component
        // This just tracks the animation state and timing
        setTimeout(() => {
          stopAnimating(cardId);
          resolve();
        }, animConfig.autoMoveDuration);
      });
    },
    [animConfig.autoMoveDuration, startAnimating, stopAnimating]
  );

  /**
   * Animate a regular move (drag or click-to-select)
   */
  const animateMove = useCallback(
    async (from: GameLocation, to: GameLocation): Promise<void> => {
      const cardId = `${from.type}-${from.index}`;
      startAnimating(cardId);

      // Create a promise that resolves when animation completes
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          stopAnimating(cardId);
          resolve();
        }, animConfig.moveDuration);
      });
    },
    [animConfig.moveDuration, startAnimating, stopAnimating]
  );

  /**
   * Clear all active animations
   */
  const clearAnimations = useCallback(() => {
    setAnimatingCards(new Set());
    setCelebrationActive(false);
    animationQueueRef.current = [];
  }, []);

  // Return state and handlers
  return {
    state: {
      animatingCards,
      celebrationActive,
      animationQueue: animationQueueRef.current,
    },
    handlers: {
      flipCard,
      celebrateWin,
      animateAutoMove,
      animateMove,
      clearAnimations,
      isAnimating,
    },
  };
}
