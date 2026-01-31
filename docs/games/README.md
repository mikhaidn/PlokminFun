# Game-Specific Documentation

This directory contains documentation specific to each game implementation.

---

## 🎮 Available Games

- **[freecell.md](freecell.md)** - FreeCell implementation details
- **[klondike.md](klondike.md)** - Klondike (Solitaire) implementation details
- **[shared-library.md](shared-library.md)** - @plokmin/shared library guide

---

## 🚀 Quick Reference

### FreeCell
- **Live:** https://mikhaidn.github.io/PlokminFun/freecell/
- **Rules:** 8 tableau columns, 4 free cells, 4 foundations
- **Stack movement:** Limited by free cells and empty columns
- **Tests:** 191+ tests
- **Docs:** [freecell.md](freecell.md), [freecell-mvp/README.md](../../freecell-mvp/README.md)

### Klondike
- **Live:** https://mikhaidn.github.io/PlokminFun/klondike/
- **Rules:** 7 tableau columns, stock/waste, 4 foundations
- **Modes:** Draw-1 and Draw-3
- **Tests:** 1,415+ tests
- **Docs:** [klondike.md](klondike.md)

### Shared Library
- **Package:** `@plokmin/shared`
- **Components:** GameControls, DraggingCardPreview
- **Hooks:** useGameHistory, useCardInteraction
- **Docs:** [shared-library.md](shared-library.md)

---

## 🎯 Choose Your Game

**I want to...**
- Work on FreeCell → [freecell.md](freecell.md)
- Work on Klondike → [klondike.md](klondike.md)
- Work on shared components → [shared-library.md](shared-library.md)
