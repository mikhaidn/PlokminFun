# FreeCell Game Documentation

## Overview

FreeCell is a solitaire card game that requires strategy and planning. This implementation is built with React, TypeScript, and Vite, featuring responsive design, accessibility settings, and comprehensive game mechanics.

**Live Demo**: https://mikhaidn.github.io/PlokminFun/freecell/

## Game Rules

### Objective
Move all 52 cards to the four foundation piles, building from Ace to King in each suit.

### Game Layout

```
┌─────────────────────────────────────────────┐
│  [Free Cells: 4]      [Foundations: 4]      │
│     ○ ○ ○ ○              ♠ ♥ ♦ ♣            │
├─────────────────────────────────────────────┤
│                 Tableau                     │
│  [Col1] [Col2] [Col3] [Col4] ...  [Col8]   │
│    K      7      A      3           Q       │
│    Q      6      ...    2           J       │
│    ...    ...           ...         ...     │
└─────────────────────────────────────────────┘
```

### Playing Rules

**Tableau Stacking**:
- Cards must be placed in descending rank order
- Cards must alternate colors (red on black, black on red)
- Example: Red 7 can be placed on Black 8

**Foundation Building**:
- Must start with Ace
- Build up in same suit (A→2→3...→K)
- Example: 2♠ can only go on A♠

**Free Cells**:
- Can hold exactly one card each
- 4 free cells total
- Acts as temporary storage for strategic moves

**Stack Movement**:
- You can move multiple cards as a sequence
- Limited by available free cells and empty tableau columns
- Maximum movable stack calculated as: `(emptyFreeCells + 1) × 2^(emptyTableauColumns)`

### Valid Moves

1. **Card to Tableau**: Descending rank, alternating colors
2. **Card to Free Cell**: If free cell is empty
3. **Card to Foundation**: Correct suit, ascending rank
4. **Stack to Tableau**: If enough free cells/empty columns available
5. **Any card from Free Cell**: Can move to valid destination

## Architecture

### Directory Structure

```
freecell-mvp/
├── src/
│   ├── core/              # Game-agnostic card primitives
│   │   ├── types.ts       # Card, Suit, Value types
│   │   ├── deck.ts        # Deck creation and shuffling
│   │   ├── rng.ts         # Seeded random number generator
│   │   └── cardPack.ts    # Card utilities and validation
│   │
│   ├── rules/             # FreeCell-specific game rules
│   │   ├── validation.ts  # Move validation logic
│   │   └── helpers.ts     # Game rule helpers
│   │
│   ├── state/             # Game state management
│   │   ├── gameState.ts   # State type definitions
│   │   └── gameActions.ts # State mutation functions
│   │
│   ├── components/        # React UI components
│   │   ├── GameBoard.tsx  # Main game container
│   │   ├── Card.tsx       # Individual card rendering
│   │   ├── Tableau.tsx    # 8-column playing area
│   │   ├── FreeCellArea.tsx   # Top-left holding cells
│   │   ├── FoundationArea.tsx # Top-right foundation piles
│   │   └── SettingsModal.tsx  # Accessibility settings
│   │
│   ├── config/            # Configuration
│   │   ├── featureFlags.ts    # Feature toggles
│   │   └── accessibilitySettings.ts  # User preferences
│   │
│   ├── utils/             # Utility functions
│   │   ├── responsiveLayout.ts     # Dynamic sizing
│   │   ├── highContrastStyles.ts   # Visual accessibility
│   │   └── bugReport.ts            # Error reporting
│   │
│   ├── App.tsx            # Main game component
│   └── main.tsx           # Entry point
│
├── public/                # Static assets (icons, manifest)
├── package.json           # Dependencies (includes @plokmin/shared)
├── vite.config.ts         # Vite config (base: /PlokminFun/freecell/)
└── vitest.config.ts       # Test configuration
```

## Core Types

### Card Type

```typescript
type Suit = '♠' | '♥' | '♦' | '♣';
type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  value: Value;
  rank: number;  // 1-13 (A=1, K=13)
  id: string;    // e.g., "A♠", "K♥"
}
```

### Game State

```typescript
interface GameState {
  tableau: Card[][];         // 8 columns (main playing area)
  freeCells: (Card | null)[]; // 4 temporary holding cells
  foundations: Card[][];      // 4 suit piles (A→K)
  seed: number;               // For reproducible games
  moves: number;              // Move counter
}
```

## State Management

### Immutable State Updates

All state updates follow an immutable pattern:

```typescript
// ❌ WRONG: Direct mutation
function moveCard(state: GameState) {
  state.tableau[0].push(card); // Mutates state!
  return state;
}

// ✅ CORRECT: Return new objects
function moveCard(state: GameState): GameState {
  return {
    ...state,
    tableau: state.tableau.map((column, idx) =>
      idx === 0 ? [...column, card] : column
    ),
    moves: state.moves + 1,
  };
}
```

### Game Actions

All game mutations are in `src/state/gameActions.ts`:

- `moveCardToTableau(state, cardLocation, targetColumn)`
- `moveCardToFreeCell(state, cardLocation, freeCellIndex)`
- `moveCardToFoundation(state, cardLocation, foundationIndex)`
- `moveStackToTableau(state, fromColumn, toColumn, stackSize)`

Each action:
1. Validates the move
2. Returns new state if valid
3. Returns unchanged state if invalid

## Seeded Random Number Generation

