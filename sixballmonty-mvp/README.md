# 6 Ball Monty

Falling-ball chain puzzle (Puyo genre) — see [RFC-008](../rfcs/008-six-ball-monty/).

## Status: Phase 1 — headless engine

This workspace currently contains **only the deterministic game engine** (`src/engine/`)
and its test suite. There is deliberately no rendering, no React, and no `plokmin`
package.json block yet — the app UI, controls, and landing-page entry arrive in Phase 2
(see [RFC-008 implementation plan](../rfcs/008-six-ball-monty/07-implementation.md)).

## Engine invariants

- `tick(state, inputs, config)` is a **pure function**: no timers, no DOM, no
  `Math.random`, no `Date.now`. The seeded RNG cursor lives inside `GameState`.
- `(seed, inputs) → state` is fully reproducible; `hashState` gives a cheap
  fingerprint for replay/netcode desync checks.
- All numeric tuning in `src/engine/presets.ts` is a **placeholder** pending the
  Phase 2 playtesting pass (RFC-008 decision).

```bash
npm test -w sixballmonty-mvp          # run the engine suite
npm run test:coverage -w sixballmonty-mvp
```
