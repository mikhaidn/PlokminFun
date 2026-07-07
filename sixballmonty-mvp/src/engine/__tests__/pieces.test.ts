import { describe, expect, it } from 'vitest';
import type { ActivePiece } from '../types';
import {
  canFall,
  canPlace,
  dropToRest,
  pieceCells,
  tryMove,
  tryRotate,
  writePiece,
} from '../pieces';
import { makeGrid, testConfig } from './helpers';

const config = testConfig(); // 6 cols, 1 hidden + 6 visible rows (7 total, rows 0..6)
const empty = makeGrid(config, []);

function piece(overrides: Partial<ActivePiece> = {}): ActivePiece {
  return { colors: [0, 1], row: 3, col: 2, orientation: 0, ...overrides };
}

describe('pieceCells', () => {
  it('maps all four orientations around the pivot', () => {
    expect(pieceCells(piece({ orientation: 0 }))).toEqual([
      [3, 2],
      [2, 2],
    ]); // above
    expect(pieceCells(piece({ orientation: 1 }))).toEqual([
      [3, 2],
      [3, 3],
    ]); // right
    expect(pieceCells(piece({ orientation: 2 }))).toEqual([
      [3, 2],
      [4, 2],
    ]); // below
    expect(pieceCells(piece({ orientation: 3 }))).toEqual([
      [3, 2],
      [3, 1],
    ]); // left
  });
});

describe('tryMove', () => {
  it('moves within bounds', () => {
    expect(tryMove(empty, piece(), -1)?.col).toBe(1);
    expect(tryMove(empty, piece(), 1)?.col).toBe(3);
  });

  it('blocks at walls, including the satellite side', () => {
    expect(tryMove(empty, piece({ col: 0 }), -1)).toBeNull();
    expect(tryMove(empty, piece({ col: 0, orientation: 3 }), -1)).toBeNull();
    expect(tryMove(empty, piece({ col: 5 }), 1)).toBeNull();
    expect(tryMove(empty, piece({ col: 4, orientation: 1 }), 1)).toBeNull();
  });

  it('blocks on occupied cells', () => {
    const grid = makeGrid(config, ['......', '......', 'R.....', '......', '......', '......']);
    // Visible row index 2 -> grid row 3 (hidden row on top); ball at (3,0)
    expect(grid[3][0]).toBe(0);
    expect(tryMove(grid, piece({ col: 1 }), -1)).toBeNull();
  });
});

describe('tryRotate', () => {
  it('cycles orientation both ways in open space', () => {
    expect(tryRotate(empty, piece({ orientation: 0 }), 1)?.orientation).toBe(1);
    expect(tryRotate(empty, piece({ orientation: 3 }), 1)?.orientation).toBe(0);
    expect(tryRotate(empty, piece({ orientation: 0 }), -1)?.orientation).toBe(3);
  });

  it('wall-nudges off the right wall', () => {
    const p = piece({ col: 5, orientation: 0 });
    const rotated = tryRotate(empty, p, 1); // satellite would be at col 6
    expect(rotated).not.toBeNull();
    expect(rotated!.orientation).toBe(1);
    expect(rotated!.col).toBe(4); // pivot kicked left
  });

  it('lifts the pivot when rotating the satellite underneath at the floor', () => {
    const p = piece({ row: 6, col: 2, orientation: 1 }); // resting on the bottom row
    const rotated = tryRotate(empty, p, 1); // satellite to below -> out of bounds
    expect(rotated).not.toBeNull();
    expect(rotated!.orientation).toBe(2);
    expect(rotated!.row).toBe(5); // pivot lifted one cell
  });

  it('fails when both the target and the kick are blocked', () => {
    const grid = makeGrid(config, ['......', '......', '.R.R..', '......', '......', '......']);
    // Pivot at (3,2) between two balls at (3,1) and (3,3): rotating the
    // satellite to the right is blocked and the left kick is blocked too.
    const p = piece({ row: 3, col: 2, orientation: 0 });
    expect(tryRotate(grid, p, 1)).toBeNull();
  });
});

describe('dropToRest / canFall / writePiece', () => {
  it('drops to the floor and cannot fall further', () => {
    const rested = dropToRest(empty, piece());
    expect(rested.row).toBe(6);
    expect(canFall(empty, rested)).toBe(false);
  });

  it('rests on top of existing stacks', () => {
    const grid = makeGrid(config, ['......', '......', '......', '......', '......', '..G...']);
    const rested = dropToRest(grid, piece());
    expect(rested.row).toBe(5); // ball below at grid row 6
  });

  it('writePiece writes both balls without mutating the source grid', () => {
    const grid = makeGrid(config, []);
    const written = writePiece(grid, piece({ row: 6, col: 0, orientation: 1 }));
    expect(written[6][0]).toBe(0);
    expect(written[6][1]).toBe(1);
    expect(grid[6][0]).toBeNull();
    expect(canPlace(grid, piece({ row: 6, col: 0, orientation: 1 }))).toBe(true);
  });
});
