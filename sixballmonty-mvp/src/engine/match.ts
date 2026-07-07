/**
 * MatchController (RFC-008 03-engine.md): a versus match is two independent
 * engines plus garbage routing. Pure and tick-driven, so a whole 2P match is
 * deterministic and replayable. Local and online versus share this; only the
 * input sources differ.
 */
import type { GameState, InputEvent, MechanicsConfig } from './types';
import { createInitialState, tick } from './tick';

export type MatchResult = 'p1' | 'p2' | 'draw' | null;

export interface MatchState {
  readonly p1: GameState;
  readonly p2: GameState;
  readonly tick: number;
  readonly result: MatchResult;
}

/** Both players get the same seed, hence the same piece sequence — fair race. */
export function createMatch(seed: number, config: MechanicsConfig): MatchState {
  return {
    p1: createInitialState(seed, config),
    p2: createInitialState(seed, config),
    tick: 0,
    result: null,
  };
}

export function matchTick(
  match: MatchState,
  p1Events: readonly InputEvent[],
  p2Events: readonly InputEvent[],
  config: MechanicsConfig
): MatchState {
  if (match.result !== null) return match;
  let p1 = tick(match.p1, p1Events, config);
  let p2 = tick(match.p2, p2Events, config);

  // Route each side's emitted garbage into the opponent's pending queue
  if (p1.outgoingGarbage > 0) {
    p2 = { ...p2, pendingGarbage: p2.pendingGarbage + p1.outgoingGarbage };
    p1 = { ...p1, outgoingGarbage: 0 };
  }
  if (p2.outgoingGarbage > 0) {
    p1 = { ...p1, pendingGarbage: p1.pendingGarbage + p2.outgoingGarbage };
    p2 = { ...p2, outgoingGarbage: 0 };
  }

  const out1 = p1.status === 'toppedOut';
  const out2 = p2.status === 'toppedOut';
  const result: MatchResult = out1 && out2 ? 'draw' : out1 ? 'p2' : out2 ? 'p1' : null;
  return { p1, p2, tick: match.tick + 1, result };
}
