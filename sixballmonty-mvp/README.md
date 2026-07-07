# 6 Ball Monty

Falling-ball chain puzzle (Puyo genre) — see [RFC-008](../rfcs/008-six-ball-monty/).

## Status: Phase 2 — graphics & solo app

Playable solo game (Marathon + Sprint) built on the Phase 1 engine.

- `src/engine/` — pure deterministic engine (Phase 1), unchanged in spirit; no React/DOM.
- `src/input/` — device-agnostic input layer (the config system): logical `Control`s,
  rebindable `BindingProfile`s (keyboard live; gamepad mapping defined for Phase 3),
  and a pure DAS/ARR `stepAdapter`. Custom bindings persist as a versioned localStorage
  wire contract (registered in RFC-006).
- `src/hooks/` — `useGameLoop` (rAF + fixed-timestep accumulator), `useGame` (composes
  engine + input + loop), responsive sizing.
- `src/components/` — Well, Ball (color **+ symbol** for accessibility), preview, HUD,
  on-screen touch pad, and the keyboard bindings editor.

```bash
npm run dev -w sixballmonty-mvp     # play locally
npm test -w sixballmonty-mvp        # engine + input suites
```

### Known placeholder

PWA icons (`public/icon-*.png`) are placeholders borrowed from Spider — replace with
6 Ball Monty art before wide release. The landing-page card uses the 🎱 emoji, so the
site itself is correctly branded.

Multiplayer (local ph3, online ph4) and the puzzle maker (ph5) are still to come — see the
[implementation plan](../rfcs/008-six-ball-monty/07-implementation.md).

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
