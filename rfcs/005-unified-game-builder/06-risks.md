# 06: Risks & Mitigations

## Risk Matrix

| Risk | Likelihood | Impact | Severity | Mitigation Status |
|------|------------|--------|----------|-------------------|
| Over-abstraction | Medium | High | 🟡 Medium-High | Strong |
| UI requirements break architecture | Low | High | 🟢 Low | Very Strong |
| Migration breaks existing games | Medium | Medium | 🟡 Medium | Strong |
| Timeline overruns | Medium | Low | 🟢 Low-Medium | Medium |
| Performance degradation | Low | Medium | 🟢 Low | Strong |
| Adoption resistance | Low | Low | 🟢 Low | Medium |

---

## Risk 1: Over-Abstraction

### Description
Generic system becomes too complex, harder to maintain than duplicated code.

### Symptoms
- New developers can't understand the abstraction
- Simple changes require touching many files
- Config schema becomes sprawling and confusing
- Edge cases require lots of special handling

### Impact
**High** - Defeats the purpose of unification

### Likelihood
**Medium** - Common trap in abstraction efforts

### Mitigation Strategy

**Before coding**:
1. Start with 2 concrete implementations (Klondike, FreeCell)
2. Only abstract patterns that exist in **both** games
3. Prototype Spider config to validate abstraction

**During development**:
1. **YAGNI principle**: Don't add config options "just in case"
2. Keep escape hatches: Games can override generic behavior
3. Regular code reviews focused on simplicity
4. Document "when to use generic vs custom"

**Validation**:
1. New developer review: Can someone unfamiliar understand it?
2. Spider implementation: Does config feel natural or forced?
3. Complexity metrics: Track cyclomatic complexity

**Example of good vs bad**:

```typescript
// ❌ BAD: Over-abstracted
interface GameConfig {
  layout: {
    areas: Array<{
      type: string;
      position: { x: number; y: number; z: number };
      renderStrategy: 'stack' | 'grid' | 'cascade' | 'radial';
      constraints: ComplexConstraintObject;
      // ... 50 more options
    }>;
  };
}

// ✅ GOOD: Pragmatic abstraction
interface GameConfig {
  layout: {
    numTableauColumns: number;
    numFoundations: number;
    specialAreas: Array<'stock' | 'waste' | 'freeCells'>;
  };
}
```

**Mitigation Effectiveness**: **High**

---

## Risk 2: UI Requirements Change Architecture

### Description
Perfect UI needs features the abstraction doesn't support, requiring rework.

### Symptoms
- Animations don't work with GenericGameBoard
- Mobile interactions need different state structure
- Theme system conflicts with game-specific styling

### Impact
**High** - Could invalidate entire Phase 2 work

### Likelihood
**Low** (with Phase 1 prototyping) - This is why we have Phase 1!

### Mitigation Strategy

**Phase 1 prototyping explicitly addresses this**:
1. Discover UI requirements **before** building abstraction
2. Design GameActions and GameConfig to support those requirements
3. Build animation hooks into the architecture from day 1

**Example of Phase 1 discovery**:

```typescript
// Phase 1 discovery: "Animations need callback when move completes"

// Before discovery:
interface GameActions {
  executeMove(state, from, to): State;
}

// After discovery:
interface GameActions {
  executeMove(state, from, to): State;
  onMoveAnimationComplete?: () => void;  // ← Added based on prototype
}
```

**If requirements emerge late**:
1. Extension points in GameConfig allow per-game customization
2. Can add optional methods to GameActions (backward compatible)
3. Component composition allows game-specific wrapping

**Validation**:
1. Build all target animations in prototype first
2. Review GameActions interface with UI requirements in mind
3. Ensure GenericGameBoard has slots for custom rendering

**Mitigation Effectiveness**: **Very High**

---

## Risk 3: Migration Breaks Existing Games

### Description
Refactoring introduces bugs in Klondike or FreeCell.

### Symptoms
- Tests failing after migration
- Visual regressions
- Undo/redo broken
- Game state corruption

