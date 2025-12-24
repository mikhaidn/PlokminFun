# Solution

## Architecture: Immutable State Snapshots

Core approach: Store complete state snapshots in an array, track current position with an index pointer.

**Key decisions:**
- **Immutable snapshots** over command pattern (simpler, easier to debug)
- **Array-based storage** with index pointer (O(1) undo/redo operations)
- **Configurable size limits** to prevent memory issues
- **Generic TypeScript types** for reusability across games

---

## Core Components

### HistoryManager<TState>

Generic class that manages state history for any game type.

```typescript
export interface HistoryManager<TState> {
  // Core operations
  push(state: TState): void;
  undo(): TState | null;
  redo(): TState | null;

  // Query
  canUndo(): boolean;
  canRedo(): boolean;
  getCurrentState(): TState;

  // Advanced (for dev tools)
  getHistory(): readonly TState[];
  jumpToIndex(index: number): TState;

  // Persistence
  serialize(): string;
  deserialize(data: string): void;
}
```

**Key behaviors:**
- `push()` adds new state and clears redo history (like browser history)
- Size limiting: removes oldest states when exceeding maxSize (FIFO)
- Serialization: JSON-based for localStorage persistence

### useGameHistory Hook

React integration that wraps HistoryManager with state management.

```typescript
export interface UseGameHistoryOptions<TState> {
  initialState: TState;
  maxHistorySize?: number;      // Default: 100
  persistKey?: string;            // localStorage key
  onStateChange?: (state: TState) => void;
}

export function useGameHistory<TState>(options) {
  return {
    currentState: TState;
    pushState: (newState: TState) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    reset: () => void;
    history: HistoryManager<TState>;  // For dev tools
  };
}
```

**Features:**
- Auto-persistence to localStorage on state changes
- Restore from localStorage on mount
- React state integration with proper re-renders
- Callback support for analytics/side effects

---

## Usage Example: FreeCell

```typescript
function GameBoard() {
  const {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useGameHistory<GameState>({
    initialState: initializeGame(Date.now()),
    maxHistorySize: 100,
    persistKey: 'freecell-game-state',
  });

  const handleMove = (from: Location, to: Location) => {
    const newState = applyMove(currentState, from, to);
    if (newState) {
      pushState(newState); // Automatically saves to history
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'u' && canUndo) undo();
      if (e.key === 'r' && canRedo) redo();
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [undo, redo, canUndo, canRedo]);

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo (U)</button>
      <button onClick={redo} disabled={!canRedo}>Redo (R)</button>
      {/* Game UI */}
    </div>
  );
}
```

---

## Reusability: Spider Solitaire Example

Same hook, different game - zero changes to core system:

```typescript
function Spider() {
  const { currentState, pushState, undo, redo, canUndo, canRedo } =
    useGameHistory<SpiderGameState>({  // Different state type!
      initialState: initializeSpider(getSeed()),
      persistKey: 'spider-game',
      maxHistorySize: 200,  // Spider has longer games
    });

  // Same pattern, different game
  const handleMove = (from: Location, to: Location) => {
    const newState = applySpiderMove(currentState, from, to);
    if (newState) pushState(newState);
  };
}
```

---

## Alternatives Considered

### Alternative 1: Command Pattern (Store Moves, Not States)

**Approach:** Store move objects with execute/undo methods

**Pros:**
- Much lower memory usage (~10x less)
- Can replay entire game from seed + moves
- Better for analytics

**Cons:**
- Complex to implement (need reverse operation for every move type)
- Error-prone (undo logic can have bugs)
- Harder to debug (can't inspect intermediate states)
- Coupling (move logic tied to state structure)

**Decision: REJECTED for v1**
- Memory isn't a constraint yet (100 states ≈ 50KB)
- Simplicity > optimization at this stage
- Revisit if memory usage becomes an issue (>5MB)

### Alternative 2: Immer.js with Structural Sharing

**Approach:** Use Immer for automatic structural sharing of state

**Pros:**
- Automatic structural sharing (saves memory)
- Cleaner mutation syntax
- Prevents accidental mutations

**Cons:**
- Adds 14KB dependency
- Learning curve for team
- Not necessary if state updates are already immutable

**Decision: DEFERRED**
- Our state updates are already immutable (spread operators)
- Dependency not justified for current scale

### Alternative 3: Browser History API

**Decision: REJECTED**
- Conflicts with browser back button
- Can't control history size limit
- Poor UX (interferes with navigation)

### Alternative 4: Redux DevTools / Zustand Middleware

**Decision: REJECTED for now**
- Overkill for current needs
- Adds complexity and dependencies
- Could integrate later if we adopt Redux/Zustand

---

## Memory & Performance Analysis

### State Size Estimation

```typescript
// Typical FreeCell state:
{
  tableau: Card[8][7],     // 56 cards max
  freeCells: Card[4],      // 4 cells
  foundations: Card[4][13], // 52 cards
  seed: number,
  moves: number
}

// Each card: ~100 bytes
// Total state: ~5.2KB per snapshot
// 100 snapshots: ~520KB
// Target: <1MB for mobile
```

### Performance Targets

- **Undo/Redo:** O(1) time complexity (array index lookup)
- **Space:** O(n) where n = number of moves
- **Target:** <100ms for undo/redo on mobile devices

### Future Optimizations

1. **LRU compression** - Compress states >50 moves back
2. **Differential snapshots** - Store diffs after first 10 states
3. **Web Worker** - Background serialization

---

## Persistence Strategy

**LocalStorage integration:**
- Auto-save every move to localStorage
- Restore on mount (if available)
- Graceful degradation on quota exceeded
- No cross-tab sync in v1

**Edge cases:**
- Quota exceeded: Fall back to 50 moves max
- Corrupted data: Reset to initial state with error message
- Single tab only (no sync across tabs)

---

## Accessibility

### Keyboard Shortcuts
- `U` - Undo
- `Ctrl+Z` - Undo (standard)
- `Ctrl+Y` or `Ctrl+Shift+Z` - Redo (standard)
- `N` - New game (with confirmation)

### Screen Reader Support
- ARIA labels on buttons
- Live region announcements for undo/redo
- Visual feedback (button states, tooltips)

---

## Open Questions

### 1. Should redo be supported in v1?
**Proposal:** Include redo, but behind a feature flag. Enable after user testing.

### 2. Optimal history size?
**Proposal:** Default 100 moves (covers 95% of games), configurable via settings

### 3. Branching timelines?
**Proposal:** Discard redo history on new move (like browser). Revisit if users request it.

### 4. Keyboard shortcut conflicts?
**Mitigation:** Use standard shortcuts (Ctrl+Z), single-key only when game has focus
