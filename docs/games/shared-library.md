# @plokmin/shared Library Documentation

## Overview

The `@plokmin/shared` library is a collection of reusable React components, hooks, utilities, and TypeScript types that are shared across all card games in the CardGames monorepo. It provides a consistent UI/UX and eliminates code duplication.

**Package location**: `/shared/`

## Architecture

### Library Structure

```
shared/
├── components/            # Shared React components
│   ├── GameControls.tsx   # New Game, Undo, Redo, Settings, Help
│   └── DraggingCardPreview.tsx  # Visual feedback during drag
│
├── hooks/                 # Shared React hooks
│   ├── useGameHistory.ts  # Undo/redo state management
│   └── useCardInteraction.ts  # Unified drag-and-drop + click-to-select
│
├── utils/                 # Shared utilities
│   └── HistoryManager.ts  # Generic history management class
│
├── types/                 # Shared TypeScript types
│   └── index.ts           # Common type definitions
│
├── index.ts               # Barrel exports (main entry point)
├── package.json           # Library package configuration
└── vitest.config.ts       # Test configuration
```

## Installation & Usage

### In Game Packages

Both FreeCell and Klondike depend on `@plokmin/shared`:

```json
// freecell-mvp/package.json or klondike-mvp/package.json
{
  "dependencies": {
    "@plokmin/shared": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### Importing from Shared Library

```typescript
// Import components
import { GameControls, DraggingCardPreview } from '@plokmin/shared';

// Import hooks
import { useGameHistory, useCardInteraction } from '@plokmin/shared';

// Import utilities
import { HistoryManager } from '@plokmin/shared';

// Import types
import type { CardLocation, DragState } from '@plokmin/shared';
```

## Components

### GameControls

A consistent game control bar with New Game, Undo, Redo, Settings, and Help buttons.

**Features**:
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y, N, H)
- Responsive layout (stacks on mobile)
- Accessibility labels
- Customizable button positioning (top/bottom)
- Conditional rendering (hide buttons based on game state)

**Props**:

```typescript
interface GameControlsProps {
  // Action handlers
  onNewGame: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;

  // State flags
  canUndo?: boolean;
  canRedo?: boolean;

  // Layout options
  buttonPosition?: 'top' | 'bottom';
  touchTargetSize?: 'normal' | 'large';

  // Optional customization
  className?: string;
  style?: React.CSSProperties;
}
```

**Usage Example**:

```typescript
import { GameControls } from '@plokmin/shared';

function GameBoard() {
  const { undo, redo, canUndo, canRedo } = useGameHistory(gameState, setGameState);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div>
      <GameControls
        onNewGame={() => setGameState(initializeGame())}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSettings={() => setShowSettings(true)}
        onHelp={() => setShowHelp(true)}
        buttonPosition="top"
        touchTargetSize="large"
      />

      {/* Game area */}
    </div>
  );
}
```

**Keyboard Shortcuts**:
- `N` - New Game
- `Ctrl+Z` or `Cmd+Z` - Undo
- `Ctrl+Y` or `Cmd+Y` - Redo
- `H` - Help

### DraggingCardPreview

Provides visual feedback during drag-and-drop operations, rendering a semi-transparent preview of the card being dragged.

**Features**:
- Follows cursor/touch position
- Renders single cards or stacks
- Maintains card styling and dimensions
- Smooth positioning with CSS transforms

**Props**:

```typescript
interface DraggingCardPreviewProps {
  cards: Card[];           // Card(s) being dragged
  position: { x: number; y: number };  // Current cursor position
  cardWidth: number;       // Card dimensions
  cardHeight: number;
  fontSize: {              // Text sizing
    large: number;
    medium: number;
    small: number;
  };
  highContrastMode?: boolean;
  renderCard: (card: Card, index: number) => React.ReactNode;
}
```

**Usage Example**:

```typescript
import { DraggingCardPreview, useCardInteraction } from '@plokmin/shared';

