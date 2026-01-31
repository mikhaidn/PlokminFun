# RFC-002: Game Sharing and Replay System

**Author:** CardGames Team
**Status:** Proposed
**Created:** 2025-12-23
**Target:** FreeCell (immediate), All card games (future)

---

## Executive Summary

Implement a compact move-based encoding system that enables users to share complete game sessions via URL or text. This enables social features (sharing wins like Wordle), daily challenge verification, bug reporting with reproducible states, and learning from expert play.

**Key benefit:** Encode a 100-move game in ~2KB (vs 520KB with current state-based approach), making URL sharing practical.

---

## Problem Statement

### What problem are we solving?

**User problems:**
1. **Can't share victories** - "I won in 87 moves!" has no proof/replay
2. **Can't share challenging games** - Found a tough seed? Can't share it mid-game
3. **Can't learn from others** - No way to study expert solutions
4. **Can't report bugs effectively** - "The game broke" without reproducible state

**Developer problems:**
1. **Can't verify daily challenge scores** - No proof users actually completed it
2. **Bug reports lack context** - Can't reproduce user issues
3. **Current solution too large** - 520KB serialized state won't fit in URLs

### Why solve it now?

**Prerequisite for key features:**
- **Daily Challenge** (P2 priority) - Needs shareable results
- **Leaderboards** (future) - Needs verifiable games
- **Social growth** - Sharing drives user acquisition (see: Wordle effect)
- **Bug tracking** - Better than screenshots

**Current capability:** We have undo/redo with state history, but it's too large to share practically.

### Success Criteria

- [ ] Encode a 100-move game in <2KB (URL-safe)
- [ ] Share game via URL: `https://.../freecell/?game=<encoded>`
- [ ] Replay shared games with step-by-step visualization
- [ ] Decode <50ms on mobile devices
- [ ] Works offline (no server required)

---

## Proposed Solution

### Overview: Move-Based Encoding

**Core insight:** Instead of storing game states (5.2KB each), store only moves (~20 bytes each).

```
Seed (8 bytes) + Moves (20 bytes × N) = Complete replay
Example: Seed 1234567890 + 87 moves = 1.74KB
```

**Workflow:**
1. User plays game → moves recorded
2. User clicks "Share" → encode seed + moves
3. System generates URL or short code
4. Recipient opens URL → game replays from seed

### Implementation

**Core Types:**
```typescript
// Compact move representation
interface Move {
  // Source location
  from: {
    type: 'T' | 'F' | 'S';  // Tableau, FreeCell, Foundation
    index: number;           // 0-7 for tableau, 0-3 for others
    cardIndex?: number;      // Only for tableau stacks
  };
  // Destination location
  to: {
    type: 'T' | 'F' | 'S';
    index: number;
  };
}

// Game session for sharing
interface GameSession {
  seed: number;              // Initial deal
  moves: Move[];             // Sequence of moves
  metadata?: {
    completedAt?: number;    // Timestamp (optional)
    moveCount: number;       // For validation
    won: boolean;            // Final state
  };
}
```

**Encoding Scheme (Base64-based):**
```typescript
// Compact notation: T0.5→F0 means "Tableau 0, card 5 to Foundation 0"
// Full move: 2 bytes per move (6 bits each for from/to)

function encodeMove(move: Move): string {
  // T0.5 = 0b000_0_101 (type=000, idx=0, cards=5)
  // F1   = 0b010_001   (type=010, idx=1)
  // Result: "A7" (base64 of 2 bytes)
  const fromBits =
    (typeToInt(move.from.type) << 5) |
    (move.from.index << 3) |
    (move.from.cardIndex ?? 0);

  const toBits =
    (typeToInt(move.to.type) << 3) |
    move.to.index;

  return encodeBase64([fromBits, toBits]);
}

function encodeGame(session: GameSession): string {
  const parts = [
    session.seed.toString(36),           // Base36 seed (6-8 chars)
    session.moves.map(encodeMove).join(''), // Base64 moves
  ];

  if (session.metadata?.won) {
    parts.push('W'); // Win flag
  }

  return parts.join('.');
}

// Example output:
// "g4z3m.A7B2C5D8E1...W"
//  ^^^^^ ^^^^^^^^^^^ ^
//  seed  moves       win flag
//
// Length: ~1.8KB for 100 moves
```

