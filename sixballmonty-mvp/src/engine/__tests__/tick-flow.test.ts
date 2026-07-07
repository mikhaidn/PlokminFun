import { describe, expect, it } from 'vitest';
import { GARBAGE, type GameState, type MechanicsConfig } from '../types';
import { createInitialState, tick } from '../tick';
import { ev, makeGrid, stateWith, testConfig } from './helpers';

const noFall = testConfig(); // gravity 0: pieces move only on input
const fastFall = testConfig({ gravity: { initialCellsPerSecond: 60 } }); // 1 cell/tick
const halfFall = testConfig({ gravity: { initialCellsPerSecond: 30 } }); // 0.5 cells/tick

function runUntil(
  state: GameState,
  predicate: (s: GameState) => boolean,
  config: MechanicsConfig,
  maxTicks = 100
): GameState {
  let s = state;
  for (let i = 0; i < maxTicks; i++) {
    if (predicate(s)) return s;
    s = tick(s, [], config);
  }
  throw new Error('runUntil: predicate never satisfied');
}

describe('spawning', () => {
  it('spawns the first queue piece at the top center after the spawn delay', () => {
    const s = tick(createInitialState(1, noFall), [], noFall);
    expect(s.phase).toBe('falling');
    expect(s.active).not.toBeNull();
    expect(s.active!.row).toBe(2); // pivot on 2nd visible row; satellite above on the 1st
    expect(s.active!.col).toBe(2);
    expect(s.active!.orientation).toBe(0);
    expect(s.queue).toHaveLength(2); // previewCount stays visible
  });

  it('tops out when the spawn cell is blocked, and freezes afterwards', () => {
    const grid = makeGrid(noFall, ['..R...', '......', '......', '......', '......', '......']);
    const s = tick(stateWith(noFall, { grid }), [], noFall);
    expect(s.status).toBe('toppedOut');
    expect(tick(s, [], noFall)).toBe(s); // frozen: same reference back
  });
});

describe('gravity and drops', () => {
  it('falls one cell per tick at 60 cells/second', () => {
    let s = tick(createInitialState(1, fastFall), [], fastFall);
    const startRow = s.active!.row;
    s = tick(s, [], fastFall);
    expect(s.active!.row).toBe(startRow + 1);
  });

  it('accumulates fractional gravity across ticks', () => {
    let s = tick(createInitialState(1, halfFall), [], halfFall);
    const startRow = s.active!.row;
    s = tick(s, [], halfFall); // 0.5 cells: no move yet
    expect(s.active!.row).toBe(startRow);
    s = tick(s, [], halfFall); // 1.0 cells: moves
    expect(s.active!.row).toBe(startRow + 1);
  });

  it('soft drop multiplies gravity and hard drop locks instantly', () => {
    let s = tick(createInitialState(1, halfFall), [], halfFall);
    const startRow = s.active!.row;
    s = tick(s, [ev('softDropStart')], halfFall); // 0.5 * 2 = 1 cell
    expect(s.active!.row).toBe(startRow + 1);

    let h = tick(createInitialState(1, noFall), [], noFall);
    const colors = h.active!.colors;
    h = tick(h, [ev('hardDrop')], noFall);
    expect(h.active).toBeNull();
    expect(h.grid[6][2]).toBe(colors[0]); // pivot on the floor
    expect(h.grid[5][2]).toBe(colors[1]); // satellite above
  });

  it('ignores hard drop when disabled in config', () => {
    const cfg = testConfig({ gravity: { hardDrop: false } });
    let s = tick(createInitialState(1, cfg), [], cfg);
    s = tick(s, [ev('hardDrop')], cfg);
    expect(s.active).not.toBeNull();
  });
});

