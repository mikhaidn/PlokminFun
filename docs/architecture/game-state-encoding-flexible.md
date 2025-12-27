# Flexible Game State Encoding - Design Exploration

**Goal:** Support multiple game types, variants, and configurations in a unified encoding format.

---

## Key Questions

1. **Should state include game type?** → YES
   - Enables standalone sharing (no external context needed)
   - QR codes / text sharing work without URL
   - Self-describing format is easier to debug

2. **How to handle variants?** (draw-1 vs draw-3, mini-games, etc.)
   - Need flexible configuration encoding
   - Avoid hardcoding every variant

3. **How to stay compact?**
   - Variants add ~1-3 bytes overhead
   - Still well under URL limits

---

## Candidate Representations

### Option A: Self-Describing Header (Recommended)

**Format:**
```
[VERSION:1][GAME_TYPE:1][CONFIG_BITS:1-2][STATE_DATA:N]
```

**Example for Klondike Draw-3:**
```
v1 K 03 [state...]
│  │ │  └── State data
│  │ └────── Config: draw-3 mode
│  └──────── Game: Klondike
└─────────── Version: 1
```

**Advantages:**
- ✅ Self-contained (works in QR codes, text messages)
- ✅ Easy to debug (human-readable prefix)
- ✅ Supports future games without breaking old encodings
- ✅ Config bits flexible for variants

**Size Cost:** +2-3 bytes (negligible)

---

### Option B: URL Parameter Metadata

**Format:**
```
url?game=klondike&mode=draw3&p=[state_only]
```

**Advantages:**
- ✅ Clean separation of concerns
- ✅ Slightly smaller state encoding
- ✅ Easy to parse/modify URL params