**URL Scheme:**
```
https://mikhaidn.github.io/PlokminFun/freecell/?game=g4z3m.A7B2C5D8E1...W
https://mikhaidn.github.io/PlokminFun/freecell/?replay=g4z3m.A7B2C5D8E1...W
```

**Short Code (optional):**
```typescript
// For text sharing: "FreeCell #G4Z3M"
// Lookup table: G4Z3M → full encoded game
// Requires backend or localStorage registry
```

### Why This Approach?

✅ **Compact**: 260x smaller than state-based (2KB vs 520KB)
✅ **URL-safe**: Fits in URL query params (<2KB limit)
✅ **No backend required**: Pure client-side encoding/decoding
✅ **Deterministic replay**: Seed + moves = exact game
✅ **Verifiable**: Can validate moves are legal
✅ **Human-readable** (somewhat): Can debug move sequences
✅ **Backward compatible**: Doesn't break existing undo/redo

---

## Alternatives Considered

### Alternative 1: Current State-Based Serialization

**Approach:**
Use existing `HistoryManager.serialize()` which stores full game states.

```typescript
const encoded = btoa(JSON.stringify(historyManager.serialize()));
// Result: ~700KB base64 string
```

**Pros:**
- ✅ Already implemented
- ✅ Captures full state (no replay needed)
- ✅ No move validation required

**Cons:**
- ❌ **520KB per game** - Too large for URLs (2KB limit)
- ❌ Can't share via URL, only file download
- ❌ Not human-readable
- ❌ Bloated for simple sharing

**Decision:** REJECTED for sharing (keep for local persistence)
**Rationale:** Size makes URL sharing impractical. Good for save/load, bad for social sharing.

---

### Alternative 2: Backend Move Registry

**Approach:**
Store moves on server, share short IDs like `freecell.game/abc123`

```typescript
// Client encodes, uploads to server
const gameId = await uploadGame(session);
// Share: https://freecell.game/abc123
```

**Pros:**
- ✅ Ultra-short URLs (8 chars)
- ✅ Can track popularity/leaderboards
- ✅ Analytics on game difficulty

**Cons:**
- ❌ Requires backend infrastructure ($$$)
- ❌ Requires maintenance
- ❌ Single point of failure
- ❌ Violates "no backend" design goal
- ❌ Privacy concerns (all games stored)

**Decision:** DEFERRED until 10k+ daily users
**Rationale:** Premature optimization. Start with client-side, add backend if needed.

---

### Alternative 3: PNG/QR Code Encoding

**Approach:**
Encode game as QR code or steganography in win screen image.

```typescript
// Generate QR code with encoded game
const qr = generateQR(encodeGame(session));
// User shares image on social media
```

**Pros:**
- ✅ Works on platforms that strip URLs (Instagram)
- ✅ Visual sharing appeal
- ✅ Can embed in win screenshot

**Cons:**
- ❌ Requires QR scanning (friction)
- ❌ Image format harder to work with
- ❌ Still need text encoding anyway

**Decision:** NICE-TO-HAVE addition
**Rationale:** Complement to URL sharing, not replacement. Add in Phase 2.

---

## Technical Deep Dive

### Move Encoding Details

**Bit packing for maximum compression:**