describe('locking', () => {
  it('locks after the lock delay when grounded', () => {
    // 50ms lock delay = 3 ticks at 60tps
    const grounded = runUntil(
      createInitialState(1, fastFall),
      (s) => s.phase === 'locking',
      fastFall
    );
    const locked = runUntil(grounded, (s) => s.active === null, fastFall, 10);
    expect(locked.grid.flat().filter((c) => c !== null)).toHaveLength(2);
    expect(locked.phase).toBe('spawning'); // empty board: no pops, no garbage
  });

  it('successful shifts reset the lock delay, up to the cap', () => {
    const grounded = runUntil(
      createInitialState(1, fastFall),
      (s) => s.phase === 'locking',
      fastFall
    );
    // Without wiggling: locks in exactly lockDelay (3) ticks
    const plain = runUntil(grounded, (s) => s.active === null, fastFall, 10);
    const plainTicks = plain.elapsedTicks - grounded.elapsedTicks;

    // Wiggling left/right each tick: each shift resets the delay until the
    // cap (4 resets) is exhausted, so it must survive strictly longer.
    let s = grounded;
    let ticks = 0;
    let dir: 'left' | 'right' = 'left';
    while (s.active !== null && ticks < 50) {
      s = tick(s, [ev(dir)], fastFall);
      dir = dir === 'left' ? 'right' : 'left';
      ticks++;
    }
    expect(s.active).toBeNull(); // still locks eventually — no infinite stall
    expect(ticks).toBeGreaterThan(plainTicks);
  });

  it('re-enters falling when shifted off a ledge', () => {
    // Piece resting on a one-column ledge; shifting right puts it over open
    // air, so it must leave locking. (Zero gravity keeps it airborne within
    // the same tick so the phase change is observable.)
    const grid = makeGrid(noFall, ['......', '......', '......', '......', '......', '..G...']);
    const s = stateWith(noFall, {
      grid,
      active: { colors: [0, 1], row: 5, col: 2, orientation: 0 },
      phase: 'locking',
      lockTicks: 1,
    });
    const shifted = tick(s, [ev('right')], noFall);
    expect(shifted.active!.col).toBe(3);
    expect(shifted.phase).toBe('falling');
  });
});

describe('resolution: chains, scoring, garbage', () => {
  // R group pops (chain 1); the two stacked B's on column 3 then fall one
  // cell and connect with the two floor B's -> 4-group (chain 2). Before the
  // pop the B's are two separate pairs, so nothing pops prematurely.
  const chainGrid = (cfg: MechanicsConfig) =>
    makeGrid(cfg, ['......', '......', '......', '...B..', '...B..', 'RRRRBB']);

  it('runs a 2-chain with placeholder scoring and power-table garbage', () => {
    const start = stateWith(noFall, { grid: chainGrid(noFall), phase: 'cascading' });
    const done = runUntil(tick(start, [], noFall), (s) => s.phase === 'spawning', noFall, 30);
    expect(done.chainCount).toBe(2);
    // chain 1: 4 balls * 10 * scoreTable[0]=1 = 40; chain 2: 4 * 10 * 8 = 320
    expect(done.score).toBe(360);
    expect(done.ballsCleared).toBe(8);
    // powerTable [0, 4, 10]: chain 1 sends 0, chain 2 sends 4
    expect(done.outgoingGarbage).toBe(4);
    expect(done.grid.flat().every((c) => c === null)).toBe(true);
  });

  it('offsets pending garbage before attacking', () => {
    const start = stateWith(noFall, {
      grid: chainGrid(noFall),
      phase: 'cascading',
      pendingGarbage: 3,
    });
    const done = runUntil(tick(start, [], noFall), (s) => s.phase === 'spawning', noFall, 30);
    expect(done.pendingGarbage).toBe(0);
    expect(done.outgoingGarbage).toBe(1); // 4 earned - 3 cancelled
    expect(done.grid.flat().every((c) => c === null)).toBe(true); // nothing dropped
  });

  it('clears garbage adjacent to a pop', () => {
    const grid = makeGrid(noFall, ['......', '......', '......', '......', 'X.....', 'RRRR..']);
    const start = stateWith(noFall, { grid, phase: 'cascading' });
    const done = runUntil(tick(start, [], noFall), (s) => s.phase === 'spawning', noFall, 30);
    expect(done.ballsCleared).toBe(5); // 4 R + 1 garbage
    expect(done.grid.flat().every((c) => c === null)).toBe(true);
  });

  it('drops pending garbage after a chainless turn, capped by maxPerDrop', () => {
    const settled = makeGrid(noFall, ['......', '......', '......', '......', '......', 'RG....']);
    const start = stateWith(noFall, { grid: settled, phase: 'cascading', pendingGarbage: 20 });
    const done = runUntil(tick(start, [], noFall), (s) => s.phase === 'spawning', noFall, 30);
    const garbageCells = done.grid.flat().filter((c) => c === GARBAGE).length;
    expect(garbageCells).toBe(12); // maxPerDrop
    expect(done.pendingGarbage).toBe(8);
  });
});
