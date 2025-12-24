/**
 * Unified game settings for all card games
 * RFC-005 Phase 1 Day 2: User-configurable settings for animations and interactions
 *
 * Design principle: User choice > Forced features
 * Every animation and interaction must have a toggle. Nothing forced on users.
 */

export interface GameSettings {
  // Existing accessibility settings (migrated from per-game settings)
  gameMode: 'standard' | 'easy-to-see' | 'one-handed-left' | 'one-handed-right';

  // Animation settings (RFC-005 Phase 1)
  animationLevel: 'full' | 'reduced' | 'none';
  winCelebration: boolean;
  soundEffects: boolean;

  // Interaction settings (RFC-005 Phase 1)
  smartTapToMove: boolean;
  dragPhysics: 'spring' | 'smooth' | 'instant';
  autoComplete: boolean;
}

/**
 * Default settings for new users
 * Critical: All new features default to existing behavior or OFF
 */
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  gameMode: 'standard',
  animationLevel: 'full', // Current prototype behavior
  winCelebration: true, // New feature, opt-out available
  soundEffects: false, // Not implemented yet
  smartTapToMove: false, // DEFAULT OFF - must opt-in!
  dragPhysics: 'spring', // Current prototype behavior
  autoComplete: true, // Keep existing behavior
};

/**
 * Apply accessibility overrides based on browser preferences
 * Respects prefers-reduced-motion media query
 *
 * @param settings - User settings to apply overrides to
 * @returns Settings with accessibility overrides applied
 */
export function applyAccessibilityOverrides(settings: GameSettings): GameSettings {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return {
      ...settings,
      animationLevel: 'none',
      winCelebration: false,
    };
  }

  return settings;
}

/**
 * Animation level behavior:
 * - 'full': Spring physics drag, flip animations, confetti, all effects
 * - 'reduced': Smooth transitions only, no spring physics, no confetti
 * - 'none': Instant moves, no animations (respects prefers-reduced-motion)
 *
 * Smart tap-to-move behavior:
 * - false (default): Click card → highlights valid destinations → click destination
 * - true: Click card → if 1 valid move, auto-execute; if multiple, highlight
 *
 * Drag physics behavior:
 * - 'spring': Bouncy natural spring physics (framer-motion)
 * - 'smooth': Linear motion, no spring
 * - 'instant': No drag animation, instant placement
 */
