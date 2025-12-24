# RFC-003: Card Backs and Flip Animations

**Author:** CardGames Team
**Status:** Approved
**Created:** 2025-12-23
**Target:** Klondike, Spider (immediate), All future games (reusable)

## TL;DR

Implement a card back rendering system that decouples front and back views from card data, enabling face-down cards for Klondike, Spider Solitaire, and future games. CSS-first approach targeting iPad 2 (2011+) with <10KB bundle size.

## Key Design Principles

- **Lightweight & Works Everywhere**: CSS-first, targets iPad 2 (2011+), <10KB bundle
- **Progressive Enhancement**: Card backs work without JavaScript
- **CardPack-First**: Current cards refactored as the default CardPack (marketplace-ready)
- **Backwards Compatible**: FreeCell works unchanged (all cards face-up by default)
- **Opt-In**: Games choose to use card backs by managing `faceUp` state
- **Decoupled**: Card appearance (front/back) is separate from card data
- **Extensible**: Foundation for future animations and custom card skins

## Performance Targets

- **FPS**: 30fps minimum, 60fps goal
- **Bundle Size**: <10KB for card backs only, <50KB for full pack
- **Rendering**: 52 face-down cards in <16ms (60fps frame)
- **Animation**: Flip animation smooth on low-end devices
- **Memory**: Card back patterns <100KB in memory
- **Target Device**: iPad 2 (2011) / iPad Mini 1 (2012)

## Status

**Approved** - Ready for implementation (5-7 hours total)
- Phase 1: CardPack interface + card backs (3-4 hours)
- Phase 2: Klondike integration (2-3 hours)
- Phase 3: Animations (Future)

## Navigation

- [01-motivation.md](./01-motivation.md) - Problem statement and success criteria
- [02-solution.md](./02-solution.md) - Proposed architecture and design
- [04-implementation/](./04-implementation/) - Implementation phases and timeline
- [05-testing.md](./05-testing.md) - Testing strategy and success metrics

## Decision

**Rationale:** Unblocks Klondike/Spider development, backwards compatible with FreeCell, simple CSS implementation, extensible for future themes and animations.
