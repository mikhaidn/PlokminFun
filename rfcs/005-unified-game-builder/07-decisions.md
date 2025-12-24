# 07: Key Decisions & Rationale

## Decision 1: UI After Unification (With Prototype First)

### Decision
Unify architecture **before** perfecting UI, but prototype UI **first** to understand requirements.

### Timeline
```
✅ Phase 1: UI Prototype (2-3 days) - Understand what perfect UI needs
✅ Phase 2: Unification (3-4 weeks) - Build system to support those needs
✅ Phase 3: Perfect UI (4-5 weeks) - Polish once, all games benefit
```

### Alternatives Considered

**Alternative 1: UI First, Unify Later**
```
1. Perfect Klondike UI (2-3 weeks)
2. Perfect FreeCell UI (2-3 weeks, duplicate work)
3. Unify (3-4 weeks)
4. Rebuild UI for unified system (2-3 weeks, wasted effort)

Total: 10-13 weeks + significant rework
```

**Alternative 2: No Prototype, Unify Blindly**
```
1. Unify architecture (3-4 weeks)
2. Try to add perfect UI
3. Discover architecture doesn't support it
4. Refactor architecture (2-3 weeks rework)

Total: High risk of mismatch
```

### Why Phase 1 Prototyping is Critical

**The Problem Without Prototyping**:

You might build this interface:
```typescript
// Seemed like a good idea...
interface GameActions {
  executeMove(state, from, to): State;
}
```

Then discover during UI work:
```typescript
// Oh no, animations need to know when move completes!
// But we can't change the interface now without breaking everything
```

**The Solution: Prototype First**:

```
Day 1-2: Build smooth drag animation in Klondike
         Discover: Need callback when animation completes

Day 3:   Document finding: "UI needs animation lifecycle hooks"

Week 2:  Design GameActions with that requirement:
         interface GameActions {
           executeMove(...): State;
           onMoveAnimationComplete?: () => void;  // ← Added proactively
         }
```

**Result**: Architecture supports perfect UI from the start, zero rework.

### Real-World Analogy

**UI First = Renovate Analogy**:
- Perfect one room (Klondike UI)
- Perfect another room (FreeCell UI)
- Realize you need open floor plan (unification)
- Knock down walls
- Redo both rooms 😢

**Prototype → Unify → Perfect = Build Right Analogy**:
- Sketch floor plan first (prototype)
- Build open layout (unify with requirements in mind)
- Furnish all rooms at once (perfect UI once) ✅

### Cost Analysis

**Approach 1: UI First**
| Phase | Time | Notes |
|-------|------|-------|
| Perfect Klondike | 2-3 weeks | Full effort |
| Perfect FreeCell | 2-3 weeks | Duplicate work |
| Unify | 3-4 weeks | |
| Rebuild UI | 2-3 weeks | Wasted effort |
| **Total** | **10-13 weeks** | **3-5 weeks wasted** |

**Approach 2: Prototype → Unify → Perfect (Proposed)**
| Phase | Time | Notes |
|-------|------|-------|
| Prototype UI | 2-3 days | Cheap discovery |
| Unify | 3-4 weeks | Built right the first time |
| Perfect UI | 4-5 weeks | Do once, all games benefit |
| **Total** | **9-10 weeks** | **Zero wasted effort** |

**Savings: 1-3 weeks + lower risk**

### Exception: Urgent Demo Needed

**If you need polished Klondike in 2 weeks**:
1. Go ahead and perfect Klondike UI now
2. Accept you'll rebuild some during unification
3. Use it as reference for "what perfect means"
4. Budget 2-3 weeks for re-implementation later

**But if timeline is flexible**: Prototype → Unify → Perfect

### Rationale Summary

**Why prototype first?**
- Discovers UI requirements cheaply (2-3 days vs 3-5 weeks)
- Prevents architectural mismatches
- Ensures abstraction supports perfect UI

**Why unify before perfecting?**
- Do UI work once instead of 2-5 times
- All games benefit from improvements simultaneously
- Consistent UX across games
- Lower maintenance burden

**Decision: Approved** ✅

---

## Decision 2: Smart Tap-to-Move

