/**
 * useGameAnimations hook
 * RFC-005 Phase 1 Day 2: Animation settings integration
 *
 * Provides animation configuration based on user settings
 * Connects settings context to Day 1 animation experiments
 */

import { useSettings } from '@plokmin/shared';

export interface GameAnimationConfig {
  /** Whether to animate at all (false for 'none' level) */
  shouldAnimate: boolean;

  /** Use spring physics for drag (true for 'full' + 'spring') */
  useSpringPhysics: boolean;

  /** Show win celebration (confetti + card cascade) */
  showWinCelebration: boolean;

  /** Drag physics mode */
  dragPhysics: 'spring' | 'smooth' | 'instant';

  /** Animation duration in milliseconds */
  animationDuration: number;

  /** Animation level (for direct checks) */
  animationLevel: 'full' | 'reduced' | 'none';
}

/**
 * Hook to get animation configuration based on user settings
 * Respects prefers-reduced-motion and user preferences
 *
 * Example:
 * ```tsx
 * const { shouldAnimate, useSpringPhysics, showWinCelebration } = useGameAnimations();
 *
 * // Use in component
 * if (shouldAnimate) {
 *   // Apply animations
 * }
 * ```
 */
export function useGameAnimations(): GameAnimationConfig {
  const { settings } = useSettings();

  // Determine animation config based on user settings
  const shouldAnimate = settings.animationLevel !== 'none';
  const useSpringPhysics = settings.animationLevel === 'full' && settings.dragPhysics === 'spring';
  const showWinCelebration = settings.winCelebration && settings.animationLevel !== 'none';

  // Animation duration: reduced level = faster, full = normal
  const animationDuration = settings.animationLevel === 'reduced' ? 200 : 400;

  return {
    shouldAnimate,
    useSpringPhysics,
    showWinCelebration,
    dragPhysics: settings.dragPhysics,
    animationDuration,
    animationLevel: settings.animationLevel,
  };
}
