import type { SpiderGameState, Location, TableauColumn } from './gameState';
import { NUM_COLUMNS, RUN_LENGTH } from './gameState';
import {
  canPlaceOnTableau,
  canPlaceOnEmptyTableau,
  isValidSpiderRun,
  isCompleteRun,
} from '../rules/spiderRules';

/**
 * Spider Game Actions
 *
 * All state mutations return new state objects (immutable updates).
 */

/**
 * Whether a deal from the stock is currently allowed.
 *
 * A deal requires at least one full row of cards (one per column) and is
 * forbidden while any tableau column is empty.
 */
export function canDeal(state: SpiderGameState): boolean {
  if (state.stock.length < NUM_COLUMNS) return false;
  return !state.tableau.some((col) => col.cards.length === 0);
}

/**
 * Deal a row from the stock: one face-up card onto every tableau column.
 * Any runs completed by the deal are collected to the foundations.
 *
 * Returns the unchanged state if a deal is not currently allowed.
 */
export function dealFromStock(state: SpiderGameState): SpiderGameState {
  if (!canDeal(state)) return state;

  const dealt = state.stock.slice(0, NUM_COLUMNS);
  const remaining = state.stock.slice(NUM_COLUMNS);

  const tableau = state.tableau.map((col, i) => ({
    cards: [...col.cards, dealt[i]],
    faceUpCount: col.faceUpCount + 1, // dealt cards are face-up
  }));

  const dealtState: SpiderGameState = {
    ...state,
    tableau,
    stock: remaining,
    moves: state.moves + 1,
  };

  return collectCompletedRuns(dealtState);
}

/**
 * Move a run of cards from one tableau column to another.
 *
 * @param from - Source column location
 * @param to - Destination column location
 * @param cardCount - Number of cards to move (a same-suit descending run)
 * @returns New state, or null if the move is invalid
 */
export function moveCards(
  state: SpiderGameState,
  from: Location,
  to: Location,
  cardCount: number = 1
): SpiderGameState | null {
  if (!canMove(state, from, to, cardCount)) {
    return null;
  }

  const fromIndex = from.index as number;
  const toIndex = to.index as number;

  const fromColumn = state.tableau[fromIndex];
  const toColumn = state.tableau[toIndex];

  const splitAt = fromColumn.cards.length - cardCount;
  const movingCards = fromColumn.cards.slice(splitAt);

  const newFromColumn = removeFromColumn(fromColumn, cardCount);
  const newToColumn: TableauColumn = {
    cards: [...toColumn.cards, ...movingCards],
    faceUpCount: toColumn.faceUpCount + cardCount,
  };

  const tableau = state.tableau.map((col, i) => {
    if (i === fromIndex) return newFromColumn;
    if (i === toIndex) return newToColumn;
    return col;
  });

  const movedState: SpiderGameState = {
    ...state,
    tableau,
    moves: state.moves + 1,
  };

  return collectCompletedRuns(movedState);
}

/**
 * Get all valid destination columns for a run starting in a source column.
 * Used for smart tap-to-move on mobile.
 */
export function getValidMoves(
  state: SpiderGameState,
  from: Location,
  cardCount: number = 1
): Location[] {
  const validMoves: Location[] = [];

  if (from.type !== 'tableau' || from.index === undefined) {
    return validMoves;
  }

  for (let i = 0; i < NUM_COLUMNS; i++) {
    if (i === from.index) continue;
    const destination: Location = { type: 'tableau', index: i };
    if (canMove(state, from, destination, cardCount)) {
      validMoves.push(destination);
    }
  }

  return validMoves;
}

// =============================================================================
// Internal helpers
// =============================================================================

/**
 * Check whether moving `cardCount` cards from `from` to `to` is legal.
 */
function canMove(state: SpiderGameState, from: Location, to: Location, cardCount: number): boolean {
  // Spider only supports tableau → tableau moves
  if (from.type !== 'tableau' || to.type !== 'tableau') return false;

  const fromIndex = from.index;
  const toIndex = to.index;
  if (fromIndex === undefined || toIndex === undefined) return false;
  if (fromIndex === toIndex) return false;

  const fromColumn = state.tableau[fromIndex];
  if (!fromColumn || fromColumn.cards.length === 0) return false;

  // The selected cards must all be face-up...
  const faceDownCount = fromColumn.cards.length - fromColumn.faceUpCount;
  const startIndex = fromColumn.cards.length - cardCount;
  if (startIndex < faceDownCount || startIndex < 0) return false;

  // ...and form a valid same-suit descending run.
  const movingCards = fromColumn.cards.slice(startIndex);
  if (!isValidSpiderRun(movingCards)) return false;

  const cardToPlace = movingCards[0];
  const toColumn = state.tableau[toIndex];

  if (toColumn.cards.length === 0) {
    return canPlaceOnEmptyTableau();
  }

  const targetCard = toColumn.cards[toColumn.cards.length - 1];
  return canPlaceOnTableau(cardToPlace, targetCard);
}

/**
 * Remove the top `count` cards from a column, flipping the newly exposed card.
 */
function removeFromColumn(column: TableauColumn, count: number): TableauColumn {
  const cards = column.cards.slice(0, column.cards.length - count);
  let faceUpCount = column.faceUpCount - count;

  if (cards.length === 0) {
    faceUpCount = 0;
  } else if (faceUpCount <= 0) {
    faceUpCount = 1; // flip the newly exposed top card
  }

  return { cards, faceUpCount: Math.max(0, faceUpCount) };
}

/**
 * Remove any completed King→Ace runs from the tableau to the foundations.
 * Loops until no further runs complete (a single action can complete several).
 */
function collectCompletedRuns(state: SpiderGameState): SpiderGameState {
  let current = state;
  let changed = true;

  while (changed) {
    changed = false;

    for (let i = 0; i < NUM_COLUMNS; i++) {
      const column = current.tableau[i];
      if (column.faceUpCount < RUN_LENGTH) continue;

      const candidate = column.cards.slice(column.cards.length - RUN_LENGTH);
      if (!isCompleteRun(candidate)) continue;

      const newColumn = removeFromColumn(column, RUN_LENGTH);
      current = {
        ...current,
        tableau: current.tableau.map((col, j) => (j === i ? newColumn : col)),
        foundations: [...current.foundations, candidate],
      };
      changed = true;
      break;
    }
  }

  return current;
}
