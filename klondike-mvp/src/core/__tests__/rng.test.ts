import { describe, test, expect } from 'vitest';
import { seededRandom } from '../rng';

describe('seededRandom', () => {
  test('generates same sequence for same seed', () => {
    const rng1 = seededRandom(12345);
    const rng2 = seededRandom(12345);

    const seq1 = [rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2()];

    expect(seq1).toEqual(seq2);
  });

  test('generates different sequences for different seeds', () => {
    const rng1 = seededRandom(12345);
    const rng2 = seededRandom(54321);

    expect(rng1()).not.toEqual(rng2());
  });

  test('generates numbers between 0 and 1', () => {
    const rng = seededRandom(99999);

    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  test('generates different values on subsequent calls', () => {
    const rng = seededRandom(777);
    const val1 = rng();
    const val2 = rng();
    const val3 = rng();

    expect(val1).not.toEqual(val2);
    expect(val2).not.toEqual(val3);
    expect(val1).not.toEqual(val3);
  });

  test('works with negative seeds', () => {
    const rng = seededRandom(-12345);
    const val = rng();

    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
  });

  test('produces consistent sequence across multiple calls', () => {
    const rng1 = seededRandom(555);
    const sequence1 = Array.from({ length: 10 }, () => rng1());

    const rng2 = seededRandom(555);
    const sequence2 = Array.from({ length: 10 }, () => rng2());

    expect(sequence1).toEqual(sequence2);
  });
});