The game uses **XorShift algorithm** for reproducible shuffles:

```typescript
// src/core/rng.ts
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 0x100000000);
  };
}
```

**Usage**: Each game is identified by a numeric seed, allowing players to replay specific deals.

```typescript
// Create a reproducible game
const seed = 12345;
const rng = seededRandom(seed);
const shuffledDeck = shuffleDeck(createDeck(), rng);
```

## Responsive Design

### Dynamic Sizing System

FreeCell uses **viewport-based dynamic sizing** that scales all UI elements to fit any screen size:

```typescript
// src/utils/responsiveLayout.ts
interface LayoutSizes {
  cardWidth: number;      // Calculated card width
  cardHeight: number;     // Calculated card height (maintains 5:7 ratio)
  cardGap: number;        // Gap between cards (scaled)
  cardOverlap: number;    // Vertical overlap in tableau (scaled)
  fontSize: {
    large: number;        // Suit symbol size
    medium: number;       // Card value size
    small: number;        // Corner text size
  };
}

function calculateLayoutSizes(
  viewportWidth: number,
  viewportHeight: number,
  maxCardWidth?: number,         // Override for accessibility
  fontMultiplier?: number         // Override for accessibility
): LayoutSizes;
```

**Algorithm**:
1. Calculate available space (viewport - padding - UI elements)
2. Determine optimal card width based on:
   - Horizontal constraint: Fitting 8 tableau columns + gaps
   - Vertical constraint: Fitting stacked cards
3. Use the smaller constraint to ensure everything fits
4. Scale all dimensions proportionally

**Constraints**:
- Maximum card size: 60×84px (default)
- Minimum card size: Dynamically calculated
- Aspect ratio: Always 5:7 (width:height)

### Breakpoints

**Mobile** (< 600px):
- Compact header layout
- Reduced padding (12px vs 24px)
- Smaller buttons and text

**Tablet** (600-900px):
- Medium sizing
- Side-by-side header layout

**Desktop** (> 900px):
- Full-size layout
- Maximum card size (60×84px)

### Window Resize Handling

```typescript
useEffect(() => {
  const handleResize = () => {
    setLayoutSizes(calculateLayoutSizes(
      window.innerWidth,
      window.innerHeight,
      getMaxCardWidth(accessibilitySettings.cardSize),
      accessibilitySettings.fontSizeMultiplier
    ));
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
}, [accessibilitySettings]);
```

## Accessibility Features

### Available Settings

**1. High Contrast Mode**
- Bolder card borders (4px vs 1-2px)
- Stronger colors: Pure black (#000) for spades/clubs, bright red (#ff0000) for hearts/diamonds
- Enhanced selection indicators
- Better for vision impairments or bright sunlight

**2. Card Size** (small | medium | large | extra-large)
- Small: Up to 60px width (default)
- Medium: Up to 75px width (25% larger)
- Large: Up to 90px width (50% larger)
- Extra Large: Up to 110px width (80% larger)

**3. Font Size Multiplier** (1.0 - 2.0)
- Scales all text independently from card size
- Range: 1.0x to 2.0x (double size)

**4. Button Position** (top | bottom)
- Top: Default position in header
- Bottom: Fixed position at bottom (one-handed mode for mobile)

**5. Touch Target Size** (normal | large)
- Normal: Standard button sizing
- Large: Minimum 44px height (WCAG AAA guideline)

### Settings Storage

```typescript
// src/config/accessibilitySettings.ts

// Load settings from localStorage
const settings = loadAccessibilitySettings();

// Save settings to localStorage
saveAccessibilitySettings(settings);

// Stored under key: 'freecell-accessibility-settings'
```

### High Contrast Styling

```typescript
// src/utils/highContrastStyles.ts

// Get colors for a card
const colors = getCardColors(card, highContrastMode, isSelected, isHighlighted);
// Returns: { text, background, border, borderWidth }

// Get box shadow based on state
const boxShadow = getCardBoxShadow(isSelected, isHighlighted, highContrastMode);
```

## Testing

### Test Structure

```
freecell-mvp/src/
├── core/__tests__/        # Card primitive tests
├── rules/__tests__/       # Rule validation tests
├── state/__tests__/       # State management tests
└── utils/__tests__/       # Utility function tests
```

### Running Tests

```bash
cd freecell-mvp

# Run all tests
npm run test

# Watch mode (TDD)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Coverage Goals
- Core logic: >95% coverage
- Game rules: >90% coverage
- State management: >90% coverage

## Development Commands

```bash
# Start development server
npm run dev          # localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Key Files Reference

**Core Game Logic**:
- `src/core/types.ts` - Card types and interfaces
- `src/core/deck.ts` - Deck creation and shuffling
- `src/core/rng.ts` - Seeded random number generator
- `src/state/gameState.ts` - Game state type
- `src/state/gameActions.ts` - All game mutations

**UI Components**:
- `src/components/GameBoard.tsx` - Main game container
- `src/components/Card.tsx` - Individual card rendering
- `src/components/Tableau.tsx` - 8-column playing area

**Configuration**:
- `src/config/accessibilitySettings.ts` - User preferences
- `src/config/featureFlags.ts` - Feature toggles
- `vite.config.ts` - Build configuration

**Shared Library Integration**:
- Uses `@plokmin/shared` for GameControls, useGameHistory, useCardInteraction
- See [Shared Library Documentation](./shared-library.md) for details
