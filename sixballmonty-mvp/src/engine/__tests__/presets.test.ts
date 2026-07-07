import { describe, expect, it } from 'vitest';
import { CLASSIC, FRANTIC, MINI, PRESETS } from '../presets';
import { TICKS_PER_SECOND } from '../types';
import { createInitialState, gravityCellsPerSecond, tick } from '../tick';
import { randomEvents, testConfig } from './helpers';

describe('preset structure', () => {
  it('exposes all presets by name', () => {
    expect(PRESETS.classic).toBe(CLASSIC);
    expect(PRESETS.mini).toBe(MINI);
    expect(PRESETS.frantic).toBe(FRANTIC);
  });

  for (const [name, preset] of Object.entries(PRESETS)) {
    it(`${name} is internally consistent`, () => {
      expect(preset.board.columns).toBeGreaterThanOrEqual(4);
      expect(preset.board.hiddenRows).toBeGreaterThanOrEqual(1);
      expect(preset.colors).toBeGreaterThanOrEqual(3);
      expect(preset.matchSize).toBeGreaterThanOrEqual(3);
      expect(preset.piece.previewCount).toBeGreaterThanOrEqual(1);
      expect(preset.chain.powerTable.length).toBeGreaterThan(1);
      expect(preset.chain.scoreTable.length).toBeGreaterThan(1);
      // Speed curve must be ascending so "last entry ≤ elapsed wins" holds
      const times = preset.gravity.speedCurve.map((p) => p.atSeconds);
      expect([...times].sort((a, b) => a - b)).toEqual(times);
    });

    it(`${name} runs a playable game`, () => {
      const events = randomEvents(99, 600, 0.2);
      let s = createInitialState(7, preset);
      for (let t = 0; t < 600 && s.status === 'playing'; t++) {
        s = tick(s, events[t], preset);
      }
      expect(s.elapsedTicks).toBeGreaterThan(0);
      expect(s.grid.length).toBe(preset.board.rows + preset.board.hiddenRows);
    });
  }
});

describe('speed curve', () => {
  it('ramps gravity up at the configured times', () => {
    const initial = gravityCellsPerSecond(CLASSIC, 0);
    expect(initial).toBe(CLASSIC.gravity.initialCellsPerSecond);
    const first = CLASSIC.gravity.speedCurve[0];
    const atFirst = gravityCellsPerSecond(CLASSIC, first.atSeconds * TICKS_PER_SECOND);
    expect(atFirst).toBe(first.cellsPerSecond);
    const last = CLASSIC.gravity.speedCurve[CLASSIC.gravity.speedCurve.length - 1];
    const wayLater = gravityCellsPerSecond(CLASSIC, 10_000 * TICKS_PER_SECOND);
    expect(wayLater).toBe(last.cellsPerSecond);
  });

  it('an empty curve keeps the initial speed forever', () => {
    const flat = testConfig();
    expect(gravityCellsPerSecond(flat, 10_000 * TICKS_PER_SECOND)).toBe(0);
  });
});
