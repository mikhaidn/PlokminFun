# Motivation

## Current State

Both games independently implemented:
- Click-to-select/place handlers (~175 lines duplicated)
- Drag-and-drop logic (~85 lines duplicated)
- Touch handlers (~60 lines duplicated)
- Validation rules (~117 lines, 80% identical)
- Move execution (270 lines, different patterns)

**Total duplication:** ~600-700 lines

## Problems

1. **Bug fixes must be applied twice** - Fix drag-and-drop in FreeCell, must also fix in Klondike
2. **Inconsistent behavior** - Games handle edge cases differently
3. **Unused shared code** - `useCardInteraction` hook exists but isn't used
4. **High barrier for new games** - Adding Spider Solitaire requires reimplementing all interaction logic
5. **Testing overhead** - Same logic tested twice in different files

## Benefits of Consolidation

### Short-term
- Single source of truth for interaction logic
- Easier bug fixes (fix once, applies everywhere)
- Better test coverage (test shared code thoroughly once)

### Long-term
- Adding new games becomes trivial (just implement game rules)
- Foundation for advanced features (tutorials, replays) that work across all games
- Easier accessibility improvements (keyboard navigation, screen reader support)

## Impact Analysis

**Code Reduction:**
```
Shared validation (duplicated):
  FreeCell: validation.ts ~61 lines
  Klondike: klondikeRules.ts ~56 lines
  → Can reduce to ~30 lines shared + ~15 lines each game-specific

Interaction handlers (duplicated):
  FreeCell GameBoard: ~240 lines (click, drag, touch handlers)
  Klondike GameBoard: ~180 lines (click, drag handlers)
  → Can reduce to ~50 lines each (just config + rendering)

Total reduction: ~600-700 lines
```

**Maintenance Impact:**
- Bug fixes: Apply once instead of twice
- New features: Implement once for all games
- Testing: Focus effort on shared code
