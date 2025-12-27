# Implementation Plan

## Timeline Overview

```
Phase 1 (2-3 hours):  Core encoding utilities and FreeCell support
Phase 2 (1-2 hours):  Game integration and UI
Phase 3 (2-3 hours):  Klondike support and variants
```

**Total: 6-7 hours**

---

## Phase 1: Core Encoding (2-3 hours)

### Goal
Implement foundational encoding/decoding infrastructure for FreeCell.

### Tasks

#### 1.1: BitWriter Utility (30 min)

**File:** `shared/utils/bitWriter.ts`

```typescript
export class BitWriter {
  private bytes: number[] = [];
  private currentByte = 0;
  private bitPosition = 0;

  writeBits(value: number, numBits: number): void {
    // Implementation from 02-solution.md
  }

  toBytes(): Uint8Array {
    // Flush and return bytes
  }

  getSize(): number {
    return this.bytes.length + (this.bitPosition > 0 ? 1 : 0);
  }
}
```

**Tests:**
- Write 1-8 bits correctly
- Handle byte boundaries
- Flush partial bytes
- Write multiple values

#### 1.2: BitReader Utility (30 min)

**File:** `shared/utils/bitReader.ts`

```typescript
export class BitReader {
  private byteIndex = 0;
  private bitPosition = 0;

  constructor(private bytes: Uint8Array) {}

  readBits(numBits: number): number {
    // Implementation from 02-solution.md
  }

  hasMore(): boolean {
    return this.byteIndex < this.bytes.length;
  }

  getRemainingBits(): number {
    // Calculate remaining bits
  }
}
```

**Tests:**
- Read 1-8 bits correctly
- Handle byte boundaries
- Detect end of data
- Round-trip with BitWriter

#### 1.3: Card Encoding Functions (15 min)

**File:** `shared/utils/cardEncoding.ts`

```typescript
const RANK_TO_NUMBER: Record<string, number> = {
  'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5,
  '7': 6, '8': 7, '9': 8, 'T': 9, 'J': 10, 'Q': 11, 'K': 12
};

const NUMBER_TO_RANK: Record<number, string> = {
  0: 'A', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6',
  6: '7', 7: '8', 8: '9', 9: 'T', 10: 'J', 11: 'Q', 12: 'K'
};

const SUIT_TO_NUMBER: Record<string, number> = {
  '♠': 0, '♥': 1, '♣': 2, '♦': 3
};

const NUMBER_TO_SUIT: Record<number, string> = {
  0: '♠', 1: '♥', 2: '♣', 3: '♦'
};

export function encodeCard(card: Card): number {
  const rank = RANK_TO_NUMBER[card.value];
  const suit = SUIT_TO_NUMBER[card.suit];
  return (rank << 2) | suit;
}

export function decodeCard(encoded: number): Card {
  const rank = (encoded >> 2) & 0xF;
  const suit = encoded & 0x3;
  return {
    value: NUMBER_TO_RANK[rank],
    suit: NUMBER_TO_SUIT[suit]
  };
}
```

**Tests:**
- Encode all 52 cards correctly
- Decode all 52 cards correctly
- Round-trip encoding

#### 1.4: FreeCell Position Encoding (1 hour)

**File:** `shared/utils/positionEncoding/freecell.ts`

```typescript
export function encodeFreeCellPosition(state: FreeCellGameState): string {
  const writer = new BitWriter();

  // Header
  writer.writeBits(0x01, 8); // Version
  writer.writeBits(0x46, 8); // 'F' for FreeCell
  writer.writeBits(0x00, 8); // Config: standard

  // Foundations (4 piles)
  for (const pile of state.foundations) {
    writer.writeBits(pile.length, 4);
    for (const card of pile) {
      writer.writeBits(encodeCard(card), 6);
    }
  }

  // Free cells (4 cells)
  for (const cell of state.freeCells) {
    writer.writeBits(cell ? 1 : 0, 1);
    if (cell) {
      writer.writeBits(encodeCard(cell), 6);
    }
  }

  // Tableau (8 columns)
  for (const column of state.tableau) {
    writer.writeBits(column.length, 5);
    for (const card of column) {
      writer.writeBits(encodeCard(card), 6);
    }
  }

  // Metadata
  writer.writeBits(state.moves, 16);

  return base64url.encode(writer.toBytes());
}

export function decodeFreeCellPosition(encoded: string): FreeCellGameState {
  const reader = new BitReader(base64url.decode(encoded));

  // Validate header
  const version = reader.readBits(8);
  if (version !== 0x01) {
    throw new DecodingError(`Unsupported version: ${version}`);
  }

  const gameType = reader.readBits(8);
  if (gameType !== 0x46) {
    throw new DecodingError(`Expected FreeCell, got: ${gameType}`);
  }

  const config = reader.readBits(8); // For future use

  // Decode state
  const state: FreeCellGameState = {
    foundations: [],
    freeCells: [],
    tableau: [],
    moves: 0,
    seed: 0,
  };

  // Foundations
  for (let i = 0; i < 4; i++) {
    const length = reader.readBits(4);
    const pile: Card[] = [];
    for (let j = 0; j < length; j++) {
      pile.push(decodeCard(reader.readBits(6)));
    }
    state.foundations.push(pile);
  }

  // Free cells
  for (let i = 0; i < 4; i++) {
    const occupied = reader.readBits(1);
    state.freeCells.push(occupied ? decodeCard(reader.readBits(6)) : null);
  }

  // Tableau
  for (let i = 0; i < 8; i++) {
    const length = reader.readBits(5);
    const column: Card[] = [];
    for (let j = 0; j < length; j++) {
      column.push(decodeCard(reader.readBits(6)));
    }
    state.tableau.push(column);
  }

  // Metadata
  state.moves = reader.readBits(16);

  return state;
}
```