### Decision
Implement "tap-to-move" on mobile where:
- **1 valid move**: Auto-execute on single tap
- **2+ valid moves**: Show options, execute on second tap
- **0 valid moves**: Visual feedback (shake/pulse)

### User Problem

**Current mobile experience**:
```
User wants to move King from column 3 to empty column 6:
1. Tap and hold King
2. Drag finger across screen
3. Drop on column 6
4. Card is small, finger obscures view
5. Miss target, have to retry
```

**Frustrating**: 30% of mobile moves require 2-3 attempts

### Proposed Experience

**Scenario 1: Only one valid move**
```
Ace of Spades is on tableau, empty foundation exists
User taps Ace → Immediately moves to foundation
No second tap needed!
```

**Scenario 2: Multiple valid moves**
```
King of Hearts can go to 2 empty columns
User taps King → Both columns highlight
User taps column 6 → King moves there
```

**Scenario 3: No valid moves**
```
User taps 5 of Spades (no valid destination)
Card shakes or pulses → Visual feedback "can't move this"
```

### Implementation

**Add to GameActions**:
```typescript
interface GameActions<TState> {
  // ... existing methods

  // NEW: Get all valid destinations for smart tap
  getValidMoves?(state: TState, from: GameLocation): GameLocation[];
}
```

**Usage in interaction hook**:
```typescript
const handleCardTap = (location: GameLocation) => {
  if (!config.features?.smartTap) {
    return; // Feature disabled
  }

  const validMoves = config.actions.getValidMoves?.(state, location) || [];

  if (validMoves.length === 1) {
    // Auto-execute
    executeMove(location, validMoves[0]);
    playMoveAnimation(location, validMoves[0]);
  } else if (validMoves.length > 1) {
    // Show options
    setSelectedCard(location);
    setHighlightedCells(validMoves);
    // Wait for second tap
  } else {
    // Invalid
    playInvalidFeedback(location);
  }
};
```

**Desktop compatibility**:
- Drag-and-drop still works (primary interaction)
- Smart tap available via click (secondary option)
- Double-click for quick foundation move

### Why This Pattern?

**Alternative 1: Always require two taps**
```
❌ Slower (2 taps for every move)
❌ Doesn't leverage "obvious move" situations
```

**Alternative 2: Always auto-execute**
```
❌ No way to cancel accidental taps
❌ Can't choose between multiple destinations
```

**Alternative 3: Long-press to auto-execute**
```
❌ Slower (must wait for long-press timeout)
❌ Less intuitive
❌ Conflicts with other long-press actions (hints)
```

**Chosen pattern: Smart tap (1 or 2 taps based on context)**
```
✅ Fast for obvious moves (1 tap)
✅ Flexible for ambiguous moves (2 taps)
✅ Intuitive (highlights show what's possible)
✅ Can be disabled per-game if not wanted
```

### User Research Evidence

Mobile solitaire apps with smart tap:
- Microsoft Solitaire Collection (200M+ users)
- Solitaire by MobilityWare (100M+ users)
- Google Solitaire

**User feedback**: "Tap-to-move is essential on mobile"

### Rollout Strategy

**Phase 1**: Add `getValidMoves()` to GameActions
**Phase 2**: Implement in `useCardInteraction` hook
**Phase 3**: Enable via feature flag
**Phase 4**: A/B test (50% with, 50% without)
**Phase 5**: Default to enabled based on results

**Configurable per-game**:
```typescript
const KlondikeConfig = {
  features: {
    smartTap: true  // Can be disabled if not wanted
  }
};
```

**Decision: Approved** ✅

---

## Decision 3: Unified Menu & Settings System

### Decision
Create a consistent settings modal that works across all games with:
- **Global settings** (theme, sound, animations) - always shown
- **Game-specific settings** (draw count, difficulty) - conditional
- **Game selector** (integrated in settings)

### User Problem

**Current experience**:
```
FreeCell: Has extensive settings modal
Klondike: Has basic controls only
User switches games: "Where did settings go?"
User changes theme in one game: Doesn't apply to other games
```

**Inconsistent** → Confusing UX

### Proposed Experience

