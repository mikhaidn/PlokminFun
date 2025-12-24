# Phase 2: Klondike Integration

**Priority:** P1 (Proof of concept)
**Estimated Time:** 2-3 hours
**Status:** Not started
**Dependencies:** Phase 1 must be complete

## Objectives

- Integrate card backs into Klondike game
- Demonstrate that card back system works in a real game
- Validate game logic with face-down cards
- Ensure card flip behavior is correct

## Tasks

### 1. Add `faceUp` State to Klondike (1 hour)

**File:** `klondike-mvp/src/state/gameState.ts`

**Deliverables:**
- [ ] Update `KlondikeGameState` interface to track face orientation
- [ ] Add `faceUpCount` to tableau columns
- [ ] Add `allFaceDown` flag to stock pile
- [ ] Create `isCardFaceUp()` helper function
- [ ] Update game initialization to set face orientation
- [ ] Update move logic to flip cards when exposed

**Game State Structure:**
```typescript
interface KlondikeGameState {
  tableau: {
    cards: Card[];
    faceUpCount: number;  // How many cards at end are face-up
  }[];

  stock: {
    cards: Card[];
    allFaceDown: boolean;  // Stock is always face-down
  };

  waste: Card[];  // All face-up
  foundations: Card[][];  // All face-up

  seed: number;
  moves: number;
}
```

**Helper Function:**
```typescript
function isCardFaceUp(
  state: KlondikeGameState,
  location: Location,
  index: number
): boolean {
  if (location.type === 'tableau') {
    const column = state.tableau[location.columnIndex];
    const faceDownCount = column.cards.length - column.faceUpCount;
    return index >= faceDownCount;
  }

  if (location.type === 'stock') {
    return false;  // Stock always face-down
  }

  return true;  // Waste and foundations always face-up
}
```

**Acceptance Criteria:**
- Tableau columns track which cards are face-up
- Stock pile is always face-down
- Waste and foundations are always face-up
- Helper function correctly determines card orientation
- State is serializable (can save/load game)

### 2. Update Klondike Rendering (1 hour)

**Files:**
- `klondike-mvp/src/components/Tableau.tsx`
- `klondike-mvp/src/components/Stock.tsx`

**Deliverables:**
- [ ] Update `TableauColumn` to pass `faceUp` prop to cards
- [ ] Update `Stock` component to render face-down cards
- [ ] Ensure card spacing/overlap works with face-down cards
- [ ] Add visual distinction for face-down cards (optional)

**Tableau Rendering:**
```typescript
function TableauColumn({ column, columnIndex, gameState }: TableauColumnProps) {
  return (
    <div className="tableau-column">
      {column.cards.map((card, index) => {
        const faceUp = isCardFaceUp(gameState,
          { type: 'tableau', columnIndex },
          index
        );

        return (
          <Card
            key={card.id}
            card={card}
            faceUp={faceUp}
            cardWidth={layoutSizes.cardWidth}
            cardHeight={layoutSizes.cardHeight}
            fontSize={layoutSizes.fontSize}
          />
        );
      })}
    </div>
  );
}
```

**Stock Rendering:**
```typescript
function Stock({ stock }: StockProps) {
  return (
    <div className="stock">
      {stock.cards.length > 0 && (
        <Card
          card={stock.cards[0]}
          faceUp={false}  // Stock always face-down
          cardWidth={layoutSizes.cardWidth}
          cardHeight={layoutSizes.cardHeight}
          fontSize={layoutSizes.fontSize}
        />
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- Tableau renders correct mix of face-up and face-down cards
- Stock shows card back
- Waste shows card fronts
- Card overlap/spacing is visually correct
- No layout shifts when cards flip

### 3. Test Klondike Gameplay (1 hour)

**Test Scenarios:**

**Basic Rendering:**
- [ ] New game shows correct initial layout
  - Tableau column 1: all face-up
  - Tableau column 2: 1 face-down, 1 face-up
  - Tableau column 3: 2 face-down, 1 face-up
  - Etc.
- [ ] Stock pile shows card back
- [ ] Waste pile is empty

**Card Flipping:**
- [ ] Move card from tableau - top card flips face-up
- [ ] Deal from stock - card appears face-up in waste
- [ ] Move multiple cards - only top card of destination flips

**Game Logic:**
- [ ] Can't move face-down cards
- [ ] Can't see rank/suit of face-down cards
- [ ] Undo/redo preserves face orientation
- [ ] Win condition detection works correctly

**Edge Cases:**
- [ ] Empty tableau column (no crash)
- [ ] Single card in column (correct face orientation)
- [ ] All cards face-down (can't move anything)
- [ ] Rapid card flipping (no race conditions)

**Visual Testing:**
- [ ] Card backs look professional
- [ ] No visual glitches during flip
- [ ] High contrast mode works
- [ ] Mobile layout is correct

**Acceptance Criteria:**
- All test scenarios pass
- No console errors or warnings
- Game is playable and fun
- Card backs enhance gameplay (not confusing)

## Definition of Done

- [ ] All tasks completed
- [ ] All tests passing
- [ ] Klondike game playable with card backs
- [ ] No regressions in FreeCell
- [ ] Code reviewed and approved
- [ ] Manual testing completed on desktop and mobile

## Validation

### Manual Testing Checklist
1. **Start New Game**
   - Verify initial layout matches Klondike rules
   - Check that correct cards are face-down
   - Verify stock pile shows card back

2. **Play Game**
   - Move cards between tableau columns
   - Deal cards from stock to waste
   - Build foundations
   - Test undo/redo with card flips

3. **Win Game**
   - Complete full game
   - Verify win detection works
   - Check that all cards end up face-up

4. **Edge Cases**
   - Start multiple new games
   - Test different seeds
   - Try invalid moves (should be prevented)

### Performance Testing
1. Measure frame rate during gameplay (should be 60fps)
2. Check memory usage (should be stable)
3. Test on low-end mobile device
4. Verify no performance degradation vs FreeCell

## Known Limitations

- No flip animation (just instant state change) - handled in Phase 3
- No deal animation from stock - handled in Phase 3
- Only blue/red card backs - custom themes in future phases

## Next Steps

After Phase 2 completion:
- Gather user feedback on card backs
- Decide if Phase 3 (animations) is needed for v1
- Consider implementing Spider Solitaire using same system
- Update documentation with Klondike-specific guidance
