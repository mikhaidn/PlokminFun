# Implementation Plan

## New workspace

```
sixballmonty-mvp/                  # npm workspace, same scaffold as klondike-mvp
├── package.json                # deps: @plokmin/shared; plokmin block:
│                               #   { slug: "sixballmonty", title: "6 Ball Monty", icon: "🔴",
│                               #     description: "...", cta: "Play Now", order: 6 }
├── src/
│   ├── engine/                 # pure core (03-engine.md) — zero React imports
│   ├── net/                    # phase 4: adapters implementing the input-producer interface
│   ├── puzzle/                 # PuzzleDef, serialization, solvability worker (06)
│   ├── components/             # Well, Ball, PiecePreview, GarbageMeter, MatchLayout, EditorGrid
│   ├── hooks/                  # useGameLoop (rAF+accumulator), useWellInteraction, useKeyboardAdapter, useGamepadAdapter
│   ├── state/                  # app-level mode/match/session state
│   └── sixballmonty.config.ts     # presets + app wiring (mirrors freecell.config.ts)
```

Landing-page discovery is automatic via the `plokmin` package.json block (`scripts/site/generate-landing.mjs`) — no site changes needed.

## Reuse map (@plokmin/shared)

| Shared export | Used for |
|---|---|
| `seededRandom` | Piece queue + garbage columns (determinism backbone) |
| `GameControls` | Pause/restart/undo(puzzle)/settings/help chrome |
| `SettingsModal`, `SettingsProvider`, `settingsStorage`, `GameSettings` | Preset picker, key remap, control scheme, persistence |
| `HelpModal` | Rules/controls reference per mode |
| `useGameHistory`, `HistoryManager` | Puzzle-mode undo/redo (snapshot per lock) |
| `VictoryModal`, `WinCelebration` | Round/match end |
| `InvalidMoveTooltip` | Editor validation feedback |
| `calculateLayoutSizes`, `getResponsiveFontSizes`, accessibility config | Responsive wells, touch target sizing, reduced motion, color+symbol mode |
| `useAnalytics`, analytics utils | Mode starts, chain distributions, puzzle shares |
| `FEATURE_FLAGS` | Gate online (ph4) and editor (ph5) while shipping earlier phases |
| `bugReport` utils | Desync + engine bug reports with replay attached |

Not reused: card components (`Card`, `GenericTableau`, `FoundationArea`, `useCardInteraction`, solitaire rules) — card-specific. **Extraction candidates back into shared** (end of Phase 3, if proven): `TickEngine` scaffolding (`tick`/replay/state-hash harness), `useGameLoop`, input-adapter interfaces.

## Phases (each independently shippable)

Ordering is owner-directed (2026-07-07): **engine and graphics are strictly separate phases**, and **multiplayer ships before the puzzle maker**.

**Phase 1 — Headless engine, solo + versus core (~3 days)**
- TDD the full engine per 03-engine.md (types → pieces → resolve → garbage → tick → replay)
- Includes `MatchController` and garbage routing/offsetting — the versus *rules* are engine-level and graphics-free, so they land here (multiplayer-first)
- **Zero rendering.** No React, no DOM; the deliverable is a library + its test suite (optionally a throwaway console harness for sanity play)
- Exit: determinism test green (same seed+inputs ⇒ same hash), self-play soak clean, 95%+ engine coverage

**Phase 2 — Graphics & solo app (2-3 days)**
- All rendering lands here: Well/Ball/preview components, animations honoring reduced-motion, keyboard + touch adapters (drag + button-pad variants), settings/help/victory chrome, Marathon + Sprint modes, PWA parity, landing-page entry as **6 Ball Monty**
- Exit: playable on phone, `npm run validate` green, listed on live site

**Phase 3 — Local versus (2 days)**
- UI over the already-tested Phase 1 versus core: side-by-side/stacked layouts, P2 keyboard + gamepad adapters, best-of-N match flow
- Exit: two humans on one device; garbage exchange visibly correct

**Phase 4 — Online versus (3-5 days, feature-flagged)**
- Step 1 async (seed race + ghost URLs) first — ships alone if WebRTC slips
- Rollback netcode over RTCDataChannel with copy/paste signaling → then minimal room-code worker
- Exit: cross-network match completes; desync detector never fires across 50 automated selfplay matches

**Phase 5 — Puzzle mode + maker (3-4 days)**
- PuzzleDef + URL serialization, built-in pack, editor with test-play, solvability worker, local library
- Exit: author → share URL → friend solves on their phone

## Dependencies & ordering notes

- Phases 1-3 and 5 have **zero** new dependencies and no backend
- Phase 4 v2 signaling needs one deploy decision (Cloudflare Worker or similar) — flagged in 09-risks-and-decisions.md
- RFC-006 is *complementary*, not blocking: puzzle/replay URLs here can inform its final format
