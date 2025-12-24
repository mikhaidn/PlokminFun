# Implementation Plan

## Overview

3-phase implementation spanning 12-18 hours of development:

1. **Phase 1:** Core Encoding/Decoding (6-8 hours) - P1 Priority
2. **Phase 2:** Replay UI (4-6 hours) - P2 Priority
3. **Phase 3:** Social Features (2-4 hours) - P3 Priority

---

## Phase 1: Core Encoding/Decoding (6-8 hours)

**Priority: P1 (Blocks daily challenge)**

### Tasks

- [ ] **Move Recording** (2h)
  - Add `recordMove()` to game actions
  - Store moves alongside undo/redo history
  - Ensure all move types captured (tableau, freecell, foundation)

- [ ] **Encoding** (2h)
  - Implement `encodeMove()` bit packing
  - Implement `encodeGame()` with base64
  - Add compression (if size >2KB)

- [ ] **Decoding** (2h)
  - Implement `decodeMove()`
  - Implement `decodeGame()`
  - Error handling for invalid encodings

- [ ] **Validation** (2h)
  - Apply moves to fresh game state
  - Verify all moves are legal
  - Unit tests for edge cases

### File Structure

```
freecell-mvp/src/replay/
├── encoder.ts          # Encoding functions
├── decoder.ts          # Decoding functions
├── validator.ts        # Move validation
├── types.ts            # GameSession, Move types
└── __tests__/
    ├── encoder.test.ts
    ├── decoder.test.ts
    └── integration.test.ts
```

### Success Criteria

- Encode/decode round-trip with 100% fidelity
- Encoding size <2KB for 100-move game
- Decoding time <50ms on mobile
- All tests passing

---

## Phase 2: Replay UI (4-6 hours)

**Priority: P2 (After encoding works)**

### Tasks

- [ ] **Replay Component** (3h)
  - GameReplayer component
  - Play/pause/step controls
  - Speed control (0.5x, 1x, 2x, 4x)
  - Progress bar with seek

- [ ] **Share Dialog** (2h)
  - "Share Game" button in win screen
  - Copy URL button
  - "Share on Twitter" link (optional)
  - Show encoded game size

- [ ] **URL Routing** (1h)
  - Read `?replay=<encoded>` from URL
  - Auto-start replay mode
  - Deep linking support

### UI Mockup

```
┌─────────────────────────────────────┐
│  Replay: Game #g4z3m (87 moves)    │
│  ◀◀ ▶ ▎▎ ▶▶    ●──────────○        │
│      Move 42/87                     │
│                                     │
│  [Game board showing state at       │
│   move 42, greyed out/non-interactive]
│                                     │
│  Move log:                          │
│  40. T2→F0 (6♦)                    │
│  41. T5→T3 (7♠ on 8♥)              │
│  42. F1→T2 (A♣) ← current          │
│                                     │
│  [Copy URL] [Play Original]        │
└─────────────────────────────────────┘
```

### Success Criteria

- Replay controls fully functional
- Keyboard navigation works
- Visual feedback for current move
- Share dialog generates valid URLs

---

## Phase 3: Social Features (2-4 hours)

**Priority: P3 (After daily challenge ships)**

### Tasks

- [ ] **Share Results** (1h)
  - "I won FreeCell #g4z3m in 87 moves! 🎉"
  - Twitter/Facebook meta tags
  - Copy shareable text

- [ ] **Embedded Replay** (2h)
  - Mini-replay widget for embedding
  - Auto-play animation for social preview

- [ ] **QR Code Sharing** (1h)
  - Generate QR code with encoded game
  - Embed in win screenshot

### Social Share Format

```
I just won FreeCell in 87 moves! 🎉

Can you beat my score?
https://mikhaidn.github.io/CardGames/freecell/?replay=g4z3m.A7B2C5...W

#FreeCell #CardGames
```

### Success Criteria

- One-click sharing to social platforms
- Meta tags render correctly on Twitter/Facebook
- QR codes scan successfully on mobile devices

---

## Future Enhancements (Post-Launch)

### Phase 4: Advanced Replay

**Branching timelines:**
- "What if I made a different move at move 42?"
- Fork replay, try alternative moves
- Compare outcomes side-by-side

**Annotations:**
- Add text/voice commentary to moves
- "This is where I realized I made a mistake..."
- Share as tutorial

**Analysis:**
- Show optimal solution path
- Highlight mistakes
- Efficiency score vs best possible

---

### Phase 5: Social Platform

**Move registry backend:**
- Store popular games
- Leaderboard: shortest solution for each seed
- Daily challenge leaderboard

**Discovery:**
- Browse popular games
- Filter by difficulty
- Search by seed

**Profiles:**
- User game history
- Win rate, average moves
- Achievements

---

### Phase 6: Multi-Game Support

**Extend to other card games:**
- Spider Solitaire
- Klondike
- Pyramid

**Unified encoding:**
```
Protocol: <game-id>:<version>:<seed>.<moves>

Examples:
fc:1:g4z3m.A7B2...   (FreeCell v1)
sp:1:h8k2n.C3D4...   (Spider v1)
kl:1:j9p1m.E5F6...   (Klondike v1)
```

---

## Migration Path

### Backward Compatibility

- Existing undo/redo continues to work
- State-based serialization kept for save/load
- New move recording doesn't break existing features

### Version Management

```typescript
// Encoding format versioning
const ENCODING_VERSION = 1;

function encodeGame(session: GameSession): string {
  return `v${ENCODING_VERSION}:${encodeGameData(session)}`;
}

function decodeGame(encoded: string): GameSession {
  const [version, data] = encoded.split(':');
  switch (version) {
    case 'v1': return decodeV1(data);
    // Future versions here
    default: throw new Error('Unsupported encoding version');
  }
}
```

### Rollout Strategy

1. **Phase 1:** Deploy encoding/decoding (no UI changes)
2. **Test:** Validate with internal games
3. **Phase 2:** Add replay UI (feature flag)
4. **Beta:** Enable for 10% of users
5. **Phase 3:** Full rollout + social features
6. **Monitor:** Track share rates, encoding sizes

---

## Dependencies

**Required:**
- None (pure TypeScript, no new libraries)

**Optional (for Phase 3):**
- QR code library (e.g., `qrcode.js`)
- Social share widgets (can use native share API)

**Nice-to-have:**
- Web Worker API (for async decoding)
- Compression library (if encoding >2KB)
