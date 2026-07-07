/**
 * The input adapter: a pure, per-tick reducer that turns the set of currently
 * held/just-pressed `Control`s into engine `InputEvent`s.
 *
 * Keeping this pure (no DOM, no timers) is what lets DAS/ARR timing be tested
 * deterministically with a fake clock, and lets the *same* logic drive replays
 * and network inputs later. Devices only have to report "what's held" and
 * "what was pressed since last tick" — all the timing lives here.
 */
import { TICKS_PER_SECOND, type InputEvent } from '../engine';
import { CONTROL_KIND, type Control } from './controls';

export interface AutoShiftConfig {
  /** Delayed Auto Shift: how long a direction is held before it repeats. */
  readonly dasMs: number;
  /** Auto Repeat Rate: the interval between repeats once DAS charges. */
  readonly arrMs: number;
}

export interface AdapterState {
  readonly softDropActive: boolean;
  /** Ticks each direction has been held; -1 = not held. */
  readonly heldTicks: Readonly<Record<'moveLeft' | 'moveRight', number>>;
}

export const INITIAL_ADAPTER_STATE: AdapterState = {
  softDropActive: false,
  heldTicks: { moveLeft: -1, moveRight: -1 },
};

/** What the device layer reports for a single simulation tick. */
export interface FrameInput {
  /** Controls physically down right now. */
  readonly held: ReadonlySet<Control>;
  /** Controls that had a press (rising edge) since the last tick. */
  readonly pressed: readonly Control[];
}

function msToTicks(ms: number): number {
  return Math.max(0, Math.round((ms / 1000) * TICKS_PER_SECOND));
}

/**
 * Advance one tick. Returns the next adapter state and the events to feed to
 * `engine.tick` for this tick (already stamped with `tick`).
 */
export function stepAdapter(
  prev: AdapterState,
  input: FrameInput,
  config: AutoShiftConfig,
  tick: number
): { state: AdapterState; events: InputEvent[] } {
  const events: InputEvent[] = [];
  const emit = (action: InputEvent['action']): void => {
    events.push({ tick, action });
  };

  // Soft drop (toggle): emit start/end on the held-state transition.
  const wantSoftDrop = input.held.has('softDrop');
  if (wantSoftDrop && !prev.softDropActive) emit('softDropStart');

  // Horizontal movement (repeat): immediate move on press, then DAS→ARR.
  // Opposed left+right cancels (no jitter) and freezes both charges.
  const dasThreshold = msToTicks(config.dasMs);
  const arrPeriod = Math.max(1, msToTicks(config.arrMs));
  const opposed = input.held.has('moveLeft') && input.held.has('moveRight');

  const heldTicks = { ...prev.heldTicks };
  for (const dir of ['moveLeft', 'moveRight'] as const) {
    const heldNow = input.held.has(dir) && !opposed;
    const tapped = input.pressed.includes(dir) && !opposed;
    if (!heldNow) {
      // A tap that ended within the frame still nudges once.
      if (tapped) emit(dir === 'moveLeft' ? 'left' : 'right');
      heldTicks[dir] = -1;
      continue;
    }
    if (prev.heldTicks[dir] < 0) {
      emit(dir === 'moveLeft' ? 'left' : 'right'); // rising edge: move now
      heldTicks[dir] = 0;
    } else {
      const t = prev.heldTicks[dir] + 1;
      heldTicks[dir] = t;
      if (t >= dasThreshold && (t - dasThreshold) % arrPeriod === 0) {
        emit(dir === 'moveLeft' ? 'left' : 'right');
      }
    }
  }

  // Edge controls: one action per press.
  for (const control of input.pressed) {
    if (CONTROL_KIND[control] !== 'edge') continue;
    if (control === 'rotateCW') emit('rotateCW');
    else if (control === 'rotateCCW') emit('rotateCCW');
    else if (control === 'hardDrop') emit('hardDrop');
  }

  if (!wantSoftDrop && prev.softDropActive) emit('softDropEnd');

  return { state: { softDropActive: wantSoftDrop, heldTicks }, events };
}
