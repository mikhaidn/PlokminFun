# Game Design & Configurable Mechanics

## Core loop (default ruleset)

1. A **piece** (a pair of colored balls) spawns at the top of a **6-wide × 12-tall well** (plus 1 hidden spawn row)
2. Player moves it left/right, rotates it, and drops it (soft drop accelerates, hard drop is optional/configurable)
3. When the piece can't fall further, it **locks** after a short lock-delay window
4. Any group of **4+ orthogonally connected same-colored balls pops**
5. Balls above popped cells fall (column gravity); new groups may form → **chain** (×2, ×3 …)
6. Repeat until no pops remain, then the next piece spawns
7. **Top-out:** if the spawn cell is occupied, the game ends (solo) or the round is lost (versus)

**Versus additions:** chain size × chain-power table → garbage balls queued at the opponent. Garbage falls as neutral balls that don't match anything and clear only when a pop happens in an adjacent cell. **Offsetting:** your own pending garbage is cancelled first by your chains.

## Modes

| Mode | Description | Phase |
|---|---|---|
| **Marathon** | Solo survival; speed ramps up over time; score chasing | 2 |
| **Sprint** | Clear N balls / reach score X as fast as possible | 2 |
| **Versus (local)** | 2 players, one keyboard or keyboard+gamepad/touch, garbage attacks | 3 |
| **Versus (online)** | Same rules as local versus over WebRTC | 4 |
| **Puzzle** | Preset board + fixed piece queue + goal ("clear all", "make a 4-chain") | 5 |
| **Daily challenge** | Seeded marathon/puzzle of the day (ties into RFC-006/007 daily systems) | later |

## MechanicsConfig — configurable mechanics

Every rule above is data, not code. The engine takes a single frozen config object; variants and difficulty are presets. This mirrors RFC-005's config-driven `GameConfig` approach.

```typescript
interface MechanicsConfig {
  board: { columns: number; rows: number; hiddenRows: number };   // 6, 12, 1
  colors: number;                    // 4 default; 3 easy, 5 hard
  matchSize: number;                 // 4 = pop threshold
  piece: {
    shape: 'pair' | 'triple-L' | 'triple-I';  // pair default
    previewCount: number;            // 2 next-pieces shown
  };
  gravity: {
    initialCellsPerSecond: number;   // passive fall speed
    speedCurve: Array<{ atSeconds: number; cellsPerSecond: number }>;
    softDropMultiplier: number;      // e.g. 10x
    hardDrop: boolean;               // instant drop enabled?
    lockDelayMs: number;             // e.g. 400, with move-reset cap
  };
  chain: {
    powerTable: number[];            // garbage per chain step, e.g. [0, 4, 10, 18, ...]
    groupBonus: number[];            // bonus for popping >matchSize at once
    scoreTable: number[];            // solo scoring per chain step
  };
  garbage: {
    enabled: boolean;
    clearRule: 'adjacent-pop';       // extensible later
    offsetting: boolean;             // cancel incoming with your own chains
    maxPerDrop: number;              // cap garbage dumped between pieces
  };
  input: {
    dasMs: number;                   // delayed auto-shift for held left/right
    arrMs: number;                   // auto-repeat rate
  };
}
```

**Presets:** `classic` (values above), `mini` (5×9 board, 3 colors — mobile/daily-friendly, RFC-007 spirit), `frantic` (5 colors, fast curve, hard drop on). Presets live next to the engine as plain data and are selectable in `SettingsModal`.

> ⚠️ **All numeric values in this file are illustrative placeholders, not commitments.** Nobody has playtested them. Phase 1 ships with whatever feels roughly right; a dedicated tuning pass during Phase 2 playtesting sets the real defaults. The structure of `MechanicsConfig` is the design decision here — the numbers inside it are deliberately cheap to change.

## Feel & accessibility requirements

- Ball colors must pass the existing high-contrast/accessibility settings: each color gets a **distinct symbol/pattern overlay** (reuse the approach of `highContrastStyles` / `AccessibilitySettings` from `@plokmin/shared`)
- Reduced-motion setting swaps pop/fall animations for instant transitions (engine is animation-independent — see 03-engine.md)
- Touch controls sized via existing `getMinButtonHeight` / responsive layout utilities

## Explicitly out of scope for v1 rules

- Spinning/kick tables beyond simple wall-nudge rotation
- More than one garbage-clear rule
- Items/power-ups
