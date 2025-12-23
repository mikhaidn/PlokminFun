import { type Card, SUITS, VALUES } from './types';
import { seededRandom } from './rng';

/**
 * Creates a standard 52-card deck.
 * Cards are ordered by suit (♠, ♥, ♦, ♣) and rank (A through K).
 *
 * @returns An array of 52 Card objects
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      deck.push({
        suit,
        value: VALUES[i],
        rank: i + 1, // A=1, 2=2, ..., K=13
        id: `${VALUES[i]}${suit}`,
      });
    }
  }

  return deck;
}

/**
 * Shuffles a deck using the Fisher-Yates algorithm with a seeded RNG.
 * Returns a new array; does not modify the original deck.
 *
 * @param deck - The deck to shuffle
 * @param seed - The random seed for reproducible shuffles
 * @returns A new shuffled array of cards
 */
export function shuffleWithSeed(deck: Card[], seed: number): Card[] {
  const shuffled = [...deck]; // Create a copy
  const rng = seededRandom(seed);

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
