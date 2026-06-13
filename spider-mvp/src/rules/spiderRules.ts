import { type CardType as Card } from '@plokmin/shared';
import { isRed, canStackDescending, isValidSequence } from '@plokmin/shared';
import { RUN_LENGTH } from '../state/gameState';

/**
 * Spider Solitaire Rules
 *
 * Tableau placement: a card may be placed on a card of the next rank up,
 *                    regardless of suit (e.g. any 9 on any 10).
 * Movable runs:      a group of cards can only be picked up together if they
 *                    form a descending run of the SAME suit (e.g. 10♠ 9♠ 8♠).
 * Completed run:     a full King→Ace run of one suit is removed to a foundation.
 */

// Re-export isRed for use in UI components
export { isRed };

/**
 * Check if a card can be placed on another card in the tableau.
 *
 * Rule: descending rank by exactly one, any suit.
 */
export function canPlaceOnTableau(cardToPlace: Card, targetCard: Card): boolean {
  return canStackDescending(cardToPlace, targetCard, {
    requireAlternatingColors: false,
    allowEmpty: false,
  });
}

/**
 * Whether a card may be placed on an empty tableau column.
 *
 * Rule: any card (or any valid run) may be placed on an empty column, so this
 * is unconditionally true. Kept as a function for parity with other games.
 */
export function canPlaceOnEmptyTableau(): boolean {
  return true;
}

/**
 * Check if a group of cards forms a valid movable run.
 *
 * A valid run is descending by one rank with all cards of the same suit.
 * Cards are ordered bottom-to-top (highest rank first).
 */
export function isValidSpiderRun(cards: Card[]): boolean {
  return isValidSequence(
    cards,
    (card, target) => card.rank === target.rank - 1 && card.suit === target.suit
  );
}

/**
 * Check if a group of cards is a complete King→Ace run of a single suit.
 *
 * Cards are ordered bottom-to-top, so a complete run is
 * [K, Q, J, ..., 2, A] (ranks 13 down to 1), all the same suit.
 */
export function isCompleteRun(cards: Card[]): boolean {
  if (cards.length !== RUN_LENGTH) return false;

  const suit = cards[0].suit;
  for (let i = 0; i < RUN_LENGTH; i++) {
    if (cards[i].suit !== suit) return false;
    if (cards[i].rank !== RUN_LENGTH - i) return false; // 13, 12, ..., 1
  }

  return true;
}
