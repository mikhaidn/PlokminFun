# Game State Position Encoding

**Purpose:** Enable sharing specific game positions (tableaus) independent of move history or seed.

**Use Cases:**
- Daily challenges (everyone plays same position)
- Puzzle sharing ("Can you solve this?")
- Bug reporting (share exact failing state)
- Interesting position sharing
- Tutorial/learning scenarios

---

## Design Goals

1. **Compact**: <300 bytes for typical position
2. **URL-safe**: Base64url encoding
3. **Human-debuggable**: Include version/game type prefix
4. **Fast decode**: <10ms on mobile
5. **Deterministic**: Same state → same encoding

---

## Encoding Format

### High-Level Structure

```
[VERSION:1][GAME:1][STATE_DATA:N]
```

### Version Byte (1 byte)
- `v1` = Current version
- Allows future format changes

### Game Type Byte (1 byte)
- `F` = FreeCell
- `K` = Klondike
- `S` = Spider (future)

### State Data (variable)

#### FreeCell State (estimated: 180-250 bytes)

```typescript
interface FreeCellPosition {
  // Card encoding: 6 bits per card (4 suits × 13 ranks = 52 values)
  // Location encoding: 4 bits per card (4 foundations + 4 freeCells + 8 tableau = 16 locations)

  tableau: Card[][];        // 8 columns, variable lengths
  foundations: Card[][];    // 4 piles, ordered by rank
  freeCells: (Card | null)[]; // 4 cells

  // Metadata (optional)
  moves?: number;           // Move counter (2 bytes)
  seed?: number;            // Original seed if known (4 bytes)
}
```

#### Klondike State (estimated: 200-300 bytes)

```typescript
interface KlondikePosition {
  tableau: Card[][];        // 7 columns
  foundations: Card[][];    // 4 piles
  stock: Card[];            // Remaining stock
  waste: Card[];            // Waste pile

  // Metadata
  drawMode: 1 | 3;          // Draw-1 or Draw-3 (1 bit)
  moves?: number;
  seed?: number;
}
```

---

## Encoding Strategy

### Card Representation (6 bits)

```
Rank: 0-12 (A,2,3,4,5,6,7,8,9,T,J,Q,K) = 4 bits
Suit: 0-3 (♠,♥,♣,♦) = 2 bits
Total: 6 bits per card
```

### Position Encoding (Bit-Packed)

Since we need to know WHERE each card is, we have two options:

**Option A: Location-First (Recommended)**
- Encode each location (pile) sequentially
- For each pile: [pile_type:4bits][card_count:4bits][cards...]
- More compact for sparse positions

**Option B: Card-First**
- For each card: [card:6bits][location:4bits][index:4bits]
- More compact for full tableaus
- Better for random access

**Decision:** Use **Option A** (location-first) for Phase 1
- More intuitive to debug
- Aligns with existing game state structure
- Easier to implement

### Example Encoding (Pseudocode)

```typescript
function encodeFreeCellPosition(state: FreeCellGameState): string {
  const bits = new BitWriter();

  // Version + Game type
  bits.writeBits(1, 8);  // v1
  bits.writeBits(0x46, 8); // 'F'

  // Foundations (4 piles, max 13 cards each)
  for (const pile of state.foundations) {
    bits.writeBits(pile.length, 4);
    for (const card of pile) {
      bits.writeBits(encodeCard(card), 6);
    }
  }

  // Free cells (4 cells)
  for (const cell of state.freeCells) {
    bits.writeBits(cell ? 1 : 0, 1); // Present flag
    if (cell) {
      bits.writeBits(encodeCard(cell), 6);
    }
  }

  // Tableau (8 columns, variable length)
  for (const column of state.tableau) {
    bits.writeBits(column.length, 5); // Max 32 cards per column
    for (const card of column) {
      bits.writeBits(encodeCard(card), 6);
    }
  }

  // Metadata (optional)
  bits.writeBits(state.moves, 16); // Move counter

  return base64url.encode(bits.toBytes());
}

function encodeCard(card: Card): number {
  const rankValue = RANK_TO_NUMBER[card.value]; // A=0, 2=1, ..., K=12
  const suitValue = SUIT_TO_NUMBER[card.suit];  // ♠=0, ♥=1, ♣=2, ♦=3
  return (rankValue << 2) | suitValue;
}
```

---

## Size Analysis

### FreeCell Worst Case (full tableau)

