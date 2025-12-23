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