**Tests:**
- Encode initial deal correctly
- Encode mid-game position
- Encode near-win position
- Decode matches original state
- Round-trip encoding is lossless
- Size validation (<100 bytes typical)

#### 1.5: Base64url Utility (15 min)

**File:** `shared/utils/base64url.ts`

```typescript
export function encode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decode(str: string): Uint8Array {
  const base64 = str
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}
```

**Tests:**
- URL-safe characters only
- Round-trip encoding
- Handle padding correctly

---

## Phase 2: Game Integration (1-2 hours)

### Goal
Add UI for sharing positions and loading from URLs.

### Tasks

#### 2.1: Share Position Hook (30 min)

**File:** `shared/hooks/useSharePosition.ts`

```typescript
export function useSharePosition() {
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const sharePosition = useCallback((state: GameState, gameType: string) => {
    const encoded = encodeGamePosition(gameType, {}, state);
    const url = `${window.location.origin}/?p=${encoded}`;
    setShareUrl(url);

    // Copy to clipboard
    navigator.clipboard.writeText(url);
  }, []);

  const clearShare = useCallback(() => {
    setShareUrl(null);
  }, []);

  return { sharePosition, shareUrl, clearShare };
}
```

#### 2.2: Load Position from URL (30 min)

**File:** `shared/utils/urlPosition.ts`

```typescript
export function loadPositionFromURL(): {
  metadata: GameMetadata;
  state: GameState;
} | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('p');

  if (!encoded) return null;

  try {
    return decodeGamePosition(encoded);
  } catch (error) {
    console.error('Failed to decode position:', error);
    return null;
  }
}

export function setPositionInURL(encoded: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('p', encoded);
  window.history.replaceState({}, '', url.toString());
}

export function clearPositionFromURL(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('p');
  window.history.replaceState({}, '', url.toString());
}
```

#### 2.3: Share Button UI (30 min)

**File:** `shared/components/SharePositionButton.tsx`

```typescript
export function SharePositionButton({ gameState, gameType }) {
  const { sharePosition, shareUrl } = useSharePosition();
  const [showToast, setShowToast] = useState(false);

  const handleShare = () => {
    sharePosition(gameState, gameType);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      <button onClick={handleShare}>
        📋 Share Position
      </button>
      {showToast && <Toast>Link copied to clipboard!</Toast>}
    </>
  );
}
```

#### 2.4: Integrate into GameBoards (30 min)

**FreeCell:** Add share button to win modal and game controls
**Klondike:** Same integration

---

## Phase 3: Klondike & Variants (2-3 hours)

### Goal
Support Klondike with draw modes and mini-game variants.

### Tasks

#### 3.1: Klondike Position Encoding (1.5 hours)

**File:** `shared/utils/positionEncoding/klondike.ts`

Similar structure to FreeCell, but includes:
- Stock pile encoding
- Waste pile encoding
- Face-up/face-down tracking for tableau
- Draw mode in config byte

```typescript
export function encodeKlondikePosition(
  state: KlondikeGameState,
  drawMode: 1 | 3
): string {
  const writer = new BitWriter();

  // Header
  writer.writeBits(0x01, 8); // Version
  writer.writeBits(0x4B, 8); // 'K' for Klondike

  // Config: encode draw mode
  const config = (drawMode === 3 ? 0x03 : 0x01);
  writer.writeBits(config, 8);

  // Foundations (same as FreeCell)
  // ...

  // Tableau (7 columns with face-up count)
  for (const column of state.tableau) {
    writer.writeBits(column.cards.length, 5);
    writer.writeBits(column.faceUpCount, 5);
    for (const card of column.cards) {
      writer.writeBits(encodeCard(card), 6);
    }
  }

  // Stock
  writer.writeBits(state.stock.length, 6);
  for (const card of state.stock) {
    writer.writeBits(encodeCard(card), 6);
  }

  // Waste
  writer.writeBits(state.waste.length, 6);
  for (const card of state.waste) {
    writer.writeBits(encodeCard(card), 6);
  }

  // Metadata
  writer.writeBits(state.moves, 16);

  return base64url.encode(writer.toBytes());
}
```

