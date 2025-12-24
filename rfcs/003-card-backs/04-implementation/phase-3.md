# Phase 3: Animation System

**Priority:** P2 (Nice-to-have for v1)
**Estimated Time:** 5-6 hours
**Status:** Future enhancement
**Dependencies:** Phase 2 must be complete

## Objectives

- Define animation interface for card transitions
- Implement flip animation (3D CSS transform)
- Implement deal animation (position translation)
- Ensure 60fps performance on mobile devices
- Make animations opt-in and configurable

## Tasks

### 1. Define Animation Interface (1 hour)

**File:** `freecell-mvp/src/core/cardPack.ts` (extend existing)

**Deliverables:**
- [ ] Extend `AnimationDefinition` interface
- [ ] Create `AnimationOptions` type
- [ ] Create animation registry system
- [ ] Add animation preferences to user settings

**Interface Extensions:**
```typescript
export interface AnimationDefinition {
  type: 'css' | 'javascript';
  duration: number;  // milliseconds
  easing?: string;   // CSS timing function

  // CSS-based animations
  keyframes?: Record<string, React.CSSProperties>;

  // JS-based animations (future: framer-motion)
  animateFn?: (element: HTMLElement, options: AnimationOptions) => Promise<void>;
}

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  onComplete?: () => void;
  reduceMotion?: boolean;  // Respect user preferences
}

export interface CardAnimations {
  flip: AnimationDefinition;
  deal?: AnimationDefinition;
  collect?: AnimationDefinition;
  shuffle?: AnimationDefinition;
}
```

**Acceptance Criteria:**
- Interface supports both CSS and JS animations
- Respects user's "reduce motion" preferences
- Animations can be disabled globally
- Type-safe API for all animation types

### 2. Implement Flip Animation (2 hours)

**File:** `freecell-mvp/src/utils/cardAnimations.ts`

**Deliverables:**
- [ ] Create `flipCard()` function
- [ ] Implement 3D CSS transform
- [ ] Add flip animation CSS classes
- [ ] Handle edge cases (mid-animation cancellation)
- [ ] Test on mobile devices

**Implementation:**
```typescript
/**
 * Flip animation (CSS-based 3D transform)
 */
export async function flipCard(
  element: HTMLElement,
  fromFaceUp: boolean,
  toFaceUp: boolean,
  options: AnimationOptions = {}
): Promise<void> {
  const duration = options.duration ?? 300;
  const easing = options.easing ?? 'ease-in-out';

  // Respect reduce motion preference
  if (options.reduceMotion) {
    element.classList.toggle('face-down', !toFaceUp);
    options.onComplete?.();
    return;
  }

  return new Promise((resolve) => {
    element.style.transition = `transform ${duration}ms ${easing}`;
    element.style.transformStyle = 'preserve-3d';
    element.style.transform = `rotateY(${toFaceUp ? 0 : 180}deg)`;

    const handleTransitionEnd = () => {
      element.removeEventListener('transitionend', handleTransitionEnd);
      options.onComplete?.();
      resolve();
    };

    element.addEventListener('transitionend', handleTransitionEnd);

    // Fallback timeout in case transitionend doesn't fire
    setTimeout(() => {
      element.removeEventListener('transitionend', handleTransitionEnd);
      resolve();
    }, duration + 50);
  });
}
```

**CSS Support:**
```css
.card {
  transition: transform 300ms ease-in-out;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.card.face-down {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

/* Respect reduce motion preference */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none !important;
  }
}
```

**Acceptance Criteria:**
- Smooth 3D flip animation (300ms)
- GPU-accelerated (uses transform, not position)
- Works on Safari, Chrome, Firefox
- Respects reduce-motion preference
- No memory leaks (event listeners cleaned up)
- 60fps on iPhone SE

### 3. Implement Deal Animation (2 hours)

**File:** `freecell-mvp/src/utils/cardAnimations.ts`

**Deliverables:**
- [ ] Create `dealCard()` function
- [ ] Implement position translation
- [ ] Combine with flip animation
- [ ] Add stagger effect for multiple cards
- [ ] Test performance with simultaneous animations

