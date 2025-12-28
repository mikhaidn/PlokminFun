# Invalid Move Feedback

**Usability Improvement:** Provide visual and textual feedback when players attempt invalid moves.

## Overview

The `useCardInteraction` hook now tracks invalid move attempts and provides:
- Location where the invalid move was attempted
- Optional reason message
- Auto-clearing after 600ms (sufficient for shake animation)

## Usage in Components

### 1. Import the animation CSS

```tsx
import '../../../shared/styles/animations.css';
```

### 2. Access invalid move state from the hook

```tsx
const { state, handlers } = useCardInteraction<GameLocation>({
  validateMove,
  executeMove,
  getValidMoves,
});

const { invalidMoveAttempt } = state;
```

### 3. Apply shake animation to cards/cells

```tsx
function isInvalidLocation(location: GameLocation): boolean {
  if (!invalidMoveAttempt) return false;

  return (
    invalidMoveAttempt.location.type === location.type &&
    invalidMoveAttempt.location.index === location.index
  );
}

// In your card/cell component:
<div
  className={isInvalidLocation(location) ? 'shake-animation' : ''}
  style={{...}}
>
  {/* Card content */}
</div>
```

### 4. (Optional) Show tooltip with reason

```tsx
{invalidMoveAttempt && isInvalidLocation(location) && (
  <div className="invalid-move-tooltip fade-in-animation">
    {invalidMoveAttempt.reason || 'Invalid move'}
  </div>
)}
```

## Example Integration (FreeCell/Klondike)

```tsx
// In GameBoard.tsx
import '../../../shared/styles/animations.css';

function GameBoard() {
  const { state: interactionState, handlers } = useCardInteraction<GameLocation>({
    validateMove: (from, to) => validateMove(gameState, from, to),
    executeMove: (from, to) => {
      const newState = executeMove(gameState, from, to);
      if (newState) pushState(newState);
    },
    getValidMoves: (from) => getValidMoves(gameState, from),
  });

  const { invalidMoveAttempt } = interactionState;

  // Helper to check if a location had an invalid move attempt
  const isInvalidLocation = useCallback((loc: GameLocation) => {
    if (!invalidMoveAttempt) return false;
    return (
      invalidMoveAttempt.location.type === loc.type &&
      invalidMoveAttempt.location.index === loc.index
    );
  }, [invalidMoveAttempt]);

  return (
    <div className="game-board">
      {/* Tableau columns */}
      {gameState.tableau.map((column, colIndex) => (
        <TableauColumn
          key={colIndex}
          column={column}
          isInvalid={isInvalidLocation({ type: 'tableau', index: colIndex })}
          invalidReason={
            isInvalidLocation({ type: 'tableau', index: colIndex })
              ? invalidMoveAttempt?.reason
              : undefined
          }
        />
      ))}

      {/* Free cells, foundations, etc. */}
    </div>
  );
}

// In TableauColumn.tsx
function TableauColumn({ column, isInvalid, invalidReason }) {
  return (
    <div className={isInvalid ? 'shake-animation' : ''}>
      {invalidReason && (
        <div className="tooltip fade-in-animation">
          {invalidReason}
        </div>
      )}
      {/* Column cards */}
    </div>
  );
}
```

## Automatic Triggers

Invalid move feedback is automatically triggered in these scenarios:

1. **Smart tap with no valid moves**
   - Message: "No valid moves for this card"
   - Occurs when: User taps a card that has no legal destinations

2. **Traditional mode invalid move**
   - Message: "Invalid move"
   - Occurs when: User selects card A, then taps invalid destination B

3. **Invalid drag-and-drop (mouse)**
   - Message: "Cannot drop card here"
   - Occurs when: User drags a card and drops it on an invalid destination

4. **Invalid touch drag (mobile)**
   - Message: "Cannot move card here"
   - Occurs when: User touch-drags a card to an invalid destination

## Customization

### Change animation duration

Edit `shared/styles/animations.css`:

```css
@keyframes shake {
  /* Adjust timing */
}

.shake-animation {
  animation: shake 400ms ease-in-out; /* Change duration here */
}
```

### Change auto-clear delay

Edit `shared/hooks/useCardInteraction.ts`:

```typescript
// Currently set to 600ms
invalidMoveTimerRef.current = window.setTimeout(() => {
  setInvalidMoveAttempt(null);
  invalidMoveTimerRef.current = null;
}, 600); // Change this value
```

### Custom reason messages

You can provide custom reasons when calling validation functions:

```typescript
// In your validation logic
if (!canPlaceOnTableau(card, targetColumn)) {
  // Instead of just returning false, you could track the reason
  // and pass it to invalidMoveAttempt
  return false;
}
```

## Accessibility

The animation respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Users who prefer reduced motion will see instant feedback without shake animation.

## Benefits

1. **Reduces confusion**: Players immediately know when a move is invalid
2. **Provides context**: Optional reason messages explain why
3. **Mobile-friendly**: Works with touch, drag, and tap interactions
4. **Accessible**: Respects motion preferences
5. **Non-intrusive**: Auto-clears after brief delay

## Testing

To test invalid move feedback:

1. **Smart tap mode**: Tap a card with no valid moves
2. **Traditional mode**: Select card, tap invalid destination
3. **Drag-and-drop**: Drag card to invalid location
4. **Touch drag**: Touch-drag card to invalid location

Expected behavior:
- Shake animation on target location (600ms)
- Optional tooltip with reason
- Auto-clears after animation completes
