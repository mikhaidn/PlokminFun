# Engine: Deterministic Tick-Based Core

## Design principle

**The engine is a pure function.** No timers, no DOM, no React, no `Math.random`, no `Date.now` inside the core. This single constraint is what makes replays, undo (puzzle mode), online lockstep, headless solvability checking, and exhaustive testing all fall out for free.

```typescript
tick(state: GameState, inputs: InputEvent[], config: MechanicsConfig): GameState
```

- Runs at a **fixed timestep** (60 ticks/sec); the React layer accumulates real time and calls `tick` N times per frame (`requestAnimationFrame` + accumulator)
- Returns a **new immutable state** (repo rule #2) — cheap because the grid is small (≤ 6×13)
- Rendering interpolates *between* ticks for smoothness but never feeds back into state

## State shape

```typescript
interface GameState {
  grid: (BallColor | 'garbage' | null)[][];   // [row][col]
  active: { balls: BallColor[]; col: number; row: number; orientation: 0|1|2|3 } | null;
  queue: BallColor[][];              // upcoming pieces (visible previews + buffer)
  rngState: number;                  // seeded RNG cursor — part of state, not a side effect
  phase: Phase;                      // see phase machine below
  phaseTicks: number;                // ticks spent in current phase
  chainCount: number;
  pendingGarbage: number;            // incoming, not yet dropped
  outgoingGarbage: number;           // emitted this resolution (versus routes it)
  score: number; ballsCleared: number; elapsedTicks: number;
  status: 'playing' | 'toppedOut' | 'cleared';   // 'cleared' = puzzle goal met
}
```

## Phase machine

```
SPAWNING → FALLING → LOCKING → RESOLVING ⇄ CASCADING → GARBAGE_DROP → SPAWNING
                └ (spawn blocked) → TOP_OUT
```

- **FALLING:** passive gravity + player inputs (move/rotate/soft/hard drop); DAS/ARR handled here from held-key events
- **LOCKING:** lock-delay countdown; successful move/rotate resets it (capped)
- **RESOLVING:** flood-fill connected groups ≥ `matchSize`, mark pops, score, bump chain
- **CASCADING:** apply column gravity; if new groups formed → back to RESOLVING (chain++)
- **GARBAGE_DROP:** materialize up to `maxPerDrop` pending garbage into random columns (via seeded RNG)

Each phase has a tick duration so the UI can animate pops/falls by *observing* phase + phaseTicks — animation timing lives in config, not in branching logic.

## Determinism contract

1. **Seeded RNG:** reuse `seededRandom` from `@plokmin/shared/core/rng`; the RNG cursor is stored **in** `GameState`, so `(seed, inputs) → state` is fully reproducible
2. **Inputs are discrete events with tick timestamps:** `{ tick: number; action: 'left'|'right'|'rotateCW'|'rotateCCW'|'softDropStart'|'softDropEnd'|'hardDrop' }`
3. **A replay is just** `{ configPresetOrOverrides, seed, inputs[] }` — tiny, serializable, and the foundation for RFC-002-style sharing, ghost races, and netcode
4. **State hash:** a cheap stable hash of `GameState` for desync detection (online) and golden-replay tests
5. **Free snapshots:** because states are immutable, a snapshot is just a reference — a ring buffer of the last ~120 states costs nothing to maintain. Rewind-and-re-simulate (rollback netcode, replay scrubbing) is then just re-running `tick` with corrected inputs; purity guarantees the re-simulation is exactly right

## Versus = two engines + a router

A match is two independent engine instances plus a thin `MatchController` that moves `outgoingGarbage` from one state's resolution into the other's `pendingGarbage`. The controller is itself pure and tick-driven, so a whole 2P match is *also* deterministic and replayable. Local and online versus share this controller; only the input sources differ (04/05).

## Module layout (in `chaindrop-mvp/src/engine/`)

```
engine/
├── types.ts          # GameState, InputEvent, MechanicsConfig
├── presets.ts        # classic / mini / frantic configs
├── tick.ts           # the tick function + phase machine
├── pieces.ts         # spawn, move, rotate (wall-nudge), lock
├── resolve.ts        # flood-fill pops, chain scoring, cascade gravity
├── garbage.ts        # queueing, offsetting, dropping
├── match.ts          # MatchController (2-engine garbage routing)
├── replay.ts         # record/serialize/play replays; state hash
└── index.ts
```

Zero React imports anywhere in `engine/`. If this pattern proves out, `tick.ts`/`replay.ts` scaffolding graduates to `@plokmin/shared/core/` as a generic `TickEngine` capability for future real-time games.
