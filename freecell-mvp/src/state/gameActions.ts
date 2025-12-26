import { type GameState } from './gameState';
import { type Card } from '../core/types';
import { canStackOnTableau, canStackOnFoundation } from '../rules/validation';
import { isValidStack, getMaxMovable } from '../rules/movement';

type MoveSource = 'tableau' | 'freeCell' | 'foundation';

/**
 * Creates a deep copy of the game state to ensure immutability.
 */
function cloneState(state: GameState): GameState {
  return {
    ...state,
    tableau: state.tableau.map(col => [...col]),
    freeCells: [...state.freeCells],
    foundations: state.foundations.map(f => [...f]),
  };
}

/**
 * Moves a card from a tableau column to a free cell.
 *
 * @param state - Current game state
 * @param tableauIndex - Index of the source tableau column
 * @param freeCellIndex - Index of the target free cell (0-3)
 * @returns New game state or null if move is invalid
 */
export function moveCardToFreeCell(
  state: GameState,
  tableauIndex: number,
  freeCellIndex: number
): GameState | null {
  // Validate move
  if (state.freeCells[freeCellIndex] !== null) return null;
  if (state.tableau[tableauIndex].length === 0) return null;

  const newState = cloneState(state);
  const card = newState.tableau[tableauIndex].pop()!;
  newState.freeCells[freeCellIndex] = card;
  newState.moves++;

  return newState;
}

/**
 * Moves a card from a free cell to a tableau column.
 *
 * @param state - Current game state
 * @param freeCellIndex - Index of the source free cell
 * @param tableauIndex - Index of the target tableau column
 * @returns New game state or null if move is invalid
 */
export function moveCardFromFreeCell(
  state: GameState,
  freeCellIndex: number,
  tableauIndex: number
): GameState | null {
  const card = state.freeCells[freeCellIndex];
  if (!card) return null;

  const targetColumn = state.tableau[tableauIndex];
  const targetCard = targetColumn.length > 0 ? targetColumn[targetColumn.length - 1] : null;

  if (!canStackOnTableau(card, targetCard)) return null;

  const newState = cloneState(state);
  newState.freeCells[freeCellIndex] = null;
  newState.tableau[tableauIndex].push(card);
  newState.moves++;

  return newState;
}

/**
 * Moves a card to a foundation pile.
 *
 * @param state - Current game state
 * @param source - Source location ('tableau' or 'freeCell')
 * @param sourceIndex - Index of source column/free cell
 * @param foundationIndex - Index of target foundation (0-3)
 * @returns New game state or null if move is invalid
 */
export function moveCardToFoundation(
  state: GameState,
  source: MoveSource,
  sourceIndex: number,
  foundationIndex: number
): GameState | null {
  let card: Card | null = null;

  if (source === 'tableau') {
    const column = state.tableau[sourceIndex];
    if (column.length === 0) return null;
    card = column[column.length - 1];
  } else {
    card = state.freeCells[sourceIndex];
    if (!card) return null;
  }

  const foundation = state.foundations[foundationIndex];
  if (!canStackOnFoundation(card, foundation)) return null;

  const newState = cloneState(state);

  if (source === 'tableau') {
    newState.tableau[sourceIndex].pop();
  } else {
    newState.freeCells[sourceIndex] = null;
  }

  newState.foundations[foundationIndex].push(card);
  newState.moves++;

  return newState;
}

/**
 * Moves a card from a foundation pile to a tableau column.
 *
 * @param state - Current game state
 * @param foundationIndex - Index of the source foundation (0-3)
 * @param tableauIndex - Index of the target tableau column
 * @returns New game state or null if move is invalid
 */
export function moveCardFromFoundationToTableau(
  state: GameState,
  foundationIndex: number,
  tableauIndex: number
): GameState | null {
  const foundation = state.foundations[foundationIndex];
  if (foundation.length === 0) return null;

  const card = foundation[foundation.length - 1];
  const targetColumn = state.tableau[tableauIndex];
  const targetCard = targetColumn.length > 0 ? targetColumn[targetColumn.length - 1] : null;

  if (!canStackOnTableau(card, targetCard)) return null;

  const newState = cloneState(state);
  newState.foundations[foundationIndex].pop();
  newState.tableau[tableauIndex].push(card);
  newState.moves++;

  return newState;
}

/**
 * Moves a card from a foundation pile to a free cell.
 *
 * @param state - Current game state
 * @param foundationIndex - Index of the source foundation (0-3)
 * @param freeCellIndex - Index of the target free cell (0-3)
 * @returns New game state or null if move is invalid
 */
export function moveCardFromFoundationToFreeCell(
  state: GameState,
  foundationIndex: number,
  freeCellIndex: number
): GameState | null {
  if (state.freeCells[freeCellIndex] !== null) return null;

  const foundation = state.foundations[foundationIndex];
  if (foundation.length === 0) return null;

  const newState = cloneState(state);
  const card = newState.foundations[foundationIndex].pop()!;
  newState.freeCells[freeCellIndex] = card;
  newState.moves++;

  return newState;
}

/**
 * Moves one or more cards from one tableau column to another.
 *
 * @param state - Current game state
 * @param sourceIndex - Index of source tableau column
 * @param numCards - Number of cards to move from bottom of column
 * @param targetIndex - Index of target tableau column
 * @returns New game state or null if move is invalid
 */
