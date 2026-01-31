# RFC-004: Consolidate Card Movement Mechanics

**Status:** Draft
**Author:** Claude
**Created:** 2025-12-23
**Target Version:** 0.3.0

## TL;DR

Remove 600-700 lines of duplicate code by consolidating card movement mechanics:
- Extract shared validation rules to `@plokmin/shared`
- Migrate both games to use the existing `useCardInteraction` hook
- Standardize on `cardCount` (simplified representation)
- Refactor FreeCell to use Klondike's generic `moveCards(from, to, count)` pattern

## Key Metrics

- **Code Reduction:** ~600-700 lines removed
- **Estimated Effort:** 6-8 days
- **Risk Level:** Medium
- **Test Coverage Target:** 90%+ on shared code

## Quick Navigation

- [Motivation](./01-motivation.md) - Why we need this consolidation
- [Solution](./02-solution.md) - Shared validation and useCardInteraction approach
- [Alternatives](./03-alternatives.md) - Other approaches considered
- [Implementation](./04-implementation/README.md) - Three-phase implementation plan
- [Testing](./05-testing.md) - Test strategy and acceptance criteria
- [Decisions](./07-decisions.md) - Key architectural decisions

## Current Duplication

Both games independently implemented:
- Click-to-select/place handlers (~175 lines duplicated)
- Drag-and-drop logic (~85 lines duplicated)
- Touch handlers (~60 lines duplicated)
- Validation rules (~117 lines, 80% identical)
- Move execution (270 lines, different patterns)

## Implementation Phases

1. **Phase 1 (2 days):** Extract shared validation rules
2. **Phase 2 (3-4 days):** Migrate to useCardInteraction hook
3. **Phase 3 (2 days):** Refactor FreeCell & cleanup

## Success Criteria

- [x] Single source of truth for interaction logic
- [x] Both games use shared validation and interaction hook
- [x] All existing tests pass with no regressions
- [x] Performance maintained or improved
