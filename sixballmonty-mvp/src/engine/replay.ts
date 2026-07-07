/**
 * Replays and state hashing (RFC-008 03-engine.md).
 *
 * A replay is just (seed, inputs, tick count): tiny, serializable, and the
 * foundation for sharing (RFC-002), ghost races, netcode desync checks, and
 * golden-replay tests. URL encoding (deflate + base64url) is Phase 5 scope;
 * Phase 1 serializes to plain JSON.
 */
import type { GameState, InputEvent, MechanicsConfig } from './types';
import { createInitialState, tick } from './tick';

export interface Replay {
  readonly version: 1;
  readonly seed: number;
  /** Preset name, informational — the caller supplies the actual config. */
  readonly preset?: string;
  /** Sorted by tick; events with tick T apply on the T-th tick (0-based). */
  readonly inputs: readonly InputEvent[];
  /** Total ticks to simulate. */
  readonly ticks: number;
}

export function simulateReplay(replay: Replay, config: MechanicsConfig): GameState {
  const byTick = new Map<number, InputEvent[]>();
  for (const event of replay.inputs) {
    const bucket = byTick.get(event.tick);
    if (bucket) bucket.push(event);
    else byTick.set(event.tick, [event]);
  }
  let state = createInitialState(replay.seed, config);
  for (let t = 0; t < replay.ticks; t++) {
    state = tick(state, byTick.get(t) ?? [], config);
  }
  return state;
}

export function serializeReplay(replay: Replay): string {
  return JSON.stringify(replay);
}

export function deserializeReplay(serialized: string): Replay {
  const parsed: unknown = JSON.parse(serialized);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as { version?: unknown }).version !== 1 ||
    typeof (parsed as { seed?: unknown }).seed !== 'number' ||
    !Array.isArray((parsed as { inputs?: unknown }).inputs) ||
    typeof (parsed as { ticks?: unknown }).ticks !== 'number'
  ) {
    throw new Error('Invalid replay payload');
  }
  return parsed as Replay;
}

// --- State hashing ----------------------------------------------------------

const PHASES = ['spawning', 'falling', 'locking', 'resolving', 'cascading', 'garbageDrop'];
const STATUSES = ['playing', 'toppedOut', 'cleared'];
const floatView = new DataView(new ArrayBuffer(8));

/**
 * Cheap, stable FNV-1a fingerprint of the full game state. Two states with
 * equal hashes at every tick are (for our purposes) the same simulation —
 * used by golden-replay tests and online desync detection.
 */
export function hashState(state: GameState): number {
  let h = 0x811c9dc5;
  const mix = (n: number): void => {
    h ^= n | 0;
    h = Math.imul(h, 0x01000193);
  };
  const mixFloat = (n: number): void => {
    floatView.setFloat64(0, n);
    mix(floatView.getInt32(0));
    mix(floatView.getInt32(4));
  };

  for (const row of state.grid) for (const cell of row) mix(cell === null ? -2 : cell);
  if (state.active === null) {
    mix(-3);
  } else {
    mix(state.active.colors[0]);
    mix(state.active.colors[1]);
    mix(state.active.row);
    mix(state.active.col);
    mix(state.active.orientation);
  }
  for (const [a, b] of state.queue) {
    mix(a);
    mix(b);
  }
  mix(state.rngState);
  mix(PHASES.indexOf(state.phase));
  mix(state.phaseTicks);
  mixFloat(state.fallSubcells);
  mix(state.lockTicks);
  mix(state.lockResets);
  mix(state.softDropping ? 1 : 0);
  mix(state.chainCount);
  if (state.clearing === null) {
    mix(-4);
  } else {
    for (const [r, c] of state.clearing) {
      mix(r);
      mix(c);
    }
  }
  mix(state.pendingGarbage);
  mix(state.outgoingGarbage);
  mix(state.score);
  mix(state.ballsCleared);
  mix(state.elapsedTicks);
  mix(STATUSES.indexOf(state.status));
  return h >>> 0;
}
