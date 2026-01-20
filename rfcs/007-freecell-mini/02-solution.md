# Solution: FreeCell Mini Game Design

## Game Rules

### Board Layout
```
┌─────────────────────────────────────┐
│  [FC] [FC]           [F♥] [F♠]     │  Free Cells (2) + Foundations (2)
├─────────────────────────────────────┤
│  [T1] [T2] [T3] [T4]                │  Tableau (4 columns)
│   7    7    6    6    (26 cards)    │
└─────────────────────────────────────┘
```

### Components
- **Deck:** 26 cards (hearts ♥ and spades ♠ only, A-K each)
- **Free Cells:** 2 (instead of 4)
- **Foundations:** 2 (one per suit)
- **Tableau:** 4 columns (instead of 8)
  - Columns 1-2: 7 cards each (14 cards)
  - Columns 3-4: 6 cards each (12 cards)
  - All cards face-up from start

### Game Mechanics
All standard FreeCell rules apply:
- **Tableau → Tableau:** Descending rank, alternating color (red-black)
- **Tableau → Free Cell:** Any top card to empty free cell
- **Tableau → Foundation:** Ascending rank by suit, starting with Ace
- **Free Cell → Tableau/Foundation:** Standard movement rules
- **Empty tableau columns:** Any card or sequence can move there
- **Supermove calculation:** Max movable sequence = (freeCells + 1) × 2^emptyTableauColumns

### Win Condition
All 26 cards moved to foundations (K♥ and K♠ as final cards).

---

## Visual Design

### Desktop Layout (1024px+)
```
┌────────────────────────────────────────────┐
│  FreeCell Mini                      [⚙️ ☰] │
│                                             │
│  🔲 🔲              🃏A♥ 🃏A♠              │  Larger cells
│                                             │
│  🂱  🂱  🂱  🂱                              │  4 columns
│  7♥  K♠  6♠  5♥                             │  with spacing
│  6♠  Q♥  5♥  4♠                             │
│  ...  ...  ...  ...                         │
└────────────────────────────────────────────┘
```

### Mobile Layout (375px)
```
┌──────────────────────┐
│ FreeCell Mini   [⚙️] │
│                       │
│ 🔲 🔲      🃏A♥ 🃏A♠ │
│                       │
│ 🂱 🂱 🂱 🂱           │  Full width
│ 7♥ K♠ 6♠ 5♥          │  No scroll
│ 6♠ Q♥ 5♥ 4♠          │  needed
│ ... ... ... ...       │
└──────────────────────┘
```

### Color Scheme
- **Hearts (♥):** Red/pink gradient (same as full FreeCell)
- **Spades (♠):** Black/dark blue gradient
- **High contrast:** Easy visual distinction on all devices

---

## Why 2 Suits? (vs 3 or 1)

### Option Analysis

**1 Suit (13 cards):**
- ❌ Too easy (trivial, ~100% win rate)
- ❌ No strategy depth
- ❌ Too short (~2-3 minutes)

**2 Suits (26 cards):** ✅ RECOMMENDED
- ✅ Balanced difficulty (95%+ solvability)
- ✅ Strategic depth (alternating colors matter)
- ✅ Perfect timing (5-10 minutes)
- ✅ Mobile-friendly (4 columns fit all screens)
- ✅ Clear color distinction (red vs black)

**3 Suits (39 cards):**
- ⚠️ Less mobile-friendly (6 columns = scrolling)
- ⚠️ Complexity closer to full game
- ⚠️ 10-15 minute playtime (not "mini")

---

## Solvability & Balance

### Target Win Rate: 95%+
- Full FreeCell: ~99% of random deals are solvable
- FreeCell Mini (2 suits): Estimated 95-98% solvable
- Strategy: Pre-validate daily challenge seeds for solvability

### Difficulty Tuning
If 2-suit proves too easy/hard:
- **Easier:** Increase free cells to 3 (vs 2)
- **Harder:** Reduce free cells to 1, or use 3 suits

### Daily Challenge Approach
- Generate 100 random seeds daily
- Test each for solvability (solver algorithm)
- Select seed with target move range (40-80 moves)
- Ensures consistent daily experience

---

## User Experience

### Tutorial Value
FreeCell Mini serves as excellent tutorial for full FreeCell:
- Same rules, simpler state
- Learn supermove mechanics
- Practice foundation building
- Graduate to full game

### Progression Path
1. **New players:** Start with Mini to learn
2. **Daily players:** Rotate Mini/Full for variety
3. **Mobile-first:** Mini as primary experience
4. **Completionists:** Both games in daily rotation

---

## Naming & Branding

**Primary Name:** "FreeCell Mini"
- Clear relationship to FreeCell
- "Mini" signals quicker gameplay
- Searchable, memorable

**Alternatives considered:**
- "FreeCell Express" - implies rushing (wrong tone)
- "FreeCell Lite" - implies lesser quality
- "FreeCell Daily" - locks into daily format only
- "FreeCell 2" - confusing (not a sequel)

**Icon:** 🎴 or 🃏 with "2" badge (2 suits)
