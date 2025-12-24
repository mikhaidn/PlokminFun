# Klondike Game Documentation

## Overview

Klondike is the classic solitaire card game that most people simply call "Solitaire". This implementation features both Draw-1 and Draw-3 modes, comprehensive testing (1415+ tests), and shares the same architecture and UI components as FreeCell.

**Live Demo**: https://mikhaidn.github.io/CardGames/klondike/

## Game Rules

### Objective
Move all 52 cards to the four foundation piles, building from Ace to King in each suit.

### Game Layout

```
┌─────────────────────────────────────────────┐
│  [Stock] [Waste]      [Foundations: 4]      │
│    🂠      K♠             ♠ ♥ ♦ ♣            │
├─────────────────────────────────────────────┤
│                 Tableau                     │
│  [Col1] [Col2] [Col3] [Col4] ... [Col7]    │
│    K      🂠     🂠      🂠        🂠          │
│           Q      🂠     🂠        🂠          │
│                  J      🂠        🂠          │
│                         ...      Q          │
│                                  J          │
│                                  ...        │
└─────────────────────────────────────────────┘
```

### Playing Rules

**Tableau Stacking**:
- Cards must be placed in descending rank order
- Cards must alternate colors (red on black, black on red)
- Example: Red 7 can be placed on Black 8
- Only Kings can be placed in empty tableau columns

**Foundation Building**:
- Must start with Ace
- Build up in same suit (A→2→3...→K)
- Example: 2♠ can only go on A♠

**Stock and Waste**:
- Click stock pile to draw cards to waste pile
- **Draw-1 mode**: Draw one card at a time
- **Draw-3 mode**: Draw three cards at a time (harder)
- When stock is empty, click to recycle waste pile back to stock
- Unlimited recycling allowed

**Tableau Rules**:
- 7 columns total
- Column 1 has 1 card, Column 2 has 2 cards, ..., Column 7 has 7 cards
- Top card in each column is face-up, others are face-down
- When a face-down card is revealed, it automatically flips face-up

### Valid Moves

1. **Card to Tableau**: Descending rank, alternating colors
2. **Card to Foundation**: Correct suit, ascending rank
3. **King to Empty Tableau**: Only Kings can start a new tableau pile
4. **Stack to Tableau**: Can move face-up sequences together
5. **Draw from Stock**: Reveals new cards to waste pile
6. **Waste to Tableau/Foundation**: Top waste card can be played

## Draw Modes

### Draw-1 Mode (Easier)
- Draw one card from stock at a time
- Waste pile shows one card
- Every stock card can be accessed
- Better for beginners

### Draw-3 Mode (Harder)
- Draw three cards from stock at a time
- Waste pile shows top card of the three
- Some cards may be blocked by others
- Traditional Vegas-style rules
- More strategic and challenging

**Switching Modes**:
- Available in settings menu
- Starts a new game when changed
- Preference saved to localStorage

## Architecture

### Directory Structure

```
klondike-mvp/
├── src/
│   ├── core/              # Card primitives
│   │   ├── types.ts       # Card, Suit, Value types
│   │   ├── deck.ts        # Deck creation and shuffling
│   │   ├── rng.ts         # Seeded random number generator
│   │   └── cardPack.ts    # Card utilities and validation
│   │
│   ├── rules/             # Klondike-specific game rules
│   │   ├── validation.ts  # Move validation logic
│   │   ├── helpers.ts     # Game rule helpers
│   │   └── drawModes.ts   # Draw-1 vs Draw-3 logic
│   │
│   ├── state/             # Game state management
│   │   ├── gameState.ts   # State type definitions
│   │   └── gameActions.ts # State mutation functions
│   │
│   ├── components/        # React UI components
│   │   ├── GameBoard.tsx  # Main game container
│   │   ├── Card.tsx       # Individual card rendering
│   │   ├── Tableau.tsx    # 7-column playing area
│   │   ├── StockArea.tsx  # Stock and waste piles
│   │   ├── FoundationArea.tsx # Foundation piles
│   │   └── SettingsModal.tsx  # Game settings (draw mode)
│   │
│   ├── config/            # Configuration
│   │   ├── featureFlags.ts    # Feature toggles
│   │   └── gameSettings.ts    # Draw mode settings
│   │
│   ├── utils/             # Utility functions
│   │   ├── responsiveLayout.ts # Dynamic sizing
│   │   └── autoComplete.ts     # Auto-complete detection
│   │
│   ├── App.tsx            # Main game component
│   └── main.tsx           # Entry point
│
├── public/                # Static assets (icons, manifest)
├── package.json           # Dependencies (includes @cardgames/shared)
├── vite.config.ts         # Vite config (base: /CardGames/klondike/)
└── vitest.config.ts       # Test configuration
```

