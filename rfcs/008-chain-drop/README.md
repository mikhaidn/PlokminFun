# RFC-008: Chain Drop - Falling-Ball Chain Puzzle (6-Ball Puzzle Style)

**Status:** APPROVED — **top priority** (owner-prioritized 2026-07-07; see STATUS.md / ROADMAP.md)
**Author:** Claude Code
**Created:** 2026-07-07
**Updated:** 2026-07-07
**Target Version:** 2.0.0

---

## TL;DR

1. **Problem:** All current games are turn-based solitaire. We want a real-time action-puzzle game (in the spirit of *6-Ball Puzzle* from Clubhouse Games / Puyo-style chain droppers) that opens up versus multiplayer, puzzle authoring, and online play as new capabilities for the whole repo.
2. **Solution:** A new `chaindrop-mvp` workspace built on a **pure, deterministic, tick-based engine** (immutable state, seeded RNG, input-event driven). Everything above the engine — controls, local 2P, online netcode, puzzle maker — layers on without touching core rules.
3. **Impact:** First real-time game, first multiplayer capability, first user-generated-content (puzzle maker) capability. The deterministic-engine pattern becomes reusable infrastructure for future action games.
4. **Effort:** Phased. Phase 1 (engine + solo play) ~3-4 days; each later phase independently shippable.

---

## Quick Navigation

- **[01-motivation.md](01-motivation.md)** - Why this game, why now, capability unlocks.
- **[02-game-design.md](02-game-design.md)** - Rules, modes, and the MechanicsConfig (configurable mechanics).
- **[03-engine.md](03-engine.md)** - Deterministic core: state, tick loop, phases, RNG, replays.
- **[04-controls-and-multiplayer.md](04-controls-and-multiplayer.md)** - Input abstraction, keyboard/touch/gamepad, local versus.
- **[05-online.md](05-online.md)** - Async challenges first, then WebRTC rollback-netcode versus.
- **[06-puzzle-maker.md](06-puzzle-maker.md)** - Puzzle mode, editor, URL sharing, solvability validation.
- **[07-implementation.md](07-implementation.md)** - Phases and the @plokmin/shared reuse map.
- **[08-testing.md](08-testing.md)** - Determinism/replay/property testing strategy.
- **[09-risks-and-decisions.md](09-risks-and-decisions.md)** - Risks, naming/IP, open decisions.

---

## Key Metrics

**Estimated effort:** Phase 1: 3-4 days; Phases 2-5 each 2-5 days, independently shippable
**Code reuse:** App shell ~70% shared (controls chrome, settings, modals, RNG, analytics); engine is new
**Risk level:** Medium (first real-time loop in repo; online phase needs signaling infra)
**Breaking changes:** No (new workspace)

---

## Related

- **RFC-002** Game Sharing & Replay (URL sharing patterns → puzzle links, replays)
- **RFC-005** Unified Game Builder (config-driven games → MechanicsConfig mirrors this philosophy)
- **RFC-006** Game State Serialization (compact state encoding → puzzle/challenge URLs)
