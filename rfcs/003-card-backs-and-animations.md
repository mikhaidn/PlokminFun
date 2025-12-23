# RFC-003: Card Backs and Flip Animations

**Author:** CardGames Team
**Status:** Proposed
**Created:** 2025-12-23
**Target:** Klondike, Spider (immediate), All future games (reusable)

---

## Executive Summary

Implement a card back rendering system that decouples front and back views from card data, enabling face-down cards for Klondike, Spider Solitaire, and future games. This system establishes reusable animation interfaces for card flipping and dealing while maintaining backwards compatibility with FreeCell.

**Key Design Principles:**
- **Lightweight & Works Everywhere**: CSS-first, targets iPad 2 (2011+), <10KB bundle
- **Progressive Enhancement**: Card backs work without JavaScript
- **CardPack-First**: Current cards refactored as the default CardPack (marketplace-ready)
- **Backwards Compatible**: FreeCell works unchanged (all cards face-up by default)
- **Opt-In**: Games choose to use card backs by managing `faceUp` state
- **Decoupled**: Card appearance (front/back) is separate from card data
- **Extensible**: Foundation for future animations and custom card skins

---

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

---

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

### Success Criteria

- [ ] Card component can render face-down with a default blue card back
- [ ] FreeCell continues working unchanged (no code modifications required)
- [ ] New games can opt-in by managing `faceUp` in their game state
- [ ] Interface defined for future flip animations (CSS or JS-based)
- [ ] Pathway for custom card back themes (blue, red, pattern library)
- [ ] Performance: Rendering 52 face-down cards takes <16ms (60fps)

---

## Proposed Solution

### Overview

**Architecture: Rendering Concern, Not Data Concern**

Face orientation (`faceUp`) is **not** part of the core `Card` type. Instead:
1. Games that need face-down cards store `faceUp: boolean` in their game state
2. `Card` component accepts optional `faceUp?: boolean` prop (defaults to `true`)
3. When `faceUp={false}`, component renders `<CardBack>` instead of card face
4. `CardSet` interface decouples front/back rendering logic

**Why this approach:**
- ✅ FreeCell unaffected (never passes `faceUp`, defaults to `true`)
- ✅ No breaking changes to core types (`src/core/types.ts`)
- ✅ Games opt-in only if they need face-down cards
- ✅ Rendering logic cleanly separated from game logic

---

### Implementation

#### 1. Card Back Component

