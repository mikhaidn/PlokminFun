import type { KlondikeGameState, Location, TableauColumn } from './gameState';
import { type CardType as Card } from '@plokmin/shared';
import {
  canPlaceOnTableau,
  canPlaceOnEmptyTableau,
  canPlaceOnFoundation,
  isValidTableauSequence,
} from '../rules/klondikeRules';

/**
 * Klondike Game Actions
 *
 * All state mutations return new state objects (immutable updates)
 */

/**
 * Draw card(s) from stock to waste
 * Supports both Draw-1 (easier) and Draw-3 (traditional) modes
 *
 * Draw-1: Draw 1 card at a time
 * Draw-3: Draw 3 cards at a time (or fewer if less than 3 remain)
 *
 * If stock is empty, recycle waste back to stock
 */
export function drawFromStock(state: KlondikeGameState): KlondikeGameState {
  let currentState = state;

  // If stock is empty, recycle waste to stock
  if (currentState.stock.length === 0) {
    if (currentState.waste.length === 0) {
      return currentState; // Nothing to recycle
    }

    // Recycle waste back to stock (reversed)
    currentState = {
      ...currentState,
      stock: [...currentState.waste].reverse(),
      waste: [],
    };
    // Continue to draw cards from the newly recycled stock
  }

  // Determine how many cards to draw based on mode
  const cardsToDraw =
    currentState.drawMode === 'draw3' ? Math.min(3, currentState.stock.length) : 1;

  // Draw cards from stock to waste
  const newStock = currentState.stock.slice(0, -cardsToDraw);
  const drawnCards = currentState.stock.slice(-cardsToDraw);
  const newWaste = [...currentState.waste, ...drawnCards];

  return {
    ...currentState,
    stock: newStock,
    waste: newWaste,
    moves: currentState.moves + 1,
  };
}

/**
 * Move card(s) from one location to another
 *
 * @param from Source location
 * @param to Destination location
 * @param cardCount Number of cards to move (for tableau sequences)
 */
export function moveCards(
  state: KlondikeGameState,
  from: Location,
  to: Location,
  cardCount: number = 1
): KlondikeGameState | null {
  // Validate move
  if (!canMove(state, from, to, cardCount)) {
    return null;
  }

  // Execute move
  let newState = { ...state };

  // Remove cards from source
  const cardsToMove = removeCards(newState, from, cardCount);
  if (!cardsToMove) return null;

  // Add cards to destination
  newState = addCards(newState, to, cardsToMove);

  // Flip top card in source tableau column if needed
  if (from.type === 'tableau' && from.index !== undefined) {
    newState = flipTopTableauCard(newState, from.index);
  }

  // Increment move counter
  newState.moves++;

  return newState;
}

/**
 * Check if a move is valid
 */
function canMove(
  state: KlondikeGameState,
  from: Location,
  to: Location,
  cardCount: number
): boolean {
  // Can't move from stock (must draw first)
  if (from.type === 'stock') return false;

  // Can't move to stock or waste
  if (to.type === 'stock' || to.type === 'waste') return false;

  // Get source cards
  const sourceCards = getCardsToMove(state, from, cardCount);
  if (!sourceCards || sourceCards.length === 0) return false;

  // Only move sequences from tableau
  if (cardCount > 1 && from.type !== 'tableau') return false;

  // Validate sequence (if moving multiple cards)
  if (cardCount > 1 && !isValidTableauSequence(sourceCards)) {
    return false;
  }

  const cardToPlace = sourceCards[0];

  // Moving to tableau
  if (to.type === 'tableau' && to.index !== undefined) {
    const targetColumn = state.tableau[to.index];

    // Empty column: only King
    if (targetColumn.cards.length === 0) {
      return canPlaceOnEmptyTableau(cardToPlace);
    }

    // Place on existing card
    const targetCard = targetColumn.cards[targetColumn.cards.length - 1];
    return canPlaceOnTableau(cardToPlace, targetCard);
  }

  // Moving to foundation
  if (to.type === 'foundation' && to.index !== undefined) {
    // Only single cards to foundation
    if (cardCount > 1) return false;

    const foundation = state.foundations[to.index];
    return canPlaceOnFoundation(cardToPlace, foundation);
  }

  return false;
}

