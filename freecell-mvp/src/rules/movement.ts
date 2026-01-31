import { type CardType as Card } from '@plokmin/shared';
import { canStackOnTableau } from './validation';

/**
 * Calculates the maximum number of cards that can be moved as a sequence.
 * This is based on the FreeCell "supermove" formula:
 * max = (freeCells + 1) × 2^(emptyColumns)
 *
 * @param freeCells - Number of empty free cells available
 * @param emptyColumns - Number of empty tableau columns available
 * @returns Maximum number of cards that can be moved together
 */
export function getMaxMovable(freeCells: number, emptyColumns: number): number {
  return (freeCells + 1) * Math.pow(2, emptyColumns);
}

/**
 * Checks if a sequence of cards forms a valid stack for moving.
 * A valid stack must:
 * - Alternate colors (red/black)
 * - Descend in rank by 1 each step
 *
 * @param cards - Array of cards from top to bottom of the sequence
 * @returns true if the cards form a valid movable stack
 */
export function isValidStack(cards: Card[]): boolean {
  // Empty or single card is always valid
  if (cards.length <= 1) return true;

  // Check each pair of adjacent cards
  for (let i = 0; i < cards.length - 1; i++) {
    const topCard = cards[i];
    const bottomCard = cards[i + 1];

    // Use tableau stacking rules (alternating colors, descending rank)
    if (!canStackOnTableau(bottomCard, topCard)) {
      return false;
    }
  }

  return true;
}
