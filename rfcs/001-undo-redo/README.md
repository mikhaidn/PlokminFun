# RFC-001: Universal Undo/Redo System

**Status:** Proposed
**Created:** 2025-12-22
**Author:** CardGames Team
**Target:** FreeCell (immediate), All future games (reusable)

---

## TL;DR

Time-travel state management system providing undo/redo for FreeCell with a reusable pattern for all future card games. Uses immutable state snapshots with a simple React hook interface.

**Core Components:**
- `HistoryManager<TState>` - Generic state history manager
- `useGameHistory()` - React hook for game integration
- LocalStorage persistence for game state recovery

**Key Metrics:**
- Performance: <100ms per undo/redo operation
- Memory: <1MB for typical game (100 moves)
- Bundle: <5KB gzipped
- Test coverage: 100% on core HistoryManager

---

## Design Principles

- **Reusable First** - Works for any turn-based game
- **Memory Efficient** - Mobile-friendly (<1MB)
- **Developer Experience** - Makes debugging easier
- **Progressive Enhancement** - Core feature now, dev tools later

---

## Navigation

- **[01-motivation.md](./01-motivation.md)** - Why we need undo/redo
- **[02-solution.md](./02-solution.md)** - Architecture and implementation approach
- **[04-implementation.md](./04-implementation.md)** - Technical details and rollout plan
- **[05-testing.md](./05-testing.md)** - Testing strategy and success metrics

---

## Quick Start

```typescript
const { currentState, pushState, undo, redo, canUndo, canRedo } =
  useGameHistory<GameState>({
    initialState: initializeGame(seed),
    maxHistorySize: 100,
    persistKey: 'freecell-game'
  });
```
