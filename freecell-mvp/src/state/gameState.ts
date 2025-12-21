import { type Card } from '../core/types';
import { createDeck, shuffleWithSeed } from '../core/deck';

/**
 * Represents the complete state of a FreeCell game.
 */
export interface GameState {
  /** 8 tableau columns (main playing area) */
  tableau: Card[][];

  /** 4 free cells for temporary card storage */
  freeCells: (Card | null)[];

  /** 4 foundation piles (one per suit, Ace to King) */
  foundations: Card[][];

  /** The random seed used to generate this game */
  seed: number;

  /** Number of moves made */
  moves: number;
}

/**
 * Initializes a new FreeCell game with the given seed.
 *
 * FreeCell deal pattern:
 * - First 4 columns get 7 cards each
 * - Last 4 columns get 6 cards each
 * - Total: 52 cards distributed across 8 columns
 *
 * @param seed - Random seed for reproducible game generation
 * @returns A new GameState object
 */
export function initializeGame(seed: number): GameState {
  // Create and shuffle the deck
  const deck = createDeck();
  const shuffled = shuffleWithSeed(deck, seed);

  // Initialize empty tableau columns
  const tableau: Card[][] = Array(8).fill(null).map(() => []);

  // Distribute cards to tableau
  // First 4 columns get 7 cards, last 4 get 6 cards
  let cardIndex = 0;
  for (let col = 0; col < 8; col++) {
    const cardsInColumn = col < 4 ? 7 : 6;
    for (let row = 0; row < cardsInColumn; row++) {
      tableau[col].push(shuffled[cardIndex++]);
    }
  }

  return {
    tableau,
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []],
    seed,
    moves: 0,
  };
}

/**
 * Checks if the game has been won.
 * Win condition: All 4 foundations have 13 cards each (complete suits A-K).
 *
 * @param state - The current game state
 * @returns true if the game is won
 */
export function checkWinCondition(state: GameState): boolean {
  return state.foundations.every(foundation => foundation.length === 13);
}
