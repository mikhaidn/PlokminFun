# Puzzle Mode & Puzzle Maker

## Puzzle mode (playing)

A puzzle is a small declarative document consumed by the same engine with gravity effectively paused between placements (piece falls only on player drop — turn-based feel):

```typescript
interface PuzzleDef {
  version: 1;
  config: Partial<MechanicsConfig>;   // overrides on a preset (board size, colors…)
  startGrid: string;                  // row-major encoding, e.g. "..RGB.|.RRG.." per row
  queue: BallColor[][];               // exact piece sequence, e.g. 3 pieces
  goal:
    | { type: 'clear-all' }
    | { type: 'chain'; minChain: number }
    | { type: 'clear-color'; color: BallColor }
    | { type: 'score'; min: number };
  meta: { title?: string; author?: string; difficulty?: 1|2|3|4|5 };
}
```

- Win = goal met before the queue runs out; lose = queue exhausted or top-out
- **Undo/redo per placement** via `useGameHistory` (between locks a puzzle is turn-based, so the shared history hook applies directly)
- Ships with a small built-in pack (~20 hand-made puzzles teaching chains: 2-chain, 3-chain, garbage clearing…)

## Puzzle maker (authoring)

An in-app editor page (route within `chaindrop-mvp`, feature-flagged via `FEATURE_FLAGS`):

1. **Board painter:** tap/click cells cycling colors (or pick color then paint); garbage balls paintable too
2. **Queue builder:** compose the exact piece sequence (1-8 pieces)
3. **Goal picker:** the goal types above + title/difficulty
4. **Test-play loop:** one tap flips between edit and play against the live engine — the editor *is* the game with an editable state
5. **Share:** emit a puzzle URL

**Validation before sharing:**
- **Static checks:** no floating balls (unless intended — warn), no pre-solved goal, queue non-empty, board within config bounds
- **Solvability search:** because the engine is pure and headless, brute-force all placement sequences — branching factor per piece is ≤ columns × 4 orientations (~22 for a pair on 6 columns), so ≤ 8 pieces is at most ~22⁸ worst case, pruned heavily by top-out/goal checks and memoized state hashes; runs in a Web Worker with a time budget. Result: **Solvable (with solution replay) / Not solvable / Unknown (timed out)** — author sees it before publishing, players can request a hint from the stored solution replay

## Sharing & serialization

- `PuzzleDef` → deterministic JSON → deflate → base64url → `#p=` URL fragment (fragment keeps payloads out of server logs and off GitHub Pages request limits)
- Same versioned-envelope approach as **RFC-006**; a puzzle URL is self-contained — no storage backend, share via any messenger
- Puzzle *results* can round-trip too: appending the winner's input replay to the URL produces a "beat my solution" challenge (ties into 05-online.md Step 1)
- **Local library:** authored + played puzzles cached in `localStorage` via the `settingsStorage` patterns (list, resume, delete)

## Reuse & future capability

- The editor deliberately produces plain data consumed by the unmodified engine — no editor-only game code
- `PuzzleDef` is the template for a **daily puzzle** rotation later (RFC-007's daily-challenge spirit): a date-seeded generator proposes candidates, the solvability searcher filters them, one is published as a URL
- If RFC-005's unified builder lands, `PuzzleDef.config` slots into its `GameConfig` overrides pattern unchanged
