# Phase 3: Refactor FreeCell & Cleanup (2 days)

**Goal:** Finalize consolidation, refactor FreeCell move execution, remove old code.

---

## Step 3.1: Monitor Phase 2 Deployment

**Duration:** 1 week after Phase 2 merge to main

**Actions:**
1. Merge Phase 2 to main
2. Deploy to GitHub Pages
3. Monitor for issues:
   - Check browser console errors
   - Test on multiple devices
   - Gather user feedback (if applicable)
4. Keep feature flag ON
5. Fix any critical bugs immediately

**Acceptance Criteria:**
- [ ] No critical bugs reported
- [ ] Both games working smoothly for 1 week
- [ ] Performance is acceptable
- [ ] Mobile experience is good

---

## Step 3.2: Refactor FreeCell Move Execution

**Goal:** Replace FreeCell's 7 specialized move functions with Klondike's generic `moveCards(from, to, count)` pattern.

**File:** `freecell-mvp/src/state/gameActions.ts` (REFACTOR)

### Current Structure (7 functions)
```typescript
moveCardToFreeCell(state, tableauIndex, freeCellIndex)
moveCardFromFreeCell(state, freeCellIndex, tableauIndex)
moveCardsToTableau(state, sourceIndex, numCards, targetIndex)
moveCardToFoundation(state, sourceType, sourceIndex, foundationIndex)
moveCardFromFoundationToTableau(state, foundationIndex, tableauIndex)
// ... 2 more functions
```

### New Structure (1 function + helpers)
```typescript
/**
 * Generic move function (Klondike pattern)
 * Replaces all 7 specialized functions
 */
export function moveCards(
  state: GameState,
  from: Location,
  to: Location,
  cardCount: number = 1
): GameState | null {
  // Validate the move first
  if (!canMove(state, from, to, cardCount)) {
    return null;
  }

  // Remove cards from source
  const { newState, cards } = removeCards(state, from, cardCount);
  if (!cards) return null;

  // Add cards to destination
  const finalState = addCards(newState, to, cards);

  // Increment move counter
  finalState.moves++;

  return finalState;
}

/**
 * Remove cards from a location
 */
function removeCards(
  state: GameState,
  location: Location,
  count: number
): { newState: GameState; cards: Card[] | null }

/**
 * Add cards to a location
 */
function addCards(
  state: GameState,
  location: Location,
  cards: Card[]
): GameState
```

**Implementation Steps:**
1. Create `removeCards` helper function
2. Create `addCards` helper function
3. Create unified `moveCards` function
4. Update `moveExecution.ts` to use new `moveCards` function
5. Keep legacy function wrappers temporarily (for compatibility)
6. Run tests: `cd freecell-mvp && npm run test`
7. Remove legacy wrappers once confirmed working
8. Run tests again

**Acceptance Criteria:**
- [ ] `moveCards` function implemented with helpers
- [ ] All move types supported (tableau, freeCell, foundation)
- [ ] All existing tests pass (no regressions)
- [ ] Move execution simplified from ~150 lines to ~80 lines
- [ ] TypeScript compiles without errors

---

## Step 3.3: Remove Old Code

**Files to Update:**

### Klondike
- `klondike-mvp/src/components/GameBoard.tsx` - Remove old implementation and feature flag
- Delete `GameBoardOriginal.tsx` (if separate file)

### FreeCell
- `freecell-mvp/src/components/GameBoard.tsx` - Remove old implementation and feature flag
- Delete `GameBoardOriginal.tsx` (if separate file)

### Shared
- `shared/config/featureFlags.ts` - Remove `USE_SHARED_INTERACTION_HOOK` flag

**Pattern:**

```typescript
// BEFORE
if (FEATURE_FLAGS.USE_SHARED_INTERACTION_HOOK) {
  return <GameBoardWithSharedHook {...props} />;
} else {
  return <GameBoardOriginal {...props} />;
}

// AFTER
// Just use the new implementation directly
return (
  <div className="game-board">
    {/* Direct rendering */}
  </div>
);
```

**Acceptance Criteria:**
- [ ] All old click/drag/touch handlers removed
- [ ] All old selection state management removed
- [ ] Feature flag removed
- [ ] Code is cleaner and simpler
- [ ] All tests still pass
- [ ] Both games still work correctly

---

## Step 3.4: Optimize Shared Code

**Review and optimize:**

1. **useCardInteraction hook:**
   - Add memoization where appropriate
   - Optimize re-renders
   - Add performance comments

2. **Validation functions:**
   - Add caching if beneficial
   - Optimize hot paths

3. **Documentation:**
   - Add comprehensive JSDoc comments
   - Add usage examples
   - Update README files

**Acceptance Criteria:**
- [ ] No performance regressions
- [ ] Code is well-documented
- [ ] Examples are clear and helpful

---

## Step 3.5: Update Documentation

**Files to Update:**

1. **CLAUDE.md:**
   - Update "Shared Library" section with new validation/interaction details
   - Document how to add a new game using shared mechanics
   - Update architecture diagrams (if any)

2. **STATUS.md:**
   - Mark RFC-004 as complete
   - Update metrics (lines of code reduced, test coverage, etc.)

3. **ROADMAP.md:**
   - Check off movement consolidation
   - Update priorities based on new foundation

4. **shared/README.md** (create if doesn't exist):
   - Document all exported functions
   - Provide usage examples
   - Explain interaction hook patterns

**Example Addition to CLAUDE.md:**

```markdown
### Using Shared Movement Mechanics

All games use the `useCardInteraction` hook for unified click/drag/touch interactions:

**Step 1: Implement validation**
```typescript
export function validateMove(
  state: YourGameState,
  from: GameLocation,
  to: GameLocation
): boolean {
  // Your game-specific validation logic
}
```

**Step 2: Use hook in GameBoard**
```typescript
const { state, handlers } = useCardInteraction({
  canMove: (from, to) => validateMove(gameState, from, to),
  executeMove: (from, to) => {
    const newState = executeMove(gameState, from, to);
    if (newState) pushState(newState);
  },
});
```
```

**Acceptance Criteria:**
- [ ] CLAUDE.md updated with new patterns
- [ ] STATUS.md reflects completion
- [ ] ROADMAP.md updated
- [ ] shared/README.md documents all exports

---

## Step 3.6: Final Testing

**Full regression test:**

1. **Automated tests:**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

2. **Manual testing:**
   - Run through all Klondike test cases again
   - Run through all FreeCell test cases again
   - Test on real mobile devices (iOS + Android)

3. **Performance testing:**
   - Measure interaction latency
   - Check for memory leaks
   - Verify smooth animations

**Acceptance Criteria:**
- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] No performance regressions
- [ ] Mobile experience is excellent

---

## Step 3.7: Final Commit

**Commit Message:**

```
chore: finalize movement mechanics consolidation (RFC-004 Phase 3)

- Refactor FreeCell to use generic moveCards(from, to, count) pattern
- Remove old click/drag/touch handler code from both games
- Remove USE_SHARED_INTERACTION_HOOK feature flag
- Optimize shared interaction hook performance
- Add comprehensive documentation for shared mechanics
- Update CLAUDE.md, STATUS.md, ROADMAP.md

Summary:
- ~600 lines of duplicate code removed
- Single source of truth for card interactions
- Both games validated and working perfectly
- Foundation ready for adding new games (Spider, etc.)

Related: RFC-004 Phase 3/3 (Complete)
```

**Acceptance Criteria:**
- [ ] Clean commit with all cleanup
- [ ] No feature flags remaining
- [ ] Documentation complete
- [ ] RFC-004 marked as "Implemented"