function GameBoard() {
  const {
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    // ...
  } = useCardInteraction({
    onMove: handleCardMove,
    // ...
  });

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Game area */}

      {dragState.isDragging && dragState.cards && (
        <DraggingCardPreview
          cards={dragState.cards}
          position={dragState.position}
          cardWidth={layoutSizes.cardWidth}
          cardHeight={layoutSizes.cardHeight}
          fontSize={layoutSizes.fontSize}
          renderCard={(card, index) => (
            <Card
              card={card}
              cardWidth={layoutSizes.cardWidth}
              cardHeight={layoutSizes.cardHeight}
              fontSize={layoutSizes.fontSize}
            />
          )}
        />
      )}
    </div>
  );
}
```

## Hooks

### useGameHistory

Manages undo/redo functionality with state snapshots and history navigation.

**Features**:
- Automatic state snapshot management
- Configurable history limit (default: 100)
- Push/undo/redo operations
- Can undo/can redo state tracking
- Works with any state type (generic)

**API**:

```typescript
function useGameHistory<T>(
  currentState: T,
  setCurrentState: (state: T) => void,
  maxHistorySize?: number  // Default: 100
): {
  push: (state: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
};
```

**Usage Example**:

```typescript
import { useGameHistory } from '@plokmin/shared';

function GameBoard() {
  const [gameState, setGameState] = useState(initializeGame());

  const {
    push,      // Save current state to history
    undo,      // Go back one state
    redo,      // Go forward one state
    canUndo,   // Boolean: can undo?
    canRedo,   // Boolean: can redo?
    clear,     // Clear all history
  } = useGameHistory(gameState, setGameState, 100);

  // After making a move
  const handleMove = (from: Location, to: Location) => {
    const newState = applyMove(gameState, from, to);
    setGameState(newState);
    push(newState);  // Save to history
  };

  // On new game
  const handleNewGame = () => {
    const newState = initializeGame();
    setGameState(newState);
    clear();  // Clear undo/redo history
  };

  return (
    <GameControls
      onNewGame={handleNewGame}
      onUndo={undo}
      onRedo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
    />
  );
}
```

**Implementation Details**:
- Uses `HistoryManager` class internally
- Stores state snapshots in array
- Maintains current position pointer
- Pushing a new state clears redo history

### useCardInteraction

Unified hook for drag-and-drop and click-to-select card interactions, supporting both mouse and touch events.

**Features**:
- Mouse drag-and-drop
- Touch drag-and-drop
- Click-to-select pattern
- Drag threshold detection (prevents accidental drags)
- Position tracking
- Works with single cards or card stacks

**API**:

```typescript
interface UseCardInteractionParams<TLocation> {
  onMove: (from: TLocation, to: TLocation) => boolean;
  onSelect?: (location: TLocation) => void;
  onDeselect?: () => void;
  getCardsAtLocation: (location: TLocation) => Card[];
  dragThreshold?: number;  // Pixels before drag starts (default: 5)
}

interface UseCardInteractionReturn<TLocation> {
  // Mouse event handlers
  handleMouseDown: (location: TLocation) => (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;

  // Touch event handlers
  handleTouchStart: (location: TLocation) => (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;

  // Click event handler
  handleClick: (location: TLocation) => () => void;

  // Current state
  dragState: DragState<TLocation>;
  selectedCard: TLocation | null;
}

interface DragState<TLocation> {
  isDragging: boolean;
  startLocation: TLocation | null;
  cards: Card[] | null;
  position: { x: number; y: number };
}
```

**Usage Example**:

```typescript
import { useCardInteraction } from '@plokmin/shared';

function GameBoard() {
  const [gameState, setGameState] = useState(initializeGame());
  const [selectedCard, setSelectedCard] = useState<CardLocation | null>(null);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleClick,
    dragState,
  } = useCardInteraction({
    onMove: (from, to) => {
      const newState = applyMove(gameState, from, to);
      if (newState !== gameState) {
        setGameState(newState);
        push(newState);
        return true;  // Move succeeded
      }
      return false;  // Move failed
    },
    onSelect: (location) => setSelectedCard(location),
    onDeselect: () => setSelectedCard(null),
    getCardsAtLocation: (location) => {
      // Return card(s) at the given location
      if (location.area === 'tableau') {
        return gameState.tableau[location.column].slice(location.cardIndex);
      }
      // ...other areas
    },
    dragThreshold: 5,  // 5px movement before drag starts
  });

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Render cards with event handlers */}
      {gameState.tableau.map((column, colIndex) =>
        column.map((card, cardIndex) => (
          <Card
            key={card.id}
            card={card}
            onMouseDown={handleMouseDown({ area: 'tableau', column: colIndex, cardIndex })}
            onTouchStart={handleTouchStart({ area: 'tableau', column: colIndex, cardIndex })}
            onClick={handleClick({ area: 'tableau', column: colIndex, cardIndex })}
            isSelected={
              selectedCard?.area === 'tableau' &&
              selectedCard?.column === colIndex &&
              selectedCard?.cardIndex === cardIndex
            }
          />
        ))
      )}

      {/* Drag preview */}
      {dragState.isDragging && dragState.cards && (
        <DraggingCardPreview
          cards={dragState.cards}
          position={dragState.position}
          // ...
        />
      )}
    </div>
  );
}
```

## Utilities

### HistoryManager

Generic class for managing state history with undo/redo functionality.

**Features**:
- Generic type support (works with any state)
- Configurable max history size
- Push/undo/redo operations
- State inspection methods

**API**:

```typescript
class HistoryManager<T> {
  constructor(maxSize?: number);  // Default: 100

