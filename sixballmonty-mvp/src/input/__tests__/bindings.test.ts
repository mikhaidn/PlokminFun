import { beforeEach, describe, expect, it } from 'vitest';
import {
  BINDINGS_STORAGE_VERSION,
  controlForToken,
  DEFAULT_PROFILES,
  KEYBOARD_P1,
  loadBindings,
  rebind,
  resetBindings,
  saveBindings,
} from '../bindings';
import { ALL_CONTROLS } from '../controls';

describe('default profiles', () => {
  it('bind every control', () => {
    for (const profile of Object.values(DEFAULT_PROFILES)) {
      for (const control of ALL_CONTROLS) {
        expect(profile.bindings[control].length).toBeGreaterThan(0);
      }
    }
  });

  it('never bind one key to two controls (keyboard)', () => {
    const seen = new Set<string>();
    for (const control of ALL_CONTROLS) {
      for (const code of KEYBOARD_P1.bindings[control]) {
        expect(seen.has(code)).toBe(false);
        seen.add(code);
      }
    }
  });
});

describe('rebind', () => {
  it('binds a token to a control', () => {
    const next = rebind(KEYBOARD_P1, 'hardDrop', 'KeyH');
    expect(next.bindings.hardDrop).toContain('KeyH');
    expect(controlForToken(next, 'KeyH')).toBe('hardDrop');
  });

  it('steals a token from any other control it was on', () => {
    // ArrowUp is bound to rotateCW by default; rebinding it to hardDrop moves it.
    expect(KEYBOARD_P1.bindings.rotateCW).toContain('ArrowUp');
    const next = rebind(KEYBOARD_P1, 'hardDrop', 'ArrowUp');
    expect(next.bindings.rotateCW).not.toContain('ArrowUp');
    expect(next.bindings.hardDrop).toContain('ArrowUp');
  });

  it('does not mutate the source profile', () => {
    const before = JSON.stringify(KEYBOARD_P1.bindings);
    rebind(KEYBOARD_P1, 'hardDrop', 'KeyH');
    expect(JSON.stringify(KEYBOARD_P1.bindings)).toBe(before);
  });
});

describe('storage (versioned wire contract)', () => {
  beforeEach(() => localStorage.clear());

  it('returns the default profile when nothing is stored', () => {
    expect(loadBindings('p1')).toEqual(KEYBOARD_P1);
  });

  it('round-trips a saved custom profile', () => {
    const custom = rebind(KEYBOARD_P1, 'hardDrop', 'KeyH');
    saveBindings('p1', custom);
    expect(loadBindings('p1')).toEqual(custom);
  });

  it('keeps slots independent', () => {
    const p1 = rebind(KEYBOARD_P1, 'hardDrop', 'KeyH');
    saveBindings('p1', p1);
    expect(loadBindings('p2')).toEqual(DEFAULT_PROFILES['keyboard-p2']);
  });

  it('falls back to default on a version mismatch', () => {
    localStorage.setItem(
      'sixballmonty.bindings',
      JSON.stringify({ version: BINDINGS_STORAGE_VERSION + 1, slots: { p1: { junk: true } } })
    );
    expect(loadBindings('p1')).toEqual(KEYBOARD_P1);
  });

  it('falls back to default on a malformed stored profile', () => {
    localStorage.setItem(
      'sixballmonty.bindings',
      JSON.stringify({
        version: BINDINGS_STORAGE_VERSION,
        slots: { p1: { id: 'x', device: 'keyboard', bindings: {} } },
      })
    );
    expect(loadBindings('p1')).toEqual(KEYBOARD_P1);
  });

  it('reset clears the stored slot', () => {
    saveBindings('p1', rebind(KEYBOARD_P1, 'hardDrop', 'KeyH'));
    expect(resetBindings('p1')).toEqual(KEYBOARD_P1);
    expect(loadBindings('p1')).toEqual(KEYBOARD_P1);
  });
});
