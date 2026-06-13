import { type CardType as Card, SUITS, VALUES, shuffleWithSeed } from '@plokmin/shared';

/**
 * Spider Game State
 *
 * Tableau: 10 columns. First 4 columns start with 6 cards, the rest with 5
 *          (54 cards total). Only the top card of each column starts face-up.
 * Stock:   50 remaining cards, dealt 10 at a time (one card to every column).
 * Foundations: completed King→Ace same-suit runs (8 needed to win).
 *
 * Difficulty is controlled by the number of suits used. The deck always has
 * 104 cards (two decks):
 * - 1 suit  (easy):   8 copies of every spade rank
 * - 2 suits (medium): 4 copies of every ♠ and ♥ rank
 * - 4 suits (hard):   2 copies of every rank in every suit (two full decks)
 */

export type SuitCount = 1 | 2 | 4;

export interface TableauColumn {
  cards: Card[];
  faceUpCount: number; // Number of cards that are face-up (from the end)
}

export interface SpiderGameState {
  tableau: TableauColumn[]; // 10 columns
  stock: Card[]; // Remaining cards to deal (face-down)
  foundations: Card[][]; // Completed K→A runs (each 13 cards). Length 0..8.
  seed: number; // For reproducible games
  moves: number; // Move counter
  suitCount: SuitCount; // Difficulty (1, 2, or 4 suits)
}

/** Location types for move operations */
export type LocationType = 'tableau' | 'stock' | 'foundation';

export interface Location {
  type: LocationType;
  index?: number; // Column/pile index
}

export const NUM_COLUMNS = 10;
export const NUM_FOUNDATIONS = 8;
export const DECK_SIZE = 104;
export const RUN_LENGTH = 13; // King down to Ace

/**
 * Build a 104-card Spider deck for the given number of suits.
 *
 * Unlike a standard 52-card deck there are duplicate cards, so each card is
 * given a unique id of the form `<value><suit>#<copy>` (e.g. "7♠#3").
 *
 * @param suitCount - 1, 2, or 4 suits
 * @returns An array of 104 Card objects
 */
export function createSpiderDeck(suitCount: SuitCount): Card[] {
  const suits = SUITS.slice(0, suitCount);
  const copies = DECK_SIZE / (suits.length * VALUES.length); // 8, 4, or 2

  const deck: Card[] = [];
  for (let copy = 0; copy < copies; copy++) {
    for (const suit of suits) {
      for (let i = 0; i < VALUES.length; i++) {
        deck.push({
          suit,
          value: VALUES[i],
          rank: i + 1, // A=1, 2=2, ..., K=13
          id: `${VALUES[i]}${suit}#${copy}`,
        });
      }
    }
  }

  return deck;
}

/**
 * Create initial Spider game state from a seed.
 *
 * Tableau setup (54 cards):
 * - Columns 0-3: 6 cards each (1 face-up)
 * - Columns 4-9: 5 cards each (1 face-up)
 *
 * Remaining 50 cards go to the stock (5 deals of 10).
 *
 * @param seed - Random seed for reproducible games
 * @param suitCount - Difficulty (1, 2, or 4 suits). Defaults to 1 (easiest).
 * @returns A new SpiderGameState object
 */
export function createInitialState(seed: number, suitCount: SuitCount = 1): SpiderGameState {
  const deck = shuffleWithSeed(createSpiderDeck(suitCount), seed);

  const tableau: TableauColumn[] = [];
  let cardIndex = 0;

  for (let col = 0; col < NUM_COLUMNS; col++) {
    const columnSize = col < 4 ? 6 : 5; // 4*6 + 6*5 = 54
    const cards = deck.slice(cardIndex, cardIndex + columnSize);
    tableau.push({
      cards,
      faceUpCount: 1, // Only the last card is face-up initially
    });
    cardIndex += columnSize;
  }

  const stock = deck.slice(cardIndex); // remaining 50 cards

  return {
    tableau,
    stock,
    foundations: [],
    seed,
    moves: 0,
    suitCount,
  };
}

/**
 * Check if the game is won.
 * Win condition: all 8 King→Ace runs have been completed to the foundations.
 */
export function isGameWon(state: SpiderGameState): boolean {
  return state.foundations.length === NUM_FOUNDATIONS;
}
