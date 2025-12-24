# Testing Strategy

## Overview

Comprehensive testing strategy covering unit tests, integration tests, visual regression tests, and performance benchmarks for the card back system.

## Test Pyramid

```
         /\
        /  \  E2E Tests (10%)
       /____\
      /      \  Integration Tests (30%)
     /________\
    /          \  Unit Tests (60%)
   /____________\
```

## Unit Tests

### CardBack Component Tests

**File:** `freecell-mvp/src/components/CardBack.test.tsx`

**Coverage:**
- [ ] Renders with default blue theme
- [ ] Renders with red theme
- [ ] Renders with custom image URL
- [ ] Has correct dimensions (width/height)
- [ ] Has correct accessibility attributes (role, aria-label)
- [ ] Applies correct CSS classes
- [ ] Background pattern is applied correctly
- [ ] Respects className prop

**Test Example:**
```typescript
describe('CardBack', () => {
  it('renders with blue theme by default', () => {
    const { container } = render(
      <CardBack cardWidth={100} cardHeight={140} />
    );
    const cardBack = container.querySelector('.card-back');
    expect(cardBack).toBeInTheDocument();
    expect(cardBack).toHaveAttribute('role', 'img');
    expect(cardBack).toHaveAttribute('aria-label', 'Face-down card');
  });

  it('applies correct dimensions', () => {
    const { container } = render(
      <CardBack cardWidth={100} cardHeight={140} />
    );
    const cardBack = container.querySelector('.card-back');
    expect(cardBack).toHaveStyle({ width: '100px', height: '140px' });
  });

  it('renders with custom image', () => {
    const customImage = 'https://example.com/card-back.png';
    const { container } = render(
      <CardBack cardWidth={100} cardHeight={140} theme="custom" customImage={customImage} />
    );
    const cardBack = container.querySelector('.card-back');
    expect(cardBack).toHaveStyle({ background: `url(${customImage}) center/cover` });
  });
});
```

### Card Component Tests

**File:** `freecell-mvp/src/components/Card.test.tsx`

**Coverage:**
- [ ] Renders face-up by default
- [ ] Renders CardBack when `faceUp={false}`
- [ ] Passes props to CardBack correctly
- [ ] Event handlers work on face-down cards
- [ ] Theme prop is passed through
- [ ] Accessibility attributes are correct

