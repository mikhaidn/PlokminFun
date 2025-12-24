# RFC-005: Unified Game Builder & UI Perfection Strategy

**Status:** PROPOSED
**Author:** Architecture Team
**Created:** 2025-12-24
**Updated:** 2025-12-24
**Target Version:** 2.0.0

---

## TL;DR

**Problem:** Adding new solitaire games (Spider, Pyramid, Golf) currently takes 3-4 days of duplicated effort. UI improvements must be implemented separately for each game.

**Solution:** Create a config-driven game builder where games are defined via configuration files (~150-200 lines) instead of 1200+ lines of duplicated code. Unify settings and menu experience across all games.

**Impact:** New games drop from 3-4 days to <1 day. UI perfection happens once and benefits all games. Code duplication reduced by 70%.

**Effort:** 9-10 weeks total across 3 phases: (1) UI prototype 2-3 days, (2) Unification 3-4 weeks, (3) Perfect UI 4-5 weeks.

---

## Quick Navigation

Read only what you need:

- **[01-motivation.md](01-motivation.md)** - Current state analysis, pain points, where we are vs where we want to be
- **[02-solution.md](02-solution.md)** - Three-phase approach: prototype → unify → perfect
- **[03-alternatives.md](03-alternatives.md)** - Build Spider first? Full framework? UI first? Trade-offs.
- **[04-implementation.md](04-implementation.md)** - Week-by-week plan, API designs, code examples
- **[05-testing.md](05-testing.md)** - Success criteria, metrics, validation strategy
- **[06-risks.md](06-risks.md)** - What could go wrong and how we'll mitigate
- **[07-decisions.md](07-decisions.md)** - Why UI after unification? Smart tap-to-move? Unified settings?

---

## Key Metrics

**Current effort to add new game:** 3-4 days (~1200 lines of code)
**Target effort after RFC:** <1 day (~300-400 lines)
**Code duplication eliminated:** ~600-700 lines
**Timeline:** 9-10 weeks
**Risk level:** Medium
**Breaking changes:** No (existing games migrate gradually)

---

## Status Updates

**2025-12-24 - RFC Created:**
- Initial proposal documented
- Analysis shows 70-75% toward unified builder already
- Excellent foundation with shared library (~1835 lines reusable)
- Main gap: Move execution patterns not standardized

---

## Related

- **Related RFCs:**
  - [RFC-004: Movement Mechanics](../004-movement-mechanics/) - Shared interaction system
  - [RFC-003: Card Backs](../003-card-backs/) - Visual customization patterns
- **GitHub Issues:** TBD
- **Pull Requests:** TBD

---

**Quick Start:** Read [01-motivation.md](01-motivation.md) to understand the current state, then skip to [02-solution.md](02-solution.md) for the proposed approach.
