/**
 * Shared Solitaire Validation Rules
 *
 * Generic validation functions used across multiple solitaire games
 * (FreeCell, Klondike, Spider, etc.)
 */

import type { Card } from '../types/Card';

/**
 * Check if a card is red (hearts or diamonds).
 *
 * @param card - The card to check
 * @returns true if the card is red (♥ or ♦)
 *
 * @example
 * isRed(card(7, '♥')) // true
 * isRed(card(7, '♠')) // false
 */
export function isRed(card: Card): boolean {
  return card.suit === '♥' || card.suit === '♦';
}

/**
 * Check if a card is black (spades or clubs).
 *
 * @param card - The card to check
 * @returns true if the card is black (♠ or ♣)
 *
 * @example
 * isBlack(card(7, '♠')) // true
 * isBlack(card(7, '♥')) // false
 */
export function isBlack(card: Card): boolean {
  return card.suit === '♠' || card.suit === '♣';
}

/**
 * Check if two cards have alternating colors (red/black).
 *
 * Red suits: ♥ (hearts), ♦ (diamonds)
 * Black suits: ♠ (spades), ♣ (clubs)
 *
 * @param card1 - First card
 * @param card2 - Second card
 * @returns true if one card is red and the other is black
 *
 * @example
 * hasAlternatingColors(card(7, '♥'), card(8, '♠')) // true (red on black)
 * hasAlternatingColors(card(7, '♥'), card(8, '♦')) // false (red on red)
 */
export function hasAlternatingColors(card1: Card, card2: Card): boolean {
  return isRed(card1) !== isRed(card2);
}

/**
 * Check if two cards have the same suit.
 *
 * @param card1 - First card
 * @param card2 - Second card
 * @returns true if both cards are the same suit
 *
 * @example
 * hasSameSuit(card(5, '♥'), card(8, '♥')) // true
 * hasSameSuit(card(5, '♥'), card(8, '♠')) // false
 */
export function hasSameSuit(card1: Card, card2: Card): boolean {
  return card1.suit === card2.suit;
}

/**
 * Check if a card can stack on a target card in descending rank order.
 *
 * This is the core stacking rule for most solitaire tableau piles.
 * By default, requires alternating colors and allows empty tableau.
 *
 * @param cardToPlace - The card being placed
 * @param targetCard - The card to stack on (null if empty column)
 * @param options - Validation options
 * @param options.requireAlternatingColors - Require alternating colors (default: true)
 * @param options.allowEmpty - Allow placement on empty column (default: true)
 * @returns true if the card can be stacked on the target
 *
 * @example
 * // FreeCell tableau: red 7 on black 8
 * canStackDescending(card(7, '♥'), card(8, '♠')) // true
 *
 * // Klondike tableau: same, but no empty allowed in some cases
 * canStackDescending(card(13, '♠'), null, { allowEmpty: false }) // false
 *
 * // Spider: same color stacking
 * canStackDescending(card(7, '♠'), card(8, '♣'), { requireAlternatingColors: false }) // true
 */
export function canStackDescending(
  cardToPlace: Card,
  targetCard: Card | null,
  options: {
    requireAlternatingColors?: boolean;
    allowEmpty?: boolean;
  } = {}
): boolean {
  const {
    requireAlternatingColors = true,
    allowEmpty = true,
  } = options;

  // Handle empty column
  if (!targetCard) return allowEmpty;

  // Check rank: card must be exactly one rank lower
  const correctRank = cardToPlace.rank === targetCard.rank - 1;

  // Check color: must alternate if required
  const correctColor = requireAlternatingColors
    ? hasAlternatingColors(cardToPlace, targetCard)
    : true;

  return correctRank && correctColor;
}

/**
 * Check if a card can be placed on a foundation pile.
 *
 * Standard foundation rules:
 * - Empty foundation: Only Ace (rank 1) allowed
 * - Non-empty: Must be same suit and ascending rank (A → 2 → 3 ... → K)
 *
 * @param cardToPlace - The card being placed
 * @param foundation - The current foundation pile (empty array if empty)
 * @param options - Validation options
 * @param options.requireSameSuit - Require same suit (default: true, false for Spider multi-suit)
 * @returns true if the card can be placed on the foundation
 *
 * @example
 * // Start foundation with Ace
 * canStackOnFoundation(card(1, '♠'), []) // true
 *
 * // Build foundation: 2 on Ace
 * canStackOnFoundation(card(2, '♠'), [card(1, '♠')]) // true
 *
 * // Wrong suit
 * canStackOnFoundation(card(2, '♥'), [card(1, '♠')]) // false
 *
 * // Spider variant (multi-suit allowed)
 * canStackOnFoundation(card(2, '♥'), [card(1, '♠')], { requireSameSuit: false }) // true
 */
export function canStackOnFoundation(
  cardToPlace: Card,
  foundation: Card[],
  options: {
    requireSameSuit?: boolean;
  } = {}
): boolean {
  const { requireSameSuit = true } = options;

  // Empty foundation: only Ace allowed
  if (foundation.length === 0) {
    return cardToPlace.rank === 1; // Ace
  }

  // Get top card of foundation
  const topCard = foundation[foundation.length - 1];

  // Check rank: must be exactly one higher
  const correctRank = cardToPlace.rank === topCard.rank + 1;

  // Check suit: must match if required
  const correctSuit = requireSameSuit
    ? hasSameSuit(cardToPlace, topCard)
    : true;

  return correctRank && correctSuit;
}

/**
 * Validate a sequence of cards follows a stacking rule.
 *
 * Generic helper function for validating multi-card sequences.
 * Applies a custom validator to each pair of adjacent cards.
 *
 * @param cards - Array of cards in sequence
 * @param validator - Function to validate card can stack on target
 * @returns true if the entire sequence is valid
 *
 * @example
 * const descendingValidator = (card, target) =>
 *   card.rank === target.rank - 1 && hasAlternatingColors(card, target);
 *
 * isValidSequence([card(8, '♠'), card(7, '♥'), card(6, '♣')], descendingValidator) // true
 */
export function isValidSequence(
  cards: Card[],
  validator: (card: Card, targetCard: Card) => boolean
): boolean {
  // Empty or single card is always valid
  if (cards.length <= 1) return true;

  // Check each adjacent pair
  for (let i = 0; i < cards.length - 1; i++) {
    // cards[i+1] must be stackable on cards[i]
    if (!validator(cards[i + 1], cards[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a sequence is a valid tableau sequence (descending, alternating colors).
 *
 * This is the standard validation for FreeCell and Klondike tableau sequences.
 * Used for:
 * - FreeCell supermove validation
 * - Klondike multi-card drag validation
 *
 * @param cards - Array of cards in sequence
 * @returns true if the sequence is descending rank with alternating colors
 *
 * @example
 * // Valid FreeCell/Klondike sequence
 * isValidTableauSequence([card(8, '♠'), card(7, '♥'), card(6, '♣')]) // true
 *
 * // Invalid: color break
 * isValidTableauSequence([card(8, '♠'), card(7, '♣')]) // false
 *
 * // Invalid: rank break
 * isValidTableauSequence([card(8, '♠'), card(6, '♥')]) // false
 */
export function isValidTableauSequence(cards: Card[]): boolean {
  return isValidSequence(cards, (card, target) =>
    canStackDescending(card, target, { allowEmpty: false })
  );
}
