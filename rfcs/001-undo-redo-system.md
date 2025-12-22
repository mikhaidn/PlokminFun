# RFC-001: Universal Undo/Redo System for Card Games

**Author:** CardGames Team
**Status:** Proposed
**Created:** 2025-12-22
**Target:** FreeCell (immediate), All future games (reusable)

---

## Executive Summary

Implement a time-travel state management system that provides undo/redo functionality for FreeCell and establishes a reusable pattern for all future card games. This system will serve as both a user-facing feature and a development tool.

**Key Design Principles:**
- **Reusable First**: Design works for any turn-based game, not just FreeCell
- **Memory Efficient**: Mobile-friendly (<1MB for typical games)
- **Developer Experience**: Makes debugging and testing easier
- **Progressive Enhancement**: Core feature now, dev tools layer later

---

## Problem Statement

### User Problems
1. **No recovery from mistakes** - One wrong move can ruin a 20-minute game
2. **Learning curve** - New players need to experiment without punishment
3. **Exploration** - Players want to try "what if" scenarios
4. **Expectations** - Undo is table-stakes in modern card games

### Developer Problems
1. **Testing** - Hard to test specific game states without undo/redo
2. **Debugging** - Can't replay sequences of moves to find bugs
3. **Future games** - Will need to rebuild this for Spider, Klondike, etc.

### Success Criteria
- [ ] User can undo 100+ moves without lag (<100ms per undo)
- [ ] Memory usage <1MB for full game history
- [ ] Implementation reusable for game #2 with zero code changes to core system
- [ ] Enables time-travel debugging (future: visual state inspector)
- [ ] Works offline (persists to localStorage)
- [ ] Accessible (keyboard shortcuts, screen reader announcements)

---

## Proposed Solution

### Architecture: Immutable State Snapshots with Structural Sharing

```typescript
// packages/game-history/src/types.ts
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

// packages/game-history/src/HistoryManager.ts
export class HistoryManager<TState> implements HistoryManager<TState> {
  private states: TState[] = [];
  private currentIndex: number = -1;
  private maxSize: number;

  constructor(options: { maxSize?: number } = {}) {
    this.maxSize = options.maxSize ?? 100;
  }

  push(state: TState): void {
    // Remove any redo history (like browser history)
    this.states = this.states.slice(0, this.currentIndex + 1);

    // Add new state
    this.states.push(state);
    this.currentIndex++;

    // Enforce size limit (FIFO - remove oldest)
    if (this.states.length > this.maxSize) {
      this.states.shift();
      this.currentIndex--;
    }
  }

  undo(): TState | null {
    if (!this.canUndo()) return null;
    this.currentIndex--;
    return this.states[this.currentIndex];
  }

  redo(): TState | null {
    if (!this.canRedo()) return null;
    this.currentIndex++;
    return this.states[this.currentIndex];
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.states.length - 1;
  }

  getCurrentState(): TState {
    return this.states[this.currentIndex];
  }

  // Dev tools support
  getHistory(): readonly TState[] {
    return this.states;
  }

  jumpToIndex(index: number): TState {
    if (index < 0 || index >= this.states.length) {
      throw new Error(`Invalid history index: ${index}`);
    }
    this.currentIndex = index;
    return this.states[index];
  }

  // Persistence support
  serialize(): string {
    return JSON.stringify({
      states: this.states,
      currentIndex: this.currentIndex,
    });
  }

  static deserialize<T>(data: string, maxSize?: number): HistoryManager<T> {
    const { states, currentIndex } = JSON.parse(data);
    const manager = new HistoryManager<T>({ maxSize });
    manager.states = states;
    manager.currentIndex = currentIndex;
    return manager;
  }
}
```

### Integration: React Hook

