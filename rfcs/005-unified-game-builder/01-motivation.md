# 01: Motivation

## Current State: 70-75% There

You've built an excellent foundation. The shared library is comprehensive, both games follow consistent patterns, and the architecture is clean. But there's a gap preventing truly config-driven games.

### Architecture Maturity Scorecard

| Component | Maturity | Notes |
|-----------|----------|-------|
| **Shared Library** | 90% | Components, hooks, rules are very reusable |
| **Type Safety** | 85% | Good interfaces, minor inconsistencies between games |
| **Validation Rules** | 80% | Core rules shared, game-specific rules well organized |
| **Move Execution** | 60% | Different patterns (Klondike generic vs FreeCell routing) |
| **Component Reuse** | 70% | Tableau/Foundation reusable but need game-specific logic |
| **State Management** | 50% | Different schemas, no shared pattern |
| **Configuration** | 30% | No config-driven game setup yet |
| **Documentation** | 75% | Good RFC, architecture docs, but no unified pattern guide |
| **Test Coverage** | 85% | 1600+ tests, good coverage in both games |
| **Deployment** | 90% | Monorepo setup, both games auto-deploy to GitHub Pages |

**Overall Score: 72/100** (Very Good Foundation, Needs Consolidation)

## What's Already Shared (~1835 lines)

### Components (`@cardgames/shared/components/`)
- `Card.tsx` - Universal card display
- `CardBack.tsx` - Card back with CSS patterns
- `EmptyCell.tsx` - Empty column placeholder
- `GameControls.tsx` - New Game/Undo/Redo/Settings/Help
- `DraggingCardPreview.tsx` - Visual feedback during drag

### Hooks (`@cardgames/shared/hooks/`)
- `useGameHistory.ts` - Undo/redo system with localStorage persistence
- `useCardInteraction.ts` - Unified drag-and-drop + click-to-select interaction

### Rules (`@cardgames/shared/rules/`)
- `solitaireRules.ts`:
  - `isRed()`, `isBlack()` - Color detection
  - `hasAlternatingColors()`, `hasSameSuit()` - Color/suit rules
  - `canStackDescending()` - Descending rank with optional color alternation
  - `canStackOnFoundation()` - Ace→King foundation rules
  - `isValidTableauSequence()` - Multi-card sequence validation
  - **100% reusable for any tableau-based game**

### Types (`@cardgames/shared/types/`)
- `Card.ts`, `GameLocation.ts`, `CardInteraction.ts`
- Unified location type supports all current games

## What's Still Duplicated (~620 lines)

### 1. Move Execution Patterns

**Klondike** (~160 lines):
```typescript
// Generic function
function moveCards(state, from, to, count) {
  // ... 160 lines of move logic
}
```

**FreeCell** (~180 lines):
```typescript
// Specialized functions
function moveCardToFreeCell(state, from, to) { ... }
function moveCardFromFreeCell(state, from, to) { ... }
function moveCardToFoundation(state, from, to) { ... }
// ... 5 different functions
```

**Problem**: Inconsistent patterns prevent easy abstraction.

### 2. Validation Logic (~170 lines duplicated)

Both games have similar validation structure but different implementations:
- Tableau→tableau validation
- Tableau→foundation validation
- Special area rules

### 3. Component Layout (~250 lines duplicated)

- `GameBoard.tsx`: ~450 lines (Klondike) vs ~550 lines (FreeCell)
- Similar structure, different game-specific areas
- Both manage interaction state, history, layout sizes

### 4. UI Handlers (~80 lines duplicated)

- Drag/drop + click handlers
- Being consolidated via `useCardInteraction` hook (in progress)

## Pain Points

### 1. Adding Spider Takes 3-4 Days

To add Spider Solitaire, you'd need:

| Task | Lines of Code | Time |
|------|---------------|------|
| Game state schema | ~50 | 2-3 hours |
| Validation rules | ~80-100 | 4-6 hours |
| Move execution | ~150-200 | 1 day |
| Game components | ~400-500 | 1 day |
| Tests | ~500+ | 1 day |
| **Total** | **~1200** | **3-4 days** |

Much of this code duplicates patterns from Klondike/FreeCell.

### 2. UI Perfection is 2-3x Effort

If you perfect Klondike's animations:
- Smooth card drag physics
- Card flip animations
- Win celebration effects
- Mobile touch optimization

**You must reimplement all of it for FreeCell and Spider.**

That's 2-4 weeks per game instead of 2-4 weeks once.

### 3. No Clear Pattern for New Games

Questions a new game developer asks:
- "Which file do I copy for a new game?"
- "Where do validation rules go?"
- "How do I hook into the interaction system?"
- "What's game-specific vs shared?"

**No single source of truth = slow onboarding**

### 4. Settings Inconsistency

Currently:
- FreeCell has extensive settings modal
- Klondike has basic controls
- No unified theme system
- No cross-game navigation

**Users expect consistent UX across games.**

## The Dream: Config-Driven Games

Adding Spider should be as simple as:

```typescript
// spider/spider.config.ts (~150-200 lines total)
export const SpiderConfig: GameConfig<SpiderGameState> = {
  metadata: {
    name: 'Spider Solitaire',
    id: 'spider',
    description: 'Classic 2-suit Spider'
  },

  layout: {
    numTableauColumns: 10,
    numFoundations: 8,
    specialAreas: ['stock']
  },

  rules: {
    tableauStackRule: 'sameSuit',
    emptyTableauRule: 'anyCard',
    foundationRule: 'completeSuit'
  },

  actions: SpiderGameActions,  // ~200 lines of game logic
  component: SpiderLayout       // ~50 lines of layout config
}
```

**Effort: <1 day** (down from 3-4 days)

## Why This Matters

### Short-term (3-6 months)

**Adding 3 more games** (Spider, Pyramid, Golf):
- **Current approach**: 3-4 days × 3 = 9-12 days
- **Unified approach**: <1 day × 3 = 3 days
- **Savings**: 6-9 days

**UI perfection**:
- **Current approach**: 2-4 weeks × 5 games = 10-20 weeks
- **Unified approach**: 4-5 weeks once = 4-5 weeks
- **Savings**: 6-15 weeks

### Long-term (1+ years)

- **Community contributions**: Clear pattern makes PRs easy
- **Maintenance**: Fix bugs once, all games benefit
- **Experimentation**: Try new interaction models quickly
- **Quality**: Consistent UX builds user trust

### Developer Experience

**Current workflow** (adding Spider):
1. Copy Klondike's structure (which files?)
2. Modify game state (what shape?)
3. Reimplement validation (what patterns?)
4. Build UI components (what props?)
5. Wire up interaction system (how?)
6. Write tests (what coverage?)

**Desired workflow** (adding Spider):
1. Create `spider.config.ts` (follow template)
2. Implement `SpiderGameActions` (~200 lines)
3. Run tests
4. Done

## Summary

**What we have**:
- Excellent shared library (90% mature)
- Strong test coverage (1600+ tests)
- Good documentation
- Clean architecture

**What's missing**:
- Standardized move execution interface
- Game configuration system
- Generic components that adapt to config
- Unified settings/menu experience

**The gap**: 25-30% of work to reach true unified builder

**Is it worth it?** If you plan 3+ more games: **Absolutely yes.**

---

Next: [02-solution.md](02-solution.md) - The three-phase approach to unification