```
Version + Game:     2 bytes
Foundations:        4 × (4 bits + 13 × 6 bits) = 41 bytes
Free cells:         4 × (1 bit + 6 bits) = 4 bytes
Tableau:            8 × (5 bits + avg 6 × 6 bits) = 40 bytes
Metadata:           2 bytes (moves)
                    ─────────
Total:              ~89 bytes
```

### FreeCell Typical Case (mid-game)

```
Foundations:        ~20 bytes (some cards placed)
Free cells:         ~3 bytes (2-3 occupied)
Tableau:            ~30 bytes (fewer cards, distributed)
                    ─────────
Total:              ~55 bytes
```

### After Base64url encoding
- 55 bytes → ~73 characters
- 89 bytes → ~119 characters

**Perfect for URLs!** (URL query param limit: ~2000 chars)

---

## URL Format

```
https://cardgames.com/freecell?p=v1F...encoded...
https://cardgames.com/klondike?p=v1K...encoded...
```

Where `p` = position parameter

---

## Implementation Plan

### Phase 1: Basic Encoding (2-3 hours)

1. **Implement BitWriter/BitReader utilities**
   ```typescript
   class BitWriter {
     writeBits(value: number, numBits: number): void
     toBytes(): Uint8Array
   }
   ```

2. **Implement encode/decode for FreeCell**
   ```typescript
   function encodeFreeCellPosition(state: FreeCellGameState): string
   function decodeFreeCellPosition(encoded: string): FreeCellGameState
   ```

3. **Add tests**
   - Round-trip encoding (encode → decode → equal)
   - Size validation (<150 bytes typical)
   - Invalid input handling

### Phase 2: Game Integration (1-2 hours)

1. **Add "Share Position" button** to win screen
2. **Parse position param** from URL on load
3. **Show "Daily Challenge" badge** if position was loaded
4. **Copy to clipboard** functionality

### Phase 3: Klondike Support (1 hour)

1. **Implement Klondike encoding** (similar to FreeCell)
2. **Add stock/waste pile** encoding
3. **Handle draw mode** (1 bit flag)

---

## Testing Strategy

### Unit Tests

```typescript
describe('encodeFreeCellPosition', () => {
  it('encodes initial deal correctly', () => {
    const state = initializeGame(12345);
    const encoded = encodeFreeCellPosition(state);
    const decoded = decodeFreeCellPosition(encoded);
    expect(decoded).toEqual(state);
  });

  it('encodes mid-game position', () => {
    const state = createMidGamePosition();
    const encoded = encodeFreeCellPosition(state);
    expect(encoded.length).toBeLessThan(120); // ~89 bytes base64
  });

  it('handles edge cases', () => {
    const wonState = createWonGamePosition();
    const encoded = encodeFreeCellPosition(wonState);
    // All cards in foundations, minimal size
    expect(encoded.length).toBeLessThan(60);
  });
});
```

### Integration Tests

- Copy/paste position URL
- Load game from URL param
- Share button generates valid URL
- Works across browsers (iOS Safari, Chrome, Firefox)

---

## Future Enhancements

### Compression (if needed)
- Run-length encoding for sequential cards
- Dictionary encoding for common patterns
- Target: 30-40% size reduction

### Metadata Extensions
- Add difficulty rating
- Add puzzle description/title
- Add creator attribution

### Analytics
- Track shared position popularity
- Measure solve rates
- Identify interesting positions

---

## Example Usage

```typescript
// Encode current game state
const position = encodeFreeCellPosition(gameState);
const url = `https://cardgames.com/freecell?p=${position}`;

// Share via clipboard
navigator.clipboard.writeText(url);

// Load from URL
const params = new URLSearchParams(window.location.search);
if (params.has('p')) {
  const state = decodeFreeCellPosition(params.get('p')!);
  loadGameState(state);
}
```

---

## Advantages Over Move-Based (RFC-002)

| Feature | Move-Based | Position-Based |
|---------|-----------|----------------|
| **Size (typical)** | ~400 bytes | ~55 bytes |
| **Daily challenges** | ❌ Need full replay | ✅ Direct load |
| **Puzzle creation** | ❌ Need move history | ✅ Just position |
| **Mid-game sharing** | ❌ Full history | ✅ Current state |
| **Implementation** | Complex (replay) | Simple (load) |

**Conclusion:** Position encoding is simpler, smaller, and better suited for daily challenges and puzzle sharing. Move-based encoding is better for sharing your victory replay.

**Recommendation:** Implement position encoding first (this document), add move-based replay later if needed.