**User opens settings in any game**:
```
┌─────────────────────────────┐
│ Settings                  ✕ │
├─────────────────────────────┤
│                             │
│ 🎨 Appearance               │  ← Global settings
│   ○ Theme: Classic          │     (Same in all games)
│   ○ Card Style: Modern      │
│                             │
│ 🔊 Sound & Animation        │  ← Global settings
│   ☑ Sound Effects           │
│   ○ Animation: Full         │
│                             │
│ ♠️ Klondike Settings        │  ← Game-specific
│   ○ Draw Count: 3           │     (Only in Klondike)
│                             │
│ 🎮 More Games              │  ← Game selector
│   [Klondike] [FreeCell]     │     (Same everywhere)
│   [Spider]   [Pyramid]      │
└─────────────────────────────┘
```

**Consistent** → Settings work the same everywhere

### Architecture

**Global settings** (apply to all games):
```typescript
interface GlobalSettings {
  theme: 'classic' | 'dark' | 'highContrast' | 'minimal';
  cardStyle: 'classic' | 'modern' | 'minimal';
  soundEnabled: boolean;
  animationLevel: 'full' | 'reduced' | 'none';
  colorblindMode: boolean;
  leftHandedMode: boolean;
}
```

**Game-specific settings** (via GameConfig):
```typescript
// Klondike
const KlondikeConfig = {
  settings: [
    {
      id: 'draw-count',
      label: 'Draw Count',
      type: 'select',
      options: [
        { value: 1, label: 'Draw 1' },
        { value: 3, label: 'Draw 3' }
      ],
      default: 3
    }
  ]
};

// FreeCell (no game-specific settings)
const FreeCellConfig = {
  // settings: undefined - section omitted from UI
};

// Spider
const SpiderConfig = {
  settings: [
    {
      id: 'difficulty',
      label: 'Difficulty',
      type: 'select',
      options: [
        { value: 1, label: '1 Suit (Easy)' },
        { value: 2, label: '2 Suits (Medium)' },
        { value: 4, label: '4 Suits (Hard)' }
      ],
      default: 2
    }
  ]
};
```

**Storage strategy**:
```typescript
// localStorage structure
{
  "app:theme": "dark",
  "app:soundEnabled": true,
  "app:animationLevel": "full",
  "game:klondike:draw-count": 3,
  "game:spider:difficulty": 2
  // FreeCell has no game-specific settings
}
```

### Why Unified Settings?

**Benefits**:

1. **Consistent UX**
   - Settings work the same in all games
   - Users learn once, apply everywhere

2. **Theme system**
   - Change theme once → applies to all games
   - No per-game theme configuration

3. **Discoverability**
   - "More Games" in settings = easy to find other games
   - No separate game selector page needed

4. **Flexibility**
   - Games can add settings (Klondike: draw count)
   - Games can omit settings (FreeCell: none)
   - Same UI either way

5. **Maintainability**
   - One SettingsModal component
   - One theme system
   - Shared settings context

### Why Game Selector in Settings?

**Alternative locations**:
- Home page with game grid ❌ (requires separate page)
- Hamburger menu ❌ (hidden, not discoverable)
- Top navigation ❌ (clutters game UI)

**In settings modal** ✅:
- Already opening modal for settings
- Natural place to explore options
- Doesn't clutter game UI
- Works on mobile (no hover menus)

**User flow**:
```
User playing Klondike
  ↓
Clicks "Settings" button
  ↓
Sees "More Games" section
  ↓
Clicks FreeCell thumbnail
  ↓
Navigates to FreeCell
  ↓
Theme/settings persist
```

### Implementation Complexity

**Estimated effort**: 4-5 days

| Task | Time |
|------|------|
| Define GlobalSettings interface | 1 hour |
| Create AppContext | 4 hours |
| Build SettingsModal component | 2 days |
| Build theme system | 1-2 days |
| Build game selector | 1 day |
| Integrate with all games | 1 day |

**Reusable across all future games** → High ROI

### Mobile Considerations

**Settings modal on mobile**:
- Full-screen overlay (not sidebar)
- Touch-friendly controls (44x44px minimum)
- Swipe-down to close
- Remembers scroll position

### Accessibility

