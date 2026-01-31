import type { GameLocation } from '@plokmin/shared';
import type { KlondikeGameState } from './gameState';
import { moveCards } from './gameActions';
import { gameLocationToLocation } from '../rules/moveValidation';

/**
 * Execute a move from source to destination.
 * Used by the useCardInteraction hook.
 *
 * This is a thin wrapper around the existing moveCards function,
 * adapting GameLocation types to internal Location types.
 *
 * @param state - Current game state
 * @param from - Source location (GameLocation from shared)
 * @param to - Destination location (GameLocation from shared)
 * @returns New state if move succeeded, null if failed
 *
 * @example
 * const from: GameLocation = { type: 'waste', index: 0, cardCount: 1 };
 * const to: GameLocation = { type: 'tableau', index: 3 };
 * const newState = executeMove(gameState, from, to);
 * if (newState) {
 *   setGameState(newState);
 * }
 */
export function executeMove(
  state: KlondikeGameState,
  from: GameLocation,
  to: GameLocation
): KlondikeGameState | null {
  // Determine how many cards to move
  const cardCount = from.cardCount ?? 1;

  // Convert GameLocation to internal Location type
  const fromLoc = gameLocationToLocation(from);
  const toLoc = gameLocationToLocation(to);

  // Use existing moveCards function
  return moveCards(state, fromLoc, toLoc, cardCount);
}
