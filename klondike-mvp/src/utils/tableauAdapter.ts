/**
 * Tableau Adapter
 *
 * Converts Klondike-specific tableau format to GenericTableau format
 * This allows Klondike to use the shared GenericTableau component (RFC-005)
 */

import type { TableauColumnData, GameLocation } from '@cardgames/shared';
import type { KlondikeGameState, TableauColumn } from '../state/gameState';
import { isCardFaceUp } from '../state/cardDisplay';

/**
 * Convert Klondike tableau to GenericTableau format
 *
 * @param gameState - Current Klondike game state
 * @returns Tableau columns in GenericTableau format
 */
export function convertTableauToGeneric(gameState: KlondikeGameState): TableauColumnData[] {
  return gameState.tableau.map((column: TableauColumn, columnIndex: number) => {
    const location: GameLocation = { type: 'tableau', index: columnIndex };

    // Calculate face-down card count (total cards - face-up cards)
    const faceDownCount = column.cards.length - column.faceUpCount;

    return {
      cards: column.cards.map((card, cardIndex) => ({
        card,
        faceUp: isCardFaceUp(gameState, location, cardIndex),
        draggable: isCardFaceUp(gameState, location, cardIndex), // Only face-up cards are draggable
      })),
      emptyLabel: 'K', // Klondike only allows Kings on empty columns
      faceDownCount: faceDownCount > 0 ? faceDownCount : undefined, // Only show if there are face-down cards
    };
  });
}
