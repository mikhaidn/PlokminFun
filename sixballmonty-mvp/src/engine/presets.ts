/**
 * Mechanics presets (RFC-008 02-game-design.md).
 *
 * ⚠️ Every numeric value here is a PLACEHOLDER — nobody has playtested them.
 * The Phase 2 tuning pass sets the real defaults (RFC-008 resolved decision,
 * 2026-07-07). The structure is the contract; the numbers are cheap to change.
 */
import type { MechanicsConfig } from './types';

export const CLASSIC: MechanicsConfig = {
  board: { columns: 6, rows: 12, hiddenRows: 1 },
  colors: 4,
  matchSize: 4,
  piece: { shape: 'pair', previewCount: 2 },
  gravity: {
    initialCellsPerSecond: 0.5,
    speedCurve: [
      { atSeconds: 30, cellsPerSecond: 0.75 },
      { atSeconds: 60, cellsPerSecond: 1 },
      { atSeconds: 120, cellsPerSecond: 1.5 },
      { atSeconds: 180, cellsPerSecond: 2 },
      { atSeconds: 300, cellsPerSecond: 3 },
    ],
    softDropMultiplier: 10,
    hardDrop: false,
    lockDelayMs: 400,
    lockResetMax: 8,
  },
  chain: {
    powerTable: [0, 4, 10, 18, 28, 40],
    groupBonus: [0, 10, 20, 40, 80],
    scoreTable: [1, 8, 16, 32, 64, 128],
  },
  garbage: { enabled: true, clearRule: 'adjacent-pop', offsetting: true, maxPerDrop: 12 },
  input: { dasMs: 150, arrMs: 40 },
  timing: { spawnDelayTicks: 6, popTicks: 18, cascadeTicks: 10, garbageTicks: 10 },
};

/** Smaller, gentler board — mobile/daily-friendly (RFC-007 spirit). */
export const MINI: MechanicsConfig = {
  ...CLASSIC,
  board: { columns: 5, rows: 9, hiddenRows: 1 },
  colors: 3,
  garbage: { ...CLASSIC.garbage, maxPerDrop: 10 },
};

/** Faster, meaner: 5 colors, quick gravity, hard drop enabled. */
export const FRANTIC: MechanicsConfig = {
  ...CLASSIC,
  colors: 5,
  gravity: {
    ...CLASSIC.gravity,
    initialCellsPerSecond: 1,
    speedCurve: [
      { atSeconds: 20, cellsPerSecond: 1.5 },
      { atSeconds: 45, cellsPerSecond: 2.5 },
      { atSeconds: 90, cellsPerSecond: 4 },
    ],
    hardDrop: true,
  },
};

export const PRESETS: Record<string, MechanicsConfig> = {
  classic: CLASSIC,
  mini: MINI,
  frantic: FRANTIC,
};
