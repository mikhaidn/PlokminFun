# Phase 1: CardPack Interface & Card Back Rendering

**Priority:** P1 (Required for Klondike)
**Estimated Time:** 3-4 hours
**Status:** Approved, not started

## Objectives

- Define `CardPack` interface as the native language for card rendering
- Create `CardBack.tsx` component with CSS patterns
- Refactor current card rendering to use CardPack pattern
- Ensure FreeCell remains unchanged and backwards compatible

## Tasks

### 1. Define `CardPack` Interface (1 hour)

**File:** `freecell-mvp/src/core/cardPack.ts`

**Deliverables:**
- [ ] Create `CardPackManifest` type (id, name, version, requirements, assets)
- [ ] Create `CardPack` interface (manifest, renderFront, renderBack, animations)
- [ ] Create `CardSize` type (width, height)
- [ ] Create `AnimationDefinition` interface (type, duration, easing, keyframes)
- [ ] Create `useCardPack()` hook (returns DEFAULT_CARD_PACK for v1)

**Acceptance Criteria:**
- Interface is well-documented with JSDoc comments
- Manifest includes performance metadata (bundle size, browser requirements)
- Interface supports future extensions without breaking changes

### 2. Create `CardBack.tsx` Component (1 hour)

**File:** `freecell-mvp/src/components/CardBack.tsx`

**Deliverables:**
- [ ] Create `CardBackProps` interface
- [ ] Implement `CardBack` component with CSS patterns
- [ ] Implement `getCardBackBackground()` helper function
- [ ] Add blue pattern (diamond checkerboard)
- [ ] Add red pattern (same pattern, different colors)
- [ ] Support custom image URLs
- [ ] Add accessibility attributes (role="img", aria-label)

**Acceptance Criteria:**
- Component renders without JavaScript (pure CSS)
- Patterns are inline CSS (no HTTP requests)
- Component size matches card dimensions exactly
- Patterns look professional and match classic card backs
- WCAG AA contrast ratio compliance

**CSS Pattern Spec:**
```css
background:
  linear-gradient(135deg, #1e3a8a 25%, transparent 25%),
  linear-gradient(225deg, #1e3a8a 25%, transparent 25%),
  linear-gradient(45deg, #1e3a8a 25%, transparent 25%),
  linear-gradient(315deg, #1e3a8a 25%, #2563eb 25%);
background-size: 20px 20px;
background-position: 0 0, 10px 0, 10px -10px, 0px 10px;
```

### 3. Refactor Current Implementation to Use CardPack (1 hour)

**Files:**
- `freecell-mvp/src/core/cardPack.ts`
- `freecell-mvp/src/components/Card.tsx`

**Deliverables:**
- [ ] Create `DEFAULT_CARD_PACK` constant
- [ ] Update `Card.tsx` to accept `faceUp?: boolean` prop (default `true`)
- [ ] Render `<CardBack>` when `faceUp={false}`
- [ ] Ensure FreeCell continues to work (never passes `faceUp`)
- [ ] Pass through interaction props to CardBack (onClick, drag handlers)

**Acceptance Criteria:**
- `faceUp` prop is optional and defaults to `true`
- FreeCell requires zero code changes
- CardBack component receives same event handlers as Card
- Visual appearance of face-up cards is unchanged

**Code Example:**
```typescript
export function Card({
  card,
  faceUp = true,
  cardWidth,
  cardHeight,
  cardBackTheme = 'blue',
  ...otherProps
}: CardProps) {
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
  return <div className="card" {...}>...</div>;
}
```

### 4. Write Tests (1 hour)

**Files:**
- `freecell-mvp/src/core/cardPack.test.ts`
- `freecell-mvp/src/components/CardBack.test.tsx`
- `freecell-mvp/src/components/Card.test.tsx`

**Test Coverage:**
- [ ] CardPack interface validation
  - Manifest has required fields
  - Bundle size is within limits
- [ ] CardBack component
  - Renders with blue theme
  - Renders with red theme
  - Renders with custom image
  - Has correct dimensions
  - Has accessibility attributes
  - CSS patterns are applied correctly
- [ ] Card component
  - Renders face-up by default
  - Renders CardBack when `faceUp={false}`
  - Passes props to CardBack correctly
- [ ] Integration test
  - FreeCell game renders without `faceUp` prop
  - All cards are face-up by default
- [ ] Bundle size check
  - CardBack adds <2KB to production bundle

**Acceptance Criteria:**
- 100% test coverage on new components
- All tests pass
- No regressions in existing tests

## Definition of Done

- [ ] All tasks completed
- [ ] All tests passing with 100% coverage
- [ ] FreeCell works unchanged (verified with manual testing)
- [ ] Bundle size <10KB (verified with webpack-bundle-analyzer)
- [ ] Code reviewed and approved
- [ ] Documentation updated (JSDoc comments on all public APIs)

## Validation

### Manual Testing
1. Run FreeCell - verify all cards are face-up
2. Create test component with `faceUp={false}` - verify card back renders
3. Test blue and red themes - verify patterns look correct
4. Test on mobile Safari - verify CSS patterns work without JS
5. Check bundle size - verify <10KB increase

### Performance Testing
1. Render 52 face-down cards
2. Measure rendering time (should be <16ms)
3. Check memory usage (should be <100KB)
4. Verify no HTTP requests for patterns

## Next Steps

After Phase 1 completion:
- Proceed to Phase 2 (Klondike integration)
- Update STATUS.md with progress
- Demo card backs to team for feedback
