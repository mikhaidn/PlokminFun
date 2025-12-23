import type { Card } from '../core/types';

/**
 * Klondike Solitaire Rules
 *
 * Tableau stacking: Descending rank, alternating colors
 * Foundation building: Same suit, ascending rank (A → K)
 */

/**
 * Check if a card is red
 */
export function isRed(card: Card): boolean {
  return card.suit === '♥' || card.suit === '♦';
}

/**
 * Check if two cards have alternating colors
 */
export function hasAlternatingColors(card1: Card, card2: Card): boolean {
  return isRed(card1) !== isRed(card2);
}

/**
 * Check if a card can be placed on another card in the tableau
 *
 * Rules:
 * - Descending rank (e.g., 7 on 8)
 * - Alternating colors (red on black, black on red)
 */
export function canPlaceOnTableau(cardToPlace: Card, targetCard: Card): boolean {
  return (
    cardToPlace.rank === targetCard.rank - 1 && // Descending rank
    hasAlternatingColors(cardToPlace, targetCard) // Alternating colors
  );
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
  // Empty foundation: only Ace can start
  if (foundation.length === 0) {
    return cardToPlace.rank === 1; // Ace
  }

  const topCard = foundation[foundation.length - 1];

  return (
    cardToPlace.suit === topCard.suit && // Same suit
    cardToPlace.rank === topCard.rank + 1 // Ascending rank
  );
}

/**
 * Check if a sequence of cards forms a valid tableau sequence
 *
 * A valid sequence:
 * - Descending ranks
 * - Alternating colors
 */
export function isValidTableauSequence(cards: Card[]): boolean {
  if (cards.length <= 1) return true;

  for (let i = 0; i < cards.length - 1; i++) {
    const current = cards[i];
    const next = cards[i + 1];

    // Check descending rank and alternating colors
    if (!canPlaceOnTableau(next, current)) {
      return false;
    }
  }

  return true;
}
