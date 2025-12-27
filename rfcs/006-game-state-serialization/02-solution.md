# Solution: Self-Describing Position Encoding

## Overview

Encode the **current game state** (tableau, foundations, etc.) into a compact, self-describing binary format that includes game type and configuration metadata in a 3-byte header.

---

## Complete Format Specification

### Binary Structure

```
┌──────────┬────────────┬────────┬────────────────┐
│ VERSION  │ GAME_TYPE  │ CONFIG │  STATE_DATA    │
│ 1 byte   │  1 byte    │ 1 byte │   N bytes      │
└──────────┴────────────┴────────┴────────────────┘
```

### Header (3 bytes)

#### 1. Version Byte
```
0x01 = Version 1 (current)
0x02 = Version 2 (future format changes)
...
```

Purpose: Allow format evolution without breaking old shares.

#### 2. Game Type Byte (ASCII)
```
0x46 = 'F' = FreeCell
0x4B = 'K' = Klondike
0x53 = 'S' = Spider
0x50 = 'P' = Pyramid (future)
0x47 = 'G' = Golf (future)
```

Why ASCII? Human-readable in hex dumps, easier debugging.

#### 3. Config Byte (game-specific)

**FreeCell Config:**
```
Bit 0:     Mini mode flag (1=mini, 0=standard)
Bits 1-3:  Column count override (0=default 8, 1-7=custom)
Bits 4-6:  Free cell count override (0=default 4, 1-7=custom)
Bit 7:     Reserved

Examples:
0x00 = Standard (8 columns, 4 free cells)
0x05 = Mini (4 columns from bits 1-3: 101 = 5, but bit 0 triggers mini logic)
0x01 = Mini mode enabled
```

**Klondike Config:**
```
Bits 0-1:  Draw mode
           00 = Draw-1
           01 = Draw-3
           10 = Draw-5 (variant)
           11 = Reserved
Bit 2:     Vegas scoring (1=enabled)
Bit 3:     Timed mode (1=enabled)
Bits 4-7:  Tableau columns (binary, 3-7)

Examples:
0x01 = Draw-1, 7 columns, standard
0x03 = Draw-3, 7 columns, standard
0x43 = Draw-3, 4 columns (mini variant)
0x07 = Draw-3, Vegas scoring enabled
```

**Spider Config:**
```
Bits 0-1:  Suit count
           00 = 1-suit
           01 = 2-suit
           10 = 4-suit
           11 = Reserved
Bits 2-7:  Reserved for future variants

Examples:
0x00 = 1-suit
0x01 = 2-suit
0x02 = 4-suit
```

---

## State Data Encoding

### Card Encoding (6 bits per card)

```
┌────────────┬──────────┐
│ RANK (4b)  │ SUIT (2b)│
└────────────┴──────────┘

Rank values (4 bits):
0 = Ace, 1 = 2, 2 = 3, ..., 12 = King

Suit values (2 bits):
0 = ♠ Spades
1 = ♥ Hearts
2 = ♣ Clubs
3 = ♦ Diamonds

Example: King of Hearts
Rank: 12 (1100 in binary)
Suit: 1  (01 in binary)
Combined: 110001 (6 bits) = 0x31
```

### FreeCell State Encoding

```
┌──────────────────────────────────────────────────┐
│ FOUNDATIONS (4 piles)                            │
│   For each pile:                                 │
│     - Pile length (4 bits, 0-13)                │
│     - Cards (6 bits each)                        │
├──────────────────────────────────────────────────┤
│ FREE CELLS (4 cells)                             │
│   For each cell:                                 │
│     - Occupied flag (1 bit)                      │
│     - Card if occupied (6 bits)                  │
├──────────────────────────────────────────────────┤
│ TABLEAU (8 columns)                              │
│   For each column:                               │
│     - Column length (5 bits, 0-31)              │
│     - Cards (6 bits each)                        │
├──────────────────────────────────────────────────┤
│ METADATA (optional)                              │
│   - Move count (16 bits)                        │
│   - Original seed if known (32 bits, optional)  │
└──────────────────────────────────────────────────┘
```

### Klondike State Encoding

