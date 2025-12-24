# Testing Strategy

## Success Metrics

### User-Facing Metrics

#### Performance
- [ ] **Undo/redo completes in <100ms** (measured on iPhone SE)
  - Test on low-end mobile device
  - Measure with Chrome DevTools Performance panel
  - Profile with 100+ move histories

#### Memory
- [ ] **History uses <1MB for typical game** (measured in Chrome DevTools)
  - Typical game = 50-80 moves
  - Worst case = 100 moves
  - Monitor memory usage in production

#### Persistence
- [ ] **Game state restores correctly after page reload** (E2E test)
  - Save game mid-play
  - Reload page
  - Verify all state restored correctly
  - Test undo/redo still work

#### Accessibility
- [ ] **Can complete full game using only keyboard** (manual test)
  - Navigate with Tab/Shift+Tab
  - Undo with Ctrl+Z or U key
  - Redo with Ctrl+Y or R key
  - Screen reader announces state changes

---

### Developer-Facing Metrics

#### Reusability
- [ ] **Game #2 adopts this with <30 min integration**
  - Test with Spider Solitaire or Klondike
  - Zero changes to core system required
  - Only game-specific type parameters

#### Code Quality
- [ ] **100% test coverage on core HistoryManager**
  - Unit tests for all methods
  - Edge cases covered
  - Error handling tested

#### Documentation
- [ ] **Examples in README, JSDoc on all public APIs**
  - Clear usage examples
  - TypeScript types documented
  - Integration guide for new games

#### Bundle Size
- [ ] **Package adds <5KB gzipped to production bundle**
  - Measure with webpack-bundle-analyzer
  - Tree-shaking verified
  - No bloat from dependencies

---

### Long-Term Success

#### Adoption
- [ ] **All future card games use this system** (no rewrites)
  - Spider Solitaire uses it
  - Klondike uses it
  - Pattern established

#### Dev Tools
- [ ] **Time-travel debugger helps find 2+ bugs** (tracked in issues)
  - Document bugs found using the tool
  - Developer feedback positive

#### Community
- [ ] **If open-sourced, gets 10+ GitHub stars**
  - Validation of quality
  - Potential for external contributions

---

## Test Plan

### Unit Tests: HistoryManager

**Core functionality:**
```typescript
describe('HistoryManager', () => {
  test('push adds state to history', () => {
    const manager = new HistoryManager<number>();
    manager.push(1);
    expect(manager.getCurrentState()).toBe(1);
  });

  test('undo returns previous state', () => {
    const manager = new HistoryManager<number>();
    manager.push(1);
    manager.push(2);
    expect(manager.undo()).toBe(1);
  });

  test('redo returns next state', () => {
    const manager = new HistoryManager<number>();
    manager.push(1);
    manager.push(2);
    manager.undo();
    expect(manager.redo()).toBe(2);
  });

  test('canUndo returns false at initial state', () => {
    const manager = new HistoryManager<number>();
    manager.push(1);
    expect(manager.canUndo()).toBe(false);
  });

  test('push after undo clears redo history', () => {
    const manager = new HistoryManager<number>();
    manager.push(1);
    manager.push(2);
    manager.undo();
    manager.push(3);
    expect(manager.canRedo()).toBe(false);
  });

  test('enforces maxSize limit', () => {
    const manager = new HistoryManager<number>({ maxSize: 3 });
    manager.push(1);
    manager.push(2);
    manager.push(3);
    manager.push(4); // Should remove 1
    expect(manager.getHistory().length).toBe(3);
  });

  test('serialize/deserialize roundtrip', () => {
    const manager = new HistoryManager<number>();
    manager.push(1);
    manager.push(2);
    const serialized = manager.serialize();
    const restored = HistoryManager.deserialize<number>(serialized);
    expect(restored.getCurrentState()).toBe(2);
    expect(restored.canUndo()).toBe(true);
  });
});
```

**Edge cases:**
- Undo at initial state (returns null)
- Redo with no redo history (returns null)
- Empty history
- Corrupted serialized data
- Very large states (test memory)

---

### Unit Tests: useGameHistory Hook

**Core functionality:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useGameHistory } from './useGameHistory';

