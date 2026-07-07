/**
 * The Phase 1 exit criterion (RFC-008): same seed + same inputs ⇒ the same
 * state hash at every single tick, and the engine never mutates its inputs.
 */
import { describe, expect, it } from 'vitest';
import { createInitialState, tick } from '../tick';
import { hashState } from '../replay';
import { deepFreeze, randomEvents, testConfig } from './helpers';

const config = testConfig({ gravity: { initialCellsPerSecond: 30 } });

describe('determinism', () => {
  it('same seed + inputs produce identical hash timelines', () => {
    for (const seed of [1, 77, 424242]) {
      const events = randomEvents(seed + 1000, 500, 0.2);
      const timelines: number[][] = [];
      for (let run = 0; run < 2; run++) {
        let s = createInitialState(seed, config);
        const hashes: number[] = [];
        for (let t = 0; t < 500; t++) {
          s = tick(s, events[t], config);
          hashes.push(hashState(s));
        }
        timelines.push(hashes);
      }
      expect(timelines[0]).toEqual(timelines[1]);
    }
  });

  it('different seeds diverge', () => {
    const events = randomEvents(5, 200, 0.2);
    let a = createInitialState(1, config);
    let b = createInitialState(2, config);
    for (let t = 0; t < 200; t++) {
      a = tick(a, events[t], config);
      b = tick(b, events[t], config);
    }
    expect(hashState(a)).not.toBe(hashState(b));
  });
});

describe('purity', () => {
  it('tick never mutates its input state (deep-frozen states throw on write)', () => {
    const events = randomEvents(9, 300, 0.25);
    let s = createInitialState(3, config);
    let played = 0;
    for (let t = 0; t < 300 && s.status === 'playing'; t++) {
      s = tick(deepFreeze(s), events[t], config);
      played++;
    }
    // Random hard drops may top the game out early; what matters is that no
    // frozen object was ever written to (strict mode would have thrown).
    expect(s.elapsedTicks).toBe(played);
    expect(played).toBeGreaterThan(20);
  });

  it('tick does not mutate the events array or config', () => {
    const s = createInitialState(3, config);
    const events = deepFreeze([{ tick: 0, action: 'left' as const }]);
    tick(s, events, deepFreeze(structuredClone(config)));
  });
});
