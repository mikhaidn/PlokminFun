# Key Architectural Decisions

## Decision 1: Standardize on cardCount (Simplified)

**Problem:** FreeCell uses `cardIndex` (position in column), Klondike uses `cardCount` (number of cards selected).

**Decision:** Use `cardCount` exclusively. FreeCell converts at click handlers.

**Rationale:**
- **Simpler shared types** - One way to represent selection (not two)
- **Clearer intent** - "Moving 3 cards" is clearer than "card at index 2"
- **Matches Klondike** - Proven pattern, no migration needed for Klondike
- **Minimal FreeCell impact** - Just convert at click handlers (3 lines of code)

**Implementation:**

```typescript
// shared/types/GameLocation.ts
export interface GameLocation {
  type: 'tableau' | 'foundation' | 'waste' | 'stock' | 'freeCell';
  index: number;
  cardCount?: number;  // Number of cards to move
}

// FreeCell: Convert cardIndex to cardCount at the boundary
function handleTableauClick(columnIndex: number, cardIndex: number) {
  const column = gameState.tableau[columnIndex];
  const cardCount = column.length - cardIndex;  // Convert once

  handlers.handleCardClick({
    type: 'tableau',
    index: columnIndex,
    cardCount,  // Use cardCount everywhere after this
  });
}
```

---

## Decision 2: Validation Interface

**Problem:** How should games provide validation logic to the shared hook?

**Decision:** Separate `canMove` validator function passed as config.

**Rationale:**
- Keeps validation logic pure and testable
- Allows games to compose validation from shared rules
- Clear separation between interaction (shared) and rules (game-specific)

**Implementation:**

```typescript
export interface CardInteractionConfig {
  // Returns true if move is valid
  canMove: (from: GameLocation, to: GameLocation) => boolean;

  // Executes the move (assumes validation passed)
  executeMove: (from: GameLocation, to: GameLocation) => void;

  // Optional: Get card at location for UI feedback
  getCardAtLocation?: (location: GameLocation) => Card | Card[] | null;
}

// Game implementation
const canMove = useCallback((from: GameLocation, to: GameLocation): boolean => {
  return validateMove(gameState, from, to);
}, [gameState]);
```

---

## Decision 3: Shared Validation Rules

**Problem:** Which validation logic goes in shared vs game-specific files?

**Decision:** Extract color/rank/sequence checks to shared, keep empty column rules game-specific.

**Clear Rules:**

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

**Implementation:**

```typescript
// shared/rules/solitaireRules.ts
export function hasAlternatingColors(card1: Card, card2: Card): boolean
export function canStackDescending(card: Card, target: Card | null, options?): boolean
export function canStackOnFoundation(card: Card, foundation: Card[], options?): boolean
export function isValidTableauSequence(cards: Card[]): boolean

// Game-specific usage
import { canStackDescending } from '@plokmin/shared';

export function canStackOnTableau(card: Card, target: Card | null): boolean {
  // FreeCell: Any card can go on empty tableau
  return canStackDescending(card, target, { allowEmpty: true });
}
```

---

## Decision 4: Migration Strategy

**Problem:** How do we migrate without breaking existing functionality?

**Decision:** Feature flag approach with parallel implementation, then cutover.

**Rationale:**
- Can test new code alongside old code
- Easy rollback if issues found
- Can migrate one game at a time
- Reduces risk of regressions

**Implementation:**

```typescript
// shared/config/featureFlags.ts
export const FEATURE_FLAGS = {
  USE_SHARED_INTERACTION_HOOK: true,  // Toggle to rollback if needed
} as const;

// Game component
if (FEATURE_FLAGS.USE_SHARED_INTERACTION_HOOK) {
  return <GameBoardWithSharedHook />;
} else {
  return <GameBoardOriginal />;
}
```

**Cutover Plan:**
1. Implement new code with flag OFF
2. Test thoroughly with flag ON
3. Deploy with flag ON but old code still present
4. Monitor for issues (1 week)
5. Remove old code and flag

---

## Decision 5: Testing Strategy

**Problem:** How do we ensure we don't break existing functionality?

**Decision:** Three-tier testing approach.

**Tier 1: Unit Tests (Shared Library)**
- 50+ test cases for validation rules
- 40+ test cases for interaction hook
- 100% coverage on shared code

