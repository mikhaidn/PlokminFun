# Phase 2: Migrate to useCardInteraction Hook (3-4 days)

**Goal:** Both games use `useCardInteraction` for all click/drag/touch interactions.

---

## Step 2.1: Create GameLocation Type

**File:** `shared/types/GameLocation.ts` (NEW)

**Implementation:**

```typescript
import type { Card } from './Card';

/**
 * Represents a location in a solitaire game where cards can be placed
 * Unified type supporting FreeCell, Klondike, and future games
 */
export interface GameLocation {
  /** Type of location (tableau column, foundation pile, etc.) */
  type: 'tableau' | 'foundation' | 'waste' | 'stock' | 'freeCell';

  /** Index of the column/pile (0-based) */
  index: number;

  /** Number of cards selected/affected (preferred for new code) */
  cardCount?: number;
}

/**
 * Convert FreeCell-style cardIndex to Klondike-style cardCount
 */
export function cardIndexToCount(column: Card[], cardIndex: number): number {
  if (cardIndex < 0 || cardIndex >= column.length) {
    throw new Error(`Invalid cardIndex ${cardIndex} for column of length ${column.length}`);
  }
  return column.length - cardIndex;
}
```

**Export from:** `shared/types/index.ts`

**Acceptance Criteria:**
- [ ] File created with types and conversion helpers
- [ ] TypeScript compiles without errors
- [ ] Exported from shared library

---

## Step 2.2: Update useCardInteraction Hook

**File:** `shared/hooks/useCardInteraction.ts` (UPDATE)

**Changes:**

```typescript
import type { GameLocation } from '../types/GameLocation';

export interface CardInteractionConfig {
  /** Validate if move from source to destination is legal */
  canMove: (from: GameLocation, to: GameLocation) => boolean;

  /** Execute the move (assumes canMove returned true) */
  executeMove: (from: GameLocation, to: GameLocation) => void;

  /** Optional: Get card(s) at location for UI feedback */
  getCardAtLocation?: (location: GameLocation) => unknown;
}

export interface CardInteractionState {
  selectedCard: GameLocation | null;
  draggingCard: GameLocation | null;
  dragPosition: { x: number; y: number } | null;
}

export interface CardInteractionHandlers {
  handleCardClick: (location: GameLocation) => void;
  handleDragStart: (location: GameLocation, event: React.MouseEvent | React.TouchEvent) => void;
  handleDragEnd: () => void;
  handleDrop: (location: GameLocation) => void;
  handleTouchStart: (location: GameLocation, event: React.TouchEvent) => void;
  handleTouchMove: (event: React.TouchEvent) => void;
  handleTouchEnd: (location: GameLocation) => void;
  clearSelection: () => void;
}

export function useCardInteraction(
  config: CardInteractionConfig
): {
  state: CardInteractionState;
  handlers: CardInteractionHandlers;
}
```

**Acceptance Criteria:**
- [ ] Hook uses `GameLocation` types
- [ ] All handlers properly typed
- [ ] TypeScript compiles without errors
- [ ] Hook ready for game integration

---

## Step 2.3: Migrate Klondike (Steps 2.3-2.6)

### Create Move Validator

**File:** `klondike-mvp/src/rules/moveValidation.ts` (NEW)

**Implementation:**
- `validateMove(state, from, to): boolean` - Main validation function
- Handles all move types: waste→tableau, waste→foundation, tableau→tableau, tableau→foundation
- Integrates with existing rule functions (canPlaceOnTableau, canPlaceOnEmptyTableau, canPlaceOnFoundation)

### Create Move Executor

**File:** `klondike-mvp/src/state/moveExecution.ts` (NEW)

**Implementation:**
- `executeMove(state, from, to): GameState | null` - Main execution function
- Converts GameLocation to internal Location type
- Delegates to existing `moveCards` function

### Integrate Hook into GameBoard

**File:** `klondike-mvp/src/components/GameBoard.tsx` (UPDATE)

**Pattern:**

