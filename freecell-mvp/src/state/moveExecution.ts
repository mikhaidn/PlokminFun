import type { GameLocation } from '@cardgames/shared';
import type { GameState } from './gameState';
import {
  moveCardToFreeCell,
  moveCardFromFreeCell,
  moveCardsToTableau,
  moveCardToFoundation,
  moveCardFromFoundationToTableau,
} from './gameActions';

/**
 * Execute a move from source to destination.
 * Used by the useCardInteraction hook.
 *
 * This wrapper routes moves to the appropriate specialized game action
 * function based on source and destination types.
 *
 * @param state - Current game state
 * @param from - Source location (GameLocation from shared)
 * @param to - Destination location (GameLocation from shared)
 * @returns New state if move succeeded, null if failed
 *
 * @example
 * const from: GameLocation = { type: 'tableau', index: 3, cardCount: 1 };
 * const to: GameLocation = { type: 'freeCell', index: 0 };
 * const newState = executeMove(gameState, from, to);
 * if (newState) {
 *   setGameState(newState);
 * }
 */
export function executeMove(
  state: GameState,
  from: GameLocation,
  to: GameLocation
): GameState | null {
  // Determine card count
  const cardCount = from.cardCount ?? (
    from.cardIndex !== undefined
      ? state.tableau[from.index].length - from.cardIndex
      : 1
  );

  // Route to appropriate action based on source and destination
  if (from.type === 'tableau' && to.type === 'freeCell') {
    return moveCardToFreeCell(state, from.index, to.index);
  }

  if (from.type === 'freeCell' && to.type === 'tableau') {
    return moveCardFromFreeCell(state, from.index, to.index);
  }

  if (from.type === 'tableau' && to.type === 'tableau') {
    return moveCardsToTableau(state, from.index, cardCount, to.index);
  }

  if (from.type === 'tableau' && to.type === 'foundation') {
    return moveCardToFoundation(state, 'tableau', from.index, to.index);
  }

  if (from.type === 'freeCell' && to.type === 'foundation') {
    return moveCardToFoundation(state, 'freeCell', from.index, to.index);
  }

  if (from.type === 'foundation' && to.type === 'tableau') {
    return moveCardFromFoundationToTableau(state, from.index, to.index);
  }

  // Unsupported move type
  return null;
}
