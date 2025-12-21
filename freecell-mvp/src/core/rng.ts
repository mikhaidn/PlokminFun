/**
 * Creates a seeded random number generator.
 * Uses a deterministic algorithm to ensure reproducible sequences.
 *
 * @param seed - The initial seed value (can be any number)
 * @returns A function that generates pseudo-random numbers between 0 and 1
 */
export function seededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    // XorShift-based PRNG algorithm
    let t = state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
