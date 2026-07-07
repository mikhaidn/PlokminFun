/**
 * The tick function and phase machine (RFC-008 03-engine.md):
 *
 *   spawning → falling → locking → resolving ⇄ cascading → garbageDrop → spawning
 *                              └ (spawn blocked) → topped out
 *
 * `tick` is pure: it never mutates its inputs and touches no ambient state.
 * One call advances exactly 1/60th of a second of game time.
 */
import {
  TICKS_PER_SECOND,
  type BallPair,
  type GameState,
  type InputAction,
  type InputEvent,
  type MechanicsConfig,
} from './types';
import { rngInt } from './rng';
import { canFall, canPlace, dropToRest, tryMove, tryRotate, writePiece } from './pieces';
import { applyColumnGravity, findPops, removeCells } from './resolve';
import { dropGarbage, garbageForChain, offsetGarbage, tableAt } from './garbage';

export function createInitialState(seed: number, config: MechanicsConfig): GameState {
  const totalRows = config.board.rows + config.board.hiddenRows;
  const grid = Array.from({ length: totalRows }, () =>
    Array.from({ length: config.board.columns }, () => null)
  );
  const { queue, rngState } = refillQueue([], seed, config);
  return {
    grid,
    active: null,
    queue,
    rngState,
    phase: 'spawning',
    phaseTicks: 0,
    fallSubcells: 0,
    lockTicks: 0,
    lockResets: 0,
    softDropping: false,
    chainCount: 0,
    clearing: null,
    pendingGarbage: 0,
    outgoingGarbage: 0,
    score: 0,
    ballsCleared: 0,
    elapsedTicks: 0,
    status: 'playing',
  };
}

export function tick(
  state: GameState,
  events: readonly InputEvent[],
  config: MechanicsConfig
): GameState {
  if (state.status !== 'playing') return state;
  let s: GameState = {
    ...state,
    elapsedTicks: state.elapsedTicks + 1,
    phaseTicks: state.phaseTicks + 1,
  };
  for (const event of events) s = applyInput(s, event.action, config);
  return stepPhase(s, config);
}

/** Passive gravity in cells/second at a point in the game, from the speed curve. */
export function gravityCellsPerSecond(config: MechanicsConfig, elapsedTicks: number): number {
  const seconds = elapsedTicks / TICKS_PER_SECOND;
  let cps = config.gravity.initialCellsPerSecond;
  for (const point of config.gravity.speedCurve) {
    if (seconds >= point.atSeconds) cps = point.cellsPerSecond;
  }
  return cps;
}

export function lockDelayTicks(config: MechanicsConfig): number {
  return Math.max(1, Math.round((config.gravity.lockDelayMs / 1000) * TICKS_PER_SECOND));
}

// --- Inputs ---------------------------------------------------------------

function applyInput(s: GameState, action: InputAction, config: MechanicsConfig): GameState {
  if (action === 'softDropStart') return { ...s, softDropping: true };
  if (action === 'softDropEnd') return { ...s, softDropping: false };
  if ((s.phase !== 'falling' && s.phase !== 'locking') || s.active === null) return s;

  switch (action) {
    case 'left':
    case 'right': {
      const moved = tryMove(s.grid, s.active, action === 'left' ? -1 : 1);
      return moved ? afterSuccessfulShift({ ...s, active: moved }, config) : s;
    }
    case 'rotateCW':
    case 'rotateCCW': {
      const rotated = tryRotate(s.grid, s.active, action === 'rotateCW' ? 1 : -1);
      return rotated ? afterSuccessfulShift({ ...s, active: rotated }, config) : s;
    }
    case 'hardDrop': {
      if (!config.gravity.hardDrop) return s;
      return lockPiece({ ...s, active: dropToRest(s.grid, s.active) }, config);
    }
  }
}

/** A move/rotate landed: in locking, reset the lock delay (capped) and re-enter falling if airborne. */
function afterSuccessfulShift(s: GameState, config: MechanicsConfig): GameState {
  if (s.phase !== 'locking') return s;
  if (s.lockResets < config.gravity.lockResetMax) {
    s = { ...s, lockTicks: 0, lockResets: s.lockResets + 1 };
  }
  if (s.active !== null && canFall(s.grid, s.active)) {
    s = { ...s, phase: 'falling', phaseTicks: 0, fallSubcells: 0 };
  }
  return s;
}

// --- Phase machine ---------------------------------------------------------

function stepPhase(s: GameState, config: MechanicsConfig): GameState {
  switch (s.phase) {
    case 'spawning':
      return s.phaseTicks >= config.timing.spawnDelayTicks ? spawn(s, config) : s;
    case 'falling':
      return stepFalling(s, config);
    case 'locking':
      return stepLocking(s, config);
    case 'resolving':
      return s.phaseTicks >= config.timing.popTicks ? finishPops(s, config) : s;
    case 'cascading':
      return s.phaseTicks >= config.timing.cascadeTicks ? enterResolving(s, config) : s;
    case 'garbageDrop':
      return s.phaseTicks >= config.timing.garbageTicks ? enterSpawning(s) : s;
  }
}

