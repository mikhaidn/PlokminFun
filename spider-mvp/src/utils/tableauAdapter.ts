/**
 * Tableau Adapter
 *
 * Converts Spider-specific tableau state to the shared GenericTableau format.
 */

import type { TableauColumnData, GameLocation } from '@plokmin/shared';
import type { SpiderGameState } from '../state/gameState';
import { isCardFaceUp } from '../state/cardDisplay';
import { isValidSpiderRun } from '../rules/spiderRules';

/**
 * Convert Spider tableau to GenericTableau format.
 *
 * A card is draggable when it is face-up and the cards from it to the top of
 * the column form a valid same-suit run (the only group that can be picked up).
 */
export function convertTableauToGeneric(gameState: SpiderGameState): TableauColumnData[] {
  return gameState.tableau.map((column, columnIndex) => {
    const location: GameLocation = { type: 'tableau', index: columnIndex };
    const faceDownCount = column.cards.length - column.faceUpCount;

    return {
      cards: column.cards.map((card, cardIndex) => {
        const faceUp = isCardFaceUp(gameState, location, cardIndex);
        const draggable = faceUp && isValidSpiderRun(column.cards.slice(cardIndex));
        return { card, faceUp, draggable };
      }),
      // Any card may start an empty column, so there is no empty-cell label.
      emptyLabel: undefined,
      faceDownCount: faceDownCount > 0 ? faceDownCount : undefined,
    };
  });
}