### Impact
**Medium** - Can be fixed, but delays timeline

### Likelihood
**Medium** - Refactoring always carries risk

### Mitigation Strategy

**During migration**:
1. Maintain all 1600+ existing tests
2. Migrate one game at a time (Klondike first, then FreeCell)
3. Keep both old and new implementations during transition
4. Feature flag unified system for gradual rollout

**Testing approach**:
```bash
# Before migration
npm test  # Baseline: all tests pass

# After Klondike migration
cd klondike-mvp
npm test  # Must pass all original tests

# After FreeCell migration
cd freecell-mvp
npm test  # Must pass all original tests

# Full suite
npm test  # Everything passes
```

**Rollback plan**:
```typescript
// Feature flag for gradual adoption
const USE_UNIFIED_SYSTEM = process.env.REACT_APP_UNIFIED || false;

export function GameBoard() {
  if (USE_UNIFIED_SYSTEM) {
    return <GenericGameBoard config={KlondikeConfig} />;
  }
  return <LegacyGameBoard />;
}
```

**Visual regression**:
- Screenshot tests before migration
- Compare screenshots after migration
- Manual testing of all features

**Validation**:
- 100% of existing tests must pass
- Visual regression tests must pass
- Manual playthrough of each game

**Mitigation Effectiveness**: **Strong**

---

## Risk 4: Timeline Overruns

### Description
9-week estimate becomes 12-15 weeks.

### Symptoms
- Phases taking longer than estimated
- Scope creep
- Unexpected technical challenges

### Impact
**Low** - Delays but doesn't derail

### Likelihood
**Medium** - Software estimates are notoriously optimistic

### Mitigation Strategy

**Break into shippable increments**:
```
Week 2:   GameActions interface ← Can ship this alone
Week 3:   GameConfig system ← Can ship this alone
Week 5:   Generic components ← Can ship this alone
Week 7:   Smart tap ← Can ship this alone
```

**Prioritize core over polish**:
- Phase 2 (unification) is must-have
- Phase 3 (perfect UI) can be time-boxed
- Ship with "good enough" UI if needed

**Track progress weekly**:
- Monday: Review last week's progress
- Wednesday: Mid-week checkpoint
- Friday: Demo what's working
- Adjust scope if falling behind

**Scope flexibility**:

