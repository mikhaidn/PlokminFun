import {
  type CardType as Card,
  type InitializationSource,
  getDeckFromSource,
  createSeedSource,
} from '@plokmin/shared';

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
 * Initializes a new FreeCell game from an initialization source.
 * Supports seed-based, manual card arrangement, or serialized game states.
 *
 * FreeCell deal pattern:
 * - First 4 columns get 7 cards each
 * - Last 4 columns get 6 cards each
 * - Total: 52 cards distributed across 8 columns
 *
 * @param source - Initialization source (seed, cards, or serialized)
 * @returns A new GameState object
 *
 * @example
 * // Random game from seed
 * const game1 = initializeGameFromSource({ type: 'seed', seed: 12345 });
 *
 * // Manual card arrangement for testing
 * const testCards = [...]; // 52 cards in specific order
 * const game2 = initializeGameFromSource({ type: 'cards', cards: testCards });
 *
 * // Future: Load from serialized state (RFC-006)
 * const game3 = initializeGameFromSource({ type: 'serialized', data: '...' });
 */
export function initializeGameFromSource(source: InitializationSource): GameState {
  // Get shuffled deck from any source type
  const shuffled = getDeckFromSource(source);

  // Initialize empty tableau columns
  const tableau: Card[][] = Array(8)
    .fill(null)
    .map(() => []);

  // Distribute cards to tableau
  // First 4 columns get 7 cards, last 4 get 6 cards
  let cardIndex = 0;
  for (let col = 0; col < 8; col++) {
    const cardsInColumn = col < 4 ? 7 : 6;
    for (let row = 0; row < cardsInColumn; row++) {
      tableau[col].push(shuffled[cardIndex++]);
    }
  }

  // Extract seed from source (or use 0 for non-seed sources)
  const seed = source.type === 'seed' ? source.seed : 0;

  return {
    tableau,
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []],
    seed,
    moves: 0,
  };
}

/**
 * Initializes a new FreeCell game with the given seed.
 * Convenience wrapper around initializeGameFromSource for backward compatibility.
 *
 * @param seed - Random seed for reproducible game generation
 * @returns A new GameState object
 */
export function initializeGame(seed: number): GameState {
  return initializeGameFromSource(createSeedSource(seed));
}

/**
 * Checks if the game has been won.
 * Win condition: All 4 foundations have 13 cards each (complete suits A-K).
 *
 * @param state - The current game state
 * @returns true if the game is won
 */
export function checkWinCondition(state: GameState): boolean {
  return state.foundations.every((foundation) => foundation.length === 13);
}
