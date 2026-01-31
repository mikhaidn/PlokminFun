# RFC-005 Compatibility Guide

**Status:** DRAFT
**Created:** 2025-12-24
**Purpose:** Ensure RFC-003 (Card Backs) implementation is compatible with future RFC-005 (Unified Game Builder)

---

## Overview

This document outlines how to implement features today in a way that will be compatible with the upcoming unified game builder system (RFC-005). By following these patterns, we can avoid refactoring work later.

## Key Principle

> **Write code that could become part of GameConfig and GameActions later**

Instead of writing game-specific helper functions in random places, write them as if they'll eventually be methods on the `GameActions<TState>` interface.

---

## RFC-003 Phase 2: Card Backs Implementation

### The Challenge

Klondike needs to show:
- **Stock pile:** Face-down cards (show CardBack)
- **Waste pile:** Face-up cards (show Card)
- **Tableau:** Mix of face-down (hidden cards) and face-up (playable cards)
- **Foundations:** Always face-up

### RFC-005 Compatible Approach

#### 1. Create `isCardFaceUp()` Helper Function

**File:** `klondike-mvp/src/state/cardDisplay.ts` (new file)

```typescript
import type { GameLocation } from '@plokmin/shared';
import type { KlondikeGameState } from '../core/types';

/**
 * Determine if a card at a location should be rendered face-up.
 *
 * IMPORTANT: This function signature matches GameActions.isCardFaceUp()
 * from RFC-005. When we migrate to the unified system, we'll just move
 * this function into KlondikeGameActions class - no refactoring needed!
 *
 * @param state - Current game state
 * @param location - Where the card is located
 * @param index - Index of the card in the stack (0 = top card)
 * @returns true if card should show its face, false for card back
 */
export function isCardFaceUp(
  state: KlondikeGameState,
  location: GameLocation,
  index?: number
): boolean {
  switch (location.type) {
    case 'stock':
      // Stock pile is always face-down
      return false;

    case 'waste':
      // Waste pile is always face-up
      return true;

    case 'foundation':
      // Foundations are always face-up
      return true;

    case 'tableau': {
      // Tableau columns have a mix:
      // - First N cards are face-down (where N = column length - faceUpCount)
      // - Remaining cards are face-up
      const column = state.tableau[location.index];
      if (!column || column.cards.length === 0) {
        return true; // Empty column doesn't matter
      }

      // If no index specified, assume we're asking about the top card
      const cardIndex = index ?? 0;

      // Calculate how many cards are face-down
      const faceDownCount = column.cards.length - column.faceUpCount;

      // If card index is less than faceDownCount, it's face-down
      return cardIndex >= faceDownCount;
    }

    default:
      // Unknown location type - default to face-up for safety
      return true;
  }
}
```

#### 2. Use in Rendering Logic

**File:** `klondike-mvp/src/components/KlondikeBoard.tsx`

```typescript
import { Card } from '@plokmin/shared';
import { isCardFaceUp } from '../state/cardDisplay';

// When rendering tableau cards
{column.cards.map((card, cardIndex) => {
  const faceUp = isCardFaceUp(
    gameState,
    { type: 'tableau', index: columnIndex },
    cardIndex
  );

  return (
    <Card
      key={card.id}
      card={card}
      faceUp={faceUp}  // ✅ Use our helper
      cardBackTheme="blue"
      // ... other props
    />
  );
})}

// When rendering stock pile
{gameState.stock.map((card, index) => (
  <Card
    key={card.id}
    card={card}
    faceUp={isCardFaceUp(gameState, { type: 'stock', index: 0 }, index)}
    cardBackTheme="blue"
    // ... other props
  />
))}
```

#### 3. Migration Path to RFC-005

When we implement RFC-005, the migration is simple:

**Before (RFC-003 Phase 2):**
```typescript
// klondike-mvp/src/state/cardDisplay.ts
export function isCardFaceUp(state: KlondikeGameState, location: GameLocation, index?: number): boolean {
  // implementation
}

// Used in components
import { isCardFaceUp } from '../state/cardDisplay';
const faceUp = isCardFaceUp(gameState, location, index);
```

**After (RFC-005):**
```typescript
// klondike-mvp/src/state/KlondikeGameActions.ts
export class KlondikeGameActions implements GameActions<KlondikeGameState> {
  isCardFaceUp(state: KlondikeGameState, location: GameLocation, index?: number): boolean {
    // SAME implementation - just copy/paste!
    switch (location.type) {
      case 'stock': return false;
      case 'waste': return true;
      // ... rest of implementation unchanged
    }
  }

  // ... other GameActions methods
}

// Used in components (through config)
const faceUp = config.actions.isCardFaceUp(gameState, location, index);
```

