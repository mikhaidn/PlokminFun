# Solution Overview

## High-Level Approach

Consolidate movement mechanics through four key changes:

1. **Extract shared validation rules** - Move color/rank checking to `@cardgames/shared`
2. **Standardize on cardCount** - Use count-based selection (not index-based)
3. **Use useCardInteraction hook** - Single hook for all click/drag/touch interactions
4. **Generic move execution** - Adopt Klondike's `moveCards(from, to, count)` pattern

## Architecture

```
┌─────────────────────────────────────────┐
│         Game Component (FreeCell/Klondike)         │
├─────────────────────────────────────────┤
│  - validateMove(from, to) → boolean     │
│  - executeMove(from, to) → GameState    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│    useCardInteraction (shared hook)     │
├─────────────────────────────────────────┤
│  - Handles click/drag/touch events      │
│  - Manages selection state              │
│  - Delegates validation to game         │
│  - Calls executeMove on valid moves     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Shared Validation Rules (shared)      │
├─────────────────────────────────────────┤
│  - canStackDescending()                 │
│  - canStackOnFoundation()               │
│  - isValidTableauSequence()             │
│  - hasAlternatingColors()               │
└─────────────────────────────────────────┘
```

## GameLocation Type

Unified location type supporting both games:

```typescript
export interface GameLocation {
  /** Type of location (tableau column, foundation pile, etc.) */
  type: 'tableau' | 'foundation' | 'waste' | 'stock' | 'freeCell';

  /** Index of the column/pile (0-based) */
  index: number;

  /** Number of cards to move (default: 1 for single card moves) */
  cardCount?: number;
}
```

## Validation Interface

Games provide validation logic via config:

```typescript
export interface CardInteractionConfig {
  // Returns true if move is valid
  canMove: (from: GameLocation, to: GameLocation) => boolean;

  // Executes the move (assumes validation passed)
  executeMove: (from: GameLocation, to: GameLocation) => void;

  // Optional: Get card at location for UI feedback
  getCardAtLocation?: (location: GameLocation) => Card | Card[] | null;
}
```

## Shared Validation Rules

| Validation Type | Location | Rationale |
|----------------|----------|-----------|
| Alternating colors | `shared/rules/` | Universal solitaire rule |
| Descending rank | `shared/rules/` | Universal solitaire rule |
| Ascending rank | `shared/rules/` | Universal solitaire rule |
| Foundation stacking | `shared/rules/` | Ace→King is standard |
| Sequence validation | `shared/rules/` | Generic array traversal |
| Empty column rules | Game-specific | FreeCell: any card, Klondike: kings only |
| Max movable calculation | Game-specific | FreeCell: supermoves, Klondike: simple |
| Face-down card handling | Game-specific | Klondike-only concept |

## Game Implementation Pattern

```typescript
// Game-specific validator
const canMove = useCallback((from: GameLocation, to: GameLocation): boolean => {
  return validateMove(gameState, from, to);
}, [gameState]);

const executeMove = useCallback((from: GameLocation, to: GameLocation): void => {
  const newState = moveCards(gameState, from, to);
  if (newState) pushState(newState);
}, [gameState, pushState]);

// Use shared hook
const { selectedCard, draggingCard, handlers } = useCardInteraction({
  canMove,
  executeMove,
  getCardAtLocation: (loc) => getCardAt(gameState, loc),
});
```

## Benefits

**Immediate:**
- ~600 lines of duplicate code removed
- Single source of truth for interactions
- Consistent behavior across games

**Future:**
- Easy to add new games (Spider, Pyramid, etc.)
- Foundation for tutorials, replays, analytics
- Better accessibility (keyboard nav, screen reader)
