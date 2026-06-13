import type { GameLocation } from '@plokmin/shared';
import type { SpiderGameState } from './gameState';
import { moveCards } from './gameActions';

/**
 * Execute a move from source to destination.
 * Used by the useCardInteraction hook.
 *
 * Thin wrapper around moveCards that adapts GameLocation types to internal
 * Location types. Spider only supports tableau → tableau moves.
 *
 * @param state - Current game state
 * @param from - Source location (GameLocation from shared)
 * @param to - Destination location (GameLocation from shared)
 * @returns New state if move succeeded, null if failed
 */
export function executeMove(
  state: SpiderGameState,
  from: GameLocation,
  to: GameLocation
): SpiderGameState | null {
  if (from.type !== 'tableau' || to.type !== 'tableau') return null;

  const cardCount = from.cardCount ?? 1;

  return moveCards(
    state,
    { type: 'tableau', index: from.index },
    { type: 'tableau', index: to.index },
    cardCount
  );
}