  // Add state to history
  push(state: T): void;

  // Navigate history
  undo(): T | undefined;
  redo(): T | undefined;

  // Query state
  canUndo(): boolean;
  canRedo(): boolean;
  getCurrentState(): T | undefined;

  // Clear history
  clear(): void;

  // Inspection
  getHistorySize(): number;
  getCurrentIndex(): number;
}
```

**Usage Example**:

```typescript
import { HistoryManager } from '@plokmin/shared';

interface GameState {
  tableau: Card[][];
  moves: number;
}

const history = new HistoryManager<GameState>(100);

// Initial state
const initialState = initializeGame();
history.push(initialState);

// After a move
const newState = applyMove(initialState, from, to);
history.push(newState);

// Undo
if (history.canUndo()) {
  const previousState = history.undo();
  setGameState(previousState);
}

// Redo
if (history.canRedo()) {
  const nextState = history.redo();
  setGameState(nextState);
}
```

**Implementation Notes**:
- Uses circular buffer for memory efficiency
- Pushing new state clears redo stack
- Thread-safe (no side effects)

## Types

### Common Types

```typescript
// Card location in the game
export interface CardLocation {
  area: 'tableau' | 'foundation' | 'freeCell' | 'stock' | 'waste';
  column?: number;      // For tableau and foundations
  cardIndex?: number;   // For specific card in stack
  cellIndex?: number;   // For free cells
}

// Drag state for card interactions
export interface DragState<TLocation = CardLocation> {
  isDragging: boolean;
  startLocation: TLocation | null;
  cards: Card[] | null;
  position: { x: number; y: number };
}

// Game history state
export interface HistoryState<T> {
  states: T[];
  currentIndex: number;
  maxSize: number;
}
```

## Development

### Building the Library

```bash
cd shared

# Install dependencies
npm install

# Run tests
npm run test

# Watch mode for TDD
npm run test:watch

# Coverage report
npm run test:coverage
```

### Testing

The shared library includes comprehensive tests for:
- `HistoryManager` class
- `useGameHistory` hook
- `useCardInteraction` hook
- Component rendering
- Event handling

```bash
# Run all shared library tests
cd shared
npm run test
```

## Integration Checklist

When adding `@plokmin/shared` to a new game:

- [ ] Add dependency in `package.json`: `"@plokmin/shared": "workspace:*"`
- [ ] Import `GameControls` component
- [ ] Implement `useGameHistory` hook for undo/redo
- [ ] Implement `useCardInteraction` hook for drag-and-drop
- [ ] Add `DraggingCardPreview` for visual feedback
- [ ] Define game-specific `CardLocation` type
- [ ] Handle keyboard shortcuts in `GameControls`
- [ ] Test all interactions (mouse, touch, keyboard)
- [ ] Remove any local duplicates of shared code

## Benefits of Shared Library

**Code Reuse**:
- Eliminates duplicate code across games
- Single source of truth for common components
- Consistent UI/UX across all games

**Maintainability**:
- Bug fixes in one place benefit all games
- New features can be added to all games simultaneously
- Easier to refactor and improve

**Consistency**:
- Same keyboard shortcuts across games
- Same visual feedback during interactions
- Same accessibility features

**Testing**:
- Shared components have comprehensive tests
- Games can focus on game-specific logic testing
- Higher overall code coverage

## Migration Notes

**RFC-004** documented the migration from game-specific implementations to the shared library:

**Phase 1**: Extract shared components (GameControls, DraggingCardPreview)
**Phase 2**: Extract shared hooks (useGameHistory, useCardInteraction)
**Phase 3**: Consolidate and remove duplicates

Both FreeCell and Klondike now exclusively use `@plokmin/shared` for:
- Game controls
- Undo/redo functionality
- Drag-and-drop interactions
- Card interaction patterns

## Related Documentation

- [FreeCell Game Documentation](./freecell.md)
- [Klondike Game Documentation](./klondike.md)
- [RFC-004: Shared Interaction System](../../rfcs/004-shared-interaction-system.md)