```
┌──────────────────────────────────────────────────┐
│ FOUNDATIONS (4 piles)                            │
│   [same as FreeCell]                             │
├──────────────────────────────────────────────────┤
│ TABLEAU (7 columns)                              │
│   For each column:                               │
│     - Column length (5 bits)                     │
│     - Face-up count (5 bits)                     │
│     - Cards (6 bits each)                        │
├──────────────────────────────────────────────────┤
│ STOCK (remaining cards)                          │
│   - Stock length (6 bits, 0-52)                 │
│   - Cards (6 bits each)                          │
├──────────────────────────────────────────────────┤
│ WASTE (waste pile)                               │
│   - Waste length (6 bits, 0-52)                 │
│   - Cards (6 bits each)                          │
├──────────────────────────────────────────────────┤
│ METADATA                                         │
│   - Move count (16 bits)                        │
└──────────────────────────────────────────────────┘
```

---

## Size Calculations

### FreeCell Worst Case (Full Tableau)

```
Header:              3 bytes
Foundations:         4 × (4 bits + 13 × 6 bits) = 41 bytes
Free cells:          4 × (1 bit + 6 bits) = 4 bytes
Tableau:             8 × (5 bits + avg 6 × 6 bits) = 40 bytes
Metadata (moves):    2 bytes
                     ─────────
Total:               ~90 bytes → ~120 chars base64url
```

### FreeCell Typical Mid-Game

```
Header:              3 bytes
Foundations:         ~20 bytes (partial)
Free cells:          ~3 bytes (2-3 occupied)
Tableau:             ~30 bytes (distributed cards)
Metadata:            2 bytes
                     ─────────
Total:               ~58 bytes → ~77 chars base64url
```

### FreeCell Near Win

```
Header:              3 bytes
Foundations:         ~40 bytes (most cards)
Free cells:          ~2 bytes (1-2 occupied)
Tableau:             ~10 bytes (few cards left)
Metadata:            2 bytes
                     ─────────
Total:               ~57 bytes → ~76 chars base64url
```

---

## Implementation Pseudocode

### Encoding

```typescript
function encodeGamePosition(
  gameType: 'freecell' | 'klondike' | 'spider',
  config: GameConfig,
  state: GameState
): string {
  const writer = new BitWriter();

  // Header
  writer.writeBits(0x01, 8);                    // Version
  writer.writeBits(encodeGameType(gameType), 8); // Game type
  writer.writeBits(encodeConfig(config), 8);    // Config

  // State (game-specific)
  if (gameType === 'freecell') {
    encodeFreeCellState(writer, state);
  } else if (gameType === 'klondike') {
    encodeKlondikeState(writer, state);
  }

  // Convert to base64url
  return base64url.encode(writer.toBytes());
}

function encodeFreeCellState(writer: BitWriter, state: FreeCellGameState) {
  // Foundations
  for (const pile of state.foundations) {
    writer.writeBits(pile.length, 4);
    for (const card of pile) {
      writer.writeBits(encodeCard(card), 6);
    }
  }

  // Free cells
  for (const cell of state.freeCells) {
    writer.writeBits(cell ? 1 : 0, 1);
    if (cell) {
      writer.writeBits(encodeCard(cell), 6);
    }
  }

  // Tableau
  for (const column of state.tableau) {
    writer.writeBits(column.length, 5);
    for (const card of column) {
      writer.writeBits(encodeCard(card), 6);
    }
  }

  // Metadata
  writer.writeBits(state.moves, 16);
}

function encodeCard(card: Card): number {
  const rank = RANK_TO_NUMBER[card.value]; // A=0, 2=1, ..., K=12
  const suit = SUIT_TO_NUMBER[card.suit];  // ♠=0, ♥=1, ♣=2, ♦=3
  return (rank << 2) | suit;
}
```

### Decoding

