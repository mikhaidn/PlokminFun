/**
 * 6 Ball Monty engine types (RFC-008, 03-engine.md).
 *
 * The engine is a pure function of (state, inputs, config). Nothing in this
 * module — or anywhere under src/engine/ — may touch the DOM, timers,
 * Math.random, or Date.now.
 */

/** Fixed simulation rate. The engine has no notion of wall-clock time. */
export const TICKS_PER_SECOND = 60;

/**
 * Grid cell contents: a color index (0..config.colors-1), GARBAGE, or null
 * for empty. Garbage balls match nothing and clear only when a pop happens
 * in an orthogonally adjacent cell.
 */
export const GARBAGE = -1;
export type Cell = number | null;

/** A falling piece's two ball colors: [pivot, satellite]. */
export type BallPair = readonly [number, number];

/** Where the satellite ball sits relative to the pivot. */
export type Orientation = 0 | 1 | 2 | 3; // 0=above, 1=right, 2=below, 3=left

export interface ActivePiece {
  readonly colors: BallPair;
  /** Pivot position. Row 0 is the top of the grid (hidden rows included). */
  readonly row: number;
  readonly col: number;
  readonly orientation: Orientation;
}

/**
 * Phase machine (RFC-008 03-engine.md):
 * spawning → falling → locking → resolving ⇄ cascading → garbageDrop → spawning
 */
export type Phase = 'spawning' | 'falling' | 'locking' | 'resolving' | 'cascading' | 'garbageDrop';

export type GameStatus = 'playing' | 'toppedOut' | 'cleared';

export interface GameState {
  /** [row][col]; row 0 = top. First config.board.hiddenRows rows are hidden. */
  readonly grid: readonly (readonly Cell[])[];
  readonly active: ActivePiece | null;
  /** Upcoming pieces; queue[0] spawns next. Always ≥ previewCount + 1 long. */
  readonly queue: readonly BallPair[];
  /** Seeded RNG cursor — part of state so (seed, inputs) → state is total. */
  readonly rngState: number;
  readonly phase: Phase;
  /** Ticks spent in the current phase (drives phase-duration transitions). */
  readonly phaseTicks: number;
  /** Fractional gravity progress of the active piece, in cells. */
  readonly fallSubcells: number;
  /** Ticks spent grounded in the locking phase. */
  readonly lockTicks: number;
  /** Times the lock delay has been reset by a move/rotate (capped). */
  readonly lockResets: number;
  readonly softDropping: boolean;
  /** Pops so far in the current resolution (1 = first pop, 2 = 2-chain…). */
  readonly chainCount: number;
  /** Cells popping right now (still in grid during `resolving` so the UI can animate). */
  readonly clearing: readonly (readonly [number, number])[] | null;
  /** Incoming garbage balls queued against this player. */
  readonly pendingGarbage: number;
  /** Garbage emitted and not yet routed (a MatchController drains this). */
  readonly outgoingGarbage: number;
  readonly score: number;
  readonly ballsCleared: number;
  readonly elapsedTicks: number;
  readonly status: GameStatus;
}

export type InputAction =
  | 'left'
  | 'right'
  | 'rotateCW'
  | 'rotateCCW'
  | 'softDropStart'
  | 'softDropEnd'
  | 'hardDrop';

/**
 * A discrete input, stamped with the tick it applies to (the value of
 * state.elapsedTicks *before* that tick runs; the first tick is 0).
 * Replays, local adapters, and network peers all produce this same shape.
 */
export interface InputEvent {
  readonly tick: number;
  readonly action: InputAction;
}

export interface SpeedCurvePoint {
  readonly atSeconds: number;
  readonly cellsPerSecond: number;
}

/**
 * Every rule is data (RFC-008 02-game-design.md). Variants are presets.
 * All numeric values in presets are PLACEHOLDERS pending Phase 2 playtesting.
 */
export interface MechanicsConfig {
  readonly board: {
    readonly columns: number;
    readonly rows: number; // visible rows
    readonly hiddenRows: number; // spawn rows above the visible well (≥ 1)
  };
  readonly colors: number;
  /** Orthogonally connected same-color group size that pops. */
  readonly matchSize: number;
  readonly piece: {
    readonly shape: 'pair'; // triples are a future config extension
    readonly previewCount: number;
  };
  readonly gravity: {
    readonly initialCellsPerSecond: number;
    /** Ascending by atSeconds; the last entry ≤ elapsed time wins. */
    readonly speedCurve: readonly SpeedCurvePoint[];
    readonly softDropMultiplier: number;
    readonly hardDrop: boolean;
    readonly lockDelayMs: number;
    readonly lockResetMax: number;
  };
  readonly chain: {
    /** Garbage balls sent per chain step (index = chain - 1, last repeats). */
    readonly powerTable: readonly number[];
    /** Score bonus for popping a group larger than matchSize (index = size - matchSize). */
    readonly groupBonus: readonly number[];
    /** Score multiplier per chain step (index = chain - 1, last repeats). */
    readonly scoreTable: readonly number[];
  };
  readonly garbage: {
    readonly enabled: boolean;
    readonly clearRule: 'adjacent-pop';
    readonly offsetting: boolean;
    /** Max garbage balls materialized between two pieces. */
    readonly maxPerDrop: number;
  };
  /** Consumed by input adapters (Phase 2), not by the engine itself. */
  readonly input: {
    readonly dasMs: number;
    readonly arrMs: number;
  };
  /** Phase durations in ticks — the UI animates by observing phase + phaseTicks. */
  readonly timing: {
    readonly spawnDelayTicks: number;
    readonly popTicks: number;
    readonly cascadeTicks: number;
    readonly garbageTicks: number;
  };
}
