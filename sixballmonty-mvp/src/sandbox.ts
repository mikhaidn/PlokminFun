/**
 * Sandbox mode: a no-pressure 1P playground for user testing. Every knob here
 * exists to let a tester (or the tuning pass) feel a mechanic in isolation —
 * gravity presets, color count, and pop threshold — with hard drop always on
 * and no speed-up curve. The seed is surfaced in the UI so a session can be
 * reproduced exactly when someone reports "this felt wrong".
 */
import { CLASSIC, type MechanicsConfig } from './engine';

export type SandboxGravity = 'zen' | 'slow' | 'normal' | 'fast';

export interface SandboxOptions {
  readonly gravity: SandboxGravity;
  readonly colors: 3 | 4 | 5;
  readonly matchSize: 3 | 4 | 5;
}

export const DEFAULT_SANDBOX_OPTIONS: SandboxOptions = {
  gravity: 'slow',
  colors: 4,
  matchSize: 4,
};

/**
 * cellsPerSecond + a soft-drop multiplier tuned so soft drop lands near
 * ~20-30 cells/s regardless of how floaty the passive fall is. 'zen' is
 * near-static: the piece effectively waits for you.
 */
const GRAVITY_PRESETS: Record<SandboxGravity, { cps: number; softDropMultiplier: number }> = {
  zen: { cps: 0.05, softDropMultiplier: 400 },
  slow: { cps: 0.3, softDropMultiplier: 70 },
  normal: { cps: 0.6, softDropMultiplier: 35 },
  fast: { cps: 1.5, softDropMultiplier: 15 },
};

export const SANDBOX_GRAVITY_LABELS: Record<SandboxGravity, string> = {
  zen: 'Zen (waits for you)',
  slow: 'Slow',
  normal: 'Normal',
  fast: 'Fast',
};

export function buildSandboxConfig(options: SandboxOptions): MechanicsConfig {
  const gravity = GRAVITY_PRESETS[options.gravity];
  return {
    ...CLASSIC,
    colors: options.colors,
    matchSize: options.matchSize,
    gravity: {
      ...CLASSIC.gravity,
      initialCellsPerSecond: gravity.cps,
      speedCurve: [], // sandbox never speeds up
      softDropMultiplier: gravity.softDropMultiplier,
      hardDrop: true,
    },
    // Solo playground: no opponent, so keep the garbage economy out of the way.
    garbage: { ...CLASSIC.garbage, enabled: false },
  };
}
