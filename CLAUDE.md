# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FreeCell card game implementation built as a React component. The codebase is a single-file React application (`claudeprototype.jsx`) that implements a complete, playable FreeCell game with seeded random number generation, game history tracking, and responsive design.

## Architecture

### Core Game State
- **gameState**: The primary state object containing:
  - `tableau`: 8 columns of cards (the main playing area)
  - `freeCells`: 4 temporary holding cells for single cards
  - `foundations`: 4 stacks where cards are built up by suit (A→K)
- **moveHistory**: Array of game states for undo functionality
- **gameHistory**: Persistent record of completed games (stored via `window.storage`)

### Seeded Random Number Generation
The game uses a custom seeded RNG (`seededRandom`) based on bit manipulation to ensure reproducible shuffles. Each game is identified by a numeric seed, allowing players to replay specific deals.

### Game Logic Components
- **Card Movement**: Supports both click-to-select and drag-and-drop interactions
- **Stack Movement**: Can move sequences of cards that form valid descending alternating-color stacks (limited by available free cells and empty columns)
- **Auto-completion**: Automatically moves safe cards to foundations when they meet criteria (rank ≤ minimum foundation rank + 2)
- **Validation**: `canStackOnTableau()` and `canStackOnFoundation()` enforce FreeCell rules

### UI Architecture
- **Responsive Design**: Uses `isCompact` state to adapt layout based on viewport size (threshold: 520px width or 700px height)
- **Component Hierarchy**:
  - `Card`: Individual card rendering with drag/select states
  - `TableauColumn`: Column of stacked cards with cascade display
  - `EmptyCell`: Placeholder for free cells and foundation spots
  - `MenuModal`: Game menu with seed input and new game options
  - `HistoryModal`: Statistics and previous games list

### State Management Patterns
- Deep cloning (`JSON.parse(JSON.stringify())`) is used for immutable state updates
- Move history is appended after each valid move for undo support
- Game recording happens once on completion to prevent duplicate history entries

### Storage Integration
The game assumes a `window.storage` API with async `get()` and `set()` methods for persisting game history. This appears to be a custom storage abstraction (not standard browser localStorage).

## Key Algorithms

### Maximum Movable Stack Calculation
`getMaxMovable()` determines how many cards can be moved as a sequence:
```
maxMovable = (emptyFreeCells + 1) × 2^(emptyTableauColumns)
```

### Auto-move Logic
Cards are automatically moved to foundations when:
1. The card can legally stack on a foundation (correct suit and rank)
2. The card's rank ≤ minimum foundation rank + 2 (ensures safe moves)

## Development Notes

### File Structure
This is a single-file application. The entire game logic, UI, and styling are contained in `claudeprototype.jsx`.

### Styling Approach
All styles are inline JavaScript objects. The design uses:
- Google Fonts: 'Crimson Text' for typography
- CSS-in-JS with computed responsive values
- Gradient background with SVG noise texture overlay
- Card colors: Red suits (#c41e3a) and Black suits (#1a1a2e)

### Testing a Specific Seed
To test a specific game configuration, use the seed input feature in the menu or modify `initGameWithSeed()` to accept a specific seed value during development.

### Adding New Features
When extending the game:
- Card movement logic should update `gameState`, call `saveState()`, and increment `moves`
- New UI elements should respect the `isCompact` flag for responsive sizing
- Game validation rules are centralized in `canStackOnTableau()` and `canStackOnFoundation()`
