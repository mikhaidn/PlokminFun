import { describe, expect, it } from 'vitest';
import {
  INITIAL_ADAPTER_STATE,
  stepAdapter,
  type AdapterState,
  type AutoShiftConfig,
} from '../adapter';
import type { Control } from '../controls';
import type { InputEvent } from '../../engine';

const cfg: AutoShiftConfig = { dasMs: 100, arrMs: 50 }; // 6-tick DAS, 3-tick ARR at 60tps

interface Frame {
  held?: Control[];
  pressed?: Control[];
}

/** Run frames through the adapter, returning the flat event stream. */
function run(frames: Frame[], config = cfg): InputEvent[] {
  let state: AdapterState = INITIAL_ADAPTER_STATE;
  const all: InputEvent[] = [];
  frames.forEach((frame, tick) => {
    const result = stepAdapter(
      state,
      { held: new Set(frame.held ?? []), pressed: frame.pressed ?? [] },
      config,
      tick
    );
    state = result.state;
    all.push(...result.events);
  });
  return all;
}

const actionsAt = (events: InputEvent[], action: string): number[] =>
  events.filter((e) => e.action === action).map((e) => e.tick);

describe('horizontal movement (DAS / ARR)', () => {
  it('moves immediately on press', () => {
    const events = run([{ held: ['moveRight'], pressed: ['moveRight'] }]);
    expect(events).toEqual([{ tick: 0, action: 'right' }]);
  });

  it('does not repeat before the DAS delay charges', () => {
    // Hold for 5 ticks (< 6-tick DAS): only the initial move.
    const frames: Frame[] = [{ held: ['moveRight'], pressed: ['moveRight'] }];
    for (let i = 0; i < 4; i++) frames.push({ held: ['moveRight'] });
    expect(actionsAt(run(frames), 'right')).toEqual([0]);
  });

  it('repeats at the ARR rate after DAS charges', () => {
    const frames: Frame[] = [{ held: ['moveRight'], pressed: ['moveRight'] }];
    for (let i = 0; i < 12; i++) frames.push({ held: ['moveRight'] });
    // Initial at 0, DAS fires at tick 6, then every 3 ticks: 9, 12.
    expect(actionsAt(run(frames), 'right')).toEqual([0, 6, 9, 12]);
  });

  it('a tap (pressed but released same frame) nudges exactly once', () => {
    const events = run([{ pressed: ['moveLeft'] }, {}]);
    expect(actionsAt(events, 'left')).toEqual([0]);
  });

  it('opposed left+right cancels movement', () => {
    const events = run([
      { held: ['moveLeft', 'moveRight'], pressed: ['moveLeft', 'moveRight'] },
      { held: ['moveLeft', 'moveRight'] },
    ]);
    expect(events.filter((e) => e.action === 'left' || e.action === 'right')).toEqual([]);
  });

  it('re-charges DAS from scratch after release', () => {
    const frames: Frame[] = [
      { held: ['moveRight'], pressed: ['moveRight'] }, // move @0
      {}, // release
      { held: ['moveRight'], pressed: ['moveRight'] }, // move @2
    ];
    expect(actionsAt(run(frames), 'right')).toEqual([0, 2]);
  });
});

describe('edge controls', () => {
  it('rotate fires once per press, never on hold', () => {
    const events = run([
      { held: ['rotateCW'], pressed: ['rotateCW'] },
      { held: ['rotateCW'] }, // still held: no repeat
      { held: ['rotateCW'] },
    ]);
    expect(actionsAt(events, 'rotateCW')).toEqual([0]);
  });

  it('hard drop fires once per press', () => {
    const events = run([{ pressed: ['hardDrop'] }, { pressed: ['hardDrop'] }]);
    expect(actionsAt(events, 'hardDrop')).toEqual([0, 1]);
  });

  it('maps rotateCCW correctly', () => {
    expect(run([{ pressed: ['rotateCCW'] }])).toEqual([{ tick: 0, action: 'rotateCCW' }]);
  });
});

describe('soft drop (toggle)', () => {
  it('emits start on press and end on release', () => {
    const events = run([
      { held: ['softDrop'], pressed: ['softDrop'] },
      { held: ['softDrop'] },
      {}, // released
    ]);
    expect(events).toEqual([
      { tick: 0, action: 'softDropStart' },
      { tick: 2, action: 'softDropEnd' },
    ]);
  });

  it('does not re-emit start while held', () => {
    const events = run([{ held: ['softDrop'] }, { held: ['softDrop'] }, { held: ['softDrop'] }]);
    expect(events.filter((e) => e.action === 'softDropStart')).toHaveLength(1);
  });
});

describe('purity', () => {
  it('does not mutate the previous state', () => {
    const prev = INITIAL_ADAPTER_STATE;
    stepAdapter(prev, { held: new Set(['moveRight']), pressed: ['moveRight'] }, cfg, 0);
    expect(prev).toEqual(INITIAL_ADAPTER_STATE);
  });
});
