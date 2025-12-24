# Implementation

## Package Structure

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

---

## Implementation Plan

### Phase 1: Core System (4-6 hours)
**Priority: P1 (This sprint)**

#### 1. Create package structure (30 min)
Set up new package in monorepo with proper TypeScript configuration.

#### 2. Implement HistoryManager (2 hours)
- [ ] Core operations (push, undo, redo)
- [ ] Size limiting with FIFO eviction
- [ ] Serialization/deserialization
- [ ] Unit tests (100% coverage target)

**Key implementation details:**
```typescript
export class HistoryManager<TState> {
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

#### 3. Implement React hook (2 hours)
- [ ] State management with useState/useRef
- [ ] LocalStorage persistence
- [ ] Callback support (onStateChange)
- [ ] Hook tests with React Testing Library

**Key implementation details:**
- Use `useRef` for HistoryManager (persist across renders)
- Use `useState` for React state (currentState, canUndo, canRedo)
- `useEffect` for localStorage sync
- `useCallback` for stable function references

#### 4. Integrate with FreeCell (1-2 hours)
- [ ] Replace manual state management in GameBoard
- [ ] Add undo/redo buttons to UI
- [ ] Implement keyboard shortcuts
- [ ] Add screen reader support (ARIA labels, live regions)

---

### Phase 2: UI Polish (2-3 hours)
**Priority: P1 (This sprint)**

#### 1. Enhanced UX (1 hour)
- [ ] Button styling (primary/secondary patterns)
- [ ] Tooltips showing keyboard shortcuts
- [ ] Disabled state styling (grayed out)
- [ ] Mobile-friendly button size (44px minimum)

#### 2. Accessibility (1 hour)
- [ ] ARIA labels on all buttons
- [ ] Live region announcements ("Undone. Now at move 15")
- [ ] Focus management (focus doesn't jump unexpectedly)
- [ ] High contrast mode support

#### 3. Testing (1 hour)
- [ ] E2E test: Play game → undo → redo → verify state
- [ ] Test localStorage persistence and restoration
- [ ] Test keyboard shortcuts
- [ ] Edge cases: undo at game start, redo after new move

---

### Phase 3: Developer Tools (Future - P2)
**Priority: P2 (Next sprint)**

#### 1. Time-travel debugger component (3-4 hours)
Visual timeline of game states for debugging.

```typescript
<HistoryDebugger
  history={history}
  onJumpTo={(index) => history.jumpToIndex(index)}
  showStateDiff={true}
/>
```

**Features:**
- Visual timeline of moves (click to jump)
- State diff viewer (show what changed)
- Export/import game sequences for bug reports
- Scrub through history with slider

#### 2. Development mode integration (1 hour)
- Only include in dev builds (tree-shaking)
- Floating debug panel (draggable)
- Hotkey to toggle (`Ctrl+Shift+D`)

---

## Technical Deep Dive

### Memory Management

**Size Estimation:**
- FreeCell state: ~5.2KB per snapshot
- 100 snapshots: ~520KB
- Mobile target: <1MB

**Mitigation strategies:**
- Conservative default (100 moves)
- Configurable limits per game
- Future: compression for old states

### Performance Optimization

**Current approach (sufficient for v1):**
- O(1) undo/redo operations
- Simple array indexing
- No complex computations

**Future optimizations (if needed):**
- LRU compression for states >50 moves back
- Differential snapshots after first 10 states
- Web Worker for background serialization
- Lazy deserialization (only parse when needed)

### Persistence Edge Cases

**LocalStorage quota exceeded:**
```typescript
try {
  localStorage.setItem(key, data);
} catch (e) {
  // Reduce history to 50 moves and retry
  manager.states = manager.states.slice(-50);
  localStorage.setItem(key, manager.serialize());

  // Show user notification
  showNotification('History limited due to storage');
}
```

**Corrupted data:**
```typescript
try {
  const manager = HistoryManager.deserialize(data);
  return manager;
} catch (e) {
  console.error('Failed to restore game state:', e);
  // Graceful fallback to new game
  return new HistoryManager({ maxSize: 100 });
}
```

**Schema validation:**
- Validate deserialized data structure
- Check for required fields
- Version the serialization format for future migrations

---

## Rollout Strategy

### Step 1: Core Package (Day 1)
- Create `packages/game-history`
- Implement HistoryManager + tests
- Implement useGameHistory hook + tests

### Step 2: FreeCell Integration (Day 1-2)
- Integrate hook into FreeCell
- Add UI controls
- Test with real gameplay

### Step 3: Polish & Accessibility (Day 2)
- UI styling
- Keyboard shortcuts
- Screen reader support
- Edge case testing

### Step 4: Documentation (Day 2)
- README with examples
- JSDoc on all public APIs
- Usage guide for future games

### Step 5: Dev Tools (Next Sprint)
- Time-travel debugger
- State inspector
- Export/import functionality

---

## Dependencies

**Production:**
- React (already in project)
- No additional dependencies needed

**Development:**
- Jest (testing)
- React Testing Library (hook tests)
- @testing-library/user-event (interaction tests)

**Bundle size impact:**
- HistoryManager: ~2KB gzipped
- useGameHistory: ~1KB gzipped
- Total: <5KB (meets success criteria)

---

## Risk Mitigation

### Risk: Memory issues on mobile
**Mitigation:**
- Start with 100 moves (conservative)
- Make configurable per game
- Monitor usage patterns
- Implement compression if needed

### Risk: LocalStorage quota exceeded
**Mitigation:**
- Try/catch around all localStorage operations
- Reduce history size on quota error
- Clear notification to user
- Fall back to in-memory only

### Risk: State serialization bugs
**Mitigation:**
- Comprehensive serialize/deserialize tests
- Schema validation on deserialize
- Graceful fallback to new game
- Version the format for migrations

### Risk: Performance degradation
**Mitigation:**
- Benchmark on low-end devices
- Profile with Chrome DevTools
- Set performance budgets
- Lazy load dev tools (code splitting)

---

## Future Enhancements

### Phase 4: Advanced Features
1. **Move annotations** - Users can add notes to specific moves
2. **Replay mode** - Auto-replay game from start
3. **Share sequences** - Export moves as URL
4. **Multiplayer undo** - Coordinate undo in shared games

### Phase 5: Analytics Integration
1. **Track undo patterns** - Which moves get undone most?
2. **Difficulty detection** - High undo rate = hard seed
3. **Learning insights** - Help users improve strategy

### Standalone Library
Potential to extract as `@cardgames/game-history`:
- Generic for any turn-based game
- TypeScript + React
- Zero dependencies
- Open source potential

---

## Decision & Timeline

**Status: APPROVED** (pending review)

**Estimated Timeline:**
- Phase 1: 4-6 hours
- Phase 2: 2-3 hours
- **Total: 6-9 hours (~1 day)**

**Next Steps:**
1. Review feedback from team
2. Begin Phase 1 implementation
3. Update STATUS.md when work begins
