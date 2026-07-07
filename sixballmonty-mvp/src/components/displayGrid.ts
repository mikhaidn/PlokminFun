/**
 * Compose the engine state into a flat list of renderable cells: settled
 * balls, the active piece overlaid, and popping cells flagged for a flash.
 * Pure, so it's trivially testable and render-agnostic. Only visible rows are
 * emitted (the hidden spawn row is dropped).
 */
import { GARBAGE, pieceCells, type GameState, type MechanicsConfig } from '../engine';

export type CellVisual = 'settled' | 'active' | 'clearing' | 'garbage';

export interface DisplayCell {
  /** Visible-row index (0 = top of the visible well). */
  row: number;
  col: number;
  /** Color index, or 'garbage'. */
  color: number | 'garbage';
  visual: CellVisual;
}

export function getDisplayCells(state: GameState, config: MechanicsConfig): DisplayCell[] {
  const hidden = config.board.hiddenRows;
  const cells: DisplayCell[] = [];

  const clearingKeys = new Set<number>();
  if (state.clearing) {
    for (const [r, c] of state.clearing) clearingKeys.add(r * config.board.columns + c);
  }

  for (let r = hidden; r < state.grid.length; r++) {
    for (let c = 0; c < config.board.columns; c++) {
      const cell = state.grid[r][c];
      if (cell === null) continue;
      const key = r * config.board.columns + c;
      cells.push({
        row: r - hidden,
        col: c,
        color: cell === GARBAGE ? 'garbage' : cell,
        visual: clearingKeys.has(key) ? 'clearing' : cell === GARBAGE ? 'garbage' : 'settled',
      });
    }
  }

  if (state.active) {
    const [[pr, pc], [sr, sc]] = pieceCells(state.active);
    const add = (r: number, c: number, color: number): void => {
      if (r >= hidden) cells.push({ row: r - hidden, col: c, color, visual: 'active' });
    };
    add(pr, pc, state.active.colors[0]);
    add(sr, sc, state.active.colors[1]);
  }

  return cells;
}
