# Testing Guide

This document describes the testing strategy, setup, and best practices for the CardGames monorepo. We use Vitest as our test runner with comprehensive coverage requirements.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Setup](#test-setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Coverage Requirements](#coverage-requirements)
- [TDD Approach](#tdd-approach)
- [Test Organization](#test-organization)
- [Writing Good Tests](#writing-good-tests)
- [Common Testing Patterns](#common-testing-patterns)
- [Best Practices](#best-practices)
- [Common Gotchas](#common-gotchas)

## Testing Philosophy

Our testing approach follows these principles:

1. **High Coverage**: Aim for >95% coverage on core logic
2. **TDD When Possible**: Write tests first for new features
3. **Co-located Tests**: Keep tests close to source files
4. **Fast Feedback**: Use watch mode for rapid iteration
5. **Immutability Testing**: Verify state updates don't mutate
6. **Test Behavior, Not Implementation**: Focus on what the code does, not how

## Test Setup

### Vitest Configuration

Each package has its own `vitest.config.ts`:

```typescript
// freecell-mvp/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
      ],
    },
  },
});
```

### Test Environment

We use **jsdom** to simulate a browser environment:

- DOM APIs available (document, window, localStorage)
- React component rendering via @testing-library/react
- Mock browser features (timers, RAF, etc.)

### Setup Files

Test setup is in `src/test/setup.ts`:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

## Running Tests

### Monorepo Commands (Root Level)

```bash
# Run all tests across all packages
npm test

# Run tests in specific package
npm test -w freecell-mvp
npm test -w klondike-mvp
npm test -w shared
```

### Individual Package Commands

```bash
# FreeCell tests
cd freecell-mvp
npm run test          # Run once
npm run test:watch    # Watch mode (for TDD)
npm run test:coverage # With coverage report

# Klondike tests (1415+ tests)
cd klondike-mvp
npm run test          # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report

# Shared library tests
cd shared
npm run test          # Run once
npm run test:watch    # Watch mode for TDD
npm run test:coverage # Coverage report
```

### Useful Test Flags

```bash
# Run tests matching pattern
npm test -- card

# Run only failed tests
npm test -- --reporter=verbose

# Run with UI
npm test -- --ui

# Update snapshots
npm test -- -u
```

## Test Structure

### File Naming Convention

Tests are co-located with source files in `__tests__/` directories:

```
src/
├── core/
│   ├── types.ts
│   ├── deck.ts
│   └── __tests__/
│       ├── types.test.ts
│       └── deck.test.ts
├── rules/
│   ├── validation.ts
│   └── __tests__/
│       └── validation.test.ts
└── state/
    ├── gameState.ts
    └── __tests__/
        └── gameState.test.ts
```

### Test File Structure

Follow this pattern for consistent test organization:

```typescript
// src/core/__tests__/deck.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createDeck, shuffleDeck } from '../deck';

describe('deck', () => {
  describe('createDeck', () => {
    it('should create a standard 52-card deck', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('should have 4 suits', () => {
      const deck = createDeck();
      const suits = new Set(deck.map(card => card.suit));
      expect(suits.size).toBe(4);
    });

    it('should have 13 ranks per suit', () => {
      const deck = createDeck();
      const hearts = deck.filter(card => card.suit === '♥');
      expect(hearts).toHaveLength(13);
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle deck with given seed', () => {
      const deck = createDeck();
      const shuffled1 = shuffleDeck([...deck], 12345);
      const shuffled2 = shuffleDeck([...deck], 12345);

      expect(shuffled1).toEqual(shuffled2);
    });

    it('should not mutate original deck', () => {
      const deck = createDeck();
      const original = [...deck];
      shuffleDeck(deck, 12345);

      expect(deck).toEqual(original);
    });
  });
});
```

## Coverage Requirements

### Coverage Targets

We aim for **>95% coverage** on core logic:

- **Statements**: >95%
- **Branches**: >90%
- **Functions**: >95%
- **Lines**: >95%

### Viewing Coverage Reports

```bash
cd freecell-mvp
npm run test:coverage

# Open HTML report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Exclusions

Exclude files that don't need testing:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        'src/main.tsx',  // Entry point
        'src/vite-env.d.ts',  // Type definitions
      ],
    },
  },
});
```

## TDD Approach

### Red-Green-Refactor Cycle

1. **Red**: Write a failing test
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve code while keeping tests green

### Example TDD Workflow

```bash
# Start watch mode
cd freecell-mvp
npm run test:watch
```

**Step 1: Write failing test (Red)**

```typescript
// src/rules/__tests__/validation.test.ts
it('should allow placing red 7 on black 8', () => {
  const red7 = { suit: '♥', value: '7', rank: 7, id: '7♥' };
  const black8 = { suit: '♠', value: '8', rank: 8, id: '8♠' };

  expect(canStackOnTableau(red7, black8)).toBe(true);
});
```

**Step 2: Make it pass (Green)**

```typescript
// src/rules/validation.ts
export function canStackOnTableau(card: Card, target: Card): boolean {
  const isAlternatingColor = getColor(card.suit) !== getColor(target.suit);
  const isDescending = card.rank === target.rank - 1;

  return isAlternatingColor && isDescending;
}
```

**Step 3: Refactor**

```typescript
// Improve readability
export function canStackOnTableau(card: Card, target: Card): boolean {
  return hasAlternatingColor(card, target) && isDescendingRank(card, target);
}

function hasAlternatingColor(card: Card, target: Card): boolean {
  return getColor(card.suit) !== getColor(target.suit);
}

function isDescendingRank(card: Card, target: Card): boolean {
  return card.rank === target.rank - 1;
}
```

## Test Organization

### Unit Tests

Test individual functions in isolation:

```typescript
// src/core/__tests__/rng.test.ts
describe('seededRandom', () => {
  it('should generate reproducible random numbers', () => {
    const rng1 = seededRandom(12345);
    const rng2 = seededRandom(12345);

    expect(rng1()).toBe(rng2());
    expect(rng1()).toBe(rng2());
  });

  it('should generate numbers between 0 and 1', () => {
    const rng = seededRandom(42);

    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
```

### Integration Tests

Test multiple modules working together:

```typescript
// src/state/__tests__/gameActions.test.ts
describe('moveCardToFoundation', () => {
  it('should move ace from tableau to empty foundation', () => {
    const state = createInitialGameState(12345);
    const aceOfSpades = state.tableau[0][0]; // Assuming it's an Ace

    const newState = moveCardToFoundation(state, aceOfSpades.id, 0);

    expect(newState.foundations[0]).toContainEqual(aceOfSpades);
    expect(newState.tableau[0]).not.toContainEqual(aceOfSpades);
  });
});
```

### Component Tests

Test React components with @testing-library/react:

```typescript
// src/components/__tests__/Card.test.tsx
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card component', () => {
  it('should render card suit and value', () => {
    const card = { suit: '♥', value: 'A', rank: 1, id: 'A♥' };

    render(<Card card={card} cardWidth={60} cardHeight={84} />);

    expect(screen.getByText('♥')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should apply red color for hearts and diamonds', () => {
    const card = { suit: '♥', value: 'A', rank: 1, id: 'A♥' };

    const { container } = render(
      <Card card={card} cardWidth={60} cardHeight={84} />
    );

    const element = container.firstChild;
    expect(element).toHaveStyle({ color: '#d00' });
  });
});
```

## Writing Good Tests

### Test Naming Convention

Use descriptive test names that explain the expected behavior:

```typescript
// ❌ Bad - unclear what's being tested
it('should work', () => { ... });

// ✅ Good - clear description
it('should allow stacking red 7 on black 8', () => { ... });

// ✅ Good - describes edge case
it('should prevent stacking when no free cells available', () => { ... });
```

### Arrange-Act-Assert Pattern

Structure tests clearly:

```typescript
it('should shuffle deck with seed', () => {
  // Arrange - set up test data
  const deck = createDeck();
  const seed = 12345;

  // Act - perform the action
  const shuffled = shuffleDeck(deck, seed);

  // Assert - verify the result
  expect(shuffled).toHaveLength(52);
  expect(shuffled).not.toEqual(deck);
});
```

### Test One Thing

Each test should verify a single behavior:

```typescript
// ❌ Bad - testing multiple things
it('should handle cards correctly', () => {
  const deck = createDeck();
  expect(deck).toHaveLength(52);

  const shuffled = shuffleDeck(deck, 123);
  expect(shuffled).not.toEqual(deck);

  const state = createInitialGameState(123);
  expect(state.tableau).toHaveLength(8);
});

// ✅ Good - separate tests
describe('deck operations', () => {
  it('should create 52 cards', () => { ... });
  it('should shuffle deck', () => { ... });
  it('should deal into 8 tableau columns', () => { ... });
});
```

## Common Testing Patterns

### Testing Immutability

Verify state updates don't mutate original objects:

```typescript
it('should not mutate original state when moving card', () => {
  const state = createInitialGameState(123);
  const originalState = JSON.parse(JSON.stringify(state));

  moveCard(state, 'A♠', 'tableau', 0);

  expect(state).toEqual(originalState);
});
```

### Testing Randomness

Use seeded RNG for reproducible tests:

```typescript
it('should generate reproducible shuffle with same seed', () => {
  const deck = createDeck();

  const shuffle1 = shuffleDeck([...deck], 12345);
  const shuffle2 = shuffleDeck([...deck], 12345);

  expect(shuffle1).toEqual(shuffle2);
});
```

### Testing Error Cases

Verify error handling:

```typescript
it('should throw error when moving to invalid foundation', () => {
  const state = createInitialGameState(123);
  const card = { suit: '♥', value: '5', rank: 5, id: '5♥' };

  expect(() => {
    moveCardToFoundation(state, card.id, 0);
  }).toThrow('Cannot place 5 on empty foundation');
});
```

## Best Practices

### 1. Use Factories for Test Data

Create helper functions for common test data:

```typescript
// src/test/factories.ts
export function createTestCard(suit: Suit, value: Value): Card {
  return {
    suit,
    value,
    rank: getRank(value),
    id: `${value}${suit}`,
  };
}

export function createTestState(overrides?: Partial<GameState>): GameState {
  return {
    tableau: [[], [], [], [], [], [], [], []],
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []],
    seed: 12345,
    moves: 0,
    ...overrides,
  };
}
```

### 2. Clean Up After Tests

Use `afterEach` for cleanup:

```typescript
describe('localStorage tests', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should save game to localStorage', () => {
    saveGame(state);
    expect(localStorage.getItem('game')).toBeTruthy();
  });
});
```

### 3. Mock External Dependencies

Mock browser APIs and external libraries:

```typescript
import { vi } from 'vitest';

it('should log analytics event', () => {
  const mockAnalytics = vi.fn();
  global.analytics = { track: mockAnalytics };

  trackGameWin(state);

  expect(mockAnalytics).toHaveBeenCalledWith('game_win', {
    moves: state.moves,
    seed: state.seed,
  });
});
```

### 4. Test Edge Cases

Don't just test the happy path:

```typescript
describe('canMoveStack', () => {
  it('should allow moving single card', () => { ... });
  it('should allow moving stack with free cells', () => { ... });
  it('should prevent moving stack when no free cells', () => { ... });
  it('should handle empty tableau column', () => { ... });
  it('should handle moving to empty column', () => { ... });
});
```

## Common Gotchas

### 1. Async Test Timeouts

Increase timeout for slow tests:

```typescript
it('should handle complex shuffle', () => {
  // Test code
}, { timeout: 10000 }); // 10 seconds
```

### 2. jsdom Limitations

jsdom doesn't support everything:

- No layout engine (offsetWidth, getBoundingClientRect)
- No CSS painting
- Limited Canvas support

Use mocks for unsupported features:

```typescript
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 100,
});
```

### 3. Test Isolation

Tests can affect each other via global state:

```typescript
// ❌ Bad - shared state
let sharedState = createInitialGameState(123);

it('test 1', () => {
  sharedState = moveCard(sharedState, ...);
});

it('test 2', () => {
  // Uses modified state from test 1!
  expect(sharedState.moves).toBe(0); // Fails!
});

// ✅ Good - fresh state per test
describe('game actions', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState(123);
  });

  it('test 1', () => { ... });
  it('test 2', () => { ... });
});
```

### 4. Coverage Gaps

Check coverage report for untested code:

```bash
npm run test:coverage
open coverage/index.html
```

Look for:
- Red lines (not executed)
- Yellow lines (partially covered branches)
- Functions with 0% coverage

## Related Documentation

- [Monorepo Management](./monorepo.md) - Running tests across packages
- [Version Management](./version-management.md) - Testing before releases
- `freecell-mvp/TESTING.md` - Manual testing guide
- `ROADMAP.md` - Testing requirements for new features
