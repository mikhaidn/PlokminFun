import type { Card } from '../types/Card';
import { createDeck, shuffleWithSeed } from './deck';

/**
 * Initialization source types for game setup.
 * Supports multiple ways to initialize a game:
 * - 'seed': Random shuffle using a numeric seed (default, reproducible)
 * - 'cards': Manually specified card order (for testing/specific scenarios)
 * - 'serialized': Game state from serialized string (for sharing/loading)
 */
export type InitializationSource =
  | { type: 'seed'; seed: number }
  | { type: 'cards'; cards: Card[] }
  | { type: 'serialized'; data: string };

/**
 * Game Initialization Adapter
 *
 * Provides a unified interface for initializing games from different sources.
 * This makes it easy to:
 * 1. Generate random games from seeds (default behavior)
 * 2. Create specific test scenarios with manual card arrangements
 * 3. Load saved or shared games from serialized state
 *
 * @example
 * // Random game from seed
 * const deck1 = getDeckFromSource({ type: 'seed', seed: 12345 });
 *
 * // Manual card arrangement for testing
 * const testCards = [aceOfSpades, kingOfHearts, ...];
 * const deck2 = getDeckFromSource({ type: 'cards', cards: testCards });
 *
 * // Future: Load from serialized state (RFC-006)
 * const deck3 = getDeckFromSource({ type: 'serialized', data: 'base64string...' });
 */

/**
 * Get a shuffled deck from any initialization source.
 *
 * @param source - The initialization source (seed, cards, or serialized)
 * @returns A 52-card deck based on the source
 * @throws Error if the source type is invalid or cards are invalid
 */
export function getDeckFromSource(source: InitializationSource): Card[] {
  switch (source.type) {
    case 'seed':
      // Standard seed-based random shuffle (default)
      return shuffleWithSeed(createDeck(), source.seed);

    case 'cards':
      // Manual card arrangement (for testing or specific scenarios)
      if (source.cards.length !== 52) {
        throw new Error(`Invalid card arrangement: expected 52 cards, got ${source.cards.length}`);
      }
      return [...source.cards]; // Return a copy to avoid mutation

    case 'serialized':
      // Future: Parse serialized game state (RFC-006)
      throw new Error('Serialized game state not yet implemented. See RFC-006 for design.');

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = source;
      throw new Error(`Unknown initialization source type: ${(_exhaustive as any).type}`);
  }
}

/**
 * Create a default initialization source from a seed.
 * Convenience function for the common case of seed-based initialization.
 *
 * @param seed - Optional seed (defaults to current timestamp)
 * @returns An InitializationSource for seed-based initialization
 */
export function createSeedSource(seed?: number): InitializationSource {
  return {
    type: 'seed',
    seed: seed ?? Date.now(),
  };
}

/**
 * Create an initialization source from manual cards.
 * Useful for testing specific game scenarios.
 *
 * @param cards - Array of exactly 52 cards
 * @returns An InitializationSource for manual card arrangement
 */
export function createCardsSource(cards: Card[]): InitializationSource {
  return {
    type: 'cards',
    cards,
  };
}

/**
 * Create an initialization source from serialized data.
 * For loading saved or shared games (RFC-006).
 *
 * @param data - Serialized game state string
 * @returns An InitializationSource for serialized game loading
 */
export function createSerializedSource(data: string): InitializationSource {
  return {
    type: 'serialized',
    data,
  };
}
