# Solution: Move-Based Encoding

## Overview

**Core insight:** Instead of storing game states (5.2KB each), store only moves (~20 bytes each).

```
Seed (8 bytes) + Moves (20 bytes × N) = Complete replay
Example: Seed 1234567890 + 87 moves = 1.74KB
```

---

## Workflow

1. User plays game → moves recorded
2. User clicks "Share" → encode seed + moves
3. System generates URL or short code
4. Recipient opens URL → game replays from seed

---

## Core Types

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

---

## Encoding Scheme

**Base64-based compact notation:**

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

---

## URL Scheme

```
https://mikhaidn.github.io/CardGames/freecell/?game=g4z3m.A7B2C5D8E1...W
https://mikhaidn.github.io/CardGames/freecell/?replay=g4z3m.A7B2C5D8E1...W
```

**Short Code (optional future enhancement):**
```typescript
// For text sharing: "FreeCell #G4Z3M"
// Lookup table: G4Z3M → full encoded game
// Requires backend or localStorage registry
```

---

## Why This Approach?

✅ **Compact**: 260x smaller than state-based (2KB vs 520KB)
✅ **URL-safe**: Fits in URL query params (<2KB limit)
✅ **No backend required**: Pure client-side encoding/decoding
✅ **Deterministic replay**: Seed + moves = exact game
✅ **Verifiable**: Can validate moves are legal
✅ **Human-readable** (somewhat): Can debug move sequences
✅ **Backward compatible**: Doesn't break existing undo/redo

---

## Technical Details: Bit Packing

**Move structure (12 bits total):**

```
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

**Actual size breakdown:**
- 12 bits = 1.5 bytes, but we use 2 bytes for alignment
- 100 moves = 200 bytes for moves + 8 bytes seed = ~208 bytes
- Base64 overhead: ~280 bytes
- Metadata (timestamps, etc.): ~100 bytes
- **Total: ~400 bytes minimum, ~2KB with safety margin**

---

## Replay Architecture

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

**Validation process:**
1. Decode URL → GameSession
2. Verify seed is valid (positive int)
3. Initialize game with seed
4. Apply each move, checking legality
5. If any move fails → Error
6. If all succeed → Ready to replay

---

## Performance Targets

**Encoding:**
- Time: O(N) where N = number of moves
- Expected: <10ms for 100 moves

**Decoding:**
- Time: O(N)
- Expected: <50ms for 100 moves on mobile

**Validation:**
- Time: O(N × M) where M = move validation cost
- Expected: <500ms for 100 moves (acceptable for initial load)

**Optimization opportunities:**
- Cache decoded games in localStorage
- Lazy validation (validate on demand, not upfront)
- Web Worker for decoding (if >100ms)

---

## Security Considerations

**Mitigations in place:**

1. **Move injection** - Malicious URLs with invalid moves
   - Mitigation: Strict validation, all moves must be legal

2. **Seed manipulation** - Try to claim win with easy seed
   - Mitigation: Seed included in share, not user-editable

3. **Privacy** - Games shared publicly
   - Mitigation: Opt-in sharing, clear UX about public links

**NOT a concern:**
- XSS: No eval(), only decoding
- CSRF: No server side
- Data leaks: All data already client-side

---

## Accessibility

**Replay controls (keyboard accessible):**
- Space: Play/pause
- Left/Right: Step backward/forward
- Home/End: Jump to start/end
- Number keys: Speed control (1-5)

**Screen reader support:**
- Announce each move: "Move 42: Ace of Spades from Tableau 3 to Foundation 1"
- Progress indicator: "Move 42 of 87"
- Win announcement: "Game completed in 87 moves!"