```typescript
import { useCardInteraction, FEATURE_FLAGS, type GameLocation } from '@plokmin/shared';

const { state: interactionState, handlers } = useCardInteraction({
  canMove: (from, to) => validateMove(gameState, from, to),
  executeMove: (from, to) => {
    const newState = executeMove(gameState, from, to);
    if (newState) pushState(newState);
  },
});

if (FEATURE_FLAGS.USE_SHARED_INTERACTION_HOOK) {
  return <GameBoardWithSharedHook {...props} />;
} else {
  return <GameBoardOriginal {...props} />;
}
```

### Manual Testing - Klondike

**Test Cases:**
- [ ] Click waste card → Selects card
- [ ] Click foundation while waste selected → Moves if valid
- [ ] Click tableau while waste selected → Moves if valid
- [ ] Drag waste card to foundation → Moves
- [ ] Drag tableau sequence to another column → Moves
- [ ] Touch interactions work on mobile
- [ ] Undo/redo after moves works
- [ ] Win condition detection works

**Acceptance Criteria:**
- [ ] Feature flag OFF: Works as before (regression test)
- [ ] Feature flag ON: Uses shared hook
- [ ] All interactions work correctly
- [ ] All 1415+ tests still pass

---

## Step 2.7: Migrate FreeCell (Steps 2.7-2.10)

### Create Move Validator

**File:** `freecell-mvp/src/rules/moveValidation.ts` (NEW)

**Implementation:**
- `validateMove(state, from, to): boolean`
- Handles FreeCell-specific moves: tableau↔freeCell, tableau↔foundation, tableau↔tableau
- Integrates supermove calculation (getMaxMovable)

### Create Move Executor

**File:** `freecell-mvp/src/state/moveExecution.ts` (NEW)

**Implementation:**
- `executeMove(state, from, to): GameState | null`
- Routes to appropriate existing action functions:
  - moveCardToFreeCell
  - moveCardFromFreeCell
  - moveCardsToTableau
  - moveCardToFoundation
  - etc.

### Integrate Hook into GameBoard

**File:** `freecell-mvp/src/components/GameBoard.tsx` (UPDATE)

Same pattern as Klondike with feature flag.

### Manual Testing - FreeCell

**Test Cases:**
- [ ] Click tableau card → Selects card (or stack)
- [ ] Click free cell while card selected → Moves
- [ ] Drag single card to free cell → Moves
- [ ] Drag card stack to tableau → Moves if within supermove limit
- [ ] Drag stack larger than limit → Rejected
- [ ] Auto-complete still triggers
- [ ] Undo/redo works correctly

**Acceptance Criteria:**
- [ ] Feature flag controls code path
- [ ] All FreeCell-specific features work (supermove, auto-complete)
- [ ] All tests pass

---

## Step 2.11: Build and Test Monorepo

**Set feature flag:**
```typescript
// shared/config/featureFlags.ts
USE_SHARED_INTERACTION_HOOK: true
```

**Commands:**
```bash
npm run build:shared
npm run build:pages
npm test
npm run lint
```

**Manual Testing:**
- Test both games in browser (desktop)
- Test on mobile device (real device or DevTools)

**Acceptance Criteria:**
- [ ] All builds succeed
- [ ] All tests pass (1415+ Klondike, FreeCell tests, shared tests)
- [ ] No linter errors
- [ ] Both games work correctly
- [ ] No console errors
- [ ] Mobile interactions work

---

## Step 2.12: Commit Phase 2

**Commit Message:**

```
feat: migrate both games to useCardInteraction hook (RFC-004 Phase 2)

- Create GameLocation shared type with cardIndex/cardCount support
- Update useCardInteraction hook to use GameLocation
- Create move validation/execution for Klondike
- Create move validation/execution for FreeCell
- Integrate shared hook into both games via feature flag
- Remove ~300 lines of duplicate click/drag/touch handlers

Impact:
- Single source of truth for all card interactions
- Consistent behavior across both games
- Easier to add new games (just implement validate/execute)
- Feature flag allows easy rollback if issues found

Migration:
- Set USE_SHARED_INTERACTION_HOOK: true in shared/config/featureFlags.ts
- Old code kept for 1 week monitoring period before removal

Related: RFC-004 Phase 2/3
```

**Acceptance Criteria:**
- [ ] Clean commit with all Phase 2 changes
- [ ] Feature flag enabled
- [ ] All tests passing
- [ ] Both games work correctly