```
Move structure (12 bits total):
┌────────────┬──────────┬─────────────┐
│ From (6b)  │ To (6b)  │ = 12 bits   │
└────────────┴──────────┴─────────────┘

From bits (6 bits):
  TTT III CCC
  │   │   └─── Card index (0-7, for tableau stacks)
  │   └─────── Location index (0-7)
  └─────────── Type (000=T, 001=F, 010=S)

To bits (6 bits):
  TTT III 000
  │   │   └─── Reserved (always 0)
  │   └─────── Location index (0-7)
  └─────────── Type

Examples:
- T2.3→F0: 010_010_011 | 001_000_000 = 0x293 0x040
- F1→T5:   001_001_000 | 000_101_000 = 0x048 0x028
```

**Base64 encoding:**
```typescript
// 12 bits = 1.5 bytes, but we use 2 bytes for alignment
// Actual: ~2 bytes per move (includes padding)
// 100 moves = 200 bytes for moves + 8 bytes seed = ~208 bytes
// Base64 overhead: ~280 bytes
// Total: ~300 bytes for move data

// Add metadata (timestamps, etc.): ~100 bytes
// Final: ~400 bytes minimum, ~2KB with safety margin
```

### Replay System Architecture

**Component structure:**
```
GameReplayer
├── decode(url: string): GameSession
├── validate(session: GameSession): boolean
├── replay(session: GameSession, speed: number): void
└── step(): void

ReplayUI
├── controls: play/pause/step/speed
├── progress bar
├── move list
└── state inspector
```

**State machine:**
```
Initial → Loading → Validating → Ready → Playing → Paused → Complete
  │         │          │           │        │        │         │
  └─────────┴──────────┴───────────┴────────┴────────┴─────────┘
                        Error (invalid game)
```

**Validation steps:**
1. Decode URL → GameSession
2. Verify seed is valid (positive int)
3. Initialize game with seed
4. Apply each move, checking legality
5. If any move fails → Error
6. If all succeed → Ready to replay

### Performance Considerations

**Encoding:**
- Time: O(N) where N = number of moves
- Space: O(N)
- Expected: <10ms for 100 moves

**Decoding:**
- Time: O(N)
- Space: O(N)
- Expected: <50ms for 100 moves on mobile

**Validation:**
- Time: O(N × M) where M = move validation cost
- Expected: <500ms for 100 moves (acceptable for initial load)

**Optimization opportunities:**
- Cache decoded games in localStorage
- Lazy validation (validate on demand, not upfront)
- Web Worker for decoding (if >100ms)

### Security/Privacy

**Concerns:**
1. **Move injection** - Malicious URLs with invalid moves
   - **Mitigation:** Strict validation, all moves must be legal
2. **Seed manipulation** - Try to claim win with easy seed
   - **Mitigation:** Seed included in share, not user-editable
3. **Privacy** - Games shared publicly
   - **Mitigation:** Opt-in sharing, clear UX about public links

**NOT a concern:**
- XSS: No eval(), only decoding
- CSRF: No server side
- Data leaks: All data already client-side

### Accessibility

**Replay controls must be keyboard accessible:**
- Space: Play/pause
- Left/Right: Step backward/forward
- Home/End: Jump to start/end
- Number keys: Speed control (1-5)

**Screen reader support:**
- Announce each move: "Move 42: Ace of Spades from Tableau 3 to Foundation 1"
- Progress indicator: "Move 42 of 87"
- Win announcement: "Game completed in 87 moves!"

---

## Implementation Plan

### Phase 1: Core Encoding/Decoding (6-8 hours)

**Priority: P1 (Blocks daily challenge)**

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

**Files:**
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

---

### Phase 2: Replay UI (4-6 hours)

**Priority: P2 (After encoding works)**

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

**UI Mockup:**
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

---

### Phase 3: Social Features (2-4 hours)

**Priority: P3 (After daily challenge ships)**

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

---

## Success Metrics

### User-Facing Metrics

- [ ] **Share rate**: >5% of completed games shared
- [ ] **Replay rate**: >20% of shared games replayed
- [ ] **Completion rate**: >80% of replays watched to end
- [ ] **Load time**: <500ms from URL to replay start