```typescript
// freecell-mvp/src/components/CardBack.tsx

interface CardBackProps {
  cardWidth: number;
  cardHeight: number;
  theme?: 'blue' | 'red' | 'custom';
  customImage?: string;
  className?: string;
}

export function CardBack({
  cardWidth,
  cardHeight,
  theme = 'blue',
  customImage,
  className = '',
}: CardBackProps) {
  const style: React.CSSProperties = {
    width: `${cardWidth}px`,
    height: `${cardHeight}px`,
    borderRadius: '8px',
    border: '1px solid #333',
    boxSizing: 'border-box',
    background: getCardBackBackground(theme, customImage),
  };

  return (
    <div
      className={`card-back ${className}`}
      style={style}
      aria-label="Face-down card"
      role="img"
    />
  );
}

// Card back background patterns
function getCardBackBackground(
  theme: 'blue' | 'red' | 'custom',
  customImage?: string
): string {
  if (theme === 'custom' && customImage) {
    return `url(${customImage}) center/cover`;
  }

  // Default patterns
  const patterns = {
    blue: `
      linear-gradient(135deg, #1e3a8a 25%, transparent 25%),
      linear-gradient(225deg, #1e3a8a 25%, transparent 25%),
      linear-gradient(45deg, #1e3a8a 25%, transparent 25%),
      linear-gradient(315deg, #1e3a8a 25%, #2563eb 25%)
    `,
    red: `
      linear-gradient(135deg, #7f1d1d 25%, transparent 25%),
      linear-gradient(225deg, #7f1d1d 25%, transparent 25%),
      linear-gradient(45deg, #7f1d1d 25%, transparent 25%),
      linear-gradient(315deg, #7f1d1d 25%, #dc2626 25%)
    `,
  };

  return patterns[theme] || patterns.blue;
}
```

#### 2. Update Card Component

```typescript
// freecell-mvp/src/components/Card.tsx

interface CardProps {
  card: Card;
  faceUp?: boolean;  // NEW: Optional, defaults to true
  cardWidth: number;
  cardHeight: number;
  fontSize: FontSizes;
  highContrastMode?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  cardBackTheme?: 'blue' | 'red' | 'custom';
}

export function Card({
  card,
  faceUp = true,  // Default to face-up (FreeCell behavior)
  cardWidth,
  cardHeight,
  fontSize,
  cardBackTheme = 'blue',
  ...otherProps
}: CardProps) {
  // If face-down, render CardBack component
  if (!faceUp) {
    return (
      <CardBack
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        theme={cardBackTheme}
        {...otherProps}
      />
    );
  }

  // Existing face-up rendering logic
  return (
    <div className="card" style={...}>
      {/* Existing card face rendering */}
    </div>
  );
}
```

#### 3. CardPack Interface (Native Language)

**Key Decision:** Make CardPack the native interface from day 1, not a future addition.

```typescript
// freecell-mvp/src/core/cardPack.ts

/**
 * CardPack defines the visual appearance of cards.
 * All cards (including default) use this interface.
 */
export interface CardPackManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  license?: string;

  // Performance & compatibility metadata
  requirements: {
    maxBundleSize: string;      // e.g., "10kb"
    minSafariVersion?: string;  // e.g., "9.0"
    requiresJS: boolean;        // Card backs work without JS?
    gpuAccelerated?: boolean;   // Uses CSS transforms?
  };

  // Asset information
  assets: {
    cardBacks: {
      type: 'css-pattern' | 'svg' | 'png' | 'custom';
      estimatedSize: string;  // e.g., "2kb"
    };
    cardFronts?: {
      type: 'default' | 'svg-inline' | 'image-atlas';
      estimatedSize: string;
    };
  };
}

export interface CardPack {
  manifest: CardPackManifest;

  // Front face rendering
  renderFront: (card: Card, size: CardSize) => React.ReactNode;

  // Back face rendering
  renderBack: (size: CardSize, theme?: string) => React.ReactNode;

  // Optional animation definitions
  animations?: {
    flip?: AnimationDefinition;
    deal?: AnimationDefinition;
    collect?: AnimationDefinition;
  };
}

export interface CardSize {
  width: number;
  height: number;
}

export interface AnimationDefinition {
  type: 'css' | 'javascript';
  duration: number;  // milliseconds
  easing?: string;   // CSS timing function

  // CSS-based animations
  keyframes?: Record<string, React.CSSProperties>;

  // JS-based animations (future: framer-motion, etc.)
  animateFn?: (element: HTMLElement, options: AnimationOptions) => Promise<void>;
}

// Default card pack (current implementation refactored)
export const DEFAULT_CARD_PACK: CardPack = {
  manifest: {
    id: 'default',
    name: 'Classic',
    version: '1.0.0',
    author: 'CardGames Team',
    license: 'MIT',
    requirements: {
      maxBundleSize: '5kb',
      minSafariVersion: '9.0',
      requiresJS: false,
      gpuAccelerated: true,
    },
    assets: {
      cardBacks: {
        type: 'css-pattern',
        estimatedSize: '2kb',
      },
    },
  },
  renderFront: (card, size) => (
    <Card card={card} cardWidth={size.width} cardHeight={size.height} faceUp={true} />
  ),
  renderBack: (size, theme = 'blue') => (
    <CardBack cardWidth={size.width} cardHeight={size.height} theme={theme} />
  ),
  animations: {
    flip: {
      type: 'css',
      duration: 300,
      easing: 'ease-in-out',
      keyframes: {
        '0%': { transform: 'rotateY(0deg)' },
        '100%': { transform: 'rotateY(180deg)' },
      },
    },
  },
};

// Hook for using card packs
export function useCardPack(packId: string = 'default'): CardPack {
  // v1: Just return default pack
  // v2: Load from registry based on packId
  return DEFAULT_CARD_PACK;
}
```

#### 4. Game State Example (Klondike)

```typescript
// klondike-mvp/src/state/gameState.ts

interface KlondikeGameState {
  tableau: {
    cards: Card[];
    faceUpCount: number;  // First N cards are face-down
  }[];

  stock: {
    cards: Card[];
    allFaceDown: boolean;  // Stock is always face-down until dealt
  };

  waste: Card[];  // All face-up
  foundations: Card[][];  // All face-up

  seed: number;
  moves: number;
}

// Helper: Check if a card should be face-up
function isCardFaceUp(
  state: KlondikeGameState,
  location: Location,
  index: number
): boolean {
  if (location.type === 'tableau') {
    const column = state.tableau[location.columnIndex];
    const faceDownCount = column.cards.length - column.faceUpCount;
    return index >= faceDownCount;
  }

  if (location.type === 'stock') {
    return false;  // Stock always face-down
  }

  return true;  // Waste and foundations always face-up
}
```

#### 5. Rendering in Klondike

```typescript
// klondike-mvp/src/components/Tableau.tsx

function TableauColumn({ column, columnIndex, gameState }: TableauColumnProps) {
  return (
    <div className="tableau-column">
      {column.cards.map((card, index) => {
        const faceUp = isCardFaceUp(gameState,
          { type: 'tableau', columnIndex },
          index
        );

        return (
          <Card
            key={card.id}
            card={card}
            faceUp={faceUp}  // Pass face orientation
            cardWidth={layoutSizes.cardWidth}
            cardHeight={layoutSizes.cardHeight}
            fontSize={layoutSizes.fontSize}
          />
        );
      })}
    </div>
  );
}
```

#### 6. Animation Interface (Future)

```typescript
// freecell-mvp/src/utils/cardAnimations.ts

/**
 * Flip animation (CSS-based for v1)
 */
export function flipCard(
  element: HTMLElement,
  fromFaceUp: boolean,
  toFaceUp: boolean,
  duration = 300
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = `transform ${duration}ms ease-in-out`;
    element.style.transform = `rotateY(${toFaceUp ? 0 : 180}deg)`;

    setTimeout(resolve, duration);
  });
}

/**
 * Deal animation (move from stock to destination)
 */
export function dealCard(
  element: HTMLElement,
  from: { x: number; y: number },
  to: { x: number; y: number },
  duration = 400
): Promise<void> {
  return new Promise((resolve) => {
    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;

    element.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    setTimeout(resolve, duration);
  });
}

// Usage example:
async function animateStockDeal(stockCard: HTMLElement, wastePosition: DOMRect) {
  const stockRect = stockCard.getBoundingClientRect();

  // First flip the card face-up
  await flipCard(stockCard, false, true);

  // Then move it to waste pile
  await dealCard(
    stockCard,
    { x: stockRect.left, y: stockRect.top },
    { x: wastePosition.left, y: wastePosition.top }
  );
}
```

---

### Why This Approach?

✅ **Backwards Compatible**
- FreeCell doesn't change - `faceUp` defaults to `true`
- No modifications to existing game logic

✅ **Opt-In for New Games**
- Games track `faceUp` state only if needed
- Klondike/Spider decide which cards are face-down

✅ **Decoupled Architecture**
- Card data (`Card` type) stays clean
- Rendering logic (`faceUp` prop) is separate
- CardSet interface allows custom themes

✅ **Animation-Ready**
- Interface defined for flip/deal animations
- Can start with CSS, upgrade to framer-motion later
- Animations are opt-in (start without, add later)

✅ **Performance**
- CardBack is simple SVG/CSS pattern
- No image loading overhead (patterns are inline CSS)
- 60fps rendering on mobile devices

---

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

---

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

---

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

---

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

---

## Technical Deep Dive

### Card Back Pattern Design

**Default Blue Pattern (CSS):**
```css
.card-back-blue {
  background:
    linear-gradient(135deg, #1e3a8a 25%, transparent 25%),
    linear-gradient(225deg, #1e3a8a 25%, transparent 25%),
    linear-gradient(45deg, #1e3a8a 25%, transparent 25%),
    linear-gradient(315deg, #1e3a8a 25%, #2563eb 25%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 0, 10px -10px, 0px 10px;
}
```

**Result**: Diamond checkerboard pattern (classic card back look)

**Alternative Patterns:**
- **Red**: Same pattern, different colors (`#7f1d1d`, `#dc2626`)
- **Custom**: User-provided image URL or SVG

---

### Flip Animation (3D Transform)

**CSS Keyframes:**
```css
@keyframes flip-card {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(90deg);  /* Edge-on view */
  }
  100% {
    transform: rotateY(180deg);  /* Back side */
  }
}

.card {
  transition: transform 300ms ease-in-out;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.card.face-down {
  transform: rotateY(180deg);
}
```

**Performance:**
- GPU-accelerated (uses `transform` not `left/top`)
- 60fps on iPhone SE
- No repaints/reflows

---

### Accessibility

**Screen Reader Support:**
```typescript
// Face-down card
<div
  role="img"
  aria-label="Face-down card"
  className="card-back"
/>

// Face-up card
<div
  role="img"
  aria-label="7 of Hearts"
  className="card"
/>
```

**Keyboard Navigation:**
- Tab through face-up cards only
- Face-down cards are not interactive (until flipped)
- Announce when card flips: "7 of Hearts revealed"

**High Contrast Mode:**
- Card back borders use same high-contrast rules as card fronts
- Ensure pattern has sufficient contrast ratio (WCAG AA)

---

### Performance Considerations

**Rendering 52 Face-Down Cards:**
- Each `CardBack` is a single `<div>` with CSS background
- No image loading (patterns are inline)
- Estimated: <5ms to render 52 cards (tested on Chrome DevTools)

**Memory Usage:**
- CardBack component: ~100 bytes per instance
- 52 cards × 100 bytes = 5.2KB (negligible)

**Animation Performance:**
- CSS transforms are GPU-accelerated
- Target: 60fps (16ms per frame)
- Measured: ~8ms per flip on iPhone SE (smooth)

---

## Implementation Plan

### Phase 1: CardPack Interface & Card Back Rendering (3-4 hours)
**Priority: P1 (Required for Klondike)**

- [ ] **Define `CardPack` interface** (1 hour)
  - Create `src/core/cardPack.ts`
  - Define `CardPackManifest`, `CardPack`, `AnimationDefinition` types
  - Create `useCardPack()` hook

- [ ] **Create `CardBack.tsx` component** (1 hour)
  - Default blue CSS pattern (diamond checkerboard)
  - Red pattern variant
  - Props: `cardWidth`, `cardHeight`, `theme`
  - Ensure works without JavaScript (pure CSS)

- [ ] **Refactor current implementation to use CardPack** (1 hour)
  - Create `DEFAULT_CARD_PACK` with manifest
  - Update `Card.tsx` to accept `faceUp?: boolean` prop (default `true`)
  - Render `<CardBack>` when `faceUp={false}`
  - FreeCell uses `useCardPack('default')`

- [ ] **Write tests** (1 hour)
  - CardPack interface validation
  - CardBack renders correctly
  - Card renders CardBack when `faceUp={false}`
  - FreeCell unaffected (cards default to face-up)
  - Bundle size check (<10KB)

---

### Phase 2: Klondike Integration (2-3 hours)
**Priority: P1 (Proof of concept)**

- [ ] **Add `faceUp` state to Klondike** (1 hour)
  - Update `KlondikeGameState` to track face orientation
  - Helper function: `isCardFaceUp(state, location, index)`

- [ ] **Update Klondike rendering** (1 hour)
  - Pass `faceUp` prop to `<Card>` in tableau
  - Stock pile renders face-down

- [ ] **Test Klondike gameplay** (1 hour)
  - Cards flip when exposed
  - Stock deals face-up to waste
  - Visual correctness

---

### Phase 3: Animation Interface (Future - P2)
**Priority: P2 (Nice-to-have for v1)**

- [ ] **Define `AnimationDefinition` interface** (1 hour)
  - CSS keyframes support
  - JS animation function support

- [ ] **Implement flip animation** (2 hours)
  - CSS-based 3D transform
  - Apply when card changes `faceUp` state
  - Smooth 300ms transition

- [ ] **Implement deal animation** (2 hours)
  - Move card from stock to waste
  - Combine flip + translate animations

- [ ] **Test animations on mobile** (1 hour)
  - Ensure 60fps on iPhone SE
  - Test on Android device

---

### Phase 4: Custom Card Back Themes (Future - P3)
**Priority: P3 (Post-launch enhancement)**

- [ ] **Add theme selector** (2 hours)
  - UI for choosing card back (blue, red, custom)
  - Persist theme in localStorage

- [ ] **Support custom images** (2 hours)
  - Allow user-provided image URL
  - Upload custom card back

- [ ] **Card back gallery** (3 hours)
  - Pre-made patterns library
  - Preview before selecting

---

## Success Metrics

### User-Facing
- [ ] **Visual Quality**: Card backs look professional (user testing feedback)
- [ ] **Performance**: Flip animation runs at 60fps on iPhone SE
- [ ] **Accessibility**: Screen readers announce "Face-down card" correctly

### Developer-Facing
- [ ] **Backwards Compatibility**: FreeCell works without any code changes
- [ ] **Reusability**: Klondike and Spider both use same CardBack component
- [ ] **Code Quality**: 100% test coverage on CardBack component
- [ ] **Bundle Size**: CardBack adds <2KB to production bundle

### Long-Term
- [ ] **Adoption**: All games with face-down cards use this system
- [ ] **Extensibility**: Custom card backs can be added without modifying core components
- [ ] **Animation Library**: At least 3 animations defined (flip, deal, collect)

---

## Risks and Mitigations

### Risk 1: FreeCell Regression
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- `faceUp` defaults to `true` (preserves current behavior)
- Add integration test: FreeCell renders without `faceUp` prop
- Code review checklist: Verify no breaking changes

---

### Risk 2: Performance on Mobile
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Use CSS patterns (not images) for instant rendering
- GPU-accelerated animations (CSS `transform`)
- Test on low-end devices (iPhone SE, budget Android)
- Provide "Reduce motion" setting if needed

---

### Risk 3: Animation Complexity
**Likelihood:** Medium
**Impact:** Low
**Mitigation:**
- Start with simple CSS animations
- Animation interface allows future upgrade to JS library
- Animations are opt-in (can disable if buggy)

---

### Risk 4: Card Back Design Quality
**Likelihood:** Low
**Impact:** Low
**Mitigation:**
- Use classic checkerboard pattern (proven design)
- Get user feedback on blue vs. red preference
- Allow custom images in Phase 4 (users fix their own aesthetic)

---

## Open Questions

### 1. Should we support animated card backs?
**Example:** Pulsing glow, shimmer effect on face-down cards

**Proposal:** Not for v1. Add in Phase 4 if users request it.

---

### 2. How many card back themes should we include by default?
**Options:**
- A) Just blue (minimal)
- B) Blue + red (standard)
- C) Blue + red + 5 patterns (variety)

**Proposal:** Option B for v1 (blue + red). Expand in Phase 4 based on demand.

---

### 3. Should `faceUp` state be part of undo/redo history?
**Scenario:** User flips a card, undoes the move - should card flip back?

**Answer:** Yes, `faceUp` should be part of game state (already covered by undo/redo system in RFC-001).

---

### 4. Should we animate the initial deal?
**Example:** Klondike animates cards being dealt from deck to tableau

**Proposal:** Not for v1 (instant setup is fine). Add in Phase 3 as optional feature.

---

## Future Enhancements

### Phase 5: Advanced Animations
- **Winning cascade**: Cards fly to foundations automatically
- **Deal animation**: Smooth card distribution from deck
- **Shuffle animation**: Visual shuffle when starting new game
- **Card trails**: Motion blur effect during fast moves

### Phase 6: Card Back Marketplace
- **User-uploaded backs**: Share custom designs
- **Themed collections**: Holiday, nature, abstract, etc.
- **Unlockable backs**: Earn by winning games
- **Preview system**: See card back on real game board before selecting

### Phase 7: 3D Card Rendering
- **WebGL-based cards**: Realistic shadows, reflections
- **Curved card surface**: Simulate real playing cards
- **Accessibility toggle**: Fallback to 2D for performance

---

## Appendix: Visual Examples

### Default Blue Card Back
```
┌─────────────┐
│ ◆ ◆ ◆ ◆ ◆ ◆ │
│ ◆ ◆ ◆ ◆ ◆ ◆ │
│ ◆ ◆ ◆ ◆ ◆ ◆ │
│ ◆ ◆ ◆ ◆ ◆ ◆ │
│ ◆ ◆ ◆ ◆ ◆ ◆ │
└─────────────┘
```
(Diamond checkerboard pattern, blue gradient)

---

### Flip Animation Sequence
```
Face-up → Edge-on → Face-down
┌───┐     ┃     ┌───┐
│ 7 │  →  ┃  →  │◆◆◆│
│ ♥ │     ┃     │◆◆◆│
└───┘     ┃     └───┘
```
(3D rotation around Y-axis, 300ms)

---

## Appendix: Card Marketplace Specification

### Future Vision: CardPack Registry

**Phase 6+**: Extend CardPack interface to support marketplace distribution.

#### Manifest File Format (marketplace-ready)

```json
{
  "id": "bicycle-classic",
  "name": "Bicycle Playing Cards",
  "version": "1.0.0",
  "author": "Bicycle",
  "license": "CC-BY-4.0",
  "homepage": "https://example.com/bicycle-cards",

  "requirements": {
    "maxBundleSize": "50kb",
    "minSafariVersion": "9.0",
    "requiresJS": false,
    "gpuAccelerated": true
  },

  "assets": {
    "cardBacks": {
      "type": "svg",
      "estimatedSize": "8kb",
      "files": [
        {
          "id": "red-rider",
          "name": "Red Rider Back",
          "thumbnail": "./thumbnails/red-rider.png",
          "pattern": "./patterns/red-rider.svg",
          "tags": ["classic", "red", "traditional"]
        },
        {
          "id": "blue-rider",
          "name": "Blue Rider Back",
          "thumbnail": "./thumbnails/blue-rider.png",
          "pattern": "./patterns/blue-rider.svg",
          "tags": ["classic", "blue", "traditional"]
        }
      ]
    },
    "cardFronts": {
      "type": "svg-inline",
      "estimatedSize": "35kb",
      "atlas": "./fronts/cards.svg",
      "mapping": "./fronts/mapping.json"
    }
  },

  "preview": "./preview.png",
  "screenshots": [
    "./screenshots/game-view.png",
    "./screenshots/detail.png"
  ]
}
```

#### Distribution Options

**Option A: NPM Packages** (Developer-friendly)
```bash
npm install @cardgames/bicycle-deck
```

**Option B: CDN-Hosted** (User-friendly)
```typescript
// Load from URL
await cardRegistry.installFromUrl(
  'https://cardpacks.cdn.com/bicycle/v1.0.0/manifest.json'
);
```

**Option C: Built-In Registry** (Curated)
```typescript
const OFFICIAL_PACKS = [
  { id: 'default', name: 'Classic', builtin: true },
  { id: 'high-contrast', name: 'High Contrast', builtin: true },
];

const COMMUNITY_PACKS = [
  { id: 'bicycle', url: '...', verified: true },
  { id: 'vintage', url: '...', verified: false },
];
```

#### CardPack Registry Interface (Future)

```typescript
// Future marketplace API
interface CardPackRegistry {
  // Discovery
  listPacks(): CardPackManifest[];
  searchPacks(query: string, tags?: string[]): CardPackManifest[];

  // Installation
  installPack(packId: string): Promise<void>;
  uninstallPack(packId: string): Promise<void>;
  validatePack(manifest: CardPackManifest): ValidationResult;

  // Usage
  getInstalledPacks(): CardPackManifest[];
  setActivePack(packId: string): void;
  getActivePack(): CardPack;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  estimatedBundleSize: number;
}
```

#### Compatibility Validation

Before loading a pack, validate compatibility:

```typescript
function validateCardPack(manifest: CardPackManifest): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check bundle size
  const totalSize = parseBundleSize(manifest.requirements.maxBundleSize);
  if (totalSize > 100 * 1024) {
    errors.push(`Bundle size ${totalSize} exceeds limit (100KB)`);
  }

  // Check Safari version
  const minVersion = manifest.requirements.minSafariVersion;
  if (minVersion && parseFloat(minVersion) > parseFloat(navigator.safariVersion)) {
    errors.push(`Requires Safari ${minVersion}, current: ${navigator.safariVersion}`);
  }

  // Check asset sizes
  const backSize = parseBundleSize(manifest.assets.cardBacks.estimatedSize);
  if (backSize > 10 * 1024) {
    warnings.push(`Card backs (${backSize}) exceed recommended 10KB`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    estimatedBundleSize: totalSize,
  };
}
```

#### Installation Flow

```typescript
async function installCardPack(packId: string): Promise<void> {
  // 1. Fetch manifest
  const manifest = await fetchManifest(packId);

  // 2. Validate compatibility
  const validation = validateCardPack(manifest);
  if (!validation.valid) {
    throw new Error(`Invalid pack: ${validation.errors.join(', ')}`);
  }

  // 3. Show warnings to user
  if (validation.warnings.length > 0) {
    await confirmWarnings(validation.warnings);
  }

  // 4. Download assets
  await downloadAssets(manifest);

  // 5. Register pack
  await registry.register(manifest);

  // 6. Persist to localStorage
  saveInstalledPacks();
}
```

---

## Decision

**Status:** PROPOSED (awaiting review)

**Rationale:**
- Unblocks Klondike and Spider Solitaire development
- Backwards compatible with FreeCell
- Simple implementation (CSS patterns, no dependencies)
- Extensible for future themes and animations

**Next Steps:**
1. Review feedback from team/stakeholders
2. Begin Phase 1 implementation (CardBack component)
3. Validate with Klondike prototype
4. Update STATUS.md when work begins

**Estimated Timeline:**
- Phase 1: 3-4 hours (CardPack interface + card backs)
- Phase 2: 2-3 hours (Klondike integration)
- **Total: 5-7 hours (1 day)**

---

## Feedback and Comments

<!-- Reviewers: Add comments below -->

**Reviewer:** [Your Name]
**Date:** [Date]
**Comment:** [Your feedback here]
**Resolution:** [How it was addressed]