**Result:** Zero refactoring! Just move the function and change the import.

---

## Design Patterns for RFC-005 Compatibility

### Pattern 1: Pure Functions

✅ **Good (RFC-005 Ready):**
```typescript
export function isCardFaceUp(state: GameState, location: GameLocation): boolean {
  // Pure function - only depends on inputs
  return state.tableau[location.index].faceUpCount > 0;
}
```

❌ **Bad (Requires Refactoring):**
```typescript
// Relies on component state or global variables
function shouldShowCardBack(columnIndex: number): boolean {
  return this.state.tableau[columnIndex].hidden;
}
```

### Pattern 2: Generic Location-Based Queries

✅ **Good (RFC-005 Ready):**
```typescript
// Uses standardized GameLocation type
export function isCardFaceUp(state: GameState, location: GameLocation, index?: number): boolean {
  // Works with any location type
}
```

❌ **Bad (Requires Refactoring):**
```typescript
// Separate functions for each area
function isStockCardFaceUp(state: GameState): boolean { }
function isWasteCardFaceUp(state: GameState): boolean { }
function isTableauCardFaceUp(state: GameState, col: number, idx: number): boolean { }
```

### Pattern 3: Think "Could This Be Config?"

When adding game-specific behavior, ask:

> "Could this be declared in a config file instead of hardcoded?"

✅ **Good (RFC-005 Ready):**
```typescript
// This pattern could become part of GameConfig
const cardDisplayConfig = {
  cardBackTheme: 'blue' as const,
  enableFlipAnimation: true,
  flipAnimationDuration: 300,
};

// Used in rendering
<Card
  faceUp={faceUp}
  cardBackTheme={cardDisplayConfig.cardBackTheme}
/>
```

❌ **Bad (Hardcoded):**
```typescript
// Hardcoded in component
<Card
  faceUp={faceUp}
  cardBackTheme="blue"  // ❌ Should come from config
/>
```

---

## RFC-003 Phase 2 Checklist

When implementing card backs for Klondike:

- [x] Draft RFC-005 interfaces (shared/types/GameConfig.ts)
- [ ] Create `isCardFaceUp()` helper with GameActions signature
- [ ] Keep function pure (no side effects, depends only on inputs)
- [ ] Use `GameLocation` type for location parameters
- [ ] Use optional `index` parameter for cards in stacks
- [ ] Add JSDoc comments explaining RFC-005 compatibility
- [ ] Write tests for `isCardFaceUp()` that will transfer to GameActions
- [ ] Update Klondike rendering to use the helper
- [ ] Verify Card component's `faceUp` prop works correctly
- [ ] Ensure backwards compatibility (FreeCell unaffected)

---

## Testing Strategy

### Test `isCardFaceUp()` in isolation

**File:** `klondike-mvp/src/state/__tests__/cardDisplay.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { isCardFaceUp } from '../cardDisplay';
import { createInitialState } from '../gameState';

describe('isCardFaceUp (RFC-005 compatible)', () => {
  it('stock pile cards are always face-down', () => {
    const state = createInitialState(12345);
    expect(isCardFaceUp(state, { type: 'stock', index: 0 }, 0)).toBe(false);
  });

  it('waste pile cards are always face-up', () => {
    const state = createInitialState(12345);
    // Draw a card to waste
    // ... state mutation
    expect(isCardFaceUp(state, { type: 'waste', index: 0 }, 0)).toBe(true);
  });

  it('tableau cards respect faceUpCount', () => {
    const state = createInitialState(12345);
    // Column has 7 cards, 4 face-up
    // Cards at index 0-2 are face-down
    // Cards at index 3-6 are face-up

    expect(isCardFaceUp(state, { type: 'tableau', index: 0 }, 0)).toBe(false); // Top card, face-down
    expect(isCardFaceUp(state, { type: 'tableau', index: 0 }, 3)).toBe(true);  // First face-up
    expect(isCardFaceUp(state, { type: 'tableau', index: 0 }, 6)).toBe(true);  // Bottom card, face-up
  });

  it('foundation cards are always face-up', () => {
    const state = createInitialState(12345);
    expect(isCardFaceUp(state, { type: 'foundation', index: 0 }, 0)).toBe(true);
  });
});
```

These tests will work unchanged when we move to `KlondikeGameActions.isCardFaceUp()` in RFC-005!

---

## Future: Full RFC-005 Migration

When we implement RFC-005, here's the migration path:

### Step 1: Create GameActions Class