### Technical Metrics

- [ ] **Encoding size**: Average game <1KB, max <2KB
- [ ] **Encoding speed**: <10ms for 100 moves
- [ ] **Decoding speed**: <50ms for 100 moves
- [ ] **Validation accuracy**: 100% (no false negatives)

### Business Metrics (Future)

- [ ] **Viral coefficient**: Track referrals from shared games
- [ ] **Retention**: Do users who replay games return more?
- [ ] **Daily challenge**: Participation increases with sharing

---

## Risks and Mitigations

### Risk 1: URL Length Exceeds Browser Limits

**Likelihood:** Low
**Impact:** High (breaks sharing for long games)

**Mitigation:**
- Target <2KB (safe limit is ~2048 chars)
- Use compression (gzip text before base64)
- Fall back to file download if >2KB
- Monitor 95th percentile game length

---

### Risk 2: Move Validation Performance

**Likelihood:** Medium (complex games, mobile devices)
**Impact:** Medium (slow load time)

**Mitigation:**
- Lazy validation: validate on play, not on load
- Show loading spinner for >200ms
- Use Web Worker for validation
- Cache validated games in localStorage

---

### Risk 3: Encoding Collisions / Ambiguity

**Likelihood:** Low (good bit packing)
**Impact:** High (replays differ from original)

**Mitigation:**
- Comprehensive test suite (1000+ games)
- Property-based testing (encode → decode → encode must match)
- Add checksum to encoding (CRC-8, +1 byte)
- Versioning: prefix with version byte for future changes

---

### Risk 4: Cheating / Invalid Shares

**Likelihood:** High (users will try)
**Impact:** Low (single-player game, no leaderboards yet)

**Mitigation:**
- Strict move validation (reject invalid moves)
- Can't claim win without valid move sequence
- Future: Server-side validation for leaderboards
- For now: "Trust but verify locally"

---

## Open Questions

### 1. Should we support partial game sharing (mid-game)?

**Options:**
- A) Only share completed games (simpler)
- B) Share any state (more flexible)

**Tradeoffs:**
- Completed only: Simpler UX, smaller size, clear goal
- Any state: Better for "help me solve this", bug reports

**Recommendation:** Start with completed games, add partial in Phase 2

---

### 2. What replay speed is default?

**Options:**
- A) Real-time (1 move/sec)
- B) Fast (2x speed)
- C) Instant (show final state)

**Recommendation:** Default 2x, allow speed control

---

### 3. Should we record timestamps for moves?

**Pros:**
- Can replay at original speed
- Can analyze solve time
- Better for "watch me solve"

**Cons:**
- Adds ~2 bytes per move (×100 = 200 bytes)
- Most shares don't need timestamps

**Recommendation:** Optional in Phase 3, not Phase 1

---

### 4. Compression: gzip or custom?

**Options:**
- A) No compression (keep simple)
- B) gzip before base64 (standard)
- C) Custom run-length encoding for repeated moves

**Analysis:**
- Games are ~400 bytes uncompressed
- gzip: ~250 bytes (37% savings)
- Custom: potentially better, but more complex

**Recommendation:** Start without, add gzip if size >2KB in testing

---

## Future Enhancements

### Phase 4: Advanced Replay (Post-Launch)

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

## Decision

**Status:** PROPOSED (awaiting review)
**Rationale:**
- Enables daily challenge (P2 priority)
- Small implementation (<20h total)
- High user value (social sharing)
- No backend required (low risk)

**Next steps:**
1. Review RFC with team/stakeholders
2. Approve for implementation
3. Begin Phase 1 (encoding/decoding)

---

## Feedback and Comments

<!-- Reviewers: Add comments here -->

**Reviewer:** [Name]
**Date:** [Date]
**Comment:** [Your feedback]
**Resolution:** [How it was addressed]
