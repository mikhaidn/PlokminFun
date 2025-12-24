# Motivation

## Problem Statement

### What problem are we solving?

**Current limitation**: All cards are always face-up. Games like Klondike and Spider Solitaire require face-down cards in the stock pile and tableau.

**Concrete examples:**
- **Klondike**: Stock pile cards are face-down until dealt
- **Spider Solitaire**: Initial tableau has face-down cards that flip when exposed
- **Future games**: Pyramid, TriPeaks, Yukon all need card backs

### Why solve it now?

- **Blocker for game #2**: Cannot implement Klondike or Spider without card backs
- **Early architecture**: Better to establish pattern before building more games
- **Foundation for animations**: Dealing and winning animations require flip transitions

## Performance Budget

### Target Devices

**Minimum supported:** iPad 2 (2011) / iPad Mini 1 (2012)
- Safari 9-10
- 512MB-1GB RAM
- A5 chip (dual-core 1GHz)

### Performance Targets

- **FPS**: 30fps minimum, 60fps goal
- **Bundle Size**: <10KB for card backs only, <50KB for full pack
- **Rendering**: 52 face-down cards in <16ms (60fps frame)
- **Animation**: Flip animation smooth on low-end devices
- **Memory**: Card back patterns <100KB in memory

### Progressive Enhancement

- **Card backs render without JavaScript** (pure CSS patterns)
- **Animations are CSS-first** (GPU-accelerated transforms)
- **JavaScript only for interactivity** (click, drag), not rendering
- **Graceful degradation** on unsupported browsers

## Success Criteria

- [ ] Card component can render face-down with a default blue card back
- [ ] FreeCell continues working unchanged (no code modifications required)
- [ ] New games can opt-in by managing `faceUp` in their game state
- [ ] Interface defined for future flip animations (CSS or JS-based)
- [ ] Pathway for custom card back themes (blue, red, pattern library)
- [ ] Performance: Rendering 52 face-down cards takes <16ms (60fps)

## Alternatives Considered

### Alternative 1: Add `faceUp` to Core `Card` Type

**Approach:**
```typescript
interface Card {
  suit: Suit;
  value: Value;
  rank: number;
  id: string;
  faceUp: boolean;  // Add to core type
}
```

**Pros:**
- ✅ Centralized state
- ✅ Card "knows" its orientation

**Cons:**
- ❌ Breaking change to FreeCell (would need to add `faceUp: true` to all cards)
- ❌ Violates single responsibility (card data vs. display state)
- ❌ Harder to serialize (do we save `faceUp` in seed-based replay?)

**Decision: REJECTED**
- Mixing data with display state
- Forces FreeCell to change unnecessarily
- `faceUp` is game-specific, not card-specific

### Alternative 2: Separate `FaceUpCard` and `FaceDownCard` Components

**Approach:**
```typescript
<FaceUpCard card={card} />
<FaceDownCard />  // No card data needed
```

**Pros:**
- ✅ Clear component separation
- ✅ Type safety (can't render face-down card with wrong data)

**Cons:**
- ❌ Duplication of card rendering logic
- ❌ Harder to animate flip (need to swap components)
- ❌ More components to maintain

**Decision: REJECTED**
- Single `<Card>` component with `faceUp` prop is simpler
- Easier to animate (change prop, not component)

### Alternative 3: Use Actual Card Back Images

**Approach:**
Load `card-back-blue.png`, `card-back-red.png`, etc.

**Pros:**
- ✅ More design flexibility
- ✅ Can use photorealistic textures

**Cons:**
- ❌ HTTP requests (slower initial load)
- ❌ Larger bundle size
- ❌ Need to create/license images

**Decision: DEFERRED**
- v1: CSS patterns (instant, zero overhead)
- v2: Add image support via `customImage` prop
- Users can opt-in to image-based backs later

### Alternative 4: Framer Motion for Animations

**Approach:**
Use `framer-motion` library for flip animations

**Pros:**
- ✅ Powerful animation library
- ✅ Handles complex sequences
- ✅ Spring physics

**Cons:**
- ❌ Adds 40KB to bundle
- ❌ Overkill for simple flip animation
- ❌ Learning curve

**Decision: DEFERRED**
- v1: Pure CSS animations (3D transforms)
- v2: Consider framer-motion if animations get complex (dealing sequences, winning cascades)
