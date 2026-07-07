/**
 * Test utilities: compact grid fixtures, a fast test config, and a seeded
 * random-input generator for determinism/soak tests.
 */
import {
  GARBAGE,
  type Cell,
  type GameState,
  type InputEvent,
  type MechanicsConfig,
} from '../types';
import { rngStep } from '../rng';
import { createInitialState } from '../tick';

/** '.'=empty, 'X'=garbage, RGBYP=colors 0..4 */
const CHARS: Record<string, Cell> = { '.': null, X: GARBAGE, R: 0, G: 1, B: 2, Y: 3, P: 4 };

/**
 * Build a full grid from visible-row strings (top to bottom). Hidden rows are
 * prepended empty unless `hiddenRows` strings are supplied via `hidden`.
 */
export function makeGrid(
  config: MechanicsConfig,
  visibleRows: readonly string[],
  hidden: readonly string[] = []
): Cell[][] {
  const cols = config.board.columns;
  const parse = (s: string): Cell[] => {
    if (s.length !== cols) throw new Error(`Row "${s}" is not ${cols} wide`);
    return [...s].map((ch) => {
      if (!(ch in CHARS)) throw new Error(`Unknown cell char "${ch}"`);
      return CHARS[ch];
    });
  };
  const emptyRow = (): Cell[] => Array.from({ length: cols }, () => null);
  const hiddenRows: Cell[][] = [];
  for (let i = 0; i < config.board.hiddenRows; i++) {
    const src = hidden[i - (config.board.hiddenRows - hidden.length)];
    hiddenRows.push(src !== undefined ? parse(src) : emptyRow());
  }
  const body: Cell[][] = [];
  for (let i = 0; i < config.board.rows; i++) {
    const src = visibleRows[i - (config.board.rows - visibleRows.length)];
    body.push(src !== undefined ? parse(src) : emptyRow());
  }
  return [...hiddenRows, ...body];
}

/** Render a grid back to strings for readable assertion failures. */
export function gridToStrings(grid: readonly (readonly Cell[])[]): string[] {
  const chars = ['R', 'G', 'B', 'Y', 'P'];
  return grid.map((row) =>
    row.map((c) => (c === null ? '.' : c === GARBAGE ? 'X' : (chars[c] ?? '?'))).join('')
  );
}

export interface TestConfigOverrides {
  board?: Partial<MechanicsConfig['board']>;
  colors?: number;
  matchSize?: number;
  piece?: Partial<MechanicsConfig['piece']>;
  gravity?: Partial<MechanicsConfig['gravity']>;
  chain?: Partial<MechanicsConfig['chain']>;
  garbage?: Partial<MechanicsConfig['garbage']>;
  input?: Partial<MechanicsConfig['input']>;
  timing?: Partial<MechanicsConfig['timing']>;
}

/** Small, fast-transition config so tests don't wait out animation timers. */
export function testConfig(overrides: TestConfigOverrides = {}): MechanicsConfig {
  const base: MechanicsConfig = {
    board: { columns: 6, rows: 6, hiddenRows: 1 },
    colors: 4,
    matchSize: 4,
    piece: { shape: 'pair', previewCount: 2 },
    gravity: {
      initialCellsPerSecond: 0, // pieces only move when the test says so
      speedCurve: [],
      softDropMultiplier: 2,
      hardDrop: true,
      lockDelayMs: 50, // 3 ticks
      lockResetMax: 4,
    },
    chain: {
      powerTable: [0, 4, 10],
      groupBonus: [0, 10, 20],
      scoreTable: [1, 8, 16],
    },
    garbage: { enabled: true, clearRule: 'adjacent-pop', offsetting: true, maxPerDrop: 12 },
    input: { dasMs: 150, arrMs: 40 },
    timing: { spawnDelayTicks: 1, popTicks: 1, cascadeTicks: 1, garbageTicks: 1 },
  };
  return {
    ...base,
    colors: overrides.colors ?? base.colors,
    matchSize: overrides.matchSize ?? base.matchSize,
    board: { ...base.board, ...overrides.board },
    piece: { ...base.piece, ...overrides.piece },
    gravity: { ...base.gravity, ...overrides.gravity },
    chain: { ...base.chain, ...overrides.chain },
    garbage: { ...base.garbage, ...overrides.garbage },
    input: { ...base.input, ...overrides.input },
    timing: { ...base.timing, ...overrides.timing },
  };
}

/** Initial state with overrides applied (grid fixtures, phases, etc.). */
export function stateWith(
  config: MechanicsConfig,
  overrides: Partial<GameState>,
  seed = 42
): GameState {
  return { ...createInitialState(seed, config), ...overrides };
}

export function ev(action: InputEvent['action'], tick = 0): InputEvent {
  return { tick, action };
}

const ACTIONS: readonly InputEvent['action'][] = [
  'left',
  'right',
  'rotateCW',
  'rotateCCW',
  'softDropStart',
  'softDropEnd',
  'hardDrop',
];

/** Deterministic random input stream: ~`density` events per tick on average. */
export function randomEvents(seed: number, ticks: number, density = 0.15): InputEvent[][] {
  const perTick: InputEvent[][] = [];
  let rng = seed;
  for (let t = 0; t < ticks; t++) {
    const events: InputEvent[] = [];
    const roll = rngStep(rng);
    rng = roll.next;
    if (roll.value < density) {
      const pick = rngStep(rng);
      rng = pick.next;
      events.push({ tick: t, action: ACTIONS[Math.floor(pick.value * ACTIONS.length)] });
    }
    perTick.push(events);
  }
  return perTick;
}

export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}
