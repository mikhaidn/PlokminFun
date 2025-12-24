# 05: Testing & Success Criteria

## Phase 2 Success Metrics

### Code Quality

- [ ] **Adding Spider takes <1 day** (down from 3-4 days)
  - Measure: Time from `mkdir spider-mvp` to passing tests
  - Target: 6-8 hours including tests

- [ ] **New games require <500 lines** of game-specific code (down from ~1200)
  - Measure: Lines in `spider/` excluding shared imports
  - Target: 300-400 lines

- [ ] **All existing tests pass** after migration
  - Klondike: 800+ tests passing
  - FreeCell: 800+ tests passing
  - Shared: 100+ tests passing

- [ ] **No regression in functionality**
  - All features working in migrated games
  - Undo/redo still works
  - Game state persistence works
  - Drag-and-drop + click-to-select both work

- [ ] **Code duplication reduced by >70%**
  - Before: ~620 lines duplicated
  - After: <200 lines duplicated
  - Measure with: `jscpd` or manual audit

### Type Safety

- [ ] **TypeScript strict mode** with zero `any` types in new code
- [ ] **All GameActions implementations** type-check correctly
- [ ] **GameConfig** validates at compile time

### Documentation

- [ ] **Updated AI_GUIDE.md** with unified builder pattern
- [ ] **Game development guide** created (how to add a game)
- [ ] **API documentation** for `GameActions` and `GameConfig`
- [ ] **Migration guide** for existing games

---

## Phase 3 Success Metrics

### Performance

- [ ] **Lighthouse performance score >90**
  - Test URL: Each game's production build
  - Run 3 times, average score
  - Both desktop and mobile

- [ ] **60fps animations** on mid-range devices
  - Test devices: iPhone 12, Samsung Galaxy S21
  - Monitor with Chrome DevTools Performance tab
  - No frame drops during drag operations

- [ ] **Touch response <100ms**
  - Measure time from touch to visual feedback
  - Use High Precision Timing API

- [ ] **Bundle size** not significantly increased
  - Before: Check current bundle sizes
  - After: <20% increase acceptable
  - Use webpack-bundle-analyzer

### Accessibility

- [ ] **Lighthouse accessibility score >90**
  - WCAG 2.1 AA compliant
  - Color contrast ratios meet standards
  - ARIA labels present and correct

- [ ] **Keyboard navigation** fully functional
  - Can play entire game without mouse
  - Tab order logical
  - Focus indicators visible

- [ ] **Screen reader support**
  - Test with NVDA (Windows) and VoiceOver (Mac)
  - Moves announced correctly
  - Game state changes announced
  - Win condition announced

- [ ] **Touch targets** meet WCAG standards
  - Minimum 44x44px for all interactive elements
  - Adequate spacing between targets

### Mobile Optimization

- [ ] **Smart tap-to-move** works correctly
  - Single tap when 1 valid move → auto-executes
  - Single tap when 2+ valid moves → highlights options
  - Second tap → executes selected move
  - Tap empty space → cancels selection

- [ ] **Touch gestures** functional
  - Double-tap for auto-foundation
  - Long-press for hints (if feature enabled)
  - Drag and drop smooth
  - No gesture conflicts

- [ ] **Responsive layout** works on all sizes
  - Mobile (320px width)
  - Tablet (768px width)
  - Desktop (1920px width)
  - Portrait and landscape orientations

### Visual Quality

- [ ] **Animations smooth** and polished
  - No janky transitions
  - Physics feel natural
  - Win celebration delightful

- [ ] **Themes** apply consistently
  - All 4 themes work in all games
  - No visual glitches
  - Transitions between themes smooth

- [ ] **High contrast mode** usable
  - Text readable
  - Interactive elements distinguishable
  - Meets WCAG AAA standards

### Unified Menu & Settings

- [ ] **Settings modal** consistent across all games
  - Same layout for Klondike, FreeCell, Spider
  - Global settings section always present
  - Game-specific settings only shown when defined
  - Visual design identical

- [ ] **Game selector** functional
  - Shows all available games
  - Thumbnails load correctly
  - Difficulty badges display
  - Switching games works smoothly

- [ ] **Settings persistence** works
  - Settings saved to localStorage
  - Settings restored on page reload
  - Different games have independent game-specific settings
  - Global settings shared across games

- [ ] **Theme switching** instant
  - No page reload required
  - Applies to all games
  - Persists across sessions

---

## Test Strategy

### Unit Tests

**New unit tests required**:

```typescript
// shared/types/GameActions.test.ts
describe('GameActions', () => {
  describe('KlondikeGameActions', () => {
    it('validates moves correctly', () => { ... });
    it('executes moves and returns new state', () => { ... });
    it('returns valid moves for smart tap', () => { ... });
    it('detects win condition', () => { ... });
  });

  describe('FreeCellGameActions', () => {
    // Similar tests
  });
});

// shared/core/createGame.test.ts
describe('createGame', () => {
  it('creates game component from config', () => { ... });
  it('initializes game state correctly', () => { ... });
  it('handles move execution', () => { ... });
});

// shared/components/GenericGameBoard.test.tsx
describe('GenericGameBoard', () => {
  it('renders correct number of tableau columns', () => { ... });
  it('renders special areas based on config', () => { ... });
  it('integrates with useCardInteraction', () => { ... });
});

// shared/components/SettingsModal.test.tsx
describe('SettingsModal', () => {
  it('shows global settings', () => { ... });
  it('shows game-specific settings when defined', () => { ... });
  it('hides game-specific section when not defined', () => { ... });
  it('persists changes to localStorage', () => { ... });
});
```