**Settings modal accessibility**:
- Keyboard navigation (Tab through controls)
- Screen reader announces all options
- High contrast mode applies to modal
- Focus trap (can't Tab out of modal)
- Esc key closes modal

**Decision: Approved** ✅

---

## Decision 4: Three-Phase Approach

### Decision
Execute in three distinct phases rather than all at once or piecemeal.

### Why Three Phases?

**Phase 1: Discovery** (2-3 days)
- Cheap way to understand requirements
- Prevents architectural mistakes
- Low risk, high value

**Phase 2: Foundation** (3-4 weeks)
- Build the unified system
- Migrate existing games
- Validate architecture with real games

**Phase 3: Polish** (4-5 weeks)
- Perfect UI once
- All games benefit simultaneously
- Unified experience

### Alternative: "Big Bang" (Everything at once)

```
Week 1-6: Build unified system + perfect UI + migrate games all together
```

**Problems**:
- High complexity, many moving parts
- Can't validate architecture until end
- If something doesn't work, have to redo everything
- Higher risk

### Alternative: "Piecemeal" (No structure)

```
Add features as needed:
- Week 1: Extract some shared utils
- Week 5: Maybe unify settings?
- Week 10: Think about Spider
```

**Problems**:
- No clear end state
- Easy to stop halfway
- Technical debt accumulates
- Never get full benefits

### Why Phased Approach is Better

**Clear milestones**:
- Phase 1 complete → Requirements documented
- Phase 2 complete → Architecture validated
- Phase 3 complete → Full value realized

**Validation gates**:
- Can stop after Phase 2 if timeline tight
- Can defer Phase 3 features if needed
- Each phase delivers value

**Risk management**:
- Phase 1 de-risks architecture
- Phase 2 validates with real games
- Phase 3 adds polish (lower risk)

**Decision: Approved** ✅

---

## Decision 5: GameActions Interface Design

### Decision
Use interface-based design rather than inheritance or config-only.

### Chosen Approach: Interface

```typescript
interface GameActions<TState> {
  validateMove(...): boolean;
  executeMove(...): State;
  // ...
}

class KlondikeGameActions implements GameActions<KlondikeGameState> {
  // Full flexibility, game-specific logic
}
```

### Alternative 1: Inheritance

```typescript
abstract class BaseGameActions {
  abstract validateMove(...): boolean;
  abstract executeMove(...): State;
}

class KlondikeGameActions extends BaseGameActions {
  validateMove(...) { ... }
}
```

**Why not?**
- Forces single inheritance (limiting)
- Harder to compose behaviors
- TypeScript favors interfaces

### Alternative 2: Config-Only (No Code)

```typescript
const KlondikeConfig = {
  rules: {
    tableauRule: 'alternatingColors',
    foundationRule: 'ascendingSameSuit'
  }
  // Entire game logic configured, no code
};
```

**Why not?**
- Can't express complex game logic
- Works for simple games, breaks for Spider
- Limited flexibility
- Hidden complexity in config parser

### Why Interface-Based?

**Flexibility**:
- Games can implement logic however they want
- Not constrained by base class
- Can share utilities without inheritance

**Type safety**:
- TypeScript validates implementations
- Compile-time errors if interface not satisfied
- Great IDE autocomplete

**Testability**:
- Easy to mock for tests
- Can test each method independently

**Composability**:
- Can share helper functions
- Can mix in behaviors
- Not locked into hierarchy

**Decision: Approved** ✅

---

## Summary of Key Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| **UI after unification** | Avoid wasted effort, do UI once | ✅ Approved |
| **Prototype first** | Discover requirements before building | ✅ Approved |
| **Smart tap-to-move** | Essential for mobile UX | ✅ Approved |
| **Unified settings** | Consistent UX across games | ✅ Approved |
| **Three-phase approach** | Clear milestones, manageable risk | ✅ Approved |
| **Interface-based design** | Flexibility + type safety | ✅ Approved |

---

## Open Questions

**To be decided during implementation**:

1. **Animation library**: Framer Motion vs React Spring?
   - Both work, decide in Phase 1

2. **Theme implementation**: CSS variables vs styled-components?
   - Decide based on prototype findings

3. **Game selector layout**: Grid vs list?
   - A/B test in Phase 3

4. **Sound effects**: Use Web Audio API or HTML5 audio?
   - Decide when implementing sound system

**None of these block starting Phase 1**

---

**End of RFC-005 Decisions**
