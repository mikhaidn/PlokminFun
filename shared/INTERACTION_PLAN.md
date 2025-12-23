# Card Interaction System - Implementation Plan

**Goal:** Extract and standardize card interaction logic (click-to-select, drag-and-drop, touch) into a reusable hook that works for both FreeCell and Klondike.

**Approach:** Test-Driven Development (TDD) across 3 PRs

---

## Overview

### Current State
- **FreeCell:** Full interaction support (click, drag, touch) - 848 lines in GameBoard
- **Klondike:** Click-only support - 374 lines in GameBoard
- **Problem:** Duplicated logic, inconsistent UX, no drag support in Klondike

### Target State
- **Shared hook:** `useCardInteraction` in `shared/hooks/useCardInteraction.ts`
- **Shared component:** `DraggingCardPreview` for visual feedback
- **Both games:** Use the same interaction logic via the hook

---

## Multi-PR Strategy

### **PR #1: Create Shared Interaction Hook (TDD)**
**Branch:** `claude/shared-card-interaction-hook`
**Goal:** Build tested, generic interaction hook

**Files to create:**
- `shared/hooks/useCardInteraction.ts` (core hook)
- `shared/hooks/__tests__/useCardInteraction.test.ts` (comprehensive tests)
- `shared/components/DraggingCardPreview.tsx` (visual feedback component)
- `shared/types/CardInteraction.ts` (TypeScript types)

**Test coverage:**
- ✅ Click-to-select behavior (select card, deselect, move)
- ✅ Drag-and-drop (mouse events, drag state)
- ✅ Touch interactions (touch drag, preview position)
- ✅ State management (selectedCard, draggingCard, touchPosition)
- ✅ Edge cases (invalid moves, null states, concurrent interactions)

**Deliverable:** Fully tested hook that doesn't depend on any specific game

---

### **PR #2: Refactor FreeCell to Use Hook**
**Branch:** `claude/freecell-use-shared-interaction`
**Goal:** Validate the hook API with existing working code

**Files to modify:**
- `freecell-mvp/src/components/GameBoard.tsx` (refactor to use hook)
- `freecell-mvp/vite.config.ts` (add shared path alias)
- `freecell-mvp/tsconfig.app.json` (add shared path mapping)

**Success criteria:**
- ✅ All 191 existing tests still pass
- ✅ FreeCell behavior unchanged (click, drag, touch all work)
- ✅ Code reduced by ~150-200 lines in GameBoard
- ✅ No regressions in UX

**Validation:**
- Manual testing on desktop (click + drag)
- Manual testing on mobile (touch drag)
- Run full test suite

---

### **PR #3: Add Drag Support to Klondike**
**Branch:** `claude/klondike-add-drag-support`
**Goal:** Add drag-and-drop to Klondike using the proven hook

**Files to modify:**
- `klondike-mvp/src/components/GameBoard.tsx` (integrate hook)
- `klondike-mvp/src/components/Tableau.tsx` (add drag props)
- `klondike-mvp/src/components/FoundationArea.tsx` (add drag props)
- `klondike-mvp/src/components/StockWaste.tsx` (add drag props)

**Success criteria:**
- ✅ Click-to-select still works
- ✅ Drag-and-drop works (mouse)
- ✅ Touch drag works (mobile)
- ✅ Visual preview during drag
- ✅ Consistent with FreeCell UX

**Validation:**
- Manual testing on desktop
- Manual testing on mobile device
- Add integration tests

---

## API Design

### Hook Interface

```typescript
// shared/types/CardInteraction.ts

export interface CardLocation {
  type: string;  // Game-specific (e.g., 'tableau', 'freeCell', 'foundation', 'waste')
  index?: number;
  cardIndex?: number;
  cardCount?: number;
}

export interface CardInteractionConfig<TLocation extends CardLocation> {
  /** Validate if a move is legal (game-specific logic) */
  validateMove: (from: TLocation, to: TLocation) => boolean;

  /** Execute the move (game-specific state update) */
  executeMove: (from: TLocation, to: TLocation) => void;

  /** Optional: Get card data for visual preview */
  getCardAtLocation?: (location: TLocation) => Card | null;
}

export interface CardInteractionState<TLocation extends CardLocation> {
  selectedCard: TLocation | null;
  draggingCard: TLocation | null;
  touchDragging: boolean;
  touchPosition: { x: number; y: number } | null;
}

export interface CardInteractionHandlers<TLocation extends CardLocation> {
  // Click handlers
  handleCardClick: (location: TLocation) => void;

  // Drag handlers (mouse)
  handleDragStart: (location: TLocation) => (e: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (location: TLocation) => (e: React.DragEvent) => void;

  // Touch handlers (mobile)
  handleTouchStart: (location: TLocation) => (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  handleTouchCancel: () => void;
}
```

### Hook Usage

```typescript
// Example: FreeCell GameBoard.tsx
const {
  state: { selectedCard, draggingCard, touchPosition },
  handlers: {
    handleCardClick,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  },
} = useCardInteraction<FreeCellLocation>({
  validateMove: (from, to) => {
    // Game-specific validation logic
    if (from.type === 'freeCell' && to.type === 'tableau') {
      return canMoveFromFreeCellToTableau(gameState, from.index, to.index);
    }
    // ... more cases
  },
  executeMove: (from, to) => {
    // Game-specific move execution
    const newState = moveCard(gameState, from, to);
    if (newState) pushState(newState);
  },
  getCardAtLocation: (location) => {
    // Return card for visual preview
    if (location.type === 'freeCell') {
      return gameState.freeCells[location.index];
    }
    // ... more cases
  },
});

// Pass handlers to child components
<Tableau
  onCardClick={handleCardClick}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  onDrop={handleDrop}
  onTouchStart={handleTouchStart}
  // ...
/>
```