describe('useGameHistory', () => {
  test('initializes with initialState', () => {
    const { result } = renderHook(() =>
      useGameHistory({ initialState: 1 })
    );
    expect(result.current.currentState).toBe(1);
  });

  test('pushState updates currentState', () => {
    const { result } = renderHook(() =>
      useGameHistory({ initialState: 1 })
    );
    act(() => {
      result.current.pushState(2);
    });
    expect(result.current.currentState).toBe(2);
  });

  test('undo restores previous state', () => {
    const { result } = renderHook(() =>
      useGameHistory({ initialState: 1 })
    );
    act(() => {
      result.current.pushState(2);
      result.current.undo();
    });
    expect(result.current.currentState).toBe(1);
  });

  test('canUndo updates correctly', () => {
    const { result } = renderHook(() =>
      useGameHistory({ initialState: 1 })
    );
    expect(result.current.canUndo).toBe(false);
    act(() => {
      result.current.pushState(2);
    });
    expect(result.current.canUndo).toBe(true);
  });

  test('onStateChange callback fires', () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useGameHistory({ initialState: 1, onStateChange: callback })
    );
    act(() => {
      result.current.pushState(2);
    });
    expect(callback).toHaveBeenCalledWith(2);
  });

  test('persists to localStorage', () => {
    const { result } = renderHook(() =>
      useGameHistory({
        initialState: 1,
        persistKey: 'test-game'
      })
    );
    act(() => {
      result.current.pushState(2);
    });
    expect(localStorage.getItem('test-game')).toBeTruthy();
  });

  test('restores from localStorage', () => {
    // First render: save state
    const { unmount } = renderHook(() =>
      useGameHistory({
        initialState: 1,
        persistKey: 'test-game-restore'
      })
    );
    // ... push states ...
    unmount();

    // Second render: should restore
    const { result } = renderHook(() =>
      useGameHistory({
        initialState: 1,
        persistKey: 'test-game-restore'
      })
    );
    expect(result.current.currentState).not.toBe(1);
  });
});
```

**Edge cases:**
- localStorage quota exceeded
- Corrupted localStorage data
- Multiple instances with same persistKey
- Reset clears history

---

### Integration Tests: FreeCell

**E2E test scenarios:**

1. **Basic undo/redo flow**
   - Make 5 moves
   - Undo 3 times
   - Verify game state matches move 2
   - Redo 2 times
   - Verify game state matches move 4

2. **Persistence across reload**
   - Start new game
   - Make 10 moves
   - Reload page
   - Verify game state restored
   - Undo should work correctly

3. **Keyboard shortcuts**
   - Press 'u' key → should undo
   - Press 'r' key → should redo
   - Press Ctrl+Z → should undo
   - Press Ctrl+Y → should redo

4. **Accessibility**
   - Tab to undo button → should focus
   - Press Enter → should undo
   - Screen reader should announce "Undone. Now at move X"

5. **Edge cases**
   - Undo at game start → button disabled
   - Redo with no redo history → button disabled
   - Make move after undo → redo history cleared
   - Win game → undo should still work

---

## Performance Testing

### Memory Profiling

**Test procedure:**
1. Open Chrome DevTools → Memory tab
2. Take heap snapshot (baseline)
3. Play game for 100 moves
4. Take heap snapshot (after moves)
5. Calculate memory delta
6. Verify <1MB increase

**Targets:**
- 100 moves: <520KB
- 200 moves: <1MB (warn user)
- 1000 moves: Should not crash (limit enforced)

### Performance Profiling

**Test procedure:**
1. Open Chrome DevTools → Performance tab
2. Record while doing 10 undo operations
3. Check each undo takes <100ms
4. Verify no frame drops
5. Test on throttled CPU (4x slowdown)

**Targets:**
- Undo: <100ms (95th percentile)
- Redo: <100ms (95th percentile)
- No UI jank (60fps maintained)

---

## Regression Testing

### Pre-release Checklist

- [ ] All unit tests pass (100% coverage)
- [ ] All integration tests pass
- [ ] Manual accessibility test (keyboard only)
- [ ] Performance benchmarks met
- [ ] Memory usage within budget
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] localStorage persistence works
- [ ] Bundle size <5KB gzipped

### Manual Testing Checklist

**FreeCell integration:**
- [ ] Undo button disabled at game start
- [ ] Undo button enabled after first move
- [ ] Undo correctly reverts game state
- [ ] Redo button works after undo
- [ ] New move clears redo history
- [ ] Keyboard shortcuts work (u, r, Ctrl+Z, Ctrl+Y)
- [ ] Game state persists after reload
- [ ] Can undo after reload
- [ ] No crashes with 100+ moves
- [ ] Win condition still works after undo/redo

**Accessibility:**
- [ ] Buttons have ARIA labels
- [ ] Screen reader announces state changes
- [ ] Keyboard navigation works
- [ ] Focus visible on buttons
- [ ] High contrast mode works

---

## Risks & Mitigation Testing

### Risk: Memory Issues on Mobile

**Test strategy:**
- Profile on actual iPhone SE and low-end Android
- Test with 100, 200, 500 moves
- Monitor for crashes or slowdowns
- Verify size limiting works

**Pass criteria:**
- No crashes with 100 moves
- Warning shown at 200 moves
- Hard limit enforced (config)

### Risk: LocalStorage Quota Exceeded

**Test strategy:**
- Fill localStorage with dummy data
- Attempt to save game state
- Verify graceful degradation
- Check user notification

**Pass criteria:**
- No crashes on quota error
- User notified clearly
- Falls back to reduced history

### Risk: State Serialization Bugs

**Test strategy:**
- Complex game states (many cards moved)
- Edge cases (empty freecells, full foundations)
- Corrupt localStorage data manually
- Test schema validation

**Pass criteria:**
- All game states serialize/deserialize correctly
- Corrupted data handled gracefully
- No data loss on valid states

### Risk: Performance Degradation

**Test strategy:**
- Benchmark on low-end devices
- Profile with 100+ moves
- Test with CPU throttling (4x)
- Measure frame rates during undo/redo

**Pass criteria:**
- <100ms undo/redo operations
- 60fps maintained during interactions
- No noticeable lag on mobile

---

## Continuous Monitoring

**Post-launch metrics to track:**
- Average undo operations per game
- Max history size reached
- LocalStorage errors (quota exceeded)
- Performance regressions (monitor <100ms target)
- User feedback on undo/redo UX

**Alerts to set up:**
- Undo operation >100ms (95th percentile)
- Memory usage >1MB
- LocalStorage error rate >1%
- Crash rate increase after deployment