```typescript
// packages/game-history/src/useGameHistory.ts
export interface UseGameHistoryOptions<TState> {
  initialState: TState;
  maxHistorySize?: number;
  persistKey?: string; // localStorage key
  onStateChange?: (state: TState) => void;
}

export function useGameHistory<TState>({
  initialState,
  maxHistorySize = 100,
  persistKey,
  onStateChange,
}: UseGameHistoryOptions<TState>) {
  const historyRef = useRef<HistoryManager<TState>>();
  const [currentState, setCurrentState] = useState<TState>(initialState);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize history manager
  useEffect(() => {
    if (persistKey) {
      const saved = localStorage.getItem(persistKey);
      if (saved) {
        historyRef.current = HistoryManager.deserialize(saved, maxHistorySize);
        setCurrentState(historyRef.current.getCurrentState());
        updateFlags();
        return;
      }
    }

    historyRef.current = new HistoryManager({ maxSize: maxHistorySize });
    historyRef.current.push(initialState);
    updateFlags();
  }, []);

  // Persist on state change
  useEffect(() => {
    if (persistKey && historyRef.current) {
      localStorage.setItem(persistKey, historyRef.current.serialize());
    }
  }, [currentState, persistKey]);

  const updateFlags = () => {
    if (!historyRef.current) return;
    setCanUndo(historyRef.current.canUndo());
    setCanRedo(historyRef.current.canRedo());
  };

  const pushState = useCallback((newState: TState) => {
    historyRef.current!.push(newState);
    setCurrentState(newState);
    updateFlags();
    onStateChange?.(newState);
  }, [onStateChange]);

  const undo = useCallback(() => {
    const prevState = historyRef.current!.undo();
    if (prevState) {
      setCurrentState(prevState);
      updateFlags();
      onStateChange?.(prevState);
    }
  }, [onStateChange]);

  const redo = useCallback(() => {
    const nextState = historyRef.current!.redo();
    if (nextState) {
      setCurrentState(nextState);
      updateFlags();
      onStateChange?.(nextState);
    }
  }, [onStateChange]);

  const reset = useCallback(() => {
    historyRef.current = new HistoryManager({ maxSize: maxHistorySize });
    historyRef.current.push(initialState);
    setCurrentState(initialState);
    updateFlags();
    onStateChange?.(initialState);
  }, [initialState, maxHistorySize, onStateChange]);

  return {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    // Advanced (for dev tools)
    history: historyRef.current,
  };
}
```

### Usage in FreeCell

```typescript
// freecell-mvp/src/components/GameBoard.tsx
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
    onStateChange: (state) => {
      // Analytics, autosave, etc.
      console.log(`Move ${state.moves}, can undo: ${canUndo}`);
    },
  });

  // When user makes a move
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
      if (e.key === 'n') {
        if (confirm('Start new game?')) {
          reset();
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [undo, redo, reset, canUndo, canRedo]);

  return (
    <div>
      {/* Game UI */}
      <button onClick={undo} disabled={!canUndo} aria-label="Undo last move">
        Undo (U)
      </button>
      <button onClick={redo} disabled={!canRedo} aria-label="Redo move">
        Redo (R)
      </button>
    </div>
  );
}
```

---

## Alternatives Considered

### Alternative 1: Command Pattern (Store Moves, Not States)

**Approach:**
```typescript
interface Move {
  type: 'tableau-to-foundation' | 'freecell-to-tableau' | ...;
  from: Location;
  to: Location;
  execute(state: GameState): GameState;
  undo(state: GameState): GameState;
}

// Store moves instead of full states
const moveHistory: Move[] = [];
```

**Pros:**
- ✅ Much lower memory usage (~10x less)
- ✅ Can replay entire game from seed + moves
- ✅ Better for analytics (track user behavior)