**Must-have** (can't cut):
- GameActions interface
- GameConfig system
- Generic components
- Klondike + FreeCell migration

**Should-have** (can defer):
- Unified settings modal
- Full theme system
- Advanced animations

**Nice-to-have** (can skip):
- 4 themes (ship with 2)
- Advanced mobile gestures
- Sound effects

**Mitigation Effectiveness**: **Medium**

---

## Risk 5: Performance Degradation

### Description
Abstraction layer adds overhead, games run slower.

### Symptoms
- Frame drops during drag
- Laggy animations
- Slower move execution
- Higher memory usage

### Impact
**Medium** - Hurts UX but not fatal

### Likelihood
**Low** - React is already fast enough for solitaire

### Mitigation Strategy

**Performance testing at each milestone**:

```javascript
// Benchmark before migration
const before = performance.now();
executeMove(state, from, to);
const afterBefore = performance.now();
console.log('Old system:', afterBefore - before);

// Benchmark after migration
const beforeNew = performance.now();
config.actions.executeMove(state, from, to);
const afterNew = performance.now();
console.log('New system:', afterNew - beforeNew);

// Assert no regression >10%
expect(afterNew - beforeNew).toBeLessThan((afterBefore - before) * 1.1);
```

**Optimization techniques**:
```typescript
// React.memo for expensive renders
export const GenericTableau = React.memo(({ columns, ... }) => {
  // Only re-renders when props change
});

// useMemo for expensive computations
const validMoves = useMemo(() => {
  return config.actions.getValidMoves(state, location);
}, [state, location]);

// Lazy loading for game configs
const SpiderConfig = lazy(() => import('./spider.config'));
```

**Benchmarks to track**:
- Move execution time: <10ms
- Drag frame rate: 60fps
- Animation smoothness: No jank
- Initial load time: <2s
- Bundle size: <500KB total

**Validation**:
- Chrome DevTools Performance tab
- Lighthouse performance score >90
- Real device testing (mid-range phones)

**If performance issues found**:
1. Profile with React DevTools
2. Optimize hot paths
3. Add memoization
4. Consider web workers for heavy computation (unlikely needed)

**Mitigation Effectiveness**: **Strong**

---

## Risk 6: Adoption Resistance

### Description
Team prefers old pattern, resists using unified system.

### Symptoms
- New games bypass GameConfig
- Direct state manipulation instead of GameActions
- Complaints about abstraction complexity

### Impact
**Low** - Doesn't prevent implementation, just adoption

### Likelihood
**Low** - Strong benefits should drive adoption

### Mitigation Strategy

**Make it obviously better**:
1. Spider demo shows <1 day implementation
2. Documentation clearly shows how to add games
3. Examples of game configs for common patterns

**Developer experience**:
```typescript
// Old way (400+ lines to start a new game)
mkdir new-game
cp -r klondike-mvp/* new-game/
// ... edit dozens of files

// New way (start with ~50 lines)
// new-game/game.config.ts
export const NewGameConfig: GameConfig = {
  // Just fill out config
};
```

**Education**:
- Write "Adding a New Game" guide
- Video walkthrough of adding Spider
- Code review enforcement
- Pair programming for first few adopters

**Mandate if needed**:
- Architecture decision: All new games use unified system
- Code review blocks games that don't follow pattern
- But allow exceptions with rationale

**Mitigation Effectiveness**: **Medium**

---

## Risk 7: Spider Doesn't Fit the Pattern

### Description
Discovered during Week 11: Spider's rules are too different, config doesn't work.

### Symptoms
- Spider needs special state structure
- Rules can't be expressed in GameConfig
- Requires extensive game-specific code

### Impact
**High** - Invalidates the "any solitaire game" premise

### Likelihood
**Low** - Spider is well-understood, similar to existing games

### Mitigation Strategy

**Validate early**:
1. Sketch Spider config during Phase 1
2. Review with someone who knows Spider well
3. Identify any unique requirements

**Spider-specific requirements**:
```typescript
// Spider might need:
- Different foundation rule (full suit vs ascending)
- Multi-deck support (2 decks, 104 cards)
- Same-suit stacking rule

// All supportable in current design:
interface GameConfig {
  rules: {
    foundationRule: 'sameSuit' | 'completeSuit';  // ← completeSuit for Spider
    tableauStackRule: 'sameSuit';                   // ← Spider's rule
    // ...
  };
  deck: {
    numDecks: 2;  // ← Spider uses 2 decks
  };
}
```

**Escape hatch**:
If Spider truly doesn't fit, it can still use GameActions interface without full GameConfig:

```typescript
// Still get benefit of shared interface
class SpiderGameActions implements GameActions<SpiderGameState> {
  // ...
}

// But custom component
<SpiderGameBoard actions={new SpiderGameActions()} />
```

**Validation**:
- Review Spider rules in Phase 1
- Prototype Spider config in Week 3
- Build Spider in Week 11 to prove system

**Mitigation Effectiveness**: **Medium-High**

---

## Overall Risk Assessment

**High-confidence risks** (well-mitigated):
- UI requirements (Phase 1 prototyping)
- Performance (benchmarking strategy)
- Migration bugs (testing + gradual rollout)

**Medium-confidence risks** (watch closely):
- Over-abstraction (need discipline)
- Timeline overruns (common in software)

**Low-confidence risks** (acceptable):
- Adoption resistance (benefits should drive adoption)
- Spider doesn't fit (can fall back to partial adoption)

**Overall risk level**: **Medium**

**Go/No-go recommendation**: **GO**
- Benefits outweigh risks
- Strong mitigation strategies in place
- Escape hatches available if needed

---

Next: [07-decisions.md](07-decisions.md) - Key architectural decisions