/**
 * Get cards to move from a location
 */
function getCardsToMove(
  state: KlondikeGameState,
  location: Location,
  count: number
): Card[] | null {
  if (location.type === 'waste') {
    if (state.waste.length === 0) return null;
    return [state.waste[state.waste.length - 1]];
  }

  if (location.type === 'tableau' && location.index !== undefined) {
    const column = state.tableau[location.index];
    if (column.cards.length === 0) return null;

    // Can only move face-up cards
    const faceUpStart = column.cards.length - column.faceUpCount;
    const availableCards = column.cards.slice(faceUpStart);

    if (count > availableCards.length) return null;

    return availableCards.slice(-count);
  }

  if (location.type === 'foundation' && location.index !== undefined) {
    const foundation = state.foundations[location.index];
    if (foundation.length === 0) return null;
    return [foundation[foundation.length - 1]];
  }

  return null;
}

/**
 * Remove cards from a location (immutable)
 */
function removeCards(state: KlondikeGameState, location: Location, count: number): Card[] | null {
  if (location.type === 'waste') {
    if (state.waste.length === 0) return null;
    const card = state.waste[state.waste.length - 1];
    state.waste = state.waste.slice(0, -1);
    return [card];
  }

  if (location.type === 'tableau' && location.index !== undefined) {
    const column = state.tableau[location.index];
    if (column.cards.length === 0) return null;

    const cards = column.cards.slice(-count);
    const newColumn: TableauColumn = {
      ...column,
      cards: column.cards.slice(0, -count),
      faceUpCount: Math.max(0, column.faceUpCount - count),
    };

    state.tableau = state.tableau.map((col, i) => (i === location.index ? newColumn : col));

    return cards;
  }

  if (location.type === 'foundation' && location.index !== undefined) {
    const foundation = state.foundations[location.index];
    if (foundation.length === 0) return null;

    const card = foundation[foundation.length - 1];
    state.foundations = state.foundations.map((f, i) =>
      i === location.index ? f.slice(0, -1) : f
    );

    return [card];
  }

  return null;
}

/**
 * Add cards to a location (immutable)
 */
function addCards(state: KlondikeGameState, location: Location, cards: Card[]): KlondikeGameState {
  if (location.type === 'tableau' && location.index !== undefined) {
    const column = state.tableau[location.index];
    const newColumn: TableauColumn = {
      cards: [...column.cards, ...cards],
      faceUpCount: column.faceUpCount + cards.length,
    };

    return {
      ...state,
      tableau: state.tableau.map((col, i) => (i === location.index ? newColumn : col)),
    };
  }

  if (location.type === 'foundation' && location.index !== undefined) {
    return {
      ...state,
      foundations: state.foundations.map((f, i) => (i === location.index ? [...f, ...cards] : f)),
    };
  }

  return state;
}

/**
 * Flip the top card in a tableau column (if face-down)
 */
function flipTopTableauCard(state: KlondikeGameState, columnIndex: number): KlondikeGameState {
  const column = state.tableau[columnIndex];

  // If column is empty or top card is already face-up, no change
  if (column.cards.length === 0 || column.faceUpCount > 0) {
    return state;
  }

  // Flip top card
  const newColumn: TableauColumn = {
    ...column,
    faceUpCount: 1,
  };

  return {
    ...state,
    tableau: state.tableau.map((col, i) => (i === columnIndex ? newColumn : col)),
  };
}

/**
 * Auto-move cards to foundations (if safe)
 *
 * A move is safe if:
 * - The card is an Ace (always safe)
 * - The card is one rank higher than both opposite-color foundations
 */
