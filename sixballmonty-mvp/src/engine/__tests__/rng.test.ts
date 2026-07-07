import { describe, expect, it } from 'vitest';
import { rngInt, rngStep } from '../rng';
// Reuse guarantee: the engine's pure RNG must emit the exact sequence of the
// shared closure-based PRNG (RFC-008 reuse map).
import { seededRandom } from '../../../../shared/core/rng';

describe('rngStep', () => {
  it('matches @plokmin/shared seededRandom exactly over long sequences', () => {
    for (const seed of [0, 1, 42, 123456789, -7, 2 ** 31 - 1]) {
      const shared = seededRandom(seed);
      let state = seed;
      for (let i = 0; i < 1000; i++) {
        const step = rngStep(state);
        expect(step.value).toBe(shared());
        state = step.next;
      }
    }
  });

  it('is pure: same state in, same result out', () => {
    const a = rngStep(999);
    const b = rngStep(999);
    expect(a).toEqual(b);
  });

  it('produces values in [0, 1)', () => {
    let state = 7;
    for (let i = 0; i < 500; i++) {
      const { value, next } = rngStep(state);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      state = next;
    }
  });
});

describe('rngInt', () => {
  it('produces integers in [0, max) covering the full range', () => {
    const seen = new Set<number>();
    let state = 3;
    for (let i = 0; i < 500; i++) {
      const { value, next } = rngInt(state, 6);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(6);
      seen.add(value);
      state = next;
    }
    expect(seen.size).toBe(6);
  });
});
