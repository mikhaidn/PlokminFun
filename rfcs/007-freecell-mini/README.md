# RFC-007: FreeCell Mini - Quick Daily Variant

**Status:** PROPOSED
**Author:** Claude Code
**Created:** 2026-01-14
**Updated:** 2026-01-14
**Target Version:** 1.4.0

---

## TL;DR

1. **Problem:** Players want a quick, mobile-friendly daily challenge variant that takes 5-10 minutes instead of 15-30 minutes for full FreeCell.
2. **Solution:** Create "FreeCell Mini" with 2 suits (26 cards), 4 tableau columns, 2 free cells, 2 foundations - optimized for daily play.
3. **Impact:** Mobile-first daily challenge game, 95%+ solvability, faster completion, perfect for commute/break gameplay.
4. **Effort:** 2-3 days (reuses 80% of FreeCell logic, mainly UI/layout changes).

---

## Quick Navigation

- **[01-motivation.md](01-motivation.md)** - Why a mini variant? Market fit for daily challenges.
- **[02-solution.md](02-solution.md)** - Game rules, board layout, and mechanics.
- **[03-implementation.md](03-implementation.md)** - How to build it (phases, reuse strategy).
- **[04-testing.md](04-testing.md)** - Test strategy and solvability targets.
- **[05-daily-challenge.md](05-daily-challenge.md)** - Integration with daily challenge system.

---

## Status Updates

**2026-01-14 - Initial proposal:**
- RFC created for review
- Awaiting feedback on game balance (2 suits vs 3 suits)
- Target: Quick daily challenge format

---

## Key Metrics

**Estimated effort:** 2-3 days
**Code reuse:** ~80% from existing FreeCell
**Lines of new code:** ~400 (mostly tableau layout adaptation)
**Risk level:** Low
**Breaking changes:** No (new game variant)

---

## Related

- **Related RFCs:** [RFC-006](../006-game-state-serialization/) (for daily challenges)
- **Dependencies:** Daily challenge system (P8 on roadmap)
- **Strategic fit:** Aligns with mobile-first, daily engagement goals

---

## Design Goals

1. **Quick Play:** 5-10 minute average completion (vs 15-30 for full FreeCell)
2. **Mobile First:** Less horizontal space, larger touch targets
3. **High Win Rate:** 95%+ solvability (vs ~99% for full FreeCell)
4. **Daily Format:** Perfect for daily challenge rotation
5. **Reuse First:** Leverage existing FreeCell codebase maximum
