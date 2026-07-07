/**
 * Pop detection (flood fill), garbage adjacency clearing, and cascade
 * gravity. Matches only count among visible rows (row ≥ hiddenRows) — balls
 * still in the hidden spawn rows neither form nor join groups, per genre
 * convention.
 */
import { GARBAGE, type Cell, type MechanicsConfig } from './types';
import type { CellCoord } from './pieces';

const NEIGHBORS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

export interface PopResult {
  /** Same-color groups of size ≥ matchSize (visible cells only). */
  readonly groups: readonly (readonly CellCoord[])[];
  /** Garbage cells orthogonally adjacent to a popping cell. */
  readonly garbage: readonly CellCoord[];
}

export function findPops(grid: readonly (readonly Cell[])[], config: MechanicsConfig): PopResult {
  const rows = grid.length;
  const cols = grid[0].length;
  const hidden = config.board.hiddenRows;
  const seen: boolean[][] = grid.map((row) => row.map(() => false));
  const groups: CellCoord[][] = [];

  for (let r = hidden; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = grid[r][c];
      if (seen[r][c] || color === null || color === GARBAGE) continue;
      // Flood fill this color through visible cells
      const group: CellCoord[] = [];
      const stack: [number, number][] = [[r, c]];
      seen[r][c] = true;
      while (stack.length > 0) {
        const [cr, cc] = stack.pop()!;
        group.push([cr, cc]);
        for (const [dr, dc] of NEIGHBORS) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < hidden || nr >= rows || nc < 0 || nc >= cols) continue;
          if (seen[nr][nc] || grid[nr][nc] !== color) continue;
          seen[nr][nc] = true;
          stack.push([nr, nc]);
        }
      }
      if (group.length >= config.matchSize) groups.push(group);
    }
  }

  // Garbage adjacent to any popping cell clears with it ('adjacent-pop' rule)
  const garbageSet = new Set<number>();
  const garbage: CellCoord[] = [];
  for (const group of groups) {
    for (const [r, c] of group) {
      for (const [dr, dc] of NEIGHBORS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (grid[nr][nc] !== GARBAGE) continue;
        const key = nr * cols + nc;
        if (!garbageSet.has(key)) {
          garbageSet.add(key);
          garbage.push([nr, nc]);
        }
      }
    }
  }

  return { groups, garbage };
}

/** New grid with the given cells emptied. */
export function removeCells(
  grid: readonly (readonly Cell[])[],
  cells: readonly (readonly [number, number])[]
): Cell[][] {
  const g = grid.map((row) => [...row]);
  for (const [r, c] of cells) g[r][c] = null;
  return g;
}

/** Column gravity: every ball falls straight down onto the stack below it. */
export function applyColumnGravity(grid: readonly (readonly Cell[])[]): {
  grid: Cell[][];
  moved: boolean;
} {
  const rows = grid.length;
  const cols = grid[0].length;
  const g: Cell[][] = grid.map((row) => row.map(() => null));
  let moved = false;
  for (let c = 0; c < cols; c++) {
    let write = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      const cell = grid[r][c];
      if (cell === null) continue;
      g[write][c] = cell;
      if (write !== r) moved = true;
      write--;
    }
  }
  return { grid: g, moved };
}

/** True if any ball has empty space directly below it (test invariant helper). */
export function hasFloatingBalls(grid: readonly (readonly Cell[])[]): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 1; r++) {
      if (grid[r][c] !== null && grid[r + 1][c] === null) return true;
    }
  }
  return false;
}