## Core Types

### Game State

```typescript
interface GameState {
  tableau: Card[][];         // 7 columns
  stock: Card[];             // Face-down draw pile
  waste: Card[];             // Face-up cards from stock
  foundations: Card[][];     // 4 suit piles (A→K)

  // Card visibility
  faceUpCards: Set<string>;  // IDs of face-up cards

  // Game configuration
  drawMode: 'draw1' | 'draw3';
  seed: number;              // For reproducible games
  moves: number;             // Move counter

  // Game state
  isWon: boolean;
}
```

### Card Type

```typescript
type Suit = '♠' | '♥' | '♦' | '♣';
type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  value: Value;
  rank: number;  // 1-13 (A=1, K=13)
  id: string;    // e.g., "A♠", "K♥"
  faceUp: boolean; // Whether card is visible
}
```

## State Management

### Immutable State Pattern

All state updates return new objects:

```typescript
// ✅ CORRECT: Immutable update
function drawFromStock(state: GameState): GameState {
  const drawCount = state.drawMode === 'draw3' ? 3 : 1;
  const cardsToDraw = state.stock.slice(0, drawCount);

  return {
    ...state,
    stock: state.stock.slice(drawCount),
    waste: [...cardsToDraw.reverse(), ...state.waste],
    moves: state.moves + 1,
  };
}
```

### Game Actions

All game mutations in `src/state/gameActions.ts`:

- `drawFromStock(state)` - Draw cards from stock to waste
- `recycleWaste(state)` - Move waste back to stock when empty
- `moveCardToTableau(state, cardLocation, targetColumn)`
- `moveCardToFoundation(state, cardLocation, foundationIndex)`
- `moveStackToTableau(state, fromColumn, toColumn, stackSize)`
- `flipTopCard(state, column)` - Flip face-down card when revealed

Each action validates moves and returns new state.

## Game Initialization

### Initial Layout

```typescript
function initializeGame(seed: number, drawMode: 'draw1' | 'draw3'): GameState {
  const deck = shuffleDeck(createDeck(), seededRandom(seed));

  // Deal tableau: Column 1 gets 1 card, Column 2 gets 2 cards, etc.
  const tableau: Card[][] = [];
  let deckIndex = 0;

  for (let col = 0; col < 7; col++) {
    const column: Card[] = [];
    for (let row = 0; row <= col; row++) {
      const card = deck[deckIndex++];
      card.faceUp = (row === col); // Only top card is face-up
      column.push(card);
    }
    tableau.push(column);
  }

  // Remaining cards go to stock (face-down)
  const stock = deck.slice(deckIndex).map(card => ({ ...card, faceUp: false }));

  return {
    tableau,
    stock,
    waste: [],
    foundations: [[], [], [], []],
    faceUpCards: new Set(/* IDs of face-up cards */),
    drawMode,
    seed,
    moves: 0,
    isWon: false,
  };
}
```

## Auto-Complete

Klondike includes smart auto-complete detection:

```typescript
function canAutoComplete(state: GameState): boolean {
  // Safe to auto-complete when:
  // 1. All tableau cards are face-up
  // 2. Stock is empty
  // 3. Waste is empty

  const allTableauFaceUp = state.tableau.every(column =>
    column.every(card => card.faceUp)
  );

  return allTableauFaceUp &&
         state.stock.length === 0 &&
         state.waste.length === 0;
}

function autoCompleteGame(state: GameState): GameState {
  // Automatically move all remaining cards to foundations
  // in a valid sequence until game is won
}
```

## Testing

### Comprehensive Test Suite

