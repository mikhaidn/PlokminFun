/**
 * Active-piece geometry: placement checks, movement, rotation (simple
 * wall-nudge kicks), and drops. All functions are pure; grids are never
 * mutated.
 */
import type { ActivePiece, Cell, Orientation } from './types';

/** Satellite offset from the pivot, indexed by orientation. */
export const SATELLITE_OFFSETS: readonly { dr: number; dc: number }[] = [
  { dr: -1, dc: 0 }, // 0: above
  { dr: 0, dc: 1 }, // 1: right
  { dr: 1, dc: 0 }, // 2: below
  { dr: 0, dc: -1 }, // 3: left
];

export type CellCoord = readonly [number, number];

/** [pivot, satellite] cells occupied by the piece. */
export function pieceCells(piece: ActivePiece): readonly [CellCoord, CellCoord] {
  const off = SATELLITE_OFFSETS[piece.orientation];
  return [
    [piece.row, piece.col],
    [piece.row + off.dr, piece.col + off.dc],
  ];
}

export function canPlace(grid: readonly (readonly Cell[])[], piece: ActivePiece): boolean {
  for (const [r, c] of pieceCells(piece)) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;
    if (grid[r][c] !== null) return false;
  }
  return true;
}

export function canFall(grid: readonly (readonly Cell[])[], piece: ActivePiece): boolean {
  return canPlace(grid, { ...piece, row: piece.row + 1 });
}

export function tryMove(
  grid: readonly (readonly Cell[])[],
  piece: ActivePiece,
  dCol: -1 | 1
): ActivePiece | null {
  const moved = { ...piece, col: piece.col + dCol };
  return canPlace(grid, moved) ? moved : null;
}

/**
 * Rotate with a single wall-nudge: if the new satellite cell is blocked,
 * try kicking the pivot one cell in the opposite direction (this also lifts
 * the pivot when rotating the satellite underneath while grounded). No
 * further kick tables — RFC-008 keeps rotation deliberately simple.
 */
export function tryRotate(
  grid: readonly (readonly Cell[])[],
  piece: ActivePiece,
  dir: -1 | 1
): ActivePiece | null {
  const orientation = (((piece.orientation + dir) % 4) + 4) % 4;
  const rotated = { ...piece, orientation: orientation as Orientation };
  if (canPlace(grid, rotated)) return rotated;
  const off = SATELLITE_OFFSETS[rotated.orientation];
  const kicked = { ...rotated, row: rotated.row - off.dr, col: rotated.col - off.dc };
  return canPlace(grid, kicked) ? kicked : null;
}

/** The piece moved straight down as far as it can go. */
export function dropToRest(grid: readonly (readonly Cell[])[], piece: ActivePiece): ActivePiece {
  let p = piece;
  while (canFall(grid, p)) p = { ...p, row: p.row + 1 };
  return p;
}

/** New grid with the piece's balls written into it. */
export function writePiece(grid: readonly (readonly Cell[])[], piece: ActivePiece): Cell[][] {
  const g = grid.map((row) => [...row]);
  const [[pr, pc], [sr, sc]] = pieceCells(piece);
  g[pr][pc] = piece.colors[0];
  g[sr][sc] = piece.colors[1];
  return g;
}