export function moveCardsToTableau(
  state: GameState,
  sourceIndex: number,
  numCards: number,
  targetIndex: number
): GameState | null {
  if (numCards <= 0) return null;
  if (sourceIndex === targetIndex) return null;

  const sourceColumn = state.tableau[sourceIndex];
  if (sourceColumn.length < numCards) return null;

  // Get the cards to move
  const startIndex = sourceColumn.length - numCards;
  const cardsToMove = sourceColumn.slice(startIndex);

  // Validate the stack is movable
  if (!isValidStack(cardsToMove)) return null;

  // Calculate max movable cards
  const emptyFreeCells = state.freeCells.filter(c => c === null).length;
  const emptyColumns = state.tableau.filter((col, idx) => col.length === 0 && idx !== targetIndex).length;
  const maxMovable = getMaxMovable(emptyFreeCells, emptyColumns);

  if (numCards > maxMovable) return null;

  // Check if the move is valid
  const targetColumn = state.tableau[targetIndex];
  const targetCard = targetColumn.length > 0 ? targetColumn[targetColumn.length - 1] : null;
  const bottomCard = cardsToMove[0];

  if (!canStackOnTableau(bottomCard, targetCard)) return null;

  // Execute the move
  const newState = cloneState(state);
  newState.tableau[sourceIndex] = newState.tableau[sourceIndex].slice(0, startIndex);
  newState.tableau[targetIndex] = [...newState.tableau[targetIndex], ...cardsToMove];
  newState.moves++;

  return newState;
}

/**
 * Source location type for getValidMoves.
 * Describes where the card is being moved from.
 */
export interface SourceLocation {
  type: 'tableau' | 'freeCell' | 'foundation';
  index: number;
}

/**
 * Destination location type for getValidMoves.
 * Describes where the card can be moved to.
 */
export interface DestinationLocation {
  type: 'tableau' | 'freeCell' | 'foundation';
  index: number;
}

/**
 * Get all valid destination locations for a card from a source location.
 * Used for smart tap-to-move on mobile (RFC-005 Phase 2).
 *
 * @param state - Current game state
 * @param from - Source location (tableau column, free cell, or foundation)
 * @returns Array of valid destination locations
 *
 * @example
 * // User taps a card in tableau column 3
 * const destinations = getValidMoves(state, { type: 'tableau', index: 3 });
 * // Returns: [{ type: 'foundation', index: 0 }, { type: 'freeCell', index: 1 }, ...]
 *
 * // If only one destination, smart tap can auto-execute the move
 * if (destinations.length === 1) {
 *   // Auto-execute move
 * }
 */
export function getValidMoves(
  state: GameState,
  from: SourceLocation
): DestinationLocation[] {
  const validMoves: DestinationLocation[] = [];

  // Get the card we're trying to move
  let card: Card | null = null;
  let numCards = 1; // Default to moving 1 card

  if (from.type === 'tableau') {
    const column = state.tableau[from.index];
    if (column.length === 0) return validMoves;
    card = column[column.length - 1];

    // For tableau, check if we can move multiple cards as a sequence
    const emptyFreeCells = state.freeCells.filter(c => c === null).length;
    const emptyColumns = state.tableau.filter((col, idx) => col.length === 0 && idx !== from.index).length;
    const maxMovable = getMaxMovable(emptyFreeCells, emptyColumns);

    // Try to move as many valid cards as possible
    let validSequenceCount = 1;
    for (let i = column.length - 1; i > 0 && validSequenceCount < maxMovable; i--) {
      const subset = column.slice(i - 1);
      if (isValidStack(subset)) {
        validSequenceCount = subset.length;
      } else {
        break;
      }
    }
    numCards = validSequenceCount;
  } else if (from.type === 'freeCell') {
    card = state.freeCells[from.index];
    if (!card) return validMoves;
  } else if (from.type === 'foundation') {
    const foundation = state.foundations[from.index];
    if (foundation.length === 0) return validMoves;
    card = foundation[foundation.length - 1];
  }

  if (!card) return validMoves;

  // Check all tableau columns
  for (let i = 0; i < 8; i++) {
    // Skip source column if moving from tableau
    if (from.type === 'tableau' && from.index === i) {
      continue;
    }

    const targetColumn = state.tableau[i];
    const targetCard = targetColumn.length > 0 ? targetColumn[targetColumn.length - 1] : null;

    // For single card moves
    if (numCards === 1 && canStackOnTableau(card, targetCard)) {
      validMoves.push({ type: 'tableau', index: i });
    }
    // For multi-card moves from tableau
    else if (from.type === 'tableau' && numCards > 1) {
      const sourceColumn = state.tableau[from.index];
      const startIndex = sourceColumn.length - numCards;
      const cardsToMove = sourceColumn.slice(startIndex);
      const bottomCard = cardsToMove[0];

      if (canStackOnTableau(bottomCard, targetCard)) {
        // Verify we have enough free cells/columns for the move
        const result = moveCardsToTableau(state, from.index, numCards, i);
        if (result !== null) {
          validMoves.push({ type: 'tableau', index: i });
        }
      }
    }
  }

  // Check all foundations (only single cards)
  if (numCards === 1) {
    for (let i = 0; i < 4; i++) {
      // Skip source foundation if moving from foundation
      if (from.type === 'foundation' && from.index === i) {
        continue;
      }

      const foundation = state.foundations[i];
      if (canStackOnFoundation(card, foundation)) {
        validMoves.push({ type: 'foundation', index: i });
      }
    }
  }

  // Check all free cells (only single cards, and not if moving from free cell to free cell)
  if (numCards === 1 && from.type !== 'freeCell') {
    for (let i = 0; i < 4; i++) {
      if (state.freeCells[i] === null) {
        validMoves.push({ type: 'freeCell', index: i });
      }
    }
  }

  return validMoves;
}
