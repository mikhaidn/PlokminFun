import { describe, expect, it } from 'vitest';
import type { InputEvent } from '../types';
import { createInitialState, tick } from '../tick';
import {
  deserializeReplay,
  hashState,
  serializeReplay,
  simulateReplay,
  type Replay,
} from '../replay';
import { randomEvents, testConfig } from './helpers';

const config = testConfig({ gravity: { initialCellsPerSecond: 30 } });

function makeReplay(seed: number, ticks: number): Replay {
  const inputs: InputEvent[] = randomEvents(seed * 31 + 7, ticks).flat();
  return { version: 1, seed, preset: 'test', inputs, ticks };
}

describe('simulateReplay', () => {
  it('reproduces the same final state as a manual tick loop', () => {
    const replay = makeReplay(11, 400);
    const viaReplay = simulateReplay(replay, config);

    const byTick = new Map<number, InputEvent[]>();
    for (const e of replay.inputs) byTick.set(e.tick, [...(byTick.get(e.tick) ?? []), e]);
    let manual = createInitialState(replay.seed, config);
    for (let t = 0; t < replay.ticks; t++) manual = tick(manual, byTick.get(t) ?? [], config);

    expect(hashState(viaReplay)).toBe(hashState(manual));
    expect(viaReplay).toEqual(manual);
  });

  it('is reproducible: two simulations agree exactly', () => {
    const replay = makeReplay(23, 600);
    expect(hashState(simulateReplay(replay, config))).toBe(
      hashState(simulateReplay(replay, config))
    );
  });
});

describe('replay serialization', () => {
  it('round-trips through JSON', () => {
    const replay = makeReplay(3, 200);
    const restored = deserializeReplay(serializeReplay(replay));
    expect(restored).toEqual(replay);
    expect(hashState(simulateReplay(restored, config))).toBe(
      hashState(simulateReplay(replay, config))
    );
  });

  it('rejects malformed payloads', () => {
    expect(() => deserializeReplay('{}')).toThrow();
    expect(() => deserializeReplay('[]')).toThrow();
    expect(() => deserializeReplay('{"version":2,"seed":1,"inputs":[],"ticks":10}')).toThrow();
    expect(() => deserializeReplay('{"version":1,"seed":"x","inputs":[],"ticks":10}')).toThrow();
  });
});

describe('hashState', () => {
  it('is equal for identically constructed states and differs across seeds', () => {
    expect(hashState(createInitialState(9, config))).toBe(hashState(createInitialState(9, config)));
    expect(hashState(createInitialState(9, config))).not.toBe(
      hashState(createInitialState(10, config))
    );
  });

  it('is sensitive to state changes', () => {
    const s = createInitialState(9, config);
    expect(hashState({ ...s, score: s.score + 1 })).not.toBe(hashState(s));
    expect(hashState({ ...s, pendingGarbage: 1 })).not.toBe(hashState(s));
    expect(hashState({ ...s, clearing: [[6, 0]] })).not.toBe(hashState(s));
    expect(
      hashState({ ...s, active: { colors: [0, 1], row: 1, col: 2, orientation: 0 } })
    ).not.toBe(hashState(s));
  });
});
