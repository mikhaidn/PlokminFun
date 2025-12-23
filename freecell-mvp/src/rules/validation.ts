import { type Card } from '../core/types';
import {
  isRed,
  isBlack,
  canStackDescending,
  canStackOnFoundation as sharedCanStackOnFoundation,
  isValidTableauSequence,
} from '@cardgames/shared';

// Re-export color helpers for use in UI components
export { isRed, isBlack };

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
  // FreeCell: Any card can go on empty tableau
  return canStackDescending(card, targetCard, { allowEmpty: true });
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
  // FreeCell: Ace→King same suit foundation
  return sharedCanStackOnFoundation(card, foundation);
}

/**
 * Check if a sequence of cards is valid for FreeCell tableau.
 *
 * Valid sequence: Descending rank with alternating colors.
 * Used for validating multi-card moves (supermoves).
 *
 * @param cards - Array of cards in sequence
 * @returns true if the sequence is valid
 */
export function isValidFreeCellSequence(cards: Card[]): boolean {
  return isValidTableauSequence(cards);
}