**Disadvantages:**
- ❌ Not self-describing (can't share just the encoded string)
- ❌ Requires URL context
- ❌ Harder to support QR codes

---

### Option C: Game Registry IDs

**Format:**
```
[GAME_ID:1][STATE_DATA:N]

where GAME_ID maps to:
  0x00 = FreeCell Standard
  0x01 = Klondike Draw-1
  0x02 = Klondike Draw-3
  0x03 = Spider 1-Suit
  ...
```

**Advantages:**
- ✅ Most compact (1 byte overhead)
- ✅ Fast lookup

**Disadvantages:**
- ❌ Need registry (can't decode unknown IDs)
- ❌ Hard to add custom variants
- ❌ Registry must be versioned

---

## Recommended: Option A - Self-Describing Header

Let's design a flexible config encoding that supports:

### 1. Standard Games
```typescript
// FreeCell - no variants needed
v1 F 00 [state...]
   │ └── Config byte: 0x00 (standard)
   └──── Game type: F

// Klondike Draw-1
v1 K 01 [state...]
       └── Config: 0x01 (draw-1)

// Klondike Draw-3
v1 K 03 [state...]
       └── Config: 0x03 (draw-3)

// Spider 1-Suit
v1 S 01 [state...]
       └── Config: 0x01 (1 suit)

// Spider 4-Suit
v1 S 04 [state...]
       └── Config: 0x04 (4 suits)
```

### 2. Mini/Tutorial Variants

For educational mini-games (fewer cards, simplified rules):

```typescript
// FreeCell Tutorial (2 suits, 4 columns only)
v1 F M2 [state...]
     │└── Mini variant: 2 suits
     └─── 'M' flag indicates mini-game

// Klondike Mini (3 columns, draw-1)
v1 K M3 [state...]
     │└── 3 tableau columns
     └─── Mini variant
```

### 3. Custom/Daily Challenge Variants

For special challenges with rule tweaks:

```typescript
// Daily challenge with custom rules
v1 K DC [state...] [rule_flags:2]
     │└── 'D' = Daily, 'C' = Custom config follows
     └─── Extended config bytes follow state

Rule flags example (2 bytes):
  Bit 0: Vegas scoring
  Bit 1: Timed mode
  Bit 2: Undo disabled
  Bit 3-15: Reserved
```

---

## Detailed Header Format

### Version Byte (1 byte)

```
0x01 = v1 (current)
0x02 = v2 (future, if format changes)
...
```

Purpose: Allow future format changes without breaking old shares

### Game Type Byte (1 byte)

```
ASCII codes for readability:
0x46 = 'F' = FreeCell
0x4B = 'K' = Klondike
0x53 = 'S' = Spider
0x50 = 'P' = Pyramid (future)
0x47 = 'G' = Golf (future)
...
```

Why ASCII? Human-readable in hex dumps, easier debugging

### Config Byte(s) (1-2 bytes, game-specific)

#### FreeCell Config (1 byte)

```
0x00 = Standard (8 columns, 4 free cells, 4 foundations)
0x01 = Mini-2 (4 columns, 2 suits)
0x02 = Mini-4 (4 columns, 4 suits)
0x0C = Custom (config flags follow)
```

#### Klondike Config (1 byte)

```
Bits 0-1: Draw mode
  00 = Draw-1
  01 = Draw-3
  10 = Draw-5 (variant)
  11 = Reserved

Bit 2: Vegas scoring
Bit 3: Timed mode
Bits 4-7: Tableau columns (3-7)
```

Example:
```
0x01 = Draw-1, 7 columns, no Vegas, no timer
0x03 = Draw-3, 7 columns, no Vegas, no timer
0x43 = Draw-3, 4 columns (mini), no Vegas
```

#### Spider Config (1 byte)

```
Bits 0-1: Suit count
  00 = 1-suit
  01 = 2-suit
  10 = 4-suit
  11 = Reserved

Bits 2-7: Reserved for variants
```

---

## Encoding/Decoding API

```typescript
interface GameMetadata {
  version: number;
  gameType: 'freecell' | 'klondike' | 'spider';
  config: GameConfig;
}

interface GameConfig {
  // Klondike
  drawMode?: 1 | 3 | 5;
  tableauColumns?: number;
  vegasScoring?: boolean;

  // Spider
  suitCount?: 1 | 2 | 4;

  // FreeCell
  freeCellCount?: number;

  // Universal
  mini?: boolean;
  custom?: boolean;
}

// High-level API
function encodeGamePosition(
  gameType: string,
  config: GameConfig,
  state: GameState
): string {
  const bits = new BitWriter();

  // Header
  bits.writeBits(1, 8); // Version 1
  bits.writeBits(encodeGameType(gameType), 8);
  bits.writeBits(encodeConfig(gameType, config), 8);

  // State (game-specific)
  encodeStateData(bits, gameType, state);

  return base64url.encode(bits.toBytes());
}

function decodeGamePosition(encoded: string): {
  metadata: GameMetadata;
  state: GameState;
} {
  const bits = new BitReader(base64url.decode(encoded));

  const version = bits.readBits(8);
  const gameType = decodeGameType(bits.readBits(8));
  const config = decodeConfig(gameType, bits.readBits(8));

  const state = decodeStateData(bits, gameType, config);

  return { metadata: { version, gameType, config }, state };
}
```

---

## Size Analysis with Variants

### FreeCell Standard
```
Header:  3 bytes (version + game + config)
State:   ~55 bytes (typical mid-game)
Total:   ~58 bytes → ~77 chars base64url
```

### Klondike Draw-3
```
Header:  3 bytes
State:   ~80 bytes (typical, includes stock/waste)
Total:   ~83 bytes → ~111 chars base64url
```

### FreeCell Mini (Tutorial)
```
Header:  3 bytes
State:   ~25 bytes (fewer cards, fewer columns)
Total:   ~28 bytes → ~37 chars base64url
```

**All well under URL limits (2000 chars)**

---

## URL Format with Metadata

**Option 1: All in 'p' parameter (recommended)**
```
https://cardgames.com/?p=v1K03...
                          ││││
                          │││└── State data
                          ││└─── Config (draw-3)
                          │└──── Game type (K)
                          └───── Version
```

Decoder automatically detects game type from encoded string.

**Option 2: Redundant game param (for routing)**
```
https://cardgames.com/klondike?p=v1K03...
                     ────┬────
                         └──── For routing, but 'p' is self-describing
```

Useful for SPA routing, but state encoding is still self-contained.

---

## Handling Mini-Games / Tutorials

### Use Cases

1. **Tutorial Mode**: Simplified game for learning
   ```
   FreeCell Mini: 4 columns, 2 suits, 2 free cells
   → Easier to learn, faster games
   ```

2. **Quick Play**: Shorter games for mobile
   ```
   Klondike 3-Column: Less thinking, quicker wins
   ```

3. **Daily Challenges**: Curated difficulty levels
   ```
   Easy:   Mini variant
   Medium: Standard
   Hard:   Full complexity + time limit
   ```

### Encoding Strategy

**Mini flag in config byte:**

```typescript
// FreeCell standard
v1 F 00 [state with 8 columns, 52 cards]

// FreeCell mini (4 columns, 26 cards)
v1 F M4 [state with 4 columns, 26 cards]
       └── 'M' flag + column count

// Or use bit packing:
Config byte structure for FreeCell:
  Bit 0:   Mini mode flag
  Bit 1-3: Column count (0-7, where 0=default 8)
  Bit 4-6: Free cell count (0-7, where 0=default 4)
  Bit 7:   Reserved
```

### State Differences

Mini-games have:
- **Fewer cards** → Smaller state encoding
- **Fewer piles** → Less location data
- **Same structure** → Use same encoder/decoder logic

Example state sizes:
```
FreeCell Standard (52 cards):  ~55 bytes
FreeCell Mini-4 (26 cards):    ~28 bytes
FreeCell Mini-2 (13 cards):    ~15 bytes
```

---

## Implementation Recommendations

### Phase 1: Core Structure (Do Now)
1. Implement **self-describing header** format
2. Support **FreeCell standard** + **Klondike draw-1/draw-3**
3. Define config byte structure for each game
4. Add tests for round-trip encoding

### Phase 2: Variants (Later)
1. Add mini-game configs
2. Implement Spider variants (1/2/4 suit)
3. Add custom config flags

### Phase 3: Extensions (Future)
1. Extended configs (2+ bytes for complex variants)
2. Metadata (creator, difficulty, title)
3. Compression (if needed)

---

## Example: Daily Challenge System

```typescript
// Generate daily challenge
function generateDailyChallenge(date: Date): string {
  const gameType = selectGameType(date); // Rotate games
  const config = generateDifficulty(date); // Scale difficulty
  const state = generatePosition(date, gameType, config);

  return encodeGamePosition(gameType, config, state);
}

// Example daily challenges:
// Monday: FreeCell Standard (medium)
v1 F 00 [state with strategic position]

// Tuesday: Klondike Draw-3 (hard)
v1 K 03 [state with challenging position]

// Wednesday: FreeCell Mini-4 (easy)
v1 F M4 [state with simple position]
```

All players load same encoded position, play from identical start state!

---

## Advantages of This Design

| Feature | Benefit |
|---------|---------|
| **Self-describing** | Works in QR, text, any medium |
| **Compact** | ~3 byte overhead, negligible |
| **Extensible** | Add games without breaking format |
| **Debuggable** | ASCII game codes, clear structure |
| **Variant-friendly** | Bit-packed configs support many variants |
| **Future-proof** | Version byte allows format evolution |

---

## Next Steps

1. Implement `BitWriter`/`BitReader` utilities
2. Create header encoding functions
3. Implement FreeCell position encoding
4. Add Klondike with draw mode support
5. Test with various game states and variants

**Recommendation:** Start with standard games (FreeCell, Klondike Draw-1/3), add mini variants in Phase 2.
