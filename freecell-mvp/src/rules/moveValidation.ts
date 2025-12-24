import type { GameLocation } from '@cardgames/shared';
import type { GameState } from '../state/gameState';
import type { Card } from '../core/types';
import { canStackOnTableau, canStackOnFoundation, isValidFreeCellSequence } from './validation';
import { getMaxMovable } from './movement';

/**
 * Validate if a move from source to destination is legal in FreeCell.
 * Used by the useCardInteraction hook.
 *
 * @param state - Current game state
 * @param from - Source location (GameLocation from shared)
 * @param to - Destination location (GameLocation from shared)
 * @returns true if the move is valid, false otherwise
 *
 * @example
 * const from: GameLocation = { type: 'tableau', index: 3, cardCount: 2 };
 * const to: GameLocation = { type: 'tableau', index: 5 };
 * validateMove(gameState, from, to); // true if valid supermove
 */
export function validateMove(
  state: GameState,
  from: GameLocation,
  to: GameLocation
): boolean {
  // Get source cards
  const sourceCards = getCardsAtLocation(state, from);
  if (!sourceCards || sourceCards.length === 0) return false;

  const cardCount = from.cardCount ?? (
    from.cardIndex !== undefined
      ? state.tableau[from.index].length - from.cardIndex
      : 1
  );

  const cardToPlace = sourceCards[0];

  // Validate based on destination type
  switch (to.type) {
    case 'freeCell': {
      // Only single cards to free cells
      if (cardCount > 1) return false;
      // Free cell must be empty
      return state.freeCells[to.index] === null;
    }

    case 'foundation': {
      // Only single cards to foundation
      if (cardCount > 1) return false;
      const foundation = state.foundations[to.index];
      return canStackOnFoundation(cardToPlace, foundation);
    }

    case 'tableau': {
      const targetColumn = state.tableau[to.index];
      const targetCard = targetColumn.length > 0
        ? targetColumn[targetColumn.length - 1]
        : null;

      // Check if card can stack
      if (!canStackOnTableau(cardToPlace, targetCard)) {
        return false;
      }

      // For multi-card moves, validate supermove constraints
      if (cardCount > 1) {
        // Validate sequence is valid
        if (!isValidFreeCellSequence(sourceCards)) {
          return false;
        }

        // Calculate max movable cards based on available resources
        const emptyFreeCells = state.freeCells.filter(fc => fc === null).length;
        const emptyColumns = state.tableau.filter((col, idx) =>
          col.length === 0 && idx !== from.index && idx !== to.index
        ).length;
        const maxMovable = getMaxMovable(emptyFreeCells, emptyColumns);

        if (cardCount > maxMovable) {
          return false;
        }
      }

      return true;
    }

    default:
      return false;
  }
}

/**
 * Get cards at a location (helper for validation).
 *
 * @param state - Current game state
 * @param location - Location to get cards from
 * @returns Array of cards, or null if location is invalid
 */
function getCardsAtLocation(
  state: GameState,
  location: GameLocation
): Card[] | null {
  // Determine card count
  const cardCount = location.cardCount ?? (
    location.cardIndex !== undefined
      ? state.tableau[location.index].length - location.cardIndex
      : 1
  );

  switch (location.type) {
    case 'freeCell':
      return state.freeCells[location.index] !== null
        ? [state.freeCells[location.index]!]
        : null;

    case 'foundation': {
      const foundation = state.foundations[location.index];
      return foundation.length > 0
        ? [foundation[foundation.length - 1]]
        : null;
    }

    case 'tableau': {
      const column = state.tableau[location.index];
      if (column.length === 0) return null;

      // Calculate start index for selection
      const startIndex = column.length - cardCount;

      // Can't select more cards than available
      if (startIndex < 0 || startIndex >= column.length) return null;

      return column.slice(startIndex);
    }

    default:
      return null;
  }
}
