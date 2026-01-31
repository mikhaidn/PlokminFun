import { type CardType as Card } from '@plokmin/shared';
import {
  isRed,
  canStackDescending,
  canStackOnFoundation,
  isValidTableauSequence as sharedIsValidTableauSequence,
} from '@plokmin/shared';

/**
 * Klondike Solitaire Rules
 *
 * Tableau stacking: Descending rank, alternating colors
 * Foundation building: Same suit, ascending rank (A → K)
 */

// Re-export isRed for use in UI components
export { isRed };

/**
 * Check if a card can be placed on another card in the tableau
 *
 * Rules:
 * - Descending rank (e.g., 7 on 8)
 * - Alternating colors (red on black, black on red)
 */
export function canPlaceOnTableau(cardToPlace: Card, targetCard: Card): boolean {
  // Klondike: Descending rank, alternating colors
  return canStackDescending(cardToPlace, targetCard, { allowEmpty: false });
}

/**
 * Check if a card can be placed in an empty tableau column
 *
 * Rule: Only Kings can be placed in empty tableau columns
 */
export function canPlaceOnEmptyTableau(card: Card): boolean {
  return card.rank === 13; // King
}

/**
 * Check if a card can be placed on a foundation pile
 *
 * Rules:
 * - Same suit
 * - Ascending rank (A → 2 → 3 → ... → K)
 * - Ace starts the foundation
 */
export function canPlaceOnFoundation(cardToPlace: Card, foundation: Card[]): boolean {
  // Klondike: Ace→King same suit foundation
  return canStackOnFoundation(cardToPlace, foundation);
}

/**
 * Check if a sequence of cards forms a valid tableau sequence
 *
 * A valid sequence:
 * - Descending ranks
 * - Alternating colors
 */
export function isValidTableauSequence(cards: Card[]): boolean {
  return sharedIsValidTableauSequence(cards);
}
