import { describe, expect, it } from 'vitest';
import { createMatch, matchTick } from '../match';
import { hashState } from '../replay';
import type { Cell } from '../types';
import { testConfig } from './helpers';

const config = testConfig();

function blockSpawn(grid: readonly (readonly Cell[])[]): Cell[][] {
  const g = grid.map((row) => [...row]);
  g[1][2] = 0; // the spawn pivot cell
  return g;
}

describe('createMatch', () => {
  it('gives both players the same seed and piece sequence', () => {
    const m = createMatch(123, config);
    expect(m.p1.queue).toEqual(m.p2.queue);
    expect(hashState(m.p1)).toBe(hashState(m.p2));
    expect(m.result).toBeNull();
  });
});

describe('garbage routing', () => {
  it("moves each side's outgoing garbage into the opponent's pending queue", () => {
    let m = createMatch(1, config);
    m = { ...m, p1: { ...m.p1, outgoingGarbage: 5 } };
    m = matchTick(m, [], [], config);
    expect(m.p1.outgoingGarbage).toBe(0);
    expect(m.p2.pendingGarbage).toBe(5);
    expect(m.p1.pendingGarbage).toBe(0);
  });

  it('routes both directions in the same tick', () => {
    let m = createMatch(1, config);
    m = {
      ...m,
      p1: { ...m.p1, outgoingGarbage: 3 },
      p2: { ...m.p2, outgoingGarbage: 7 },
    };
    m = matchTick(m, [], [], config);
    expect(m.p1.pendingGarbage).toBe(7);
    expect(m.p2.pendingGarbage).toBe(3);
  });
});

describe('match results', () => {
  it('declares the surviving player the winner', () => {
    let m = createMatch(5, config);
    m = { ...m, p2: { ...m.p2, grid: blockSpawn(m.p2.grid) } };
    m = matchTick(m, [], [], config); // p2 tops out on spawn
    expect(m.p2.status).toBe('toppedOut');
    expect(m.result).toBe('p1');
  });

  it('declares a draw when both top out on the same tick', () => {
    let m = createMatch(5, config);
    m = {
      ...m,
      p1: { ...m.p1, grid: blockSpawn(m.p1.grid) },
      p2: { ...m.p2, grid: blockSpawn(m.p2.grid) },
    };
    m = matchTick(m, [], [], config);
    expect(m.result).toBe('draw');
  });

  it('is frozen after a result: further ticks return the same match', () => {
    let m = createMatch(5, config);
    m = { ...m, p2: { ...m.p2, grid: blockSpawn(m.p2.grid) } };
    m = matchTick(m, [], [], config);
    expect(matchTick(m, [], [], config)).toBe(m);
  });
});