**Test Statistics**: 1415+ tests covering:
- Card pack utilities
- Deck creation and shuffling
- Seeded RNG
- Game rules and validation
- State mutations
- Draw-1 and Draw-3 modes
- Auto-complete logic
- Win detection

### Test Structure

```
klondike-mvp/src/
├── core/__tests__/
│   ├── cardPack.test.ts      # 200+ tests
│   ├── deck.test.ts          # 150+ tests
│   └── rng.test.ts           # 50+ tests
│
├── rules/__tests__/
│   ├── validation.test.ts    # 300+ tests
│   └── drawModes.test.ts     # 100+ tests
│
└── state/__tests__/
    ├── gameState.test.ts     # 200+ tests
    └── gameActions.test.ts   # 400+ tests
```

### Running Tests

```bash
cd klondike-mvp

# Run all tests (1415+)
npm run test

# Watch mode (TDD)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Coverage Goals
- Core logic: >95% coverage
- Game rules: >95% coverage
- State management: >95% coverage

## Responsive Design

Klondike uses the same responsive layout system as FreeCell:

- **Viewport-based dynamic sizing** - All UI elements scale to fit screen
- **Breakpoints**: Mobile (<600px), Tablet (600-900px), Desktop (>900px)
- **Card aspect ratio**: Always maintains 5:7 (width:height)
- **Touch optimization**: Large touch targets, drag-and-drop support

See [FreeCell Responsive Design](./freecell.md#responsive-design) for detailed documentation.

## Accessibility

Klondike inherits accessibility features from FreeCell:

- **High contrast mode** - Bolder colors and borders
- **Card size presets** - Small to extra-large
- **Font size multiplier** - 1.0x to 2.0x
- **Button positioning** - Top or bottom (one-handed mode)
- **Touch target size** - Normal or large (WCAG compliant)

Settings are stored in localStorage and persist across sessions.

## Draw Mode Settings

### User Preference Storage

```typescript
// src/config/gameSettings.ts

interface GameSettings {
  drawMode: 'draw1' | 'draw3';
}

// Load from localStorage
const settings = loadGameSettings();

// Save to localStorage
saveGameSettings({ drawMode: 'draw3' });

// Stored under key: 'klondike-game-settings'
```

### Settings UI

- **Settings button** in game controls
- **Modal dialog** with draw mode selector
- **Starts new game** when draw mode changes
- **Preserves seed** for same deal in different modes (optional)

## Development Commands

```bash
# Start development server
npm run dev          # localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test         # Run all 1415+ tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# Lint code
npm run lint
```

## Key Differences from FreeCell

| Feature | FreeCell | Klondike |
|---------|----------|----------|
| **Columns** | 8 tableau columns | 7 tableau columns |
| **Storage** | 4 free cells | Stock/waste piles |
| **Draw system** | None | Draw-1 or Draw-3 |
| **Empty columns** | Any card | Only Kings |
| **Face-down cards** | None | Initially face-down |
| **Recycling** | N/A | Unlimited stock recycling |
| **Difficulty** | Moderate | Varies by draw mode |

## Key Files Reference

**Core Game Logic**:
- `src/core/types.ts` - Card types and interfaces
- `src/core/deck.ts` - Deck creation and shuffling
- `src/state/gameState.ts` - Game state type with stock/waste
- `src/state/gameActions.ts` - All game mutations including draw

**Klondike-Specific**:
- `src/rules/drawModes.ts` - Draw-1 vs Draw-3 logic
- `src/components/StockArea.tsx` - Stock and waste pile rendering
- `src/config/gameSettings.ts` - Draw mode preference storage

**UI Components**:
- `src/components/GameBoard.tsx` - Main game container
- `src/components/Tableau.tsx` - 7-column playing area
- `src/components/SettingsModal.tsx` - Draw mode settings

**Shared Library Integration**:
- Uses `@cardgames/shared` for GameControls, useGameHistory, useCardInteraction
- See [Shared Library Documentation](./shared-library.md) for details

## Future Enhancements

**Potential Features**:
- [ ] Vegas scoring mode (money-based scoring)
- [ ] Timed games with leaderboard
- [ ] Statistics tracking (win rate, best time)
- [ ] Hints system (like FreeCell)
- [ ] Alternative card backs and animations
- [ ] Daily challenge mode