**Implementation:**
```typescript
/**
 * Deal animation (move from source to destination)
 */
export async function dealCard(
  element: HTMLElement,
  from: { x: number; y: number },
  to: { x: number; y: number },
  options: AnimationOptions = {}
): Promise<void> {
  const duration = options.duration ?? 400;
  const easing = options.easing ?? 'cubic-bezier(0.4, 0, 0.2, 1)';

  if (options.reduceMotion) {
    element.style.left = `${to.x}px`;
    element.style.top = `${to.y}px`;
    options.onComplete?.();
    return;
  }

  return new Promise((resolve) => {
    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;

    element.style.transition = `transform ${duration}ms ${easing}`;
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    const handleTransitionEnd = () => {
      element.removeEventListener('transitionend', handleTransitionEnd);
      element.style.transition = '';
      element.style.transform = '';
      element.style.left = `${to.x}px`;
      element.style.top = `${to.y}px`;
      options.onComplete?.();
      resolve();
    };

    element.addEventListener('transitionend', handleTransitionEnd);

    setTimeout(() => {
      element.removeEventListener('transitionend', handleTransitionEnd);
      resolve();
    }, duration + 50);
  });
}

/**
 * Combine flip and deal animations
 */
export async function flipAndDeal(
  element: HTMLElement,
  from: { x: number; y: number },
  to: { x: number; y: number },
  faceUp: boolean
): Promise<void> {
  // Run flip and deal in parallel
  await Promise.all([
    flipCard(element, false, faceUp),
    dealCard(element, from, to),
  ]);
}

/**
 * Stagger multiple card animations
 */
export async function dealMultipleCards(
  elements: HTMLElement[],
  positions: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>,
  staggerDelay = 100
): Promise<void> {
  const promises = elements.map((element, index) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        await dealCard(element, positions[index].from, positions[index].to);
        resolve(undefined);
      }, index * staggerDelay);
    });
  });

  await Promise.all(promises);
}
```

**Acceptance Criteria:**
- Smooth position animation (400ms)
- Can combine with flip animation
- Stagger effect for multiple cards looks natural
- Performance: 10+ cards animating simultaneously at 60fps
- No layout thrashing

### 4. Integrate Animations into Klondike (1 hour)

**Files:**
- `klondike-mvp/src/components/Tableau.tsx`
- `klondike-mvp/src/components/Stock.tsx`

**Deliverables:**
- [ ] Animate card flip when exposed in tableau
- [ ] Animate deal from stock to waste
- [ ] Add animation toggle in settings
- [ ] Respect user's reduce-motion preference

**Usage Example:**
```typescript
// In Klondike game logic
async function handleMoveCard(
  cardElement: HTMLElement,
  from: Location,
  to: Location
) {
  // If card flips, animate it
  if (shouldFlip(from, to)) {
    await flipCard(cardElement, false, true);
  }

  // Announce to screen readers
  announceCardFlip(card);
}

async function handleDealFromStock() {
  const stockElement = document.querySelector('.stock .card');
  const wastePosition = document.querySelector('.waste').getBoundingClientRect();

  if (stockElement) {
    await flipAndDeal(
      stockElement,
      stockElement.getBoundingClientRect(),
      wastePosition,
      true
    );
  }

  // Update game state after animation
  dispatch({ type: 'DEAL_FROM_STOCK' });
}
```

**Acceptance Criteria:**
- Animations enhance gameplay (not distracting)
- Can be disabled in settings
- Screen readers announce card state changes
- No bugs when animations are disabled

## Definition of Done

- [ ] All tasks completed
- [ ] Animation interface well-documented
- [ ] Flip animation implemented and tested
- [ ] Deal animation implemented and tested
- [ ] Animations integrated into Klondike
- [ ] Performance validated on mobile (60fps)
- [ ] Reduce motion preference respected
- [ ] Code reviewed and approved

## Performance Requirements

### Targets
- **Flip animation**: 60fps on iPhone SE
- **Deal animation**: 60fps with 10+ cards
- **Memory**: No memory leaks after 100 animations
- **Frame time**: <16ms per frame (60fps)

### Testing
1. **Chrome DevTools Performance Tab**
   - Record flip animation
   - Verify no dropped frames
   - Check for layout thrashing

2. **Mobile Testing**
   - iPhone SE (2016) - baseline device
   - Budget Android device
   - iPad 2 (if available)

3. **Stress Testing**
   - Animate 20 cards simultaneously
   - Rapid flip/deal cycles
   - Memory profiling after extended use

## Accessibility Considerations

### Screen Reader Support
```typescript
function announceCardFlip(card: Card) {
  const announcement = `${card.value} of ${card.suit} revealed`;
  const liveRegion = document.getElementById('sr-live-region');
  if (liveRegion) {
    liveRegion.textContent = announcement;
  }
}
```

### Reduce Motion
- Respect `prefers-reduced-motion` media query
- Provide manual toggle in settings
- Instant state change when animations disabled

### Keyboard Navigation
- Animations don't interfere with keyboard controls
- Can interrupt animation with keyboard action
- Focus management during animations

## Future Enhancements

### Phase 4: Advanced Animations
- **Winning cascade**: Cards fly to foundations automatically
- **Shuffle animation**: Visual shuffle when starting new game
- **Card trails**: Motion blur effect during fast moves
- **Spring physics**: More natural movement (via framer-motion)

### Phase 5: Animation Presets
- **Classic**: Simple fades and slides
- **Fancy**: 3D flips, bounces, trails
- **Minimal**: Instant state changes
- **Custom**: User-defined timing and easing

## Known Limitations

- CSS animations only (no JS animation library)
- Limited to flip and deal animations
- No particle effects or advanced visuals
- Performance may vary on very old devices

## Next Steps

After Phase 3 completion:
- Gather user feedback on animations
- Measure impact on user engagement
- Consider adding more animation types
- Evaluate upgrading to framer-motion if needed
