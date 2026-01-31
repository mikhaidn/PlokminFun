# Implementation Plan

Three-phase migration with feature flags for safe rollback.

## Phase Overview

| Phase | Duration | Focus | Risk |
|-------|----------|-------|------|
| Phase 1 | 2 days | Extract shared validation rules | Low |
| Phase 2 | 3-4 days | Migrate to useCardInteraction hook | Medium |
| Phase 3 | 2 days | Refactor FreeCell & cleanup | Low |

**Total:** 6-8 days

## Phase 1: Extract Shared Validation (2 days)

**Goal:** Create `@plokmin/shared/rules/` with generic validation functions.

**Key Deliverables:**
- `shared/rules/solitaireRules.ts` with validation helpers
- 100% test coverage on shared rules
- FreeCell migrated to use shared rules
- Klondike migrated to use shared rules

**Impact:** ~100 lines of duplicate validation code removed

**Risk:** Low (pure refactor, heavily tested)

[Full Phase 1 Details →](./phase-1.md)

---

## Phase 2: Migrate to useCardInteraction Hook (3-4 days)

**Goal:** Both games use `useCardInteraction` for all click/drag/touch interactions.

**Key Deliverables:**
- `shared/types/GameLocation.ts` with unified location type
- Updated `useCardInteraction` hook
- Klondike migrated to shared hook (with feature flag)
- FreeCell migrated to shared hook (with feature flag)
- Comprehensive manual testing on desktop and mobile

**Impact:** ~300 lines of duplicate interaction code removed

**Risk:** Medium (behavior change, but feature flag allows rollback)

[Full Phase 2 Details →](./phase-2.md)

---

## Phase 3: Refactor FreeCell & Cleanup (2 days)

**Goal:** Finalize consolidation and remove old code.

**Key Deliverables:**
- FreeCell refactored to use generic `moveCards(from, to, count)` pattern
- Old click/drag/touch handlers removed from both games
- Feature flags removed
- Documentation updated (CLAUDE.md, STATUS.md, ROADMAP.md)
- Performance validated

**Impact:** Final cleanup, ~200 additional lines removed

**Risk:** Low (already tested in Phase 2)

[Full Phase 3 Details →](./phase-3.md)

---

## Migration Strategy

### Feature Flag Approach

```typescript
// shared/config/featureFlags.ts
export const FEATURE_FLAGS = {
  USE_SHARED_INTERACTION_HOOK: true,  // Toggle for rollback
} as const;
```

**Rollback:** Set flag to `false` if issues found (< 5 minutes recovery)

### Testing Strategy

**Each Phase:**
1. Implement changes
2. Run automated tests (npm test)
3. Manual smoke tests on desktop + mobile
4. Commit only when all tests pass

**Full regression:** Run complete test suite before moving to next phase

### Monitoring

**Phase 2-3 Monitoring Period:**
- Deploy to GitHub Pages after Phase 2
- Monitor for 1 week before Phase 3
- Fix any critical bugs immediately
- Keep feature flag for instant rollback

---

## Success Criteria

### Overall
- [ ] 600-700 lines of duplicate code removed
- [ ] All existing tests pass (no regressions)
- [ ] 90%+ test coverage on shared code
- [ ] No performance degradation
- [ ] Mobile interactions work perfectly

### Per Phase
See individual phase files for detailed acceptance criteria.