export function autoMoveToFoundations(state: KlondikeGameState): KlondikeGameState {
  let newState = state;
  let moved = true;

  // Keep trying until no more moves
  while (moved) {
    moved = false;

    // Try waste
    if (newState.waste.length > 0) {
      const result = tryAutoMoveFromWaste(newState);
      if (result) {
        newState = result;
        moved = true;
        continue;
      }
    }

    // Try tableau columns
    for (let i = 0; i < 7; i++) {
      const result = tryAutoMoveFromTableau(newState, i);
      if (result) {
        newState = result;
        moved = true;
        break;
      }
    }
  }

  return newState;
}

function tryAutoMoveFromWaste(state: KlondikeGameState): KlondikeGameState | null {
  if (state.waste.length === 0) return null;

  const card = state.waste[state.waste.length - 1];
  const foundationIndex = getFoundationIndex(card);

  if (canPlaceOnFoundation(card, state.foundations[foundationIndex])) {
    return moveCards(state, { type: 'waste' }, { type: 'foundation', index: foundationIndex }, 1);
  }

  return null;
}

function tryAutoMoveFromTableau(
  state: KlondikeGameState,
  columnIndex: number
): KlondikeGameState | null {
  const column = state.tableau[columnIndex];
  if (column.cards.length === 0) return null;

  const card = column.cards[column.cards.length - 1];
  const foundationIndex = getFoundationIndex(card);

  if (canPlaceOnFoundation(card, state.foundations[foundationIndex])) {
    return moveCards(
      state,
      { type: 'tableau', index: columnIndex },
      { type: 'foundation', index: foundationIndex },
      1
    );
  }

  return null;
}

/**
 * Get foundation index for a card (based on suit)
 */
function getFoundationIndex(card: Card): number {
  const suits = ['♠', '♥', '♦', '♣'];
  return suits.indexOf(card.suit);
}

/**
 * Get all valid destination locations for a card/stack from a source location.
 * Used for smart tap-to-move on mobile (RFC-005 Phase 2).
 *
 * @param state Current game state
 * @param from Source location
 * @param cardCount Number of cards to move (default: 1 for single card)
 * @returns Array of valid destination locations
 *
 * @example
 * // User taps a card in tableau column 3
 * const destinations = getValidMoves(state, { type: 'tableau', index: 3 });
 * // Returns: [{ type: 'foundation', index: 0 }, { type: 'tableau', index: 5 }]
 *
 * // If only one destination, smart tap can auto-execute the move
 * if (destinations.length === 1) {
 *   moveCards(state, from, destinations[0]);
 * }
 */
export function getValidMoves(
  state: KlondikeGameState,
  from: Location,
  cardCount: number = 1
): Location[] {
  const validMoves: Location[] = [];

  // Can't move from stock (must draw first)
  if (from.type === 'stock') {
    return validMoves;
  }

  // Get source cards to determine what we're trying to move
  const sourceCards = getCardsToMove(state, from, cardCount);
  if (!sourceCards || sourceCards.length === 0) {
    return validMoves;
  }

  // Check all tableau columns
  for (let i = 0; i < 7; i++) {
    const destination: Location = { type: 'tableau', index: i };

    // Skip source column if moving from tableau
    if (from.type === 'tableau' && from.index === i) {
      continue;
    }

    if (canMove(state, from, destination, cardCount)) {
      validMoves.push(destination);
    }
  }

  // Check all foundations (only for single cards)
  if (cardCount === 1) {
    for (let i = 0; i < 4; i++) {
      const destination: Location = { type: 'foundation', index: i };

      // Skip source foundation if moving from foundation
      if (from.type === 'foundation' && from.index === i) {
        continue;
      }

      if (canMove(state, from, destination, cardCount)) {
        validMoves.push(destination);
      }
    }
  }

  return validMoves;
}
