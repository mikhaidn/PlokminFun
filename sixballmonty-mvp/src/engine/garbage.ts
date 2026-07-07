/**
 * Garbage economy: how much a chain sends, offsetting against incoming,
 * and deterministic materialization into the well.
 */
import { GARBAGE, type Cell, type MechanicsConfig } from './types';
import { rngInt } from './rng';

/** Clamped table lookup: index past the end repeats the last entry. */
export function tableAt(table: readonly number[], index: number): number {
  if (table.length === 0) return 0;
  return table[Math.min(Math.max(index, 0), table.length - 1)];
}

/** Garbage balls earned by the chainCount-th pop (1-based). */
export function garbageForChain(chainCount: number, config: MechanicsConfig): number {
  if (!config.garbage.enabled) return 0;
  return tableAt(config.chain.powerTable, chainCount - 1);
}

/** Offsetting: your chains cancel your own pending garbage before attacking. */
export function offsetGarbage(
  pending: number,
  earned: number,
  offsetting: boolean
): { pending: number; outgoing: number } {
  if (!offsetting) return { pending, outgoing: earned };
  const cancelled = Math.min(pending, earned);
  return { pending: pending - cancelled, outgoing: earned - cancelled };
}

/**
 * Materialize `amount` garbage balls into the grid. Full rows drop one ball
 * per column; a final partial row picks distinct columns via the seeded RNG
 * (partial Fisher–Yates, so the column choice is deterministic). Balls rest
 * on top of each column's stack; balls that would overflow a full column are
 * discarded.
 */
export function dropGarbage(
  grid: readonly (readonly Cell[])[],
  amount: number,
  rngState: number,
  config: MechanicsConfig
): { grid: Cell[][]; rngState: number } {
  const cols = config.board.columns;
  const g = grid.map((row) => [...row]);
  let rng = rngState;
  let remaining = amount;

  const placeInColumn = (c: number): void => {
    for (let r = g.length - 1; r >= 0; r--) {
      if (g[r][c] === null) {
        g[r][c] = GARBAGE;
        return;
      }
    }
    // Column full: overflow garbage is discarded (top-out is checked at spawn)
  };

  while (remaining > 0) {
    if (remaining >= cols) {
      for (let c = 0; c < cols; c++) placeInColumn(c);
      remaining -= cols;
    } else {
      const candidates = Array.from({ length: cols }, (_, i) => i);
      for (let i = 0; i < remaining; i++) {
        const pick = rngInt(rng, candidates.length - i);
        rng = pick.next;
        const j = i + pick.value;
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      for (let i = 0; i < remaining; i++) placeInColumn(candidates[i]);
      remaining = 0;
    }
  }

  return { grid: g, rngState: rng };
}
