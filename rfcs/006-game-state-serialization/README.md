# RFC-006: Game State Serialization & Position Sharing

**Status:** 📝 Proposed
**Author:** Architecture Team
**Created:** 2025-12-27
**Target Version:** 2.1.0

---

## TL;DR

Enable sharing specific game positions (tableaus) via compact, URL-safe encoding. Unlike RFC-002's move-based approach, this encodes the **current board state** directly, enabling daily challenges, puzzle sharing, and instant playable positions without replay.

**Key Innovation:** Self-describing position encoding in ~55-89 bytes (vs 520KB full state or 400B move history).

---

## Quick Facts

- ✅ **Compact:** ~55-89 bytes typical position (vs 520KB full state)
- ✅ **Self-describing:** Includes game type + variant config in header
- ✅ **URL-safe:** Base64url encoding, fits in query params
- ✅ **No replay needed:** Load position and play immediately
- ✅ **Variant-friendly:** Supports mini-games, draw modes, custom rules
- ✅ **Daily challenge ready:** Everyone plays identical position

---

## Key Metrics

- **Target encoding size:** <100 bytes for typical positions
- **Header overhead:** 3 bytes (version + game + config)
- **Decoding performance:** <10ms on mobile devices
- **URL length:** <150 characters typical
- **Implementation effort:** 6-7 hours across 3 phases

---

## Format at a Glance

```
[VERSION:1][GAME_TYPE:1][CONFIG:1-2][STATE_DATA:N]

Examples:
v1F00...  → FreeCell Standard
v1K03...  → Klondike Draw-3
v1FM4...  → FreeCell Mini (4 columns, tutorial)
v1S01...  → Spider 1-Suit
```

---

## Use Cases

### 1. Daily Challenges
Everyone plays the same position each day:
```
https://cardgames.com/?p=v1K03d8a7b...
```

### 2. Puzzle Sharing
"Can you solve this position?"
```
"Try this FreeCell: v1F00c4d2a1..."
```

### 3. Bug Reporting
Share exact failing state:
```
"Game crashes on this position: v1K03..."
```

### 4. Tutorials
Load specific teaching positions:
```
https://cardgames.com/tutorial?p=v1FM2...
```

---

## Navigation

- [01-motivation.md](./01-motivation.md) - Why position-based vs move-based
- [02-solution.md](./02-solution.md) - Encoding format and strategy
- [03-alternatives.md](./03-alternatives.md) - Design trade-offs
- [04-implementation.md](./04-implementation.md) - 3-phase development plan
- [05-testing.md](./05-testing.md) - Test strategy and validation

---

## Comparison: RFC-002 vs RFC-006

| Feature | RFC-002 (Move-Based) | RFC-006 (Position-Based) |
|---------|---------------------|--------------------------|
| **Primary Use** | Share your game replay | Share a specific position |
| **Size** | ~400 bytes | ~55-89 bytes |
| **Loading** | Must replay moves | Instant load |
| **Daily Challenges** | ❌ Need full replay | ✅ Direct load |
| **Puzzle Creation** | ❌ Need move history | ✅ Just position |
| **Mid-Game Share** | ❌ Full history required | ✅ Current state only |

**Conclusion:** These RFCs are **complementary**, not competing:
- **RFC-006** (this): Share positions for challenges/puzzles
- **RFC-002**: Share game sessions for replay/spectating

---

## Size Analysis

### FreeCell Positions

```
Worst case (full tableau):  ~89 bytes → 119 chars base64url
Typical mid-game:           ~55 bytes → 73 chars
Near win (sparse):          ~30 bytes → 40 chars
```

### Klondike Positions

```
Full tableau + stock:       ~90 bytes → 120 chars
Typical mid-game:           ~80 bytes → 107 chars
Mini variant (3 columns):   ~40 bytes → 53 chars
```

**All well under URL limit (2000 chars)**

---

## Implementation Phases

### Phase 1: Core Encoding (2-3 hours)
1. Implement BitWriter/BitReader utilities
2. Implement FreeCell encode/decode
3. Add comprehensive tests

### Phase 2: Game Integration (1-2 hours)
1. Add "Share Position" button
2. Parse position from URL param
3. Copy to clipboard functionality

### Phase 3: Variants (2-3 hours)
1. Klondike support (draw modes)
2. Mini-game variants
3. Spider support (future)

---

## Header Format

### Version Byte (1 byte)
```
0x01 = v1 (current)
```

### Game Type Byte (1 byte)
```
0x46 = 'F' = FreeCell
0x4B = 'K' = Klondike
0x53 = 'S' = Spider
```

### Config Byte (1 byte, game-specific)

**Klondike:**
```
Bits 0-1: Draw mode (00=draw-1, 01=draw-3)
Bit 2:    Vegas scoring
Bit 3:    Timed mode
Bits 4-7: Tableau columns (3-7)
```

**FreeCell:**
```
Bit 0:    Mini mode flag
Bits 1-3: Column count (0=default 8)
Bits 4-6: Free cell count (0=default 4)
Bit 7:    Reserved
```

---

## State Encoding Strategy

### Card Representation (6 bits)
```
Rank: 0-12 (A,2,3,4,5,6,7,8,9,T,J,Q,K) = 4 bits
Suit: 0-3 (♠,♥,♣,♦) = 2 bits
Total: 6 bits per card
```

### Location-First Encoding
For each pile: `[pile_type:4bits][card_count:4bits][cards...]`

More compact for sparse positions, easier to debug.

---

## API Design

```typescript
// High-level API
function encodeGamePosition(
  gameType: string,
  config: GameConfig,
  state: GameState
): string;

function decodeGamePosition(encoded: string): {
  metadata: GameMetadata;
  state: GameState;
};

// Example usage
const position = encodeGamePosition('klondike', { drawMode: 3 }, gameState);
// → "v1K03d8a7b..."

const { metadata, state } = decodeGamePosition(position);
// → { gameType: 'klondike', config: { drawMode: 3 }, state: {...} }
```

---

## Success Criteria

- ✅ Encode/decode round-trip is lossless
- ✅ Typical positions <100 bytes
- ✅ Decoding <10ms on mobile
- ✅ All game states (initial, mid-game, won) supported
- ✅ Variant configs work correctly
- ✅ URL sharing works in browsers
- ✅ Copy/paste in text works

---

## Related Work

- **RFC-002:** Move-based sharing (complementary)
- **RFC-005:** Unified game builder (uses this for config)
- **P8 Roadmap:** Daily challenge system (depends on this)

---

## Decision Status

**PROPOSED** - Ready for implementation approval.

**Next Steps:**
1. Review design with team
2. Approve implementation plan
3. Begin Phase 1 (BitWriter utilities)

---

**Quick Start:** Read [02-solution.md](./02-solution.md) for the complete encoding specification.
