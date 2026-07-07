# Testing Strategy

TDD throughout (repo rule), targeting **>95% coverage on `engine/` and `puzzle/`**. The pure engine makes this the most testable code in the repo — no DOM, no timers, no mocks.

## 1. Engine unit tests (Phase 1, written first)

- **Pieces:** spawn position, movement bounds, rotation + wall-nudge at both walls, lock-delay reset cap, top-out detection
- **Resolve:** flood-fill groups (exact-4, L/T/S shapes, ≥5 group bonus), multi-group simultaneous pops, cascade gravity correctness
- **Chains:** hand-built fixture boards for 2/3/4/5-chains asserting chain count, score, and outgoing garbage against the power table
- **Garbage:** queueing, offsetting math, `maxPerDrop` cap, adjacent-pop clearing, seeded column distribution

## 2. Determinism & replay tests (the load-bearing suite)

- **Reproducibility:** run N random-input games twice from the same seed ⇒ identical final state hashes at every tick
- **Golden replays:** checked-in `(seed, inputs, expectedHashTimeline)` fixtures; any engine change that alters behavior fails loudly and forces a deliberate fixture regen (this is the guard rail that keeps old puzzle/replay URLs and netcode compatibility honest)
- **Serialization round-trip:** replay/PuzzleDef → URL string → parse ⇒ deep-equal

## 3. Property-based tests (fast-check, already-compatible with vitest)

Random input streams against invariants:
- Ball count is conserved except through pops and garbage drops
- No floating balls after any CASCADING phase completes
- Grid never exceeds bounds; active piece always within board
- Chain count monotonically increases within a resolution and resets on spawn
- `tick` never mutates its input state (freeze + deep-compare in dev tests)

## 4. Versus / MatchController

- Scripted 2-engine matches asserting garbage routing, offsetting priority, and win/lose determination
- **Self-play soak:** two random-input engines, 1000 matches headless, asserting no crashes and hash agreement when the same match is re-run

## 5. Puzzle & solvability

- Every built-in puzzle: stored solution replay must solve it; solvability worker must return "Solvable" within budget
- Negative fixtures: known-unsolvable boards return "Not solvable"
- Editor static validation cases (floating balls, pre-met goals, empty queue)

## 6. UI & integration (Testing Library, matching existing games)

- Adapter tests: synthetic keyboard/pointer events ⇒ expected `InputEvent` streams (DAS/ARR timing via fake timers — timing lives in adapters, *not* the engine, precisely so it can be faked)
- Smoke: render each mode, play a scripted 10-piece game via dispatched inputs, assert board snapshot
- Netcode (Phase 5): two in-process peers over a mock DataChannel with injected latency/jitter/reorder ⇒ hash agreement; dropped-connection path

## CI

Nothing new: `npm run validate` covers it (typecheck + lint + test + build). Soak/solvability-budget tests tagged and run in the normal suite with reduced iterations; full counts runnable locally via env var.
