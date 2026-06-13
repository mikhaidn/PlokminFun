import type { GameLocation } from '@plokmin/shared';
import { type CardType as Card } from '@plokmin/shared';
import type { SpiderGameState, Location } from '../state/gameState';
import { canPlaceOnTableau, canPlaceOnEmptyTableau, isValidSpiderRun } from './spiderRules';

/**
 * Validate if a move from source to destination is legal in Spider.
 * Used by the useCardInteraction hook.
 *
 * Spider only allows tableau → tableau moves; cards reach the foundations
 * automatically when a King→Ace run completes.
 *
 * @param state - Current game state
 * @param from - Source location (GameLocation from shared)
 * @param to - Destination location (GameLocation from shared)
 * @returns true if the move is valid, false otherwise
 */
export function validateMove(
  state: SpiderGameState,
  from: GameLocation,
  to: GameLocation
): boolean {
  if (from.type !== 'tableau' || to.type !== 'tableau') return false;
  if (from.index === to.index) return false;

  const sourceCards = getSelectedCards(state, from);
  if (!sourceCards || sourceCards.length === 0) return false;

  // Selected cards must form a valid same-suit descending run
  if (!isValidSpiderRun(sourceCards)) return false;

  const cardToPlace = sourceCards[0];
  const targetColumn = state.tableau[to.index];

  if (targetColumn.cards.length === 0) {
    return canPlaceOnEmptyTableau();
  }

  const targetCard = targetColumn.cards[targetColumn.cards.length - 1];
  return canPlaceOnTableau(cardToPlace, targetCard);
}

/**
 * Get the face-up cards selected from a tableau location.
 * Returns null if the selection reaches into face-down cards or is invalid.
 */
function getSelectedCards(state: SpiderGameState, location: GameLocation): Card[] | null {
  if (location.type !== 'tableau') return null;

  const column = state.tableau[location.index];
  if (!column || column.cards.length === 0) return null;

  const cardCount = location.cardCount ?? 1;
  const faceDownCount = column.cards.length - column.faceUpCount;
  const startIndex = column.cards.length - cardCount;

  if (startIndex < faceDownCount) return null; // would include face-down cards
  if (startIndex < 0 || startIndex >= column.cards.length) return null;

  return column.cards.slice(startIndex);
}

/**
 * Convert GameLocation to internal Location type.
 */
export function gameLocationToLocation(location: GameLocation): Location {
  return {
    type: location.type as Location['type'],
    index: location.index,
  };
}

/**
 * Convert internal Location to GameLocation.
 */
export function locationToGameLocation(location: Location, cardCount?: number): GameLocation {
  return {
    type: location.type,
    index: location.index ?? 0,
    cardCount,
  };
}