```typescript
function decodeGamePosition(encoded: string): {
  metadata: GameMetadata;
  state: GameState;
} {
  const reader = new BitReader(base64url.decode(encoded));

  // Header
  const version = reader.readBits(8);
  if (version !== 0x01) {
    throw new Error(`Unsupported version: ${version}`);
  }

  const gameType = decodeGameType(reader.readBits(8));
  const config = decodeConfig(gameType, reader.readBits(8));

  // State
  let state: GameState;
  if (gameType === 'freecell') {
    state = decodeFreeCellState(reader, config);
  } else if (gameType === 'klondike') {
    state = decodeKlondikeState(reader, config);
  } else {
    throw new Error(`Unknown game type: ${gameType}`);
  }

  return {
    metadata: { version, gameType, config },
    state
  };
}

function decodeFreeCellState(
  reader: BitReader,
  config: GameConfig
): FreeCellGameState {
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
    state.freeCells.push(
      occupied ? decodeCard(reader.readBits(6)) : null
    );
  }

  // Tableau
  const columnCount = config.columnCount || 8;
  for (let i = 0; i < columnCount; i++) {
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

function decodeCard(encoded: number): Card {
  const rank = (encoded >> 2) & 0xF; // Upper 4 bits
  const suit = encoded & 0x3;        // Lower 2 bits

  return {
    value: NUMBER_TO_RANK[rank],
    suit: NUMBER_TO_SUIT[suit]
  };
}
```

---

## BitWriter/BitReader Utilities

### BitWriter

```typescript
class BitWriter {
  private bytes: number[] = [];
  private currentByte = 0;
  private bitPosition = 0;

  writeBits(value: number, numBits: number): void {
    for (let i = numBits - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      this.currentByte = (this.currentByte << 1) | bit;
      this.bitPosition++;

      if (this.bitPosition === 8) {
        this.bytes.push(this.currentByte);
        this.currentByte = 0;
        this.bitPosition = 0;
      }
    }
  }

  toBytes(): Uint8Array {
    // Flush remaining bits
    if (this.bitPosition > 0) {
      this.currentByte <<= (8 - this.bitPosition);
      this.bytes.push(this.currentByte);
    }
    return new Uint8Array(this.bytes);
  }
}
```

### BitReader

```typescript
class BitReader {
  private byteIndex = 0;
  private bitPosition = 0;

  constructor(private bytes: Uint8Array) {}

  readBits(numBits: number): number {
    let value = 0;

    for (let i = 0; i < numBits; i++) {
      if (this.byteIndex >= this.bytes.length) {
        throw new Error('Unexpected end of data');
      }

      const bit = (this.bytes[this.byteIndex] >> (7 - this.bitPosition)) & 1;
      value = (value << 1) | bit;
      this.bitPosition++;

      if (this.bitPosition === 8) {
        this.byteIndex++;
        this.bitPosition = 0;
      }
    }

    return value;
  }

  hasMore(): boolean {
    return this.byteIndex < this.bytes.length;
  }
}
```

---

## URL Integration

### Encoding for URLs

```typescript
function sharePosition(gameState: GameState): string {
  const encoded = encodeGamePosition('freecell', {}, gameState);
  const url = `${window.location.origin}/?p=${encoded}`;
  return url;
}

// Example output:
// https://cardgames.com/?p=v1F00d4c2a1b3...
```

### Loading from URL

```typescript
function loadFromURL(): GameState | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('p');

  if (!encoded) return null;

  const { metadata, state } = decodeGamePosition(encoded);
  return state;
}
```

---

## Validation

### State Validation

Before encoding, validate that state is legal:

```typescript
function validateState(state: GameState): boolean {
  // 1. Check total cards = 52
  const totalCards = countAllCards(state);
  if (totalCards !== 52) return false;

  // 2. Check no duplicate cards
  const seen = new Set<string>();
  for (const card of getAllCards(state)) {
    const key = `${card.suit}-${card.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }

  // 3. Check foundations are ordered
  for (const pile of state.foundations) {
    if (!isFoundationOrdered(pile)) return false;
  }

  return true;
}
```

---

## Error Handling

```typescript
class EncodingError extends Error {
  constructor(message: string) {
    super(`Encoding error: ${message}`);
    this.name = 'EncodingError';
  }
}

class DecodingError extends Error {
  constructor(message: string) {
    super(`Decoding error: ${message}`);
    this.name = 'DecodingError';
  }
}

// Usage
try {
  const encoded = encodeGamePosition(gameType, config, state);
} catch (error) {
  if (error instanceof EncodingError) {
    console.error('Failed to encode:', error.message);
  }
}
```

---

## Next: Implementation Plan

See [04-implementation.md](./04-implementation.md) for the 3-phase development plan.