**File:** `klondike-mvp/src/state/KlondikeGameActions.ts`

```typescript
import type { GameActions } from '@plokmin/shared';
import type { KlondikeGameState } from '../core/types';
import { isCardFaceUp } from './cardDisplay'; // Import existing function

export class KlondikeGameActions implements GameActions<KlondikeGameState> {
  // Copy/paste existing functions into class methods

  isCardFaceUp(state: KlondikeGameState, location: GameLocation, index?: number): boolean {
    // Same implementation as standalone function!
    return isCardFaceUp(state, location, index);
  }

  validateMove(state: KlondikeGameState, from: GameLocation, to: GameLocation): boolean {
    // Move existing validation logic here
  }

  executeMove(state: KlondikeGameState, from: GameLocation, to: GameLocation): KlondikeGameState | null {
    // Move existing execution logic here
  }

  // ... other GameActions methods
}
```

### Step 2: Create GameConfig

**File:** `klondike-mvp/src/klondike.config.ts`

```typescript
import type { GameConfig } from '@plokmin/shared';
import type { KlondikeGameState } from './core/types';
import { KlondikeGameActions } from './state/KlondikeGameActions';

export const KlondikeConfig: GameConfig<KlondikeGameState> = {
  metadata: {
    id: 'klondike',
    name: 'Klondike Solitaire',
    description: 'Classic solitaire game',
    difficulty: 'medium',
    version: '1.0.0',
  },
  layout: {
    numTableauColumns: 7,
    numFoundations: 4,
    specialAreas: ['stock', 'waste'],
  },
  rules: {
    tableauStackRule: 'alternatingColors',
    emptyTableauRule: 'kingOnly',
    foundationRule: 'sameSuit',
    tableauDirection: 'descending',
    foundationDirection: 'ascending',
  },
  cardDisplay: {
    cardBackTheme: 'blue',  // ✅ Moved from hardcoded value!
    enableFlipAnimation: true,
    flipAnimationDuration: 300,
  },
  actions: new KlondikeGameActions(),
  features: {
    smartTap: true,
    hints: true,
    autoComplete: true,
    undoRedo: true,
    persistence: true,
    winCelebration: true,
  },
  settings: [
    {
      id: 'drawCount',
      label: 'Draw Count',
      type: 'select',
      options: [
        { value: 1, label: 'Draw 1' },
        { value: 3, label: 'Draw 3' },
      ],
      default: 3,
      description: 'Number of cards to draw from stock',
    },
  ],
};
```

### Step 3: Use in Components

**Before:**
```typescript
import { isCardFaceUp } from '../state/cardDisplay';

const faceUp = isCardFaceUp(gameState, location, index);
```

**After:**
```typescript
import { KlondikeConfig } from '../klondike.config';

const faceUp = KlondikeConfig.actions.isCardFaceUp(gameState, location, index);
```

**Effort:** 5-10 minutes to update imports. Zero logic changes!

---

## Benefits of This Approach

### ✅ Immediate Benefits (RFC-003 Phase 2)

1. **Clean separation of concerns** - Card display logic is isolated
2. **Testable** - Pure functions are easy to test
3. **Reusable** - Can use same helper in multiple components
4. **Type-safe** - TypeScript ensures correct usage

### ✅ Future Benefits (RFC-005 Migration)

1. **Zero refactoring** - Just copy/paste functions into GameActions
2. **Tests transfer directly** - Same test suite works for GameActions methods
3. **Predictable migration** - Clear path from standalone functions to class methods
4. **No breaking changes** - Can migrate one game at a time

---

## Summary

By writing RFC-003 Phase 2 with RFC-005 patterns:

- ✅ We get card backs working in Klondike **now**
- ✅ We avoid 3-4 hours of refactoring work **later**
- ✅ We make RFC-005 implementation smoother
- ✅ We improve code quality today (pure functions, testable, type-safe)

**Next Steps:**

1. ✅ Draft RFC-005 interfaces (`shared/types/GameConfig.ts`)
2. ⬜ Implement `isCardFaceUp()` helper following GameActions signature
3. ⬜ Use helper in Klondike rendering
4. ⬜ Write tests that will transfer to GameActions
5. ⬜ Complete RFC-003 Phase 2
6. ⬜ Later: Migrate to full RFC-005 when ready (easy!)

---

**Related Files:**
- `shared/types/GameConfig.ts` - RFC-005 draft interfaces
- `rfcs/005-unified-game-builder/README.md` - Full RFC-005 spec
- `rfcs/003-card-backs/04-implementation/phase-2.md` - RFC-003 Phase 2 plan