**Cons:**
- ❌ Complex to implement (need reverse operation for every move type)
- ❌ Error-prone (undo logic can have bugs)
- ❌ Harder to debug (can't inspect intermediate states easily)
- ❌ Coupling (move logic tied to state structure)

**Decision: REJECTED for v1**
- Memory isn't a constraint yet (100 states ≈ 50KB)
- Simplicity > optimization at this stage
- **Revisit if:** Memory usage becomes an issue (>5MB) or we want move-level analytics

### Alternative 2: Immer.js with Structural Sharing

**Approach:**
```typescript
import produce from 'immer';

const nextState = produce(currentState, draft => {
  // Mutations create new state with structural sharing
  draft.tableau[0].push(card);
});
```

**Pros:**
- ✅ Automatic structural sharing (saves memory)
- ✅ Cleaner mutation syntax
- ✅ Prevents accidental mutations

**Cons:**
- ❌ Adds 14KB dependency
- ❌ Learning curve for team
- ❌ Not necessary if state updates are already immutable

**Decision: DEFERRED**
- Our state updates are already immutable (using spread operators)
- Dependency not justified for current scale
- **Revisit if:** We see bugs from accidental mutations or memory issues

### Alternative 3: Browser History API

**Approach:**
Use `window.history.pushState()` for undo/redo

**Decision: REJECTED**
- ❌ Conflicts with browser back button
- ❌ Can't control history size limit
- ❌ Doesn't work offline
- ❌ Poor UX (interferes with navigation)

### Alternative 4: Redux DevTools / Zustand Middleware

**Approach:**
Use existing state management library with built-in time-travel

**Decision: REJECTED for now**
- ❌ Overkill for current needs (we don't need Redux)
- ❌ Adds complexity and dependencies
- ✅ **Could integrate later** if we adopt Redux/Zustand

---

## Technical Deep Dive

### Memory Analysis

**State size estimation:**
```typescript
// Typical FreeCell state:
{
  tableau: Card[8][7],    // 8 columns × 7 cards max = 56 cards
  freeCells: Card[4],      // 4 free cells
  foundations: Card[4][13], // 4 foundations × 13 cards max
  seed: number,             // 8 bytes
  moves: number             // 8 bytes
}

// Each card: ~100 bytes (suit, rank, value, id)
// Total state: ~5.2KB per snapshot
// 100 snapshots: ~520KB
// 1000 moves: ~5.2MB
```

**Memory budget:**
- Mobile devices: Target <1MB for history
- Desktop: Up to 10MB acceptable
- **Decision:** Default limit of 100 moves (520KB), configurable up to 1000

### Performance Analysis

**Undo/Redo operations:**
- Time complexity: O(1) (array index lookup)
- Space complexity: O(n) where n = number of moves
- Target: <100ms for undo/redo on mobile

**Optimization opportunities (future):**
1. **LRU compression**: Compress old states (>50 moves back)
2. **Differential snapshots**: Only store diffs after first 10 states
3. **Web Worker**: Move serialization to background thread

### Persistence Strategy

**LocalStorage integration:**
```typescript
// Auto-save every move
useEffect(() => {
  localStorage.setItem('freecell-history', history.serialize());
}, [currentState]);

// Restore on mount
useEffect(() => {
  const saved = localStorage.getItem('freecell-history');
  if (saved) {
    const restored = HistoryManager.deserialize(saved);
    setHistory(restored);
  }
}, []);
```

**Edge cases:**
- Quota exceeded: Fall back to 50 moves max
- Corrupted data: Reset to initial state with error message
- Cross-tab sync: Not supported in v1 (use single tab)

### Accessibility

**Keyboard shortcuts:**
- `U` - Undo
- `Ctrl+Z` - Undo (standard)
- `Ctrl+Y` or `Ctrl+Shift+Z` - Redo (standard)
- `N` - New game (with confirmation)

**Screen reader announcements:**
```typescript
const announceMove = (state: GameState, action: 'undo' | 'redo') => {
  const message = action === 'undo'
    ? `Undone. Now at move ${state.moves}`
    : `Redone. Now at move ${state.moves}`;

  // ARIA live region
  announcer.announce(message);
};
```

**Visual feedback:**
- Button states (enabled/disabled)
- Tooltip showing available shortcuts
- Move counter updates

---

## Implementation Plan

### Phase 1: Core System (4-6 hours)
**Priority: P1 (This sprint)**

1. **Create package structure** (30 min)
   ```
   packages/game-history/
   ├── src/
   │   ├── HistoryManager.ts      # Core class
   │   ├── useGameHistory.ts      # React hook
   │   ├── types.ts               # TypeScript types
   │   └── __tests__/
   │       ├── HistoryManager.test.ts
   │       └── useGameHistory.test.ts
   ├── package.json
   └── tsconfig.json
   ```

2. **Implement HistoryManager** (2 hours)
   - [ ] Core operations (push, undo, redo)
   - [ ] Size limiting
   - [ ] Serialization
   - [ ] Unit tests (100% coverage)

3. **Implement React hook** (2 hours)
   - [ ] State management
   - [ ] Persistence
   - [ ] Hook tests

4. **Integrate with FreeCell** (1-2 hours)
   - [ ] Replace manual state in GameBoard
   - [ ] Add undo/redo buttons
   - [ ] Keyboard shortcuts
   - [ ] Screen reader support

### Phase 2: UI Polish (2-3 hours)
**Priority: P1 (This sprint)**

1. **Enhanced UX** (1 hour)
   - [ ] Undo/redo button styling
   - [ ] Tooltips with keyboard shortcuts
   - [ ] Disabled state styling
   - [ ] Mobile-friendly button size

2. **Accessibility** (1 hour)
   - [ ] ARIA labels
   - [ ] Live region announcements
   - [ ] Focus management
   - [ ] High contrast mode support

3. **Testing** (1 hour)
   - [ ] E2E test: Play game → undo → redo → verify state
   - [ ] Test localStorage persistence
   - [ ] Test keyboard shortcuts
   - [ ] Test edge cases (undo at game start, etc.)

### Phase 3: Developer Tools (Future - P2)
**Priority: P2 (Next sprint)**

1. **Time-travel debugger component** (3-4 hours)
   ```typescript
   <HistoryDebugger
     history={history}
     onJumpTo={(index) => history.jumpToIndex(index)}
     showStateDiff={true}
   />
   ```
   - Visual timeline of moves
   - Click to jump to any state
   - State diff viewer
   - Export/import game sequences

2. **Development mode integration** (1 hour)
   - Only include in dev builds
   - Floating debug panel
   - Hotkey to toggle (`Ctrl+Shift+D`)

---

## Success Metrics

### User-Facing Metrics
- [ ] **Performance**: Undo/redo completes in <100ms (measured on iPhone SE)
- [ ] **Memory**: History uses <1MB for typical game (measure in Chrome DevTools)
- [ ] **Persistence**: Game state restores correctly after page reload (E2E test)
- [ ] **Accessibility**: Can complete full game using only keyboard (manual test)

### Developer-Facing Metrics
- [ ] **Reusability**: Game #2 (Spider/Klondike) adopts this with <30 min integration
- [ ] **Code Quality**: 100% test coverage on core HistoryManager
- [ ] **Documentation**: Examples in README, JSDoc on all public APIs
- [ ] **Bundle Size**: Package adds <5KB gzipped to production bundle

### Long-Term Success
- [ ] **Adoption**: All future card games use this system (no rewrites)
- [ ] **Dev Tools**: Time-travel debugger helps find 2+ bugs (tracked in issues)
- [ ] **Community**: If open-sourced, gets 10+ GitHub stars (validation of quality)

---

## Risks and Mitigations

### Risk 1: Memory Issues on Mobile
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Start with conservative limit (100 moves)
- Monitor with analytics (if added in P2)
- Future: Implement compression for old states

### Risk 2: LocalStorage Quota Exceeded
**Likelihood:** Medium (on low-end devices)
**Impact:** Medium (game stops saving)
**Mitigation:**
- Wrap in try/catch
- Reduce history size to 50 moves on quota error
- Show user notification: "History limited due to storage"

### Risk 3: State Serialization Bugs
**Likelihood:** Medium (complex objects)
**Impact:** High (corrupted saves)
**Mitigation:**
- Comprehensive tests for serialize/deserialize
- Validate deserialized data (schema check)
- Graceful fallback to new game if corrupt

### Risk 4: Performance Degradation
**Likelihood:** Low (simple operations)
**Impact:** Medium (poor UX)
**Mitigation:**
- Benchmark on low-end devices
- Profile with Chrome DevTools
- Lazy load dev tools (code splitting)

---

## Open Questions

### 1. Should redo be supported in v1?
**Arguments for:**
- Expected feature (muscle memory from other apps)
- Already implemented in HistoryManager (no extra work)

**Arguments against:**
- Adds UI complexity (another button)
- Rarely used feature

**Proposal:** Include redo, but behind a feature flag. Enable after user testing.

### 2. What's the optimal history size?
**Data needed:**
- Average game length (moves)
- 95th percentile game length
- Mobile memory constraints

**Proposal:**
- Default: 100 moves (covers 95% of games)
- Configurable via settings (50/100/unlimited)
- Monitor usage in P2 analytics

### 3. Should we support branching timelines?
**Scenario:** User undoes, makes different move → creates branch

**Options:**
- A) Current approach: Discard redo history (like browser)
- B) Keep branches (complex UX, like Git)

