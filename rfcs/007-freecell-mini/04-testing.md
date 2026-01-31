# Testing Strategy

## Test Adaptation from FreeCell

Since FreeCell Mini uses identical game rules, **80% of tests can be copied directly** from `freecell-mvp/__tests__/` with minimal changes.

---

## Unit Tests

### Game State (`gameState.test.ts`)
```typescript
describe('FreeCell Mini - Deck Creation', () => {
  it('creates 26-card deck with hearts and spades', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(26);
    expect(deck.filter(c => c.suit === 'hearts')).toHaveLength(13);
    expect(deck.filter(c => c.suit === 'spades')).toHaveLength(13);
  });

  it('includes all ranks A-K for each suit', () => {
    const deck = createDeck();
    const ranks = deck.map(c => c.rank);
    const expectedRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    expect(ranks.filter(r => expectedRanks.includes(r))).toHaveLength(26);
  });
});

describe('FreeCell Mini - Initial Deal', () => {
  it('deals 4 tableau columns with pattern 7,7,6,6', () => {
    const shuffled = shuffle(createDeck(), 12345);
    const state = dealCards(shuffled);

    expect(state.tableau).toHaveLength(4);
    expect(state.tableau[0]).toHaveLength(7);
    expect(state.tableau[1]).toHaveLength(7);
    expect(state.tableau[2]).toHaveLength(6);
    expect(state.tableau[3]).toHaveLength(6);
  });

  it('creates 2 free cells', () => {
    const state = createInitialState(12345);
    expect(state.freeCells).toHaveLength(2);
    expect(state.freeCells).toEqual([null, null]);
  });

  it('creates 2 foundation piles', () => {
    const state = createInitialState(12345);
    expect(Object.keys(state.foundations)).toEqual(['hearts', 'spades']);
    expect(state.foundations.hearts).toEqual([]);
    expect(state.foundations.spades).toEqual([]);
  });
});
```

### Game Rules (`gameRules.test.ts`)
**Reuse 100%** from FreeCell - rules are identical:
- Tableau to tableau (descending, alternating color)
- Tableau to foundation (ascending by suit)
- Free cell moves (any card to empty cell)
- Empty tableau columns (any card/sequence)

Copy tests as-is, run to verify.

### Move Validation (`gameActions.test.ts`)
**Reuse 95%** from FreeCell:
- `canMoveToTableau()` - No changes
- `canMoveToFoundation()` - No changes
- `canMoveToFreeCell()` - No changes
- `getValidMoves()` - Adapt for 4 columns

```typescript
describe('getValidMoves', () => {
  it('returns valid moves for 4-column tableau', () => {
    const state = createTestState();
    const moves = getValidMoves(state, { type: 'tableau', index: 0 });

    // Verify moves only reference tableau columns 0-3
    moves.forEach(move => {
      if (move.to.type === 'tableau') {
        expect(move.to.index).toBeLessThan(4);
      }
    });
  });
});
```

### Win Condition (`winCondition.test.ts`)
```typescript
describe('isGameWon', () => {
  it('returns false when foundations incomplete', () => {
    const state = {
      foundations: { hearts: Array(12).fill({}), spades: Array(12).fill({}) },
      // ...
    };
    expect(isGameWon(state)).toBe(false);
  });

  it('returns true when both foundations have 13 cards', () => {
    const state = {
      foundations: { hearts: Array(13).fill({}), spades: Array(13).fill({}) },
      // ...
    };
    expect(isGameWon(state)).toBe(true);
  });
});
```

### Supermove Calculation (`supermove.test.ts`)
```typescript
describe('calculateMaxMovableCards', () => {
  it('calculates with 2 free cells available', () => {
    const freeCells = [null, null];
    const tableau = [[], [], [], []]; // 0 empty columns
    expect(calculateMaxMovableCards(freeCells, tableau)).toBe(3); // (2+1) × 2^0
  });

  it('calculates with 1 free cell and 1 empty column', () => {
    const freeCells = [card1, null];
    const tableau = [[], [card2], [card3], [card4]]; // 1 empty
    expect(calculateMaxMovableCards(freeCells, tableau)).toBe(4); // (1+1) × 2^1
  });

  it('calculates with 0 free cells and 2 empty columns', () => {
    const freeCells = [card1, card2];
    const tableau = [[], [], [card3], [card4]]; // 2 empty
    expect(calculateMaxMovableCards(freeCells, tableau)).toBe(4); // (0+1) × 2^2
  });
});
```

---

## Integration Tests

### Complete Game Scenarios
```typescript
describe('FreeCell Mini - Playthrough', () => {
  it('can win a simple game', () => {
    // Set up solvable game state
    const state = createSolvableState();

    // Execute winning sequence
    const moves = [
      { from: { type: 'tableau', index: 0 }, to: { type: 'foundation', suit: 'hearts' } },
      // ... more moves
    ];

    let currentState = state;
    moves.forEach(move => {
      currentState = executeMove(currentState, move);
    });

    expect(isGameWon(currentState)).toBe(true);
  });

  it('undo/redo works through full game', () => {
    const history = createGameHistory();

    // Make 10 moves
    for (let i = 0; i < 10; i++) {
      history.pushState(makeRandomMove());
    }

    // Undo 5 times
    for (let i = 0; i < 5; i++) {
      history.undo();
    }

    expect(history.canRedo()).toBe(true);
    expect(history.getRedoStack()).toHaveLength(5);
  });
});
```

---

## UI Component Tests