---

## Test Plan

### Unit Tests (PR #1)

**File:** `shared/hooks/__tests__/useCardInteraction.test.ts`

```typescript
describe('useCardInteraction', () => {
  describe('click-to-select', () => {
    it('should select a card on first click');
    it('should deselect card if clicking the same card');
    it('should move card if clicking valid destination');
    it('should not move if destination is invalid');
    it('should clear selection after successful move');
  });

  describe('drag-and-drop', () => {
    it('should set dragging state on drag start');
    it('should clear dragging state on drag end');
    it('should execute move on valid drop');
    it('should not execute move on invalid drop');
    it('should prevent default on drag over');
  });

  describe('touch interactions', () => {
    it('should start touch drag on touch start');
    it('should update touch position on touch move');
    it('should execute move on touch end at valid target');
    it('should cancel touch drag on touch cancel');
    it('should find drop target from touch coordinates');
  });

  describe('edge cases', () => {
    it('should handle null locations gracefully');
    it('should prevent concurrent drag and click');
    it('should reset state if executeMove throws');
  });
});
```

### Integration Tests (PR #2 & #3)

**FreeCell:**
- Existing 191 tests must pass
- Add interaction-specific tests if missing

**Klondike:**
- Add basic interaction tests (currently has 0 tests)
- Test click-to-select, drag-and-drop, touch

---

## Component Design

### DraggingCardPreview

```typescript
// shared/components/DraggingCardPreview.tsx

interface DraggingCardPreviewProps {
  card: Card | null;
  position: { x: number; y: number } | null;
  cardWidth: number;
  cardHeight: number;
  fontSize: {
    large: number;
    medium: number;
    small: number;
  };
  highContrastMode?: boolean;
}

export const DraggingCardPreview: React.FC<DraggingCardPreviewProps> = ({
  card,
  position,
  cardWidth,
  cardHeight,
  fontSize,
  highContrastMode = false,
}) => {
  if (!card || !position) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x - cardWidth / 2,
        top: position.y - cardHeight / 2,
        pointerEvents: 'none',
        zIndex: 1000,
        opacity: 0.8,
      }}
    >
      <Card
        card={card}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        fontSize={fontSize}
        highContrastMode={highContrastMode}
        isSelected={true}
      />
    </div>
  );
};
```

---

## Migration Path

### Step 1: PR #1 - Build the Foundation
1. Write comprehensive tests for `useCardInteraction`
2. Implement the hook to pass all tests
3. Create `DraggingCardPreview` component
4. Export from `shared/index.ts`

### Step 2: PR #2 - Validate with FreeCell
1. Add `@cardgames/shared` alias to FreeCell config
2. Refactor FreeCell `GameBoard.tsx`:
   - Remove inline interaction logic (~150 lines)
   - Use `useCardInteraction` hook
   - Use `DraggingCardPreview` component
3. Run all tests - must pass
4. Manual testing on desktop + mobile

### Step 3: PR #3 - Extend to Klondike
1. Integrate `useCardInteraction` into Klondike
2. Add drag props to child components
3. Add `touchAction: 'none'` to GameBoard
4. Add data-drop-target attributes for touch
5. Manual testing

---

## Success Metrics

**Code Quality:**
- ✅ >95% test coverage for shared hook
- ✅ All existing FreeCell tests pass
- ✅ No console errors/warnings
- ✅ TypeScript strict mode (no `any`)

**UX:**
- ✅ Click-to-select works in both games
- ✅ Drag-and-drop works in both games
- ✅ Touch drag works on mobile in both games
- ✅ Consistent visual feedback (selection, dragging)
- ✅ No performance regressions

**Maintainability:**
- ✅ Single source of truth for interaction logic
- ✅ Game-specific logic cleanly separated
- ✅ Easy to add interaction support to future games
- ✅ Reduced code duplication (~300 lines saved across both games)

---

## Risk Mitigation

**Risk:** Breaking FreeCell's working drag-and-drop
**Mitigation:** PR #2 must pass all existing tests + manual validation

**Risk:** Touch detection breaks on certain devices
**Mitigation:** Test on multiple devices (iPhone, Android, iPad)

**Risk:** Hook API doesn't fit Klondike's needs
**Mitigation:** Design API based on both games' requirements upfront

**Risk:** Performance issues with frequent state updates
**Mitigation:** Use `useCallback`, `useMemo` for handler functions

---

## Timeline Estimate

**PR #1:** 4-6 hours (tests + implementation)
**PR #2:** 3-4 hours (refactor + validation)
**PR #3:** 3-4 hours (integration + testing)

**Total:** 10-14 hours across 3 PRs

---

## Open Questions

1. Should the hook manage undo/redo history, or leave that to the caller?
   - **Decision:** Leave to caller (already using `useGameHistory`)

2. Should we support animation of card movement?
   - **Decision:** No, out of scope for this refactor (future enhancement)

3. Should we extract visual feedback (selection styling) too?
   - **Decision:** Yes, include in `DraggingCardPreview` but keep selection styling in Card component

4. How to handle game-specific validation (e.g., Klondike face-down cards)?
   - **Decision:** Pass validation function to hook (game provides logic)

---

## Next Steps

Ready to start **PR #1**? I'll:
1. Create types in `shared/types/CardInteraction.ts`
2. Write comprehensive tests in `shared/hooks/__tests__/useCardInteraction.test.ts`
3. Implement `useCardInteraction` hook (TDD)
4. Create `DraggingCardPreview` component
5. Commit and push to `claude/shared-card-interaction-hook`