**Proposal:** Option A for v1. Revisit if users request it.

### 4. Keyboard shortcut conflicts?
**Concern:** `U` key might conflict with future features

**Mitigation:**
- Use standard shortcuts (`Ctrl+Z`, `Ctrl+Y`)
- Single-key shortcuts only when game has focus
- Make shortcuts configurable (future)

---

## Future Enhancements

### Phase 4: Advanced Features (Post-P3)
1. **Move annotations** - Users can add notes to moves
2. **Replay mode** - Auto-replay game from start
3. **Share game sequences** - Export moves as URL
4. **Multiplayer undo** - Coordinate undo in shared games (far future)

### Phase 5: Analytics Integration (P2)
1. **Track undo patterns** - Which moves get undone most?
2. **Difficulty detection** - Games with high undo rate = hard seed
3. **Learning insights** - Help users improve

### Extraction to Standalone Library (Post-P4)
**Potential:** This could be open-sourced as `@cardgames/game-history`
- Generic enough for any turn-based game
- TypeScript + React
- Zero dependencies
- Could help other game developers

---

## Appendix: Code Examples

### Example 1: FreeCell Integration (Full)

```typescript
// freecell-mvp/src/App.tsx
function FreeCell() {
  const {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useGameHistory<GameState>({
    initialState: initializeGame(getSeed()),
    persistKey: 'freecell-game',
    maxHistorySize: 100,
  });

  const handleMove = useCallback((from: Location, to: Location) => {
    const result = validateMove(currentState, from, to);
    if (!result.valid) {
      showError(result.reason);
      return;
    }

    const newState = applyMove(currentState, from, to);
    pushState(newState);

    // Check win condition
    if (checkWinCondition(newState)) {
      showWinScreen();
    }
  }, [currentState, pushState]);

  return (
    <GameBoard
      state={currentState}
      onMove={handleMove}
      onUndo={undo}
      onRedo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      onNewGame={reset}
    />
  );
}
```

