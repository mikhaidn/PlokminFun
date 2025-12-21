import { type Card } from '../core/types';

/**
 * Checks if a card is red (hearts or diamonds).
 */
export function isRed(card: Card): boolean {
  return card.suit === '♥' || card.suit === '♦';
}

/**
 * Checks if a card is black (spades or clubs).
 */
export function isBlack(card: Card): boolean {
  return card.suit === '♠' || card.suit === '♣';
}

/**
 * FreeCell tableau stacking rule:
 * Cards must alternate colors and descend in rank by 1.
 * Any card can be placed on an empty tableau column.
 *
 * @param card - The card to place
 * @param targetCard - The card to stack on (null if tableau is empty)
 * @returns true if the move is valid
 */
export function canStackOnTableau(card: Card, targetCard: Card | null): boolean {
  // Any card can be placed on an empty tableau
  if (!targetCard) return true;

  // Cards must be opposite colors
  const oppositeColor = (isRed(card) && isBlack(targetCard)) ||
                        (isBlack(card) && isRed(targetCard));

  // Card must be exactly one rank lower than target
  const descendingRank = card.rank === targetCard.rank - 1;

  return oppositeColor && descendingRank;
}

/**
 * FreeCell foundation stacking rule:
 * - Empty foundation: only Ace allowed
 * - Non-empty foundation: must be same suit and rank ascending by 1
 *
 * @param card - The card to place
 * @param foundation - The current foundation stack
 * @returns true if the move is valid
 */
export function canStackOnFoundation(card: Card, foundation: Card[]): boolean {
  // Empty foundation: only Ace allowed
  if (foundation.length === 0) {
    return card.rank === 1; // Ace
  }

  // Get the top card of the foundation
  const top = foundation[foundation.length - 1];

  // Must be same suit and rank ascending by 1
  return card.suit === top.suit && card.rank === top.rank + 1;
}