**Tier 2: Integration Tests (Per Game)**
- 30+ test cases per game
- Test move validation and execution
- Test that game-specific rules are applied

**Tier 3: Manual Testing (Smoke Tests)**
- Test on real devices (desktop + mobile)
- Comprehensive checklist of interactions
- Before/after performance comparison

**Test Coverage Target:** 95%+ on shared code, 90%+ on integration

---

## Decision 6: Migration Order

**Problem:** Which game should we migrate first?

**Decision:** Klondike first, then FreeCell.

**Rationale:**
- Klondike has simpler selection model (already uses `cardCount`)
- Klondike has fewer location types (no free cells)
- Less complex supermove logic
- If we hit issues, easier to debug in simpler context

**Order:**
1. Extract shared validation (affects both games equally)
2. Migrate Klondike to `useCardInteraction`
3. Test Klondike thoroughly
4. Migrate FreeCell to `useCardInteraction`
5. Test FreeCell thoroughly
6. Remove old code from both games

---

## Decision 7: FreeCell Move Execution Pattern

**Problem:** FreeCell has 7 specialized move functions. Should it adopt Klondike's generic `moveCards(from, to, count)` pattern?

**Decision:** YES. Refactor FreeCell to use Klondike's cleaner pattern.

**Rationale:**
- **Simpler API** - One function instead of seven
- **Consistent with Klondike** - Same pattern across both games
- **Easier to maintain** - Test and debug one function
- **Better for shared code** - Generic location-based moves work naturally

**Current FreeCell Pattern (7 functions):**
```typescript
moveCardToFreeCell(state, tableauIndex, freeCellIndex)
moveCardFromFreeCell(state, freeCellIndex, tableauIndex)
moveCardsToTableau(state, sourceIndex, numCards, targetIndex)
moveCardToFoundation(state, sourceType, sourceIndex, foundationIndex)
moveCardFromFoundationToTableau(state, foundationIndex, tableauIndex)
// ... 2 more functions
```

**Klondike Pattern (1 function + helpers):**
```typescript
function moveCards(
  state: GameState,
  from: Location,
  to: Location,
  cardCount: number = 1
): GameState | null {
  const cards = removeCards(state, from, cardCount);
  if (!cards) return null;

  const newState = addCards(state, to, cards);
  return applyPostMoveEffects(newState, from, to);
}
```

**Implementation Timeline:**
- Phase 2: Create FreeCell moveCards wrapper (delegates to old functions)
- Phase 3: Refactor FreeCell to use generic pattern with helpers

**Benefits:**
- Consistent API across both games
- Easier to add new location types
- Simpler executeMove adapters
- ~100 lines of FreeCell code simplified

---

## Decision 8: Auto-Move Handling

**Problem:** Should we consolidate auto-move logic too?

**Decision:** NOT in this RFC. Defer to future RFC-005.

**Rationale:**
- Auto-move strategies are fundamentally different:
  - FreeCell: Automatic on timer, conservative (safe moves only)
  - Klondike: Manual button, aggressive (all valid moves)
- Would complicate this RFC unnecessarily
- Can be addressed after movement mechanics are consolidated

**Future Work:** RFC-005 will propose shared `AutoMoveStrategy` interface

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Regressions in move validation | Medium | High | Comprehensive tests, feature flags |
| Performance degradation | Low | Medium | Performance testing, profiling |
| Mobile touch interactions broken | Low | High | Real device testing, early testing |
| Undo/redo breaks | Low | High | Integration tests, manual testing |
| Feature flag forgotten (old code left) | Medium | Low | Automated reminder, Phase 3 cleanup |
| Incomplete migration (mixed old/new) | Low | Medium | Clear checklist, code review |

---

## Rollback Plan

### Phase 1 Issues
**Likelihood:** Low (pure refactor, heavily tested)

**Rollback:** Revert commit, restore original validation files
**Recovery Time:** < 1 hour

### Phase 2 Issues
**Likelihood:** Medium (significant behavior change)

**Rollback:** Set `USE_SHARED_INTERACTION_HOOK: false`
**Recovery Time:** < 5 minutes (instant via feature flag)

### Phase 3 Issues
**Likelihood:** Low (already tested in Phase 2)

**Rollback:** Revert commit, restore old code and flag
**Recovery Time:** < 30 minutes