**Coverage requirements**:
- Core library: >95%
- Game actions: >90%
- UI components: >80%

### Integration Tests

**Critical user flows**:

```typescript
// klondike-mvp/tests/integration/unified-system.test.tsx
describe('Klondike with Unified System', () => {
  it('plays full game using generic components', () => {
    // Render game with createGame()
    // Execute series of moves
    // Verify state updates correctly
    // Verify win condition detected
  });

  it('handles smart tap correctly', () => {
    // Tap card with one valid move → auto-executes
    // Tap card with multiple valid moves → shows options
  });

  it('switches themes', () => {
    // Open settings
    // Change theme
    // Verify UI updates
    // Verify persistence
  });
});
```

### E2E Tests

**Critical paths** (use Playwright or Cypress):

```typescript
// e2e/unified-experience.spec.ts
test('user can switch between games', async ({ page }) => {
  await page.goto('/klondike');
  await page.click('[data-testid="settings-button"]');
  await page.click('[data-testid="game-selector-freecell"]');
  await expect(page).toHaveURL('/freecell');
});

test('settings persist across games', async ({ page }) => {
  await page.goto('/klondike');
  await page.click('[data-testid="settings-button"]');
  await page.selectOption('[data-testid="theme-select"]', 'dark');
  await page.click('[data-testid="close-settings"]');

  // Navigate to FreeCell
  await page.goto('/freecell');

  // Theme should still be dark
  await expect(page.locator('body')).toHaveClass(/dark-theme/);
});

test('smart tap works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
  await page.goto('/klondike');

  // Tap a card with only one valid move
  await page.tap('[data-card="A♠"]');

  // Should auto-move to foundation
  await expect(page.locator('[data-location="foundation-0"]')).toContainText('A♠');
});
```

### Performance Tests

**Benchmarks**:

```javascript
// performance/drag-performance.test.js
test('drag performance', async () => {
  const page = await browser.newPage();
  await page.goto('/klondike');

  // Start performance recording
  await page.tracing.start({ screenshots: true });

  // Perform drag operation
  await page.dragAndDrop('[data-card="K♠"]', '[data-location="tableau-5"]');

  // Stop recording
  await page.tracing.stop();

  // Analyze trace
  const trace = await page.tracing.stop();
  const fps = calculateFPS(trace);

  expect(fps).toBeGreaterThan(55); // Allow 5fps buffer
});
```

### Accessibility Tests

**Automated** (via jest-axe):

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

test('Settings modal has no accessibility violations', async () => {
  const { container } = render(<SettingsModal />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Manual testing checklist**:
- [ ] Keyboard-only playthrough of each game
- [ ] Screen reader announcement validation
- [ ] Color contrast verification
- [ ] Touch target size measurement
- [ ] Reduced motion mode testing

### Visual Regression Tests

**Chromatic or Percy**:

```typescript
// .storybook/stories/GameBoard.stories.tsx
export const KlondikeWithClassicTheme = () => (
  <GenericGameBoard config={KlondikeConfig} />
);

export const FreeCellWithDarkTheme = () => (
  <ThemeProvider theme="dark">
    <GenericGameBoard config={FreeCellConfig} />
  </ThemeProvider>
);
```

Run visual regression on every PR.

---

## Validation Gates

### Gate 1: Phase 2 Complete

**Must achieve**:
- All existing tests passing
- Klondike and FreeCell migrated
- No functional regression
- GameActions interface fully implemented

**Sign-off required** before starting Phase 3.

### Gate 2: Phase 3 Complete

**Must achieve**:
- Lighthouse scores >90 (performance + accessibility)
- All manual accessibility tests passed
- Smart tap working on mobile devices
- Settings modal consistent across games

**Sign-off required** before building Spider.

### Gate 3: System Validation

**Must achieve**:
- Spider built in <1 day
- All new code has tests
- Documentation complete
- No critical bugs

**Sign-off required** before marking RFC as IMPLEMENTED.

---

## Rollback Plan

If critical issues found during migration:

1. **Keep old code** in separate branches
2. **Feature flag** unified system
3. **A/B test** with subset of users
4. **Gradual rollout**:
   - Week 1: Internal testing
   - Week 2: 10% of users
   - Week 3: 50% of users
   - Week 4: 100% of users

**Rollback criteria**:
- Performance regression >20%
- Accessibility score drops
- Critical bugs affecting gameplay
- User complaints spike

---

## Long-term Success (6 months)

- [ ] **5+ games implemented** using unified system
- [ ] **Each new game** takes <1 day to implement
- [ ] **Community contributors** add games without core team support
- [ ] **Zero major refactorings** needed
- [ ] **UI improvements** benefit all games simultaneously
- [ ] **Bug fixes** in shared code fix all games
- [ ] **User satisfaction** maintained or improved

---

Next: [06-risks.md](06-risks.md) - Risk analysis and mitigations