#### 3.2: Mini-Game Variants (1 hour)

Add support for tutorial/mini variants:

```typescript
export interface MiniGameConfig {
  mini: boolean;
  columnCount?: number;  // FreeCell: 4-8
  freeCellCount?: number; // FreeCell: 2-4
  suitCount?: number;     // For reduced-deck variants
}

// Update encoding to use config byte
function encodeConfig(config: MiniGameConfig): number {
  let byte = 0;
  if (config.mini) byte |= 0x01;
  if (config.columnCount) byte |= ((config.columnCount - 4) << 1);
  // ...
  return byte;
}
```

#### 3.3: Tests for Klondike (30 min)

- Encode/decode draw-1 and draw-3 modes
- Handle stock/waste piles
- Round-trip encoding
- Size validation

---

## Export Configuration

Update `shared/index.ts`:

```typescript
// Position encoding
export { BitWriter } from './utils/bitWriter';
export { BitReader } from './utils/bitReader';
export { encodeCard, decodeCard } from './utils/cardEncoding';
export { encodeFreeCellPosition, decodeFreeCellPosition } from './utils/positionEncoding/freecell';
export { encodeKlondikePosition, decodeKlondikePosition } from './utils/positionEncoding/klondike';
export { loadPositionFromURL, setPositionInURL } from './utils/urlPosition';
export { useSharePosition } from './hooks/useSharePosition';
export { SharePositionButton } from './components/SharePositionButton';
```

---

## Testing Strategy

### Unit Tests

Each utility gets comprehensive tests:

```typescript
describe('BitWriter', () => {
  it('writes single bits correctly', () => { /* ... */ });
  it('handles byte boundaries', () => { /* ... */ });
  it('flushes partial bytes', () => { /* ... */ });
});

describe('FreeCell encoding', () => {
  it('encodes initial game state', () => {
    const state = initializeGame(12345);
    const encoded = encodeFreeCellPosition(state);
    const decoded = decodeFreeCellPosition(encoded);
    expect(decoded).toEqual(state);
  });

  it('stays under size limit', () => {
    const state = initializeGame(12345);
    const encoded = encodeFreeCellPosition(state);
    expect(encoded.length).toBeLessThan(120); // ~89 bytes
  });
});
```

### Integration Tests

```typescript
describe('Position sharing', () => {
  it('shares position via URL', () => {
    const state = initializeGame(12345);
    const url = sharePosition(state, 'freecell');
    expect(url).toContain('?p=v1F00');
  });

  it('loads position from URL', () => {
    const original = initializeGame(12345);
    const encoded = encodeFreeCellPosition(original);

    window.location.search = `?p=${encoded}`;
    const loaded = loadPositionFromURL();

    expect(loaded?.state).toEqual(original);
  });
});
```

---

## Performance Benchmarks

Target metrics:

```typescript
describe('Performance', () => {
  it('encodes in <5ms', () => {
    const state = initializeGame(12345);
    const start = performance.now();
    encodeFreeCellPosition(state);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(5);
  });

  it('decodes in <10ms', () => {
    const state = initializeGame(12345);
    const encoded = encodeFreeCellPosition(state);

    const start = performance.now();
    decodeFreeCellPosition(encoded);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10);
  });
});
```

---

## Deliverables Checklist

### Phase 1
- [ ] BitWriter utility with tests
- [ ] BitReader utility with tests
- [ ] Card encoding functions with tests
- [ ] FreeCell position encoding with tests
- [ ] Base64url utility with tests
- [ ] All tests passing (>95% coverage)

### Phase 2
- [ ] useSharePosition hook
- [ ] URL loading utilities
- [ ] SharePositionButton component
- [ ] Integration in FreeCell GameBoard
- [ ] Integration in Klondike GameBoard
- [ ] Copy to clipboard works

### Phase 3
- [ ] Klondike position encoding
- [ ] Draw mode support (draw-1, draw-3)
- [ ] Mini-game variant support
- [ ] All Klondike tests passing
- [ ] Documentation updated

---

## Success Criteria

- ✅ All 557+ existing tests still pass
- ✅ New encoding tests have >95% coverage
- ✅ Round-trip encoding is lossless
- ✅ Typical positions <100 bytes
- ✅ Encoding <5ms, decoding <10ms
- ✅ Share button works in both games
- ✅ URL loading works in all browsers
- ✅ Documentation complete

---

Next: [05-testing.md](./05-testing.md) - Comprehensive test strategy
