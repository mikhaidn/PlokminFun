# FreeCell MVP Testing Guide

## Quick Start

### 1. Run Unit Tests
```bash
cd freecell-mvp
npm run test
```

Expected: All tests should pass (100+ tests across all modules)

### 2. Run Dev Server
```bash
npm run dev
```

Open browser to `http://localhost:5173`

---

## Unit Testing

### Run All Tests
```bash
npm run test
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

**Expected Coverage:**
- Core modules (rng, deck): 100%
- Rules (validation, movement): 100%
- State (gameState, gameActions): 95%+

---

## Manual Testing Scenarios

### Scenario 1: Reproducible Games
**Purpose:** Verify seeded RNG works correctly

1. Start the game, note the seed number in header
2. Play 3-4 moves
3. Click "Change Seed", enter the same seed
4. Click "Start Game"

✅ **Expected:** Identical starting card layout

❌ **Failure:** Different layout means RNG is broken

---

### Scenario 2: Tableau Movement
**Purpose:** Verify tableau stacking rules

1. Click a red card on top of a tableau column
2. Click a black card with rank 1 higher
   - Example: Click 7♥, then click 8♠

✅ **Expected:** Red 7 moves onto Black 8 (alternating colors, descending rank)

3. Try clicking same color cards
   - Example: Click 7♥, then click 8♥

✅ **Expected:** Card deselects (invalid move rejected)

4. Try wrong rank
   - Example: Click 7♥, then click 9♠

✅ **Expected:** Card deselects (rank must descend by exactly 1)

---

### Scenario 3: Free Cell Usage
**Purpose:** Verify free cell mechanics

1. Click a card at top of tableau column
2. Click an empty free cell slot (top left area)

✅ **Expected:** Card moves to free cell

3. Try moving a stack to free cell

✅ **Expected:** Nothing happens (only single cards allowed in free cells)

4. Click the card in free cell
5. Click a valid tableau destination

✅ **Expected:** Card moves from free cell to tableau

---

### Scenario 4: Foundation Building
**Purpose:** Verify foundation rules

1. Find an Ace on top of a tableau column
2. Click the Ace
3. Click an empty foundation slot (top right, shows suit symbol)

✅ **Expected:** Ace moves to foundation

4. Find the 2 of the same suit
5. Click the 2, then click the foundation with the Ace

✅ **Expected:** 2 stacks on Ace

6. Try moving wrong suit

✅ **Expected:** Move rejected

7. Try skipping ranks (3 on Ace)

✅ **Expected:** Move rejected

---

### Scenario 5: Stack Movement
**Purpose:** Verify multi-card moves

**Setup:** Build a valid stack on tableau:
- Black 8
- Red 7
- Black 6

1. Click the Red 7 (middle of stack)
2. Click a valid destination (e.g., Red 9 on another column)

✅ **Expected:**
- If enough free cells/empty columns: Red 7 and Black 6 move together
- If not enough resources: Move rejected (card deselects)

**Max Movable Formula:** `(freeCells + 1) × 2^(emptyColumns)`

Examples:
- 4 free cells, 0 empty = max 5 cards
- 2 free cells, 1 empty = max 6 cards
- 0 free cells, 2 empty = max 4 cards

---

### Scenario 6: Win Condition
**Purpose:** Verify game completion detection

**Use known solvable seeds:**
- Seed 1
- Seed 100
- Seed 617

1. Enter a solvable seed via "Change Seed"
2. Play until all foundations are complete (A-K of each suit)

✅ **Expected:** Win modal appears showing:
- "Congratulations!"
- Move count
- Seed number

---

## Common Issues & Fixes

### Tests Fail
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run test
```

### Dev Server Won't Start
```bash
# Kill existing processes
lsof -ti:5173 | xargs kill -9
npm run dev
```

### TypeScript Errors
```bash
# Check TypeScript compilation
npx tsc --noEmit
```

---

## Testing Checklist

**Core Functionality:**
- [ ] Cards display correctly with proper colors
- [ ] Click to select/deselect works
- [ ] Tableau stacking follows rules (alternating colors, descending)
- [ ] Free cells accept single cards only
- [ ] Foundations build by suit from Ace to King
- [ ] Stack movement respects max movable calculation
- [ ] Move counter increments on each move
- [ ] Win detection works when all foundations complete
- [ ] Seed-based games are reproducible
- [ ] New game button resets with new seed
- [ ] Change seed works correctly

**Edge Cases:**
- [ ] Empty tableau columns accept any card
- [ ] Can't move to occupied free cell
- [ ] Can't move from empty free cell
- [ ] Can't move invalid stacks (broken sequence)
- [ ] Can't move stack larger than max movable
- [ ] Clicking same location deselects card

**Visual/UX:**
- [ ] Selected cards highlight correctly
- [ ] Empty cells are clearly visible
- [ ] Foundation labels show suit symbols
- [ ] Move count updates in real-time
- [ ] Win modal is readable and functional
- [ ] Seed input accepts numbers
- [ ] Buttons are clickable and responsive

---

## Unit Test Details

### RNG Module (`core/rng.test.ts`)
- Deterministic sequences
- Range validation (0-1)
- Different seeds produce different outputs

### Deck Module (`core/deck.test.ts`)
- Creates 52 cards
- Proper suit/rank distribution
- Shuffling is deterministic
- Doesn't mutate original deck

### Validation Rules (`rules/validation.test.ts`)
- Color detection (isRed, isBlack)
- Tableau stacking rules
- Foundation stacking rules
- Edge cases (empty columns, wrong suits, wrong ranks)

### Movement Rules (`rules/movement.test.ts`)
- Max movable calculation
- Stack validation
- Multi-card sequence checks

### Game State (`state/gameState.test.ts`)
- Initialization (8 columns, 7-7-7-7-6-6-6-6 distribution)
- Seed reproducibility
- Win condition detection

### Game Actions (`state/gameActions.test.ts`)
- Move to free cell
- Move from free cell
- Move to foundation
- Move tableau to tableau
- State immutability
- Invalid move rejection

---

## Performance Testing

### Load Test
Open dev tools console:
```javascript
// Measure render time
console.time('render');
// Play 50 moves
console.timeEnd('render');
```

✅ **Expected:** Smooth performance, no lag

### Memory Test
1. Open Chrome DevTools → Performance → Memory
2. Start profiling
3. Play full game
4. Check for memory leaks

✅ **Expected:** No continuous memory growth

---

## Next Steps After Testing

1. **Fix any failing tests**
2. **Address edge cases discovered during manual testing**
3. **Consider adding:**
   - Undo/redo (feature flag ready)
   - Hints system (feature flag ready)
   - Auto-complete (feature flag ready)
   - Animations
   - Mobile responsive design
4. **Prepare for deployment**

---

## Reporting Issues

When reporting bugs, include:
1. Seed number
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots (if visual)
5. Browser/OS version
