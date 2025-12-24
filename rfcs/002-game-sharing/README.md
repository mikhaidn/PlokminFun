# RFC-002: Game Sharing and Replay System

**Author:** CardGames Team
**Status:** Proposed
**Created:** 2025-12-23
**Target:** FreeCell (immediate), All card games (future)

---

## TL;DR

Implement a compact move-based encoding system that enables users to share complete game sessions via URL or text. Encode a 100-move game in ~2KB (vs 520KB with current state-based approach), making URL sharing practical for social features, daily challenges, and bug reporting.

**Key Innovation:** Store moves (~20 bytes each) instead of game states (5.2KB each).

---

## Key Metrics

- **Target encoding size:** <2KB for 100-move game (260x smaller than current approach)
- **Decoding performance:** <50ms on mobile devices
- **Share rate goal:** >5% of completed games shared
- **Replay rate goal:** >20% of shared games replayed
- **Implementation effort:** 12-18 hours across 3 phases

---

## Quick Facts

- ✅ No backend required (pure client-side)
- ✅ URL-safe encoding fits in query parameters
- ✅ Deterministic replay from seed + moves
- ✅ Backward compatible with existing undo/redo
- ✅ Prerequisite for daily challenge feature

---

## Navigation

- [01-motivation.md](./01-motivation.md) - Problem statement and user needs
- [02-solution.md](./02-solution.md) - Move-based encoding architecture
- [03-alternatives.md](./03-alternatives.md) - Rejected approaches and rationale
- [04-implementation.md](./04-implementation.md) - 3-phase development plan
- [05-testing.md](./05-testing.md) - Test strategy, metrics, and risk mitigation

---

## Decision Status

**PROPOSED** - Awaiting review before implementation begins.