### Example 2: Reuse in Spider Solitaire

```typescript
// spider-mvp/src/App.tsx
function Spider() {
  const {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useGameHistory<SpiderGameState>({  // Different state type!
    initialState: initializeSpider(getSeed()),
    persistKey: 'spider-game',
    maxHistorySize: 200,  // Spider has longer games
  });

  // Same pattern, different game
  const handleMove = (from: Location, to: Location) => {
    const newState = applySpiderMove(currentState, from, to);
    if (newState) pushState(newState);
  };

  // ... rest identical to FreeCell
}
```

---

## Decision

**Status: APPROVED** (pending review)

**Rationale:**
- Solves immediate user need (P1 priority)
- Reusable for all future games (platform thinking)
- Enables developer tools (future leverage)
- Simple implementation (low risk)
- Well-tested pattern (used in Redux DevTools, etc.)

**Next Steps:**
1. Review feedback from team/stakeholders
2. Begin Phase 1 implementation
3. Update STATUS.md when work begins

**Estimated Timeline:**
- Phase 1: 4-6 hours
- Phase 2: 2-3 hours
- **Total: 6-9 hours (~1 day)**

---

**Feedback and Comments:**

[Space for reviewers to add comments]

<!-- Template for comments:
**Reviewer:** [Name]
**Date:** [Date]
**Comment:** [Feedback]
**Resolution:** [How feedback was addressed]
-->
