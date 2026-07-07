/**
 * 6 Ball Monty deterministic engine — public API (RFC-008 Phase 1).
 * Pure library: no React, no DOM, no ambient randomness or time.
 */
export {
  TICKS_PER_SECOND,
  GARBAGE,
  type Cell,
  type BallPair,
  type Orientation,
  type ActivePiece,
  type Phase,
  type GameStatus,
  type GameState,
  type InputAction,
  type InputEvent,
  type SpeedCurvePoint,
  type MechanicsConfig,
} from './types';
export { rngStep, rngInt, type RngResult } from './rng';
export { CLASSIC, MINI, FRANTIC, PRESETS } from './presets';
export {
  SATELLITE_OFFSETS,
  pieceCells,
  canPlace,
  canFall,
  tryMove,
  tryRotate,
  dropToRest,
  writePiece,
  type CellCoord,
} from './pieces';
export {
  findPops,
  removeCells,
  applyColumnGravity,
  hasFloatingBalls,
  type PopResult,
} from './resolve';
export { tableAt, garbageForChain, offsetGarbage, dropGarbage } from './garbage';
export { createInitialState, tick, gravityCellsPerSecond, lockDelayTicks } from './tick';
export { createMatch, matchTick, type MatchState, type MatchResult } from './match';
export {
  simulateReplay,
  serializeReplay,
  deserializeReplay,
  hashState,
  type Replay,
} from './replay';
