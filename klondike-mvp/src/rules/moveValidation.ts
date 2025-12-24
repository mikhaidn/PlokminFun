import type { GameLocation } from '@cardgames/shared';
import type { KlondikeGameState, Location } from '../state/gameState';
import type { Card } from '../core/types';
import {
  canPlaceOnTableau,
  canPlaceOnEmptyTableau,
  canPlaceOnFoundation,
  isValidTableauSequence,
} from './klondikeRules';

/**
 * Validate if a move from source to destination is legal in Klondike.
 * Used by the useCardInteraction hook.
 *
 * @param state - Current game state
 * @param from - Source location (GameLocation from shared)
 * @param to - Destination location (GameLocation from shared)
 * @returns true if the move is valid, false otherwise
 *
 * @example
 * const from: GameLocation = { type: 'waste', index: 0, cardCount: 1 };
 * const to: GameLocation = { type: 'tableau', index: 3 };
 * validateMove(gameState, from, to); // true if valid
 */
export function validateMove(
  state: KlondikeGameState,
  from: GameLocation,
  to: GameLocation
): boolean {
  // Determine card count
  const cardCount = from.cardCount ?? 1;

  // Get source cards
  const sourceCards = getCardsAtLocation(state, from);
  if (!sourceCards || sourceCards.length === 0) return false;

  // Can't move from stock (must use draw action)
  if (from.type === 'stock') return false;

  // Can't move to stock or waste
  if (to.type === 'stock' || to.type === 'waste') return false;

  // Only move sequences from tableau
  if (cardCount > 1 && from.type !== 'tableau') return false;

  // Validate sequence (if moving multiple cards)
  if (cardCount > 1 && !isValidTableauSequence(sourceCards)) {
    return false;
  }

  const cardToPlace = sourceCards[0];

  // Moving to tableau
  if (to.type === 'tableau') {
    const targetColumn = state.tableau[to.index];

    // Empty column: only King
    if (targetColumn.cards.length === 0) {
      return canPlaceOnEmptyTableau(cardToPlace);
    }

    // Place on existing card (must be face-up)
    const faceDownCount = targetColumn.cards.length - targetColumn.faceUpCount;
    if (faceDownCount === targetColumn.cards.length) {
      // All cards are face-down, can't place
      return false;
    }

    const targetCard = targetColumn.cards[targetColumn.cards.length - 1];
    return canPlaceOnTableau(cardToPlace, targetCard);
  }

  // Moving to foundation
  if (to.type === 'foundation') {
    // Only single cards to foundation
    if (cardCount > 1) return false;

    const foundation = state.foundations[to.index];
    return canPlaceOnFoundation(cardToPlace, foundation);
  }

  return false;
}

/**
 * Get cards at a location (helper for validation).
 *
 * @param state - Current game state
 * @param location - Location to get cards from
 * @returns Array of cards, or null if location is invalid
 */
function getCardsAtLocation(
  state: KlondikeGameState,
  location: GameLocation
): Card[] | null {
  const cardCount = location.cardCount ?? 1;

  switch (location.type) {
    case 'waste':
      return state.waste.length > 0 ? [state.waste[state.waste.length - 1]] : null;

    case 'tableau': {
      const column = state.tableau[location.index];
      const faceDownCount = column.cards.length - column.faceUpCount;

      // Can't select if no cards
      if (column.cards.length === 0) return null;

      // Calculate start index for selection
      const startIndex = column.cards.length - cardCount;

      // Can't select face-down cards
      if (startIndex < faceDownCount) return null;

      // Can't select more cards than available
      if (startIndex < 0 || startIndex >= column.cards.length) return null;

      return column.cards.slice(startIndex);
    }

    case 'foundation': {
      const foundation = state.foundations[location.index];
      return foundation.length > 0 ? [foundation[foundation.length - 1]] : null;
    }

    case 'stock':
      // Can't select from stock (must draw first)
      return null;

    case 'freeCell':
      // Klondike doesn't have free cells
      return null;

    default:
      return null;
  }
}

/**
 * Convert GameLocation to internal Location type (for compatibility with game actions).
 *
 * @param location - GameLocation from shared
 * @returns Internal Location type
 */
export function gameLocationToLocation(location: GameLocation): Location {
  return {
    type: location.type as 'waste' | 'tableau' | 'foundation' | 'stock',
    index: location.index,
  };
}

/**
 * Convert internal Location to GameLocation (for compatibility with shared hook).
 *
 * @param location - Internal Location type
 * @param cardCount - Optional card count
 * @returns GameLocation for shared hook
 */
export function locationToGameLocation(
  location: Location,
  cardCount?: number
): GameLocation {
  return {
    type: location.type,
    index: location.index ?? 0,
    cardCount,
  };
}
