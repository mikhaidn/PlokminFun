/**
 * Card Display Logic - RFC-005 Compatible
 *
 * This module determines which cards should be face-up or face-down in Klondike.
 *
 * IMPORTANT: This function signature matches GameActions.isCardFaceUp() from RFC-005.
 * When we migrate to the unified game builder, we'll move this function into
 * KlondikeGameActions class - no refactoring needed!
 *
 * Related:
 * - RFC-003: Card Backs & Animations
 * - RFC-005: Unified Game Builder
 * - docs/architecture/rfc-005-compatibility.md
 */

import type { GameLocation } from '@cardgames/shared';
import type { KlondikeGameState } from './gameState';

/**
 * Determine if a card at a specific location should be rendered face-up.
 *
 * This is the RFC-005 compatible version that uses GameLocation from @cardgames/shared
 * instead of the local Location type.
 *
 * @param state - Current game state
 * @param location - Where the card is located (uses shared GameLocation type)
 * @param index - Index of the card in the stack (0 = top card, optional)
 * @returns true if card should show its face, false to show card back
 *
 * @example
 * // Klondike stock pile - all face-down
 * isCardFaceUp(state, { type: 'stock', index: 0 }) // false
 *
 * // Klondike waste pile - all face-up
 * isCardFaceUp(state, { type: 'waste', index: 0 }) // true
 *
 * // Klondike tableau - depends on faceUpCount
 * isCardFaceUp(state, { type: 'tableau', index: 2 }, 0) // Check column 2, top card
 * isCardFaceUp(state, { type: 'tableau', index: 2 }, 5) // Check column 2, 6th card
 *
 * // Foundations - always face-up
 * isCardFaceUp(state, { type: 'foundation', index: 0 }) // true
 */
export function isCardFaceUp(
  state: KlondikeGameState,
  location: GameLocation,
  index?: number
): boolean {
  switch (location.type) {
    case 'stock':
      // Stock pile is always face-down (draw pile)
      return false;

    case 'waste':
      // Waste pile is always face-up (discarded cards from stock)
      return true;

    case 'foundation':
      // Foundations are always face-up (Ace to King, suit piles)
      return true;

    case 'tableau': {
      // Tableau columns have a mix of face-down and face-up cards
      // The first N cards are face-down, the last M cards are face-up
      // where M = faceUpCount
      const column = state.tableau[location.index];

      // Empty column or invalid index - default to face-up
      if (!column || column.cards.length === 0) {
        return true;
      }

      // If no index specified, check if there are ANY face-up cards
      if (index === undefined) {
        return column.faceUpCount > 0;
      }

      // Calculate how many cards are face-down at the start of the column
      const faceDownCount = column.cards.length - column.faceUpCount;

      // If the card's index is >= faceDownCount, it's in the face-up portion
      // Example: 7 cards, faceUpCount=4
      //   - faceDownCount = 3
      //   - indices 0,1,2 are face-down
      //   - indices 3,4,5,6 are face-up
      return index >= faceDownCount;
    }

    case 'freeCell':
      // Klondike doesn't use free cells, but for compatibility with shared types
      // we handle it (would be face-up if it existed)
      return true;

    default:
      // Unknown location type - default to face-up for safety
      // This ensures cards are visible even if there's a type mismatch
      return true;
  }
}

/**
 * Helper: Get all cards at a location (RFC-005 compatible version)
 *
 * This is another GameActions method that will be needed for RFC-005.
 * Including it here for future compatibility.
 *
 * @param state - Current game state
 * @param location - Where to get cards from
 * @returns Array of cards at that location, or empty array if none
 */
export function getCardsAtLocation(
  state: KlondikeGameState,
  location: GameLocation
): import('../core/types').Card[] {
  switch (location.type) {
    case 'tableau':
      return state.tableau[location.index]?.cards ?? [];

    case 'stock':
      return state.stock;

    case 'waste':
      return state.waste;

    case 'foundation':
      return state.foundations[location.index] ?? [];

    case 'freeCell':
      // Klondike doesn't use free cells
      return [];

    default:
      return [];
  }
}

/**
 * Helper: Get a single card at a location (top card)
 *
 * Another RFC-005 GameActions helper.
 *
 * @param state - Current game state
 * @param location - Where to get the card from
 * @returns The top card at the location, or null if empty
 */
export function getCardAtLocation(
  state: KlondikeGameState,
  location: GameLocation
): import('../core/types').Card | null {
  const cards = getCardsAtLocation(state, location);
  return cards.length > 0 ? cards[cards.length - 1] : null;
}
