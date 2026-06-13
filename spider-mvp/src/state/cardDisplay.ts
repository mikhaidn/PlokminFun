import type { GameLocation } from '@plokmin/shared';
import { type CardType as Card } from '@plokmin/shared';
import type { SpiderGameState } from './gameState';

/**
 * Card Display Logic - RFC-005 compatible
 *
 * Determines which cards are face-up or face-down in Spider.
 *
 * - Stock: always face-down
 * - Foundations: always face-up (completed runs)
 * - Tableau: the last `faceUpCount` cards are face-up
 */
export function isCardFaceUp(
  state: SpiderGameState,
  location: GameLocation,
  index?: number
): boolean {
  switch (location.type) {
    case 'stock':
      return false;

    case 'foundation':
      return true;

    case 'tableau': {
      const column = state.tableau[location.index];
      if (!column || column.cards.length === 0) return true;

      if (index === undefined) {
        return column.faceUpCount > 0;
      }

      const faceDownCount = column.cards.length - column.faceUpCount;
      return index >= faceDownCount;
    }

    default:
      return true;
  }
}

/**
 * Get all cards at a location (RFC-005 compatible helper).
 */
export function getCardsAtLocation(state: SpiderGameState, location: GameLocation): Card[] {
  switch (location.type) {
    case 'tableau':
      return state.tableau[location.index]?.cards ?? [];

    case 'stock':
      return state.stock;

    case 'foundation':
      return state.foundations[location.index] ?? [];

    default:
      return [];
  }
}