**Test Example:**
```typescript
describe('Card with faceUp prop', () => {
  it('renders face-up by default', () => {
    const card = createTestCard('A', 'hearts');
    const { container } = render(
      <Card card={card} cardWidth={100} cardHeight={140} fontSize={FontSizes.small} />
    );
    expect(container.querySelector('.card')).toBeInTheDocument();
    expect(container.querySelector('.card-back')).not.toBeInTheDocument();
  });

  it('renders CardBack when faceUp is false', () => {
    const card = createTestCard('A', 'hearts');
    const { container } = render(
      <Card card={card} faceUp={false} cardWidth={100} cardHeight={140} fontSize={FontSizes.small} />
    );
    expect(container.querySelector('.card-back')).toBeInTheDocument();
    expect(container.textContent).not.toContain('A');
  });

  it('passes onClick to CardBack', () => {
    const handleClick = jest.fn();
    const card = createTestCard('A', 'hearts');
    const { container } = render(
      <Card card={card} faceUp={false} cardWidth={100} cardHeight={140} fontSize={FontSizes.small} onClick={handleClick} />
    );
    const cardBack = container.querySelector('.card-back');
    fireEvent.click(cardBack);
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### CardPack Interface Tests

**File:** `freecell-mvp/src/core/cardPack.test.ts`

**Coverage:**
- [ ] DEFAULT_CARD_PACK has valid manifest
- [ ] Manifest has required fields
- [ ] Bundle size is within limits
- [ ] renderFront returns valid React element
- [ ] renderBack returns valid React element
- [ ] Animations are defined correctly

### Animation Tests (Phase 3)

**File:** `freecell-mvp/src/utils/cardAnimations.test.ts`

**Coverage:**
- [ ] flipCard() resolves after duration
- [ ] flipCard() applies correct transform
- [ ] flipCard() respects reduce-motion preference
- [ ] dealCard() moves element to correct position
- [ ] dealCard() cleans up event listeners
- [ ] flipAndDeal() runs animations in parallel
- [ ] dealMultipleCards() staggers correctly

## Integration Tests

### FreeCell Backwards Compatibility

**File:** `freecell-mvp/src/__tests__/integration/cardBacks.test.tsx`

**Coverage:**
- [ ] FreeCell game renders without `faceUp` prop
- [ ] All cards are face-up in FreeCell
- [ ] Game logic works unchanged
- [ ] No console errors or warnings
- [ ] Performance is unchanged

**Test Example:**
```typescript
describe('FreeCell backwards compatibility', () => {
  it('renders all cards face-up without faceUp prop', () => {
    const { container } = render(<FreeCellGame />);
    const cards = container.querySelectorAll('.card');
    const cardBacks = container.querySelectorAll('.card-back');

    expect(cards.length).toBeGreaterThan(0);
    expect(cardBacks.length).toBe(0);
  });

  it('game logic works unchanged', async () => {
    const { getByTestId } = render(<FreeCellGame />);
    const card = getByTestId('card-0');

    // Perform a legal move
    fireEvent.click(card);
    fireEvent.click(getByTestId('free-cell-0'));

    // Verify card moved
    expect(getByTestId('free-cell-0')).toContainElement(card);
  });
});
```

### Klondike Card Back Integration

**File:** `klondike-mvp/src/__tests__/integration/cardBacks.test.tsx`

**Coverage:**
- [ ] New game renders correct mix of face-up/face-down
- [ ] Stock pile shows card backs
- [ ] Tableau columns have correct face orientation
- [ ] Cards flip when exposed
- [ ] Undo/redo preserves face orientation
- [ ] Win detection works with card backs

**Test Example:**
```typescript
describe('Klondike card backs', () => {
  it('renders correct initial layout', () => {
    const { container } = render(<KlondikeGame />);

    // Column 1: 1 card, all face-up
    const col1 = container.querySelector('[data-column="0"]');
    expect(col1.querySelectorAll('.card').length).toBe(1);
    expect(col1.querySelectorAll('.card-back').length).toBe(0);

    // Column 2: 2 cards, 1 face-down, 1 face-up
    const col2 = container.querySelector('[data-column="1"]');
    expect(col2.querySelectorAll('.card-back').length).toBe(1);
    expect(col2.querySelectorAll('.card').length).toBe(2);
  });

  it('flips card when exposed', () => {
    const { container, getByTestId } = render(<KlondikeGame />);

    // Move top card from column
    const topCard = getByTestId('tableau-1-card-1');
    fireEvent.click(topCard);
    fireEvent.click(getByTestId('foundation-0'));

    // Verify previously face-down card is now face-up
    const newTopCard = getByTestId('tableau-1-card-0');
    expect(newTopCard).not.toHaveClass('card-back');
  });
});
```

## Performance Tests

### Rendering Performance

**File:** `freecell-mvp/src/__tests__/performance/cardBacks.perf.test.ts`

**Metrics:**
- [ ] Render 52 face-down cards in <16ms (60fps)
- [ ] CardBack component memory footprint <100 bytes
- [ ] No memory leaks after 1000 renders
- [ ] Bundle size increase <10KB

**Test Example:**
```typescript
describe('CardBack performance', () => {
  it('renders 52 cards in under 16ms', () => {
    const startTime = performance.now();

    const { container } = render(
      <div>
        {Array.from({ length: 52 }).map((_, i) => (
          <CardBack key={i} cardWidth={100} cardHeight={140} />
        ))}
      </div>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(16);
    expect(container.querySelectorAll('.card-back').length).toBe(52);
  });
});
```

### Animation Performance (Phase 3)

**Metrics:**
- [ ] Flip animation runs at 60fps on target devices
- [ ] No dropped frames during animation
- [ ] 10+ simultaneous animations maintain 60fps
- [ ] Event listeners are cleaned up (no memory leaks)

**Test Approach:**
```typescript
// Use Chrome DevTools Performance API
it('flip animation maintains 60fps', async () => {
  const element = document.createElement('div');
  document.body.appendChild(element);

  // Start performance measurement
  const entries: PerformanceEntry[] = [];
  const observer = new PerformanceObserver((list) => {
    entries.push(...list.getEntries());
  });
  observer.observe({ entryTypes: ['measure'] });

  // Run animation
  await flipCard(element, false, true);

  // Verify frame rate
  const frameTime = entries.map(e => e.duration);
  const maxFrameTime = Math.max(...frameTime);
  expect(maxFrameTime).toBeLessThan(16); // 60fps = 16ms per frame

  observer.disconnect();
  document.body.removeChild(element);
});
```

## Visual Regression Tests

### Screenshot Tests

**Tool:** Percy, Chromatic, or Storybook

**Scenarios:**
- [ ] CardBack blue theme
- [ ] CardBack red theme
- [ ] Card face-up
- [ ] Card face-down
- [ ] FreeCell game layout (all face-up)
- [ ] Klondike game layout (mix of face-up/down)
- [ ] High contrast mode
- [ ] Mobile viewport

**Storybook Stories:**
```typescript
// CardBack.stories.tsx
export const BlueTheme = () => (
  <CardBack cardWidth={100} cardHeight={140} theme="blue" />
);

export const RedTheme = () => (
  <CardBack cardWidth={100} cardHeight={140} theme="red" />
);

export const CustomImage = () => (
  <CardBack
    cardWidth={100}
    cardHeight={140}
    theme="custom"
    customImage="https://example.com/back.png"
  />
);

export const KlondikeLayout = () => (
  <KlondikeGame /> // Shows mix of face-up/down cards
);
```

## Accessibility Tests

### Automated Tests

**Tool:** axe-core, jest-axe

**Coverage:**
- [ ] CardBack has correct ARIA attributes
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators are visible
- [ ] Screen reader announcements are correct

**Test Example:**
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('CardBack accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <CardBack cardWidth={100} cardHeight={140} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing

**Checklist:**
- [ ] Screen reader announces "Face-down card"
- [ ] Tab navigation skips face-down cards (if not interactive)
- [ ] Card flip is announced to screen reader
- [ ] High contrast mode shows clear distinction
- [ ] Reduce motion preference is respected

## Success Metrics

### Code Coverage
- **Target:** 100% coverage on new components
- **Minimum:** 90% overall coverage

### Performance Benchmarks
- **Rendering:** 52 cards in <16ms
- **Animation:** 60fps on iPhone SE (2016)
- **Bundle Size:** <10KB increase
- **Memory:** No leaks after 1000 card renders

### User-Facing Metrics
- **Visual Quality:** Card backs look professional (user feedback)
- **Accessibility:** WCAG AA compliance
- **Performance:** No lag on target devices
- **Backwards Compatibility:** FreeCell works unchanged

## Continuous Integration

### CI Pipeline

**Steps:**
1. Run unit tests (Jest)
2. Run integration tests
3. Run performance benchmarks
4. Check bundle size (bundlesize or bundlephobia)
5. Run accessibility tests (axe)
6. Generate coverage report (Codecov)
7. Visual regression tests (Percy/Chromatic)

**Thresholds:**
- Unit tests: 100% pass rate
- Coverage: ≥90%
- Bundle size: <10KB increase
- Performance: No regression >5%
- Accessibility: 0 violations

## Risk Mitigation

### Risk 1: FreeCell Regression

**Testing Strategy:**
- Dedicated integration test suite for FreeCell
- Manual smoke testing before each release
- Monitor error tracking (Sentry) for new errors
- Canary deployment to 5% of users first

### Risk 2: Performance Regression

**Testing Strategy:**
- Automated performance benchmarks in CI
- Lighthouse CI integration
- Real device testing (BrowserStack)
- Monitor Core Web Vitals in production

### Risk 3: Accessibility Regression

**Testing Strategy:**
- Automated axe tests on every PR
- Manual testing with screen readers
- User testing with accessibility users
- ARIA attribute validation in CI

## Future Enhancements

### Test Automation
- Visual regression testing in CI
- Cross-browser testing (Playwright)
- Real device testing (BrowserStack)
- Performance monitoring (Lighthouse CI)

### Advanced Testing
- Fuzz testing for edge cases
- Property-based testing (fast-check)
- Mutation testing (Stryker)
- Load testing for animations
