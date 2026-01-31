# Implementation Plan

## Phase 1: Core Game Logic (Day 1, 4-6 hours)

### 1.1 Create Game Package
```bash
# Create new workspace
mkdir freecell-mini
cd freecell-mini
npm init -y
# Copy package.json structure from freecell-mvp
# Update dependencies to match monorepo
```

### 1.2 Adapt Game State (2 hours)
**Source:** `freecell-mvp/src/state/gameState.ts`

**Changes needed:**
```typescript
// Deck generation - use only 2 suits
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'spades']; // Only 2 suits
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  return suits.flatMap(suit =>
    ranks.map(rank => ({ suit, rank, faceUp: true }))
  );
}

// Initial deal - 4 columns instead of 8
export function dealCards(shuffledDeck: Card[]): GameState {
  const tableau: Card[][] = [[], [], [], []]; // 4 columns

  // Deal pattern: 7, 7, 6, 6 (total 26)
  const columnSizes = [7, 7, 6, 6];
  let deckIndex = 0;

  columnSizes.forEach((size, colIndex) => {
    for (let i = 0; i < size; i++) {
      tableau[colIndex].push(shuffledDeck[deckIndex++]);
    }
  });

  return {
    tableau,
    freeCells: [null, null], // 2 free cells
    foundations: { hearts: [], spades: [] }, // 2 foundations
    // ... rest of state
  };
}
```

**Reused from FreeCell (no changes):**
- `gameActions.ts` - Move validation logic works identically
- `gameRules.ts` - All rules are the same
- Undo/redo system (`useGameHistory` hook)

### 1.3 Update Types (1 hour)
```typescript
// Update Foundation type
type Foundation = {
  hearts: Card[];
  spades: Card[];
  // Remove diamonds, clubs
};

// Update game config
const GAME_CONFIG = {
  tableauColumns: 4,      // vs 8
  freeCells: 2,           // vs 4
  suits: ['hearts', 'spades'] as const,
  deckSize: 26,           // vs 52
};
```

### 1.4 Win Condition (30 minutes)
```typescript
export function isGameWon(state: GameState): boolean {
  // All foundations must have 13 cards (A-K)
  return state.foundations.hearts.length === 13 &&
         state.foundations.spades.length === 13;
}
```

### 1.5 Supermove Calculation (30 minutes)
```typescript
// Same algorithm, just fewer locations
export function calculateMaxMovableCards(
  freeCells: (Card | null)[],
  tableau: Card[][]
): number {
  const emptyFreeCells = freeCells.filter(c => c === null).length;
  const emptyTableauColumns = tableau.filter(col => col.length === 0).length;

  // Formula: (freeCells + 1) × 2^emptyColumns
  return (emptyFreeCells + 1) * Math.pow(2, emptyTableauColumns);
}
```

---

## Phase 2: UI Components (Day 2, 4-6 hours)

### 2.1 Copy & Adapt from FreeCell
**Copy these files:**
- `src/components/GameBoard.tsx`
- `src/components/Tableau.tsx`
- `src/App.tsx`

**Changes needed:**

#### GameBoard.tsx
```typescript
// Update layout for 4 columns
<div className="tableau">
  {state.tableau.map((column, index) => (
    <TableauColumn
      key={index}
      columnIndex={index}
      cards={column}
      // ... same props
    />
  ))}
</div>
```

#### CSS Updates (src/styles/GameBoard.css)
```css
/* Tableau - 4 columns instead of 8 */
.tableau {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Was: repeat(8, ...) */
  gap: 1rem; /* More spacing with fewer columns */
  max-width: 900px; /* Narrower than full FreeCell */
}

/* Mobile optimization */
@media (max-width: 768px) {
  .tableau {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    /* No scrolling needed! */
  }
}
```

### 2.2 Foundation Area
```typescript
// Update to show only 2 foundations
<FoundationArea
  foundations={state.foundations}
  suits={['hearts', 'spades']} // Pass only active suits
  // ... same interaction props
/>
```

### 2.3 Free Cells Area
```typescript
// Update to show only 2 free cells
<div className="free-cells">
  {state.freeCells.map((card, index) => (
    <EmptyCell key={index} title={`Free Cell ${index + 1}`}>
      {card && <Card {...card} />}
    </EmptyCell>
  ))}
</div>
```

### 2.4 Reuse from @plokmin/shared
**No changes needed for:**
- `<GameControls>` - Undo, redo, new game, settings
- `<Card>` - Card rendering component
- `<EmptyCell>` - Empty slot component
- `<DraggingCardPreview>` - Drag feedback
- `<SettingsModal>` - Game settings
- `useGameHistory` hook - Undo/redo
- `useCardInteraction` hook - Drag/tap/click

---

## Phase 3: Testing (Day 2-3, 4-6 hours)

### 3.1 Adapt Existing Tests
Copy test files from `freecell-mvp/__tests__/` and update:

