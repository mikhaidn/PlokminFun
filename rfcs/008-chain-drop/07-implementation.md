# Implementation Plan

## New workspace

```
chaindrop-mvp/                  # npm workspace, same scaffold as klondike-mvp
├── package.json                # deps: @plokmin/shared; plokmin block:
│                               #   { slug: "chaindrop", title: "Chain Drop", icon: "🔴",
│                               #     description: "...", cta: "Play Now", order: 6 }
├── src/
│   ├── engine/                 # pure core (03-engine.md) — zero React imports
│   ├── net/                    # phase 5: adapters implementing the input-producer interface
│   ├── puzzle/                 # PuzzleDef, serialization, solvability worker (06)
│   ├── components/             # Well, Ball, PiecePreview, GarbageMeter, MatchLayout, EditorGrid
│   ├── hooks/                  # useGameLoop (rAF+accumulator), useWellInteraction, useKeyboardAdapter, useGamepadAdapter
│   ├── state/                  # app-level mode/match/session state
│   └── chaindrop.config.ts     # presets + app wiring (mirrors freecell.config.ts)
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
| `FEATURE_FLAGS` | Gate editor (ph4) and online (ph5) while shipping earlier phases |
| `bugReport` utils | Desync + engine bug reports with replay attached |

Not reused: card components (`Card`, `GenericTableau`, `FoundationArea`, `useCardInteraction`, solitaire rules) — card-specific. **Extraction candidates back into shared** (end of Phase 3, if proven): `TickEngine` scaffolding (`tick`/replay/state-hash harness), `useGameLoop`, input-adapter interfaces.

## Phases (each independently shippable)

**Phase 1 — Engine + minimal solo (3-4 days)**
- TDD the full engine per 03-engine.md (types → pieces → resolve → garbage → tick → replay)
- Bare-bones Well rendering + keyboard adapter; Marathon mode playable
- Exit: determinism test green (same seed+inputs ⇒ same hash), 95%+ engine coverage

**Phase 2 — Real app (2-3 days)**
- Touch adapter (drag + button-pad variants), settings/help/victory chrome, animations honoring reduced-motion, Sprint mode, PWA parity with existing games, landing-page entry
- Exit: playable on phone, `npm run validate` green, listed on live site

**Phase 3 — Local versus (2-3 days)**
- `MatchController`, garbage routing + offsetting, side-by-side layout, P2 keyboard + gamepad adapter, best-of-N
- Exit: two humans on one device, garbage-clear rules fully tested

**Phase 4 — Puzzle mode + maker (3-4 days)**
- PuzzleDef + URL serialization, built-in pack, editor with test-play, solvability worker, local library
- Exit: author → share URL → friend solves on their phone

**Phase 5 — Online (3-5 days, feature-flagged)**
- Step 1 async (seed race + ghost URLs) first — ships alone if WebRTC slips
- Lockstep over RTCDataChannel with copy/paste signaling → then minimal room-code worker
- Exit: cross-network match completes; desync detector never fires across 50 automated selfplay matches

## Dependencies & ordering notes

- Phases 1-4 have **zero** new dependencies and no backend
- Phase 5 v2 signaling needs one deploy decision (Cloudflare Worker or similar) — flagged in 09-risks-and-decisions.md
- RFC-006 is *complementary*, not blocking: puzzle/replay URLs here can inform its final format
