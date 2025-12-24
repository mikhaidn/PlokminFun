# Testing Strategy

## Test Pyramid

```
                /\
               /  \      E2E Tests (Manual - smoke tests)
              /    \
             /------\
            /        \   Integration Tests (~30 per game)
           /          \
          /------------\
         /              \ Unit Tests (~50 in shared, existing in games)
        /________________\
```

## Coverage Targets

- **Shared validation:** 100% (pure functions, easy to test)
- **Shared interaction hook:** 95%+ (thorough interaction testing)
- **Game validation adapters:** 95%+
- **Game execution adapters:** 90%+
- **Overall:** 90%+ across all new code

---

## Automated Testing

### Test Organization

```
shared/
  rules/
    __tests__/
      solitaireRules.test.ts          (50+ test cases)
  hooks/
    __tests__/
      useCardInteraction.test.ts      (40+ test cases)

freecell-mvp/
  rules/
    __tests__/
      moveValidation.test.ts          (30+ test cases)
  state/
    __tests__/
      moveExecution.test.ts           (20+ test cases)

klondike-mvp/
  rules/
    __tests__/
      moveValidation.test.ts          (30+ test cases)
  state/
    __tests__/
      moveExecution.test.ts           (20+ test cases)
```

### Unit Tests - Shared Validation

**File:** `shared/rules/__tests__/solitaireRules.test.ts`

```typescript
describe('canStackDescending', () => {
  it('should allow red 7 on black 8', () => {
    const red7 = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    const black8 = { suit: '♠', value: '8', rank: 8, id: '8♠' };
    expect(canStackDescending(red7, black8)).toBe(true);
  });

  it('should reject same color stacking', () => {
    const red7 = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    const red8 = { suit: '♦', value: '8', rank: 8, id: '8♦' };
    expect(canStackDescending(red7, red8)).toBe(false);
  });

  // ... 20+ test cases covering all edge cases
});
```

### Integration Tests - Per Game

**File:** `freecell-mvp/src/components/__tests__/GameBoard.interaction.test.tsx`

```typescript
describe('GameBoard - Shared Interaction Hook', () => {
  it('should move card from tableau to free cell on click', () => {
    // Render game with test state
    // Click tableau card
    // Click free cell
    // Assert state updated correctly
  });

  it('should validate moves using FreeCell rules', () => {
    // Test that FreeCell-specific rules are applied
  });

  // ... 30+ integration tests
});
```

---

## Manual Testing

### Devices to Test

- **Desktop:** Chrome, Firefox, Safari
- **Mobile:** iPhone (Safari), Android (Chrome)
- **Tablet:** iPad (Safari), Android tablet

### Klondike Test Cases

#### Click Interactions
- [ ] Click waste card → Selects card (visual highlight)
- [ ] Click foundation while waste selected → Moves if valid
- [ ] Click tableau while waste selected → Moves if valid
- [ ] Click same card twice → Deselects
- [ ] Click empty tableau with king selected → Moves king
- [ ] Click empty tableau with non-king → Does nothing

#### Drag Interactions
- [ ] Drag waste card to foundation → Moves if valid
- [ ] Drag waste card to tableau → Moves if valid
- [ ] Drag tableau sequence to another column → Moves if valid
- [ ] Drag to invalid location → Returns to original position
- [ ] Drag shows preview at cursor position

#### Touch Interactions (Mobile)
- [ ] Touch drag waste card to foundation → Moves
- [ ] Touch drag tableau sequence → Moves
- [ ] Touch tap to select/deselect works

#### Game Rules
- [ ] Can't place non-king on empty tableau
- [ ] Can't place red on red (validation works)
- [ ] Can't place wrong rank
- [ ] Foundation only accepts aces when empty
- [ ] Foundation only accepts next rank of same suit

#### State Management
- [ ] Undo after move → Reverts correctly
- [ ] Redo after undo → Reapplies correctly
- [ ] Move counter increments
- [ ] Win detection works

### FreeCell Test Cases

#### Click Interactions
- [ ] Click tableau card → Selects card (or stack)
- [ ] Click free cell while card selected → Moves if valid
- [ ] Click foundation while card selected → Moves if valid
- [ ] Click another tableau column → Moves if valid
- [ ] Click free cell card → Selects it
- [ ] Click foundation card → Selects it (for moving back)

#### Multi-Card Moves (Supermove)
- [ ] Can move 2-card sequence with 1 free cell
- [ ] Can move 3-card sequence with 2 free cells
- [ ] Can move 4-card sequence with 1 free cell + 1 empty column
- [ ] Can't move more cards than supermove calculation allows

#### Auto-Complete
- [ ] Auto-complete triggers after delay
- [ ] Auto-complete only moves safe cards
- [ ] Auto-complete works after manual moves

---

## Regression Prevention

### Before Each Commit

```bash
# Full validation suite
npm run build && npm test && npm run lint

# Manual smoke test
# 1. Start FreeCell, make 10 moves, undo 5, redo 3
# 2. Start Klondike, make 10 moves, undo 5, redo 3
# 3. Test on mobile device
```

### CI/CD Checks

- [ ] All automated tests must pass
- [ ] Lint must pass
- [ ] Build must succeed
- [ ] No TypeScript errors
- [ ] No console warnings in test output

---

## Performance Testing

### Performance Budget

**Target:** No user-perceivable latency increase

- Click to selection: < 16ms (60 FPS)
- Drag start: < 16ms
- Move validation: < 5ms
- Move execution: < 10ms

### Testing Tools

- React DevTools Profiler (measure before/after)
- Browser Performance tab
- Manual user testing

### Metrics to Monitor

1. **Interaction latency:** Time from click to state update
2. **Render time:** Time to render after state change
3. **Memory usage:** Check for leaks during extended play
4. **Animation smoothness:** Drag animations stay at 60 FPS

---

## Success Criteria

### Phase 1
- [ ] 100% test coverage on shared validation rules
- [ ] All existing tests still pass
- [ ] No behavior changes (pure refactor)

### Phase 2
- [ ] All interaction tests pass
- [ ] Manual testing confirms no regressions
- [ ] Mobile interactions work correctly
- [ ] Feature flag allows rollback

### Phase 3
- [ ] All tests pass after cleanup
- [ ] Performance validated (no degradation)
- [ ] Mobile experience excellent

### Overall
- [ ] 90%+ test coverage on all new shared code
- [ ] All existing functionality works identically
- [ ] No measurable performance degradation
