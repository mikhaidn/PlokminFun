# Phase 1: Extract Shared Validation (2 days)

**Goal:** Create `@plokmin/shared/rules/` with generic validation functions.

---

## Step 1.1: Create Shared Rules File

**File:** `shared/rules/solitaireRules.ts`

**Functions to Implement:**

```typescript
/** Check if two cards have alternating colors (red/black) */
export function hasAlternatingColors(card1: Card, card2: Card): boolean

/** Check if same suit */
export function hasSameSuit(card1: Card, card2: Card): boolean

/**
 * Check if card can stack on target in descending rank with alternating colors
 * Used by: FreeCell tableau, Klondike tableau
 */
export function canStackDescending(
  cardToPlace: Card,
  targetCard: Card | null,
  options?: {
    requireAlternatingColors?: boolean;  // Default: true
    allowEmpty?: boolean;                 // Default: true
  }
): boolean

/**
 * Check if card can stack on foundation (Ace→King, same suit)
 * Used by: FreeCell, Klondike, Spider (with suit variant)
 */
export function canStackOnFoundation(
  cardToPlace: Card,
  foundation: Card[],
  options?: {
    requireSameSuit?: boolean;  // Default: true
  }
): boolean

/**
 * Validate a sequence of cards follows a stacking rule
 * Generic helper for multi-card moves
 */
export function isValidSequence(
  cards: Card[],
  validator: (card: Card, targetCard: Card) => boolean
): boolean

/**
 * Check if sequence is descending with alternating colors
 * Used by: FreeCell supermoves, Klondike tableau sequences
 */
export function isValidTableauSequence(cards: Card[]): boolean
```

**Acceptance Criteria:**
- [ ] File created with all helper functions
- [ ] TypeScript compiles without errors
- [ ] All functions have JSDoc comments
- [ ] Exported from `shared/index.ts`

---

## Step 1.2: Create Shared Rules Tests

**File:** `shared/rules/__tests__/solitaireRules.test.ts`

**Required Test Coverage:**

```typescript
describe('hasAlternatingColors', () => {
  // 4 test cases: red-black, black-red, red-red, black-black
});

describe('hasSameSuit', () => {
  // 2 test cases: same suit, different suit
});

describe('canStackDescending', () => {
  // 10+ test cases:
  // - Valid descending stack (red on black)
  // - Valid descending stack (black on red)
  // - Invalid: same color
  // - Invalid: wrong rank (off by 2+)
  // - Invalid: ascending rank
  // - Edge case: Ace on 2
  // - Edge case: null target with allowEmpty=true
  // - Edge case: null target with allowEmpty=false
  // - Option: requireAlternatingColors=false
});

describe('canStackOnFoundation', () => {
  // 8+ test cases:
  // - Ace on empty foundation
  // - Valid ascending (2 on Ace, 3 on 2, etc.)
  // - Invalid: wrong suit
  // - Invalid: wrong rank
  // - Invalid: non-Ace on empty
  // - Edge case: King on Queen (completion)
  // - Option: requireSameSuit=false (for Spider)
});

describe('isValidSequence', () => {
  // 6+ test cases:
  // - Empty array
  // - Single card
  // - Valid 2-card sequence
  // - Valid 5-card sequence
  // - Invalid sequence (break in middle)
  // - Invalid sequence (break at start)
});

describe('isValidTableauSequence', () => {
  // 4+ test cases:
  // - Valid FreeCell-style sequence
  // - Valid Klondike-style sequence
  // - Invalid: color break
  // - Invalid: rank break
});
```

**Commands:**
```bash
cd shared
npm run test
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] 100% code coverage on `solitaireRules.ts`
- [ ] No TypeScript errors

---

## Step 1.3: Update FreeCell to Use Shared Rules

**File:** `freecell-mvp/src/rules/validation.ts`

**Changes:**

```typescript
// BEFORE
export function canStackOnTableau(card: Card, targetCard: Card | null): boolean {
  if (!targetCard) return true;
  const oppositeColor = (isRed(card) && isBlack(targetCard)) ||
                        (isBlack(card) && isRed(targetCard));
  const descendingRank = card.rank === targetCard.rank - 1;
  return oppositeColor && descendingRank;
}

// AFTER
import { canStackDescending } from '@plokmin/shared';

export function canStackOnTableau(card: Card, targetCard: Card | null): boolean {
  return canStackDescending(card, targetCard, { allowEmpty: true });
}
```

**Refactor:**
- Update imports to use shared functions
- Replace validation logic with shared helpers
- Remove duplicate helpers (isRed, isBlack)
- Keep FreeCell-specific logic (getMaxMovable)

**Commands:**
```bash
cd freecell-mvp
npm run test
```

**Acceptance Criteria:**
- [ ] FreeCell validation uses shared functions
- [ ] All FreeCell tests pass (no regressions)
- [ ] No duplicate code between FreeCell and shared
- [ ] TypeScript compiles without errors

---

## Step 1.4: Update Klondike to Use Shared Rules

**File:** `klondike-mvp/src/rules/klondikeRules.ts`

**Changes:**

```typescript
// BEFORE
export function canPlaceOnTableau(cardToPlace: Card, targetCard: Card): boolean {
  return (
    cardToPlace.rank === targetCard.rank - 1 &&
    hasAlternatingColors(cardToPlace, targetCard)
  );
}

// AFTER
import { canStackDescending } from '@plokmin/shared';

export function canPlaceOnTableau(cardToPlace: Card, targetCard: Card): boolean {
  return canStackDescending(cardToPlace, targetCard, { allowEmpty: false });
}
```

**Refactor:**
- Update imports to use shared functions
- Replace validation logic
- Remove duplicate `hasAlternatingColors` helper
- Keep Klondike-specific logic (canPlaceOnEmptyTableau, face-down handling)

**Commands:**
```bash
cd klondike-mvp
npm run test
```

**Acceptance Criteria:**
- [ ] Klondike validation uses shared functions
- [ ] All 1415+ Klondike tests pass (no regressions)
- [ ] No duplicate code between Klondike and shared
- [ ] TypeScript compiles without errors

---

## Step 1.5: Build and Test Monorepo

**Commands:**
```bash
npm run build:shared
npm run build:pages
npm test
npm run lint
```

**Manual Testing:**
```bash
# FreeCell
cd freecell-mvp && npm run dev

# Klondike
cd klondike-mvp && npm run dev
```

**Acceptance Criteria:**
- [ ] All builds succeed
- [ ] All tests pass (FreeCell + Klondike + shared)
- [ ] No linter errors
- [ ] Both games work correctly in browser
- [ ] No console errors

---

## Step 1.6: Commit Phase 1

**Commit Message:**

```
feat: extract shared solitaire validation rules (RFC-004 Phase 1)

- Create shared/rules/solitaireRules.ts with generic validation
- Add comprehensive tests for shared rules (100% coverage)
- Migrate FreeCell validation to use shared rules
- Migrate Klondike validation to use shared rules
- Remove duplicate color/rank checking logic from both games

Impact:
- ~100 lines of duplicate code removed
- Single source of truth for validation logic
- Easier to add new games (Spider, Pyramid, etc.)

Related: RFC-004 Phase 1/3
```

**Acceptance Criteria:**
- [ ] Clean commit with all Phase 1 changes
- [ ] Commit message follows conventional commits format
- [ ] All tests passing in CI
