/**
 * Pure, state-explicit form of @plokmin/shared's `seededRandom` PRNG.
 *
 * The shared version keeps its state in a closure; the engine needs the
 * cursor inside GameState so that (seed, inputs) → state is total. Same
 * constants, same update rule, same output sequence — asserted by a test
 * against the shared implementation.
 */

export interface RngResult {
  readonly value: number; // in [0, 1)
  readonly next: number; // new rng state
}

export function rngStep(state: number): RngResult {
  const next = (state + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, next };
}

/** Uniform integer in [0, maxExclusive). */
export function rngInt(state: number, maxExclusive: number): RngResult {
  const r = rngStep(state);
  return { value: Math.floor(r.value * maxExclusive), next: r.next };
}
