/**
 * Tableau Adapter
 *
 * Converts Klondike-specific tableau format to GenericTableau format
 * This allows Klondike to use the shared GenericTableau component (RFC-005)
 */

import type { TableauColumnData, type GameLocation } from '@cardgames/shared';
import type { KlondikeGameState, TableauColumn } from '../state/gameState';
import { isCardFaceUp } from '../state/cardDisplay';

/**
 * Convert Klondike tableau to GenericTableau format
 *
 * @param gameState - Current Klondike game state
 * @returns Tableau columns in GenericTableau format
 */
export function convertTableauToGeneric(
  gameState: KlondikeGameState
): TableauColumnData[] {
  return gameState.tableau.map((column: TableauColumn, columnIndex: number) => {
    const location: GameLocation = { type: 'tableau', index: columnIndex };

    return {
      cards: column.cards.map((card, cardIndex) => ({
        card,
        faceUp: isCardFaceUp(gameState, location, cardIndex),
        draggable: isCardFaceUp(gameState, location, cardIndex), // Only face-up cards are draggable
      })),
      emptyLabel: 'K', // Klondike only allows Kings on empty columns
    };
  });
}
