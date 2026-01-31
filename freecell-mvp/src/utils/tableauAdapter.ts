/**
 * Tableau Adapter
 *
 * Converts FreeCell-specific tableau format to GenericTableau format
 * This allows FreeCell to use the shared GenericTableau component (RFC-005)
 */

import type { TableauColumnData } from '@plokmin/shared';
import type { GameState } from '../state/gameState';

/**
 * Convert FreeCell tableau to GenericTableau format
 *
 * @param gameState - Current FreeCell game state
 * @returns Tableau columns in GenericTableau format
 */
export function convertTableauToGeneric(gameState: GameState): TableauColumnData[] {
  return gameState.tableau.map((column) => {
    return {
      cards: column.map((card) => ({
        card,
        faceUp: true, // All cards in FreeCell are always face-up
        draggable: true, // All face-up cards are draggable
      })),
      // FreeCell allows any card on empty columns (no label needed)
      emptyLabel: undefined,
    };
  });
}
