/**
 * Self-play soak (RFC-008 08-testing.md): random-input matches, headless,
 * asserting structural invariants every step and full determinism on re-run.
 */
import { describe, expect, it } from 'vitest';
import { GARBAGE, type GameState } from '../types';
import { createMatch, matchTick, type MatchState } from '../match';
import { hashState } from '../replay';
import { hasFloatingBalls } from '../resolve';
import { randomEvents, testConfig } from './helpers';

const config = testConfig({ gravity: { initialCellsPerSecond: 30 } });
const MATCHES = 20;
const MAX_TICKS = 1200;

function checkInvariants(s: GameState): void {
  for (const row of s.grid) {
    for (const cell of row) {
      const valid = cell === null || cell === GARBAGE || (cell >= 0 && cell < config.colors);
      if (!valid) throw new Error(`Invalid cell value: ${String(cell)}`);
    }
  }
  if (hasFloatingBalls(s.grid)) throw new Error(`Floating balls in phase ${s.phase}`);
  if (s.pendingGarbage < 0 || s.outgoingGarbage < 0) throw new Error('Negative garbage');
  if (s.score < 0 || s.ballsCleared < 0) throw new Error('Negative counters');
}

function playMatch(matchSeed: number): { match: MatchState; ticksPlayed: number } {
  const p1Events = randomEvents(matchSeed * 2 + 1, MAX_TICKS, 0.25);
  const p2Events = randomEvents(matchSeed * 2 + 2, MAX_TICKS, 0.25);
  let m = createMatch(matchSeed, config);
  let t = 0;
  while (t < MAX_TICKS && m.result === null) {
    m = matchTick(m, p1Events[t], p2Events[t], config);
    checkInvariants(m.p1);
    checkInvariants(m.p2);
    t++;
  }
  return { match: m, ticksPlayed: t };
}

describe('self-play soak', () => {
  it(`survives ${MATCHES} random matches with invariants intact`, () => {
    let finished = 0;
    for (let seed = 1; seed <= MATCHES; seed++) {
      const { match } = playMatch(seed);
      if (match.result !== null) finished++;
    }
    // Random play on a small board should top somebody out most of the time
    expect(finished).toBeGreaterThan(0);
  });

  it('replaying a full match reproduces it exactly', () => {
    const a = playMatch(1);
    const b = playMatch(1);
    expect(a.ticksPlayed).toBe(b.ticksPlayed);
    expect(a.match.result).toBe(b.match.result);
    expect(hashState(a.match.p1)).toBe(hashState(b.match.p1));
    expect(hashState(a.match.p2)).toBe(hashState(b.match.p2));
  });
});
