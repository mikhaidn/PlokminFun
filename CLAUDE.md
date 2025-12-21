# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FreeCell card game implementation built with React, TypeScript, and Vite. The codebase follows a modular architecture with clear separation between core logic, game rules, state management, and UI components.

See `ARCHITECTURE.md` for the long-term vision of extracting reusable libraries for other card games.

## Build & Test Commands

```bash
cd freecell-mvp

# Development
npm run dev          # Start dev server at localhost:5173

# Testing
npm run test         # Run all tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Build & Lint
npm run build        # TypeScript check + production build
npm run lint         # ESLint
```

## Project Structure

```
CardGames/
├── CLAUDE.md              # This file
├── ARCHITECTURE.md        # Long-term architectural plans
└── freecell-mvp/          # Main application
    ├── src/
    │   ├── core/          # Game-agnostic card primitives
    │   │   ├── types.ts   # Card, Suit, Value types
    │   │   ├── deck.ts    # createDeck(), shuffleWithSeed()
    │   │   ├── rng.ts     # seededRandom() for reproducible shuffles
    │   │   └── __tests__/ # Unit tests for core modules
    │   │
    │   ├── rules/         # FreeCell-specific game rules
    │   │   ├── validation.ts   # canStackOnTableau(), canStackOnFoundation()
    │   │   ├── movement.ts     # getMaxMovable(), getValidMoveableStack()
    │   │   ├── autoComplete.ts # Auto-move logic
    │   │   ├── hints.ts        # Hint calculation
    │   │   └── __tests__/      # Rule tests
    │   │
    │   ├── state/         # Game state management
    │   │   ├── gameState.ts    # GameState type, initializeGame(), checkWinCondition()
    │   │   ├── gameActions.ts  # Move operations (immutable state updates)
    │   │   └── __tests__/      # State tests
    │   │
    │   ├── components/    # React UI components
    │   │   ├── Card.tsx
    │   │   ├── EmptyCell.tsx
    │   │   ├── Tableau.tsx
    │   │   ├── FreeCellArea.tsx
    │   │   ├── FoundationArea.tsx
    │   │   └── GameBoard.tsx
    │   │
    │   ├── config/        # Configuration
    │   │   └── featureFlags.ts # Feature flag definitions
    │   │
    │   ├── App.tsx        # Main game component
    │   └── main.tsx       # Entry point
    │
    ├── package.json
    └── TESTING.md         # Manual testing guide
```

## Architecture

### Core Types (`src/core/types.ts`)
```typescript
type Suit = '♠' | '♥' | '♦' | '♣';
type Value = 'A' | '2' | ... | 'K';

interface Card {
  suit: Suit;
  value: Value;
  rank: number;  // 1-13 (A=1, K=13)
  id: string;    // e.g., "A♠", "K♥"
}
```

### Game State (`src/state/gameState.ts`)
```typescript
interface GameState {
  tableau: Card[][];        // 8 columns (main playing area)
  freeCells: (Card | null)[]; // 4 temporary holding cells
  foundations: Card[][];    // 4 suit piles (A→K)
  seed: number;             // For reproducible games
  moves: number;            // Move counter
}
```

### Seeded Random Number Generation
The game uses `seededRandom()` in `src/core/rng.ts` based on bit manipulation to ensure reproducible shuffles. Each game is identified by a numeric seed, allowing players to replay specific deals.

### Game Rules
- **Tableau stacking**: Alternating colors, descending rank (Red 7 on Black 8)
- **Foundation building**: Same suit, ascending rank (A→2→3...→K)
- **Free cells**: Single card storage only
- **Stack movement**: Limited by available free cells and empty columns

### Maximum Movable Stack Calculation
`getMaxMovable()` determines how many cards can be moved as a sequence:
```
maxMovable = (emptyFreeCells + 1) × 2^(emptyTableauColumns)
```

## Development Notes

### State Management Pattern
- State updates are immutable (return new objects, don't mutate)
- `gameActions.ts` contains all move operations
- Each action validates the move before applying

### Testing Approach
- Unit tests co-located with source files in `__tests__/` directories
- Vitest as test runner with jsdom environment
- See `TESTING.md` for manual testing scenarios

### Adding New Features
When extending the game:
- Core card utilities go in `src/core/`
- FreeCell-specific rules go in `src/rules/`
- State mutations go through `src/state/gameActions.ts`
- UI components go in `src/components/`
- Use feature flags in `src/config/featureFlags.ts` for toggleable features

### Feature Flags
Feature flags are defined in `src/config/featureFlags.ts`. Check this file before implementing new toggleable features.
