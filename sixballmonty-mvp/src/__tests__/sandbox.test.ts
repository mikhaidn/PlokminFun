import { describe, expect, it } from 'vitest';
import { buildSandboxConfig, DEFAULT_SANDBOX_OPTIONS } from '../sandbox';
import { CLASSIC, createInitialState, tick } from '../engine';

describe('buildSandboxConfig', () => {
  it('applies the chosen knobs', () => {
    const config = buildSandboxConfig({ gravity: 'fast', colors: 3, matchSize: 5 });
    expect(config.colors).toBe(3);
    expect(config.matchSize).toBe(5);
    expect(config.gravity.initialCellsPerSecond).toBe(1.5);
  });

  it('always enables hard drop, never speeds up, and disables garbage', () => {
    const config = buildSandboxConfig(DEFAULT_SANDBOX_OPTIONS);
    expect(config.gravity.hardDrop).toBe(true);
    expect(config.gravity.speedCurve).toEqual([]);
    expect(config.garbage.enabled).toBe(false);
  });

  it('zen gravity is near-static but soft drop still lands the piece', () => {
    const config = buildSandboxConfig({ ...DEFAULT_SANDBOX_OPTIONS, gravity: 'zen' });
    // Tick past the spawn delay until the piece appears.
    let s = createInitialState(1, config);
    for (let i = 0; i < 20 && s.active === null; i++) s = tick(s, [], config);
    // Passive: after 60 more ticks (1s) the piece has not fallen a full cell.
    const spawnRow = s.active!.row;
    for (let i = 0; i < 60; i++) s = tick(s, [], config);
    expect(s.active!.row).toBe(spawnRow);
    // Soft drop: reaches the floor (locking) within a couple of seconds.
    s = tick(s, [{ tick: s.elapsedTicks, action: 'softDropStart' }], config);
    for (let i = 0; i < 120 && s.active !== null; i++) s = tick(s, [], config);
    expect(s.active).toBeNull(); // locked
  });

  it('leaves the base preset untouched', () => {
    const before = JSON.stringify(CLASSIC);
    buildSandboxConfig({ gravity: 'zen', colors: 5, matchSize: 3 });
    expect(JSON.stringify(CLASSIC)).toBe(before);
  });
});
