import { type CardType as Card } from '@cardgames/shared';
import { createDeck, shuffleWithSeed } from '@cardgames/shared';

/**
 * Klondike Game State
 *
 * Tableau: 7 columns with varying face-up counts
 * Stock: Draw pile (all face-down)
 * Waste: Discard pile from stock (all face-up)
 * Foundations: 4 suit piles, Ace to King (all face-up)
 */

export interface TableauColumn {
  cards: Card[];
  faceUpCount: number; // Number of cards that are face-up (from the end)
}

export type DrawMode = 'draw1' | 'draw3';

export interface KlondikeGameState {
  tableau: TableauColumn[]; // 7 columns
  stock: Card[]; // Draw pile (face-down)
  waste: Card[]; // Discard pile (face-up)
  foundations: Card[][]; // 4 foundation piles (face-up)
  seed: number; // For reproducible games
  moves: number; // Move counter
  drawMode: DrawMode; // Draw-1 or Draw-3
}

/**
 * Location types for move operations
 */
export type LocationType = 'tableau' | 'stock' | 'waste' | 'foundation';

export interface Location {
  type: LocationType;
  index?: number; // Column/pile index (for tableau and foundations)
}

/**
 * Create initial game state for Klondike
 *
 * Tableau setup:
 * - Column 0: 1 card (1 face-up)
 * - Column 1: 2 cards (1 face-up)
 * - Column 2: 3 cards (1 face-up)
 * - ...
 * - Column 6: 7 cards (1 face-up)
 *
 * Total in tableau: 28 cards
 * Remaining in stock: 24 cards (all face-down)
 *
 * @param seed - Random seed for reproducible games
 * @param drawMode - Draw-1 (easier) or Draw-3 (traditional)
 */
export function createInitialState(seed: number, drawMode: DrawMode = 'draw1'): KlondikeGameState {
  const deck = shuffleWithSeed(createDeck(), seed);

  const tableau: TableauColumn[] = [];
  let cardIndex = 0;

  // Deal cards to tableau (7 columns, pyramid style)
  for (let col = 0; col < 7; col++) {
    const columnSize = col + 1;
    const cards = deck.slice(cardIndex, cardIndex + columnSize);
    tableau.push({
      cards,
      faceUpCount: 1, // Only the last card is face-up initially
    });
    cardIndex += columnSize;
  }

  // Remaining cards go to stock (24 cards)
  const stock = deck.slice(cardIndex);

  return {
    tableau,
    stock,
    waste: [],
    foundations: [[], [], [], []], // 4 empty foundation piles
    seed,
    moves: 0,
    drawMode,
  };
}

/**
 * Helper: Check if a card at a specific location should be face-up
 *
 * Rules:
 * - Tableau: Last N cards are face-up (based on faceUpCount)
 * - Stock: All face-down
 * - Waste: All face-up
 * - Foundations: All face-up
 */
export function isCardFaceUp(
  state: KlondikeGameState,
  location: Location,
  cardIndex: number
): boolean {
  if (location.type === 'tableau' && location.index !== undefined) {
    const column = state.tableau[location.index];
    const faceDownCount = column.cards.length - column.faceUpCount;
    return cardIndex >= faceDownCount;
  }

  if (location.type === 'stock') {
    return false; // Stock is always face-down
  }

  // Waste and foundations are always face-up
  return true;
}

/**
 * Helper: Get cards from a location
 */
export function getCardsAtLocation(state: KlondikeGameState, location: Location): Card[] {
  switch (location.type) {
    case 'tableau':
      return location.index !== undefined ? state.tableau[location.index].cards : [];
    case 'stock':
      return state.stock;
    case 'waste':
      return state.waste;
    case 'foundation':
      return location.index !== undefined ? state.foundations[location.index] : [];
    default:
      return [];
  }
}

/**
 * Helper: Check if game is won
 * Win condition: All 4 foundations have 13 cards (Ace to King)
 */
export function isGameWon(state: KlondikeGameState): boolean {
  return state.foundations.every((foundation) => foundation.length === 13);
}
