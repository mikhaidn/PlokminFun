import { describe, expect, it } from 'vitest';
import { GARBAGE } from '../types';
import { dropGarbage, garbageForChain, offsetGarbage, tableAt } from '../garbage';
import { makeGrid, testConfig } from './helpers';

const config = testConfig(); // powerTable [0, 4, 10]

describe('tableAt', () => {
  it('clamps to both ends and repeats the last entry', () => {
    expect(tableAt([1, 8, 16], 0)).toBe(1);
    expect(tableAt([1, 8, 16], 2)).toBe(16);
    expect(tableAt([1, 8, 16], 99)).toBe(16);
    expect(tableAt([1, 8, 16], -5)).toBe(1);
    expect(tableAt([], 3)).toBe(0);
  });
});

describe('garbageForChain', () => {
  it('reads the power table by 1-based chain count', () => {
    expect(garbageForChain(1, config)).toBe(0);
    expect(garbageForChain(2, config)).toBe(4);
    expect(garbageForChain(3, config)).toBe(10);
    expect(garbageForChain(9, config)).toBe(10); // last entry repeats
  });

  it('returns 0 when garbage is disabled', () => {
    const noGarbage = testConfig({
      garbage: { enabled: false, clearRule: 'adjacent-pop', offsetting: true, maxPerDrop: 12 },
    });
    expect(garbageForChain(3, noGarbage)).toBe(0);
  });
});

describe('offsetGarbage', () => {
  it('cancels pending garbage before attacking', () => {
    expect(offsetGarbage(3, 5, true)).toEqual({ pending: 0, outgoing: 2 });
    expect(offsetGarbage(5, 3, true)).toEqual({ pending: 2, outgoing: 0 });
    expect(offsetGarbage(0, 4, true)).toEqual({ pending: 0, outgoing: 4 });
  });

  it('passes through untouched when offsetting is off', () => {
    expect(offsetGarbage(3, 5, false)).toEqual({ pending: 3, outgoing: 5 });
  });
});

describe('dropGarbage', () => {
  it('drops a full row as one ball per column, resting on the floor', () => {
    const { grid } = dropGarbage(makeGrid(config, []), 6, 1, config);
    for (let c = 0; c < 6; c++) expect(grid[6][c]).toBe(GARBAGE);
    expect(grid[5].every((cell) => cell === null)).toBe(true);
  });

  it('drops partial rows into distinct RNG-chosen columns', () => {
    const { grid } = dropGarbage(makeGrid(config, []), 3, 42, config);
    const bottom = grid[6].filter((cell) => cell === GARBAGE).length;
    expect(bottom).toBe(3); // three distinct columns, all resting on the floor
  });

  it('is deterministic in the rng state', () => {
    const a = dropGarbage(makeGrid(config, []), 5, 1234, config);
    const b = dropGarbage(makeGrid(config, []), 5, 1234, config);
    expect(a.grid).toEqual(b.grid);
    expect(a.rngState).toBe(b.rngState);
  });

  it('stacks on top of existing balls', () => {
    const grid = makeGrid(config, ['......', '......', '......', '......', '......', 'RRRRRR']);
    const { grid: after } = dropGarbage(grid, 6, 7, config);
    for (let c = 0; c < 6; c++) {
      expect(after[6][c]).toBe(0); // original balls untouched
      expect(after[5][c]).toBe(GARBAGE);
    }
  });

  it('discards overflow when a column is completely full', () => {
    const full = makeGrid(
      config,
      ['G.....', 'G.....', 'G.....', 'G.....', 'G.....', 'G.....'],
      ['G.....']
    );
    const { grid } = dropGarbage(full, 6, 9, config);
    // Column 0 was full to the hidden row: still exactly 7 balls, no garbage
    const col0 = grid.map((row) => row[0]);
    expect(col0.every((cell) => cell === 1)).toBe(true);
    // Other columns received theirs
    expect(grid[6][1]).toBe(GARBAGE);
  });

  it('does not mutate the input grid', () => {
    const grid = makeGrid(config, []);
    dropGarbage(grid, 6, 1, config);
    expect(grid[6].every((cell) => cell === null)).toBe(true);
  });
});