```typescript
// gameState.test.ts - Update expectations
describe('createDeck', () => {
  it('creates a 26-card deck with 2 suits', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(26);

    const suits = new Set(deck.map(c => c.suit));
    expect(suits).toEqual(new Set(['hearts', 'spades']));
  });
});

// dealCards.test.ts - Update column sizes
describe('dealCards', () => {
  it('deals 4 tableau columns with pattern 7,7,6,6', () => {
    const state = dealCards(createShuffledDeck());
    expect(state.tableau).toHaveLength(4);
    expect(state.tableau[0]).toHaveLength(7);
    expect(state.tableau[1]).toHaveLength(7);
    expect(state.tableau[2]).toHaveLength(6);
    expect(state.tableau[3]).toHaveLength(6);
  });
});

// winCondition.test.ts - Update win state
describe('isGameWon', () => {
  it('returns true when both foundations complete', () => {
    const wonState = {
      foundations: {
        hearts: Array(13).fill({}),
        spades: Array(13).fill({}),
      },
      // ...
    };
    expect(isGameWon(wonState)).toBe(true);
  });
});
```

### 3.2 New Tests for Mini-Specific Logic
```typescript
// supermove.test.ts - Verify calculations with fewer cells
describe('calculateMaxMovableCards', () => {
  it('calculates correctly with 2 free cells', () => {
    expect(calculateMaxMovableCards([null, null], [[]])).toBe(6); // (2+1) × 2^1
    expect(calculateMaxMovableCards([null, card], [[]])).toBe(4); // (1+1) × 2^1
  });
});
```

### 3.3 Test Coverage Goals
- **Game state:** 95%+ (reuse existing tests)
- **Move validation:** 95%+ (same rules as full FreeCell)
- **UI components:** 80%+ (focus on layout differences)
- **Integration:** Win scenarios, undo/redo, move sequences

---

## Phase 4: Integration & Polish (Day 3, 2-3 hours)

### 4.1 Landing Page Update
```html
<!-- index.html - Add new game card -->
<a href="./freecell-mini/" class="game-card">
  <div class="game-icon">🎴</div>
  <h2>FreeCell Mini</h2>
  <p>Quick 2-suit variant perfect for daily challenges. 5-10 minute games!</p>
  <span class="status available">Play Now</span>
</a>
```

### 4.2 Routing & Deployment
```yaml
# .github/workflows/deploy.yml - Add mini build
- name: Build FreeCell Mini
  run: npm run build --workspace=freecell-mini

- name: Copy FreeCell Mini to deployment
  run: cp -r freecell-mini/dist gh-pages/freecell-mini
```

### 4.3 Monorepo Integration
```json
// package.json (root)
{
  "workspaces": [
    "shared",
    "freecell-mvp",
    "freecell-mini",  // Add new workspace
    "klondike-mvp",
    "dog-care-tracker"
  ],
  "scripts": {
    "dev:freecell-mini": "npm run dev --workspace=freecell-mini",
    "build:freecell-mini": "npm run build --workspace=freecell-mini",
    "test:freecell-mini": "npm run test --workspace=freecell-mini"
  }
}
```

### 4.4 Documentation Updates
- Add to `README.md` - List FreeCell Mini
- Update `STATUS.md` - New game status
- Update `ROADMAP.md` - Mark mini variant complete
- Add `docs/games/freecell-mini.md` - Game rules

---

## Code Reuse Summary

### Reused Components (80% of codebase)
| Component | Source | Changes |
|-----------|--------|---------|
| Game actions | `freecell-mvp/src/state/gameActions.ts` | None |
| Game rules | `freecell-mvp/src/state/gameRules.ts` | None |
| Move validation | Shared logic | None |
| Undo/redo | `@plokmin/shared` | None |
| Card components | `@plokmin/shared` | None |
| Settings | `@plokmin/shared` | None |
| Drag interaction | `@plokmin/shared` | None |

### New/Modified Code (20%)
| File | Type | Lines | Effort |
|------|------|-------|--------|
| `gameState.ts` | Modified | ~50 | 2h |
| `GameBoard.tsx` | Modified | ~30 | 1h |
| `GameBoard.css` | Modified | ~20 | 1h |
| `types.ts` | Modified | ~15 | 30m |
| Tests | Adapted | ~200 | 4h |
| **Total** | | **~315** | **8-9h** |

---

## Risk Mitigation

### Risk: Solvability Too Low
**Mitigation:** Pre-validate daily seeds, maintain seed library of known-solvable games

### Risk: Too Easy/Hard
**Mitigation:** A/B test with 1, 2, or 3 free cells; collect win rate data from analytics

### Risk: Not Mobile-Friendly Enough
**Mitigation:** Test on iPhone SE (375px), ensure no horizontal scroll, 44px touch targets

### Risk: Code Duplication
**Mitigation:** Share game logic via `@plokmin/shared`, only UI differs

---

## Success Metrics

**Must-have (MVP):**
- ✅ Game playable with standard FreeCell rules
- ✅ 4 tableau columns fit mobile screens (no scroll)
- ✅ All tests passing (95%+ coverage on logic)
- ✅ Build succeeds, deploys to GitHub Pages

**Should-have (Polish):**
- ✅ Win rate data after 100 test games
- ✅ Average completion time measured
- ✅ Mobile tested on iOS Safari, Android Chrome

**Nice-to-have (Future):**
- Daily challenge integration (RFC-006 dependency)
- Solvability pre-checker
- Move counter/timer display