function spawn(s: GameState, config: MechanicsConfig): GameState {
  const refilled = refillQueue(s.queue, s.rngState, config);
  const [pair, ...rest] = refilled.queue;
  const piece = {
    colors: pair,
    // Pivot on the second visible row so the satellite (above it, orientation 0)
    // lands on the first visible row — both balls of a fresh pair are visible.
    row: config.board.hiddenRows + 1,
    col: Math.floor((config.board.columns - 1) / 2),
    orientation: 0 as const,
  };
  if (!canPlace(s.grid, piece)) {
    return { ...s, queue: refilled.queue, rngState: refilled.rngState, status: 'toppedOut' };
  }
  return {
    ...s,
    queue: rest,
    rngState: refilled.rngState,
    active: piece,
    phase: 'falling',
    phaseTicks: 0,
    fallSubcells: 0,
    lockTicks: 0,
    lockResets: 0,
    chainCount: 0,
  };
}

function refillQueue(
  queue: readonly BallPair[],
  rngState: number,
  config: MechanicsConfig
): { queue: readonly BallPair[]; rngState: number } {
  const target = config.piece.previewCount + 1;
  if (queue.length >= target) return { queue, rngState };
  const q = [...queue];
  let rng = rngState;
  while (q.length < target) {
    const a = rngInt(rng, config.colors);
    const b = rngInt(a.next, config.colors);
    rng = b.next;
    q.push([a.value, b.value]);
  }
  return { queue: q, rngState: rng };
}

function stepFalling(s: GameState, config: MechanicsConfig): GameState {
  const active = s.active;
  if (active === null) return s; // unreachable in a well-formed state
  if (!canFall(s.grid, active)) {
    return { ...s, phase: 'locking', phaseTicks: 0, lockTicks: 0, fallSubcells: 0 };
  }
  const cps = gravityCellsPerSecond(config, s.elapsedTicks);
  const multiplier = s.softDropping ? config.gravity.softDropMultiplier : 1;
  let sub = s.fallSubcells + (cps * multiplier) / TICKS_PER_SECOND;
  let piece = active;
  while (sub >= 1 && canFall(s.grid, piece)) {
    piece = { ...piece, row: piece.row + 1 };
    sub -= 1;
  }
  if (!canFall(s.grid, piece)) {
    return { ...s, active: piece, phase: 'locking', phaseTicks: 0, lockTicks: 0, fallSubcells: 0 };
  }
  return { ...s, active: piece, fallSubcells: sub };
}

function stepLocking(s: GameState, config: MechanicsConfig): GameState {
  const active = s.active;
  if (active === null) return s; // unreachable in a well-formed state
  if (canFall(s.grid, active)) return { ...s, phase: 'falling', phaseTicks: 0 };
  const lockTicks = s.lockTicks + 1;
  if (lockTicks >= lockDelayTicks(config)) return lockPiece(s, config);
  return { ...s, lockTicks };
}

function lockPiece(s: GameState, config: MechanicsConfig): GameState {
  const active = s.active;
  if (active === null) return s;
  const grid = writePiece(s.grid, active);
  return enterCascading({ ...s, grid, active: null, chainCount: 0, softDropping: false }, config);
}

function enterCascading(s: GameState, config: MechanicsConfig): GameState {
  const { grid, moved } = applyColumnGravity(s.grid);
  const next: GameState = { ...s, grid, phase: 'cascading', phaseTicks: 0 };
  // Nothing fell → no animation to wait for; check for pops immediately
  return moved ? next : enterResolving(next, config);
}

function enterResolving(s: GameState, config: MechanicsConfig): GameState {
  const pops = findPops(s.grid, config);
  if (pops.groups.length === 0) return enterGarbageDrop(s, config);

  const chainCount = s.chainCount + 1;
  let ballsPopped = 0;
  let bonus = 0;
  for (const group of pops.groups) {
    ballsPopped += group.length;
    bonus += tableAt(config.chain.groupBonus, group.length - config.matchSize);
  }
  const score =
    s.score + ballsPopped * 10 * tableAt(config.chain.scoreTable, chainCount - 1) + bonus;
  const earned = garbageForChain(chainCount, config);
  const offset = offsetGarbage(s.pendingGarbage, earned, config.garbage.offsetting);
  const clearing = [...pops.groups.flat(), ...pops.garbage];
  return {
    ...s,
    phase: 'resolving',
    phaseTicks: 0,
    chainCount,
    clearing,
    score,
    pendingGarbage: offset.pending,
    outgoingGarbage: s.outgoingGarbage + offset.outgoing,
  };
}

function finishPops(s: GameState, config: MechanicsConfig): GameState {
  if (s.clearing === null) return enterGarbageDrop(s, config); // unreachable
  const grid = removeCells(s.grid, s.clearing);
  return enterCascading(
    { ...s, grid, clearing: null, ballsCleared: s.ballsCleared + s.clearing.length },
    config
  );
}

function enterGarbageDrop(s: GameState, config: MechanicsConfig): GameState {
  if (!config.garbage.enabled || s.pendingGarbage === 0) return enterSpawning(s);
  const amount = Math.min(s.pendingGarbage, config.garbage.maxPerDrop);
  const dropped = dropGarbage(s.grid, amount, s.rngState, config);
  return {
    ...s,
    grid: dropped.grid,
    rngState: dropped.rngState,
    pendingGarbage: s.pendingGarbage - amount,
    phase: 'garbageDrop',
    phaseTicks: 0,
  };
}

function enterSpawning(s: GameState): GameState {
  return { ...s, phase: 'spawning', phaseTicks: 0 };
}