### GameBoard Component
```typescript
describe('GameBoard', () => {
  it('renders 4 tableau columns', () => {
    render(<GameBoard state={testState} />);
    const columns = screen.getAllByTestId('tableau-column');
    expect(columns).toHaveLength(4);
  });

  it('renders 2 free cells', () => {
    render(<GameBoard state={testState} />);
    const freeCells = screen.getAllByTestId('free-cell');
    expect(freeCells).toHaveLength(2);
  });

  it('renders 2 foundation piles', () => {
    render(<GameBoard state={testState} />);
    expect(screen.getByTestId('foundation-hearts')).toBeInTheDocument();
    expect(screen.getByTestId('foundation-spades')).toBeInTheDocument();
  });
});
```

### Responsive Layout Tests
```typescript
describe('GameBoard - Responsive', () => {
  it('fits on mobile viewport (375px) without scroll', () => {
    // Set viewport to iPhone SE size
    global.innerWidth = 375;
    render(<GameBoard state={testState} />);

    const tableau = screen.getByTestId('tableau');
    const bounds = tableau.getBoundingClientRect();

    expect(bounds.width).toBeLessThanOrEqual(375);
  });
});
```

---

## Solvability Testing

### Automated Solvability Checker
```typescript
describe('Solvability Analysis', () => {
  it('generates 100 random games and checks win rate', () => {
    const results = [];

    for (let seed = 0; seed < 100; seed++) {
      const isSolvable = checkSolvability(seed);
      results.push(isSolvable);
    }

    const winRate = results.filter(Boolean).length / 100;
    expect(winRate).toBeGreaterThan(0.90); // Target: 90%+ solvable
  });
});
```

**Solvability Algorithm:**
1. Generate game state from seed
2. Use recursive backtracking solver (DFS with memoization)
3. Timeout after 10 seconds (assume unsolvable)
4. Track success rate across many seeds

---

## Performance Tests

### Render Performance
```typescript
describe('Performance', () => {
  it('renders game board in <100ms', () => {
    const start = performance.now();
    render(<GameBoard state={largeState} />);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('handles 100 rapid moves without lag', () => {
    const { rerender } = render(<GameBoard state={initialState} />);

    for (let i = 0; i < 100; i++) {
      const newState = makeRandomMove(currentState);
      rerender(<GameBoard state={newState} />);
    }

    // Should complete without timeout
  });
});
```

---

## Accessibility Tests

### Keyboard Navigation
```typescript
describe('Accessibility', () => {
  it('supports tab navigation through all interactive elements', () => {
    render(<GameBoard state={testState} />);

    // Tab through elements
    const firstCard = screen.getAllByRole('button')[0];
    firstCard.focus();

    userEvent.tab();
    expect(document.activeElement).not.toBe(firstCard);
  });

  it('provides ARIA labels for screen readers', () => {
    render(<GameBoard state={testState} />);

    expect(screen.getByLabelText(/tableau column 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/free cell 1/i)).toBeInTheDocument();
  });
});
```

---

## Test Coverage Goals

| Module | Target | Why |
|--------|--------|-----|
| Game State | 95%+ | Core logic must be bulletproof |
| Game Rules | 95%+ | Move validation is critical |
| Game Actions | 90%+ | Complex interactions need thorough testing |
| UI Components | 80%+ | Focus on logic over render details |
| Integration | 85%+ | Ensure components work together |

---

## Regression Testing

### Compare with Full FreeCell
```typescript
describe('Parity with Full FreeCell', () => {
  it('move validation logic produces same results', () => {
    // Test same scenario in both games (subset of cards)
    const miniState = createMiniState(hearts_A_2_3, spades_A_2_3);
    const fullState = createFullState(hearts_A_2_3, spades_A_2_3);

    const miniMoves = getValidMoves(miniState, location);
    const fullMoves = getValidMoves(fullState, location);

    // Should have identical valid moves for same cards
    expect(miniMoves).toEqual(fullMoves);
  });
});
```

---

## Manual Testing Checklist

### Device Testing
- [ ] iPhone SE (375px) - No horizontal scroll
- [ ] iPhone 14 Pro (393px) - Comfortable spacing
- [ ] iPad (768px) - Optimal layout
- [ ] Desktop (1920px) - Centered, not stretched

### Browser Testing
- [ ] iOS Safari (primary mobile browser)
- [ ] Android Chrome
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari

### Gameplay Testing
- [ ] Complete 10 games from different seeds
- [ ] Track average completion time (target: 5-10 min)
- [ ] Note any frustrating/confusing moments
- [ ] Test undo/redo extensively
- [ ] Verify smart tap-to-move works

### Accessibility Testing
- [ ] VoiceOver (iOS) navigation works
- [ ] High contrast mode readable
- [ ] Keyboard-only playthrough possible
- [ ] Touch targets 44x44px minimum

---

## Continuous Integration

### CI Pipeline
```yaml
# .github/workflows/test.yml
- name: Test FreeCell Mini
  run: npm run test --workspace=freecell-mini

- name: Coverage Report
  run: npm run test:coverage --workspace=freecell-mini

- name: Fail if coverage < 90%
  run: |
    COVERAGE=$(cat coverage/summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 90" | bc -l) )); then
      echo "Coverage $COVERAGE% is below 90%"
      exit 1
    fi
```

---

## Success Criteria

**Must Pass:**
- ✅ All unit tests passing (200+ tests)
- ✅ 90%+ code coverage on game logic
- ✅ Zero TypeScript errors
- ✅ Linter clean

**Should Pass:**
- ✅ Solvability >90% on 100 random seeds
- ✅ Average completion time 5-10 minutes
- ✅ Mobile render <100ms on mid-range device

**Nice to Have:**
- Analytics integration for real win rate data
- A/B test results comparing 1, 2, 3 free cells
