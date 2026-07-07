# Controls & Local Multiplayer

## Input abstraction

Devices never talk to the engine directly. Every device adapter emits the same `InputEvent`s (03-engine.md), stamped with the tick they apply to:

```
Keyboard ─┐
Touch    ─┼→ InputAdapter → InputEvent[] per tick → engine.tick()
Gamepad  ─┘                     ↑
                        (replay / network feed plugs in at the same point)
```

This is the load-bearing decision: local play, replays, AI drivers, and online opponents are all just different producers of the same event stream.

## Device adapters

**Keyboard** (Phase 2)
- P1 defaults: `←/→` move, `↑`/`Z`/`X` rotate, `↓` soft drop, `Space` hard drop
- P2 defaults (local versus): `A/D` move, `W`/`Q`/`E` rotate, `S` soft drop
- DAS/ARR (hold-to-repeat) handled in the adapter using config `input.dasMs/arrMs`, emitting repeated move events — the engine only ever sees discrete events
- Remappable via `SettingsModal` (extend existing `GameSettings`), persisted with `settingsStorage`

**Touch** (Phase 2 — primary mobile input)
- Drag horizontally on the well → column-snapped movement; tap → rotate; swipe down → soft/hard drop
- Alternative **button pad** layout (large on-screen buttons) selectable in settings — better for accessibility; sizes from `getMinButtonHeight` and `calculateLayoutSizes`
- Reuses pointer-event patterns from `useCardInteraction` where applicable (unified mouse/touch handling), though a new `useWellInteraction` hook is expected since the gesture vocabulary differs from card dragging

**Gamepad** (Phase 3, with local versus)
- Standard Gamepad API polling once per frame in the adapter; d-pad/stick + face buttons
- Auto-assign: first pad → P2 (or P1 if selected); enables true couch versus on one machine

## Local versus (Phase 3)

- One `MatchController` (03-engine.md) driving two engine instances at the same tick rate
- Layout: side-by-side wells on landscape/desktop; stacked-with-mini-opponent on portrait (responsive via `calculateLayoutSizes`)
- Each player binds one adapter: keyboard-left + keyboard-right, or keyboard + gamepad, or (tablet) split-screen touch zones
- Shared chrome: `GameControls` for pause/restart/settings/help, `VictoryModal`/`WinCelebration` for round end, best-of-N match score kept in the app layer
- **Pause is match-global** (both engines freeze — trivial since we just stop ticking)

## Solo quality-of-life

- **Puzzle mode gets undo/redo** via `useGameHistory` from `@plokmin/shared` — snapshots taken at each piece-lock (puzzle mode is effectively turn-based between locks, so the existing history hook fits cleanly)
- Marathon/versus have no undo; `GameControls` config hides those buttons per mode (already supported by its props)

## Accessibility

- Full keyboard playability is the baseline (no pointer required)
- On-screen button pad + adjustable game speed preset (`mini`) as motor-accessibility options
- Color + symbol ball rendering (02-game-design.md) so color-only info never gates play
