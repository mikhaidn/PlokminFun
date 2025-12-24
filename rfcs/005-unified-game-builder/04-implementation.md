# 04: Implementation Plan

## Timeline Overview

```
Week 1:      Phase 1 - UI Prototype
Week 2-5:    Phase 2 - Unification
Week 6-10:   Phase 3 - Perfect UI
Week 11:     Validation & Spider implementation
```

**Total: 11 weeks**

---

## Phase 1: UI Prototype (Week 1, 2-3 days)

### Day 1: Animation Experiments

**Setup**:
```bash
cd klondike-mvp
git checkout -b prototype/ui-exploration
npm install framer-motion  # or react-spring
```

**Tasks**:
1. **Card drag with spring physics**:
   ```typescript
   import { motion, useMotionValue } from 'framer-motion';

   const AnimatedCard = motion.div;

   <AnimatedCard
     drag
     dragConstraints={bounds}
     dragElastic={0.1}
     dragTransition={{ bounceStiffness: 300, bounceDamping: 25 }}
   />
   ```

2. **Card flip animation**:
   ```typescript
   const [isFlipped, setIsFlipped] = useState(false);

   <motion.div
     animate={{ rotateY: isFlipped ? 180 : 0 }}
     transition={{ duration: 0.3, ease: 'easeOut' }}
   />
   ```

3. **Win celebration**:
   - Confetti effect (use react-confetti)
   - Card cascade animation
   - Sound effects

**Deliverable**: Working animations in Klondike prototype

### Day 2: Mobile Interactions

**Test smart tap-to-move**:
```typescript
const handleCardTap = (location: GameLocation) => {
  const validMoves = getValidMoves(gameState, location);

  if (validMoves.length === 1) {
    // Auto-execute
    executeMove(location, validMoves[0]);
  } else if (validMoves.length > 1) {
    // Show options
    setHighlightedCells(validMoves);
  }
};
```

**Test on devices**:
- iOS Safari (iPhone)
- Android Chrome
- iPad/tablet

**Measure**:
- Touch target sizes (min 44x44px)
- Performance (60fps?)
- Gesture conflicts

**Deliverable**: Mobile interaction patterns validated

### Day 3: Documentation

**Create** `/docs/architecture/ui-requirements.md`:

```markdown
# UI Requirements for Unified System

## Animation State

Animations need:
- [ ] Callback when move animation completes
- [ ] Ability to queue multiple animations
- [ ] Per-game configuration (duration, spring values)

## Component Lifecycle

Components need:
- [ ] onMoveStart hook
- [ ] onMoveComplete hook
- [ ] onCardFlip hook

## Mobile Interactions

Smart tap requires:
- [ ] getValidMoves() in GameActions
- [ ] Visual highlight for valid destinations
- [ ] Timeout to clear selection

## Performance

Must maintain:
- [ ] 60fps during drag
- [ ] <100ms touch response
- [ ] Smooth animations on mid-range devices
```

**Deliverable**: Requirements doc for Phase 2

---

## Phase 2: Unification (Weeks 2-5)

### Week 2: Standardize Move Execution

#### Day 1-2: Define GameActions Interface

**Create** `shared/types/GameActions.ts`:

```typescript
export interface GameActions<TState> {
  // Core game logic
  validateMove(state: TState, from: GameLocation, to: GameLocation): boolean;
  executeMove(state: TState, from: GameLocation, to: GameLocation): TState | null;
  getCardAt(state: TState, location: GameLocation): Card | Card[] | null;

  // Game lifecycle
  initializeGame(seed: number): TState;
  isGameWon(state: TState): boolean;

  // Optional features
  getAutoMoves?(state: TState): Array<{ from: GameLocation; to: GameLocation }>;
  getValidMoves?(state: TState, from: GameLocation): GameLocation[];
  getHint?(state: TState): { from: GameLocation; to: GameLocation } | null;
}
```

**Create** `shared/state/moveExecution.ts`:

```typescript
export function createMoveExecutor<TState>(actions: GameActions<TState>) {
  return {
    validateAndExecute(state: TState, from: GameLocation, to: GameLocation) {
      if (!actions.validateMove(state, from, to)) return null;
      return actions.executeMove(state, from, to);
    },

    smartTap(state: TState, from: GameLocation) {
      const validMoves = actions.getValidMoves?.(state, from) || [];
      if (validMoves.length === 1) {
        return actions.executeMove(state, from, validMoves[0]);
      }
      return { validMoves, state };
    }
  };
}
```

#### Day 3-5: Migrate Klondike

**Refactor** `klondike-mvp/src/state/gameActions.ts`:

```typescript
export class KlondikeGameActions implements GameActions<KlondikeGameState> {
  validateMove(state: KlondikeGameState, from: GameLocation, to: GameLocation): boolean {
    // Existing logic from moveValidation.ts
    return validateMove(state, from, to);
  }

  executeMove(state: KlondikeGameState, from: GameLocation, to: GameLocation): KlondikeGameState | null {
    // Existing logic from moveExecution.ts
    return moveCards(state, from, to);
  }

  getValidMoves(state: KlondikeGameState, from: GameLocation): GameLocation[] {
    // NEW: Find all valid destinations for smart tap
    const destinations: GameLocation[] = [];

    // Check each tableau column
    for (let i = 0; i < 7; i++) {
      if (this.validateMove(state, from, { type: 'tableau', index: i })) {
        destinations.push({ type: 'tableau', index: i });
      }
    }

    // Check foundations
    for (let i = 0; i < 4; i++) {
      if (this.validateMove(state, from, { type: 'foundation', index: i })) {
        destinations.push({ type: 'foundation', index: i });
      }
    }

    // Check waste/stock if applicable
    // ...

    return destinations;
  }

  initializeGame(seed: number): KlondikeGameState {
    return createInitialState(seed);
  }

  isGameWon(state: KlondikeGameState): boolean {
    return state.foundations.every(pile => pile.length === 13);
  }

  getCardAt(state: KlondikeGameState, location: GameLocation): Card | Card[] | null {
    // Implementation
  }
}
```

**Update tests** to use new interface.

#### Day 6-8: Migrate FreeCell

**Refactor** `freecell-mvp/src/state/gameActions.ts`:

```typescript
export class FreeCellGameActions implements GameActions<FreeCellGameState> {
  validateMove(state: FreeCellGameState, from: GameLocation, to: GameLocation): boolean {
    // Consolidate existing specialized functions
    return validateMove(state, from, to);
  }

  executeMove(state: FreeCellGameState, from: GameLocation, to: GameLocation): FreeCellGameState | null {
    // Consolidate moveCardToFreeCell, moveCardFromFreeCell, etc.
    return executeMove(state, from, to);
  }

  getValidMoves(state: FreeCellGameState, from: GameLocation): GameLocation[] {
    // Similar to Klondike but check free cells too
    // ...
  }

  // ... other methods
}
```

**Test migration**:
```bash
cd freecell-mvp
npm test  # All tests must pass
npm run lint
```

### Week 3: Create Game Config System

#### Day 1-2: Define GameConfig Interface

**Create** `shared/types/GameConfig.ts`:

```typescript
export interface GameConfig<TState> {
  metadata: GameMetadata;
  layout: GameLayout;
  rules: GameRules;
  actions: GameActions<TState>;
  component: React.ComponentType<GameLayoutProps<TState>>;
  animations?: AnimationConfig;
  features?: FeatureFlags;
  settings?: GameSetting[];
}

export interface GameMetadata {
  name: string;
  id: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  thumbnail?: string;
}

export interface GameLayout {
  numTableauColumns: number;
  numFoundations: number;
  specialAreas: Array<'stock' | 'waste' | 'freeCells'>;
}

export interface GameRules {
  tableauStackRule: 'alternatingColors' | 'sameSuit' | 'any';
  emptyTableauRule: 'kingOnly' | 'anyCard' | 'none';
  foundationRule: 'sameSuit' | 'completeSuit';
}

export interface GameSetting {
  id: string;
  label: string;
  type: 'select' | 'toggle' | 'slider';
  options?: Array<{ value: any; label: string }>;
  default: any;
  description?: string;
}
```

#### Day 3: Build Game Factory

**Create** `shared/core/createGame.ts` (see 02-solution.md for full code)

#### Day 4-5: Create Config Files

**Klondike**: `klondike-mvp/src/klondike.config.ts`
**FreeCell**: `freecell-mvp/src/freecell.config.ts`

See examples in 02-solution.md

### Week 4-5: Generic Components

#### Day 1-3: GenericGameBoard

**Create** `shared/components/GenericGameBoard.tsx`

**Key features**:
- Renders based on `GameConfig`
- Integrates with `useCardInteraction`
- Handles smart tap if enabled
- Conditional rendering of special areas

#### Day 4-5: GenericTableau

**Create** `shared/components/GenericTableau.tsx`:

```typescript
interface GenericTableauProps<TState> {
  columns: Card[][];
  numColumns: number;
  interactionState: InteractionState;
  handlers: InteractionHandlers;
  layoutSizes: LayoutSizes;
}

export function GenericTableau<TState>(props: GenericTableauProps<TState>) {
  return (
    <div className="tableau">
      {props.columns.map((column, index) => (
        <TableauColumn
          key={index}
          cards={column}
          columnIndex={index}
          {...props.handlers}
          {...props.layoutSizes}
        />
      ))}
    </div>
  );
}
```

#### Day 6-8: Migrate Games to Generic Components

- Update Klondike to use `GenericGameBoard`
- Update FreeCell to use `GenericGameBoard`
- Ensure all tests pass
- Visual regression testing

#### Day 9-10: Testing & Fixes

- Fix any issues from migration
- Performance testing
- Cross-browser testing

---

## Phase 3: Perfect UI (Weeks 6-10)

### Week 6: Animation System

#### Day 1-2: Shared Animation Hooks

**Create** `shared/hooks/useGameAnimations.ts`:

```typescript
export function useGameAnimations(config: GameConfig) {
  const flipCard = useCallback((cardId: string) => {
    // 3D flip animation
  }, []);

  const celebrateWin = useCallback(() => {
    // Confetti + card cascade
  }, []);

  const animateAutoMove = useCallback((from, to) => {
    // Smooth auto-move animation
  }, []);

  return { flipCard, celebrateWin, animateAutoMove };
}
```

#### Day 3-4: Implement Drag Physics

**Enhance** `useCardInteraction.ts`:
- Add spring physics to drag
- Smooth return to origin on invalid drop
- Visual feedback during drag

#### Day 5-6: Win Celebration

- Confetti effect
- Card cascade animation
- Sound effects (optional)
- Configurable per-game

### Week 7: Mobile & Touch

#### Day 1-2: Smart Tap Implementation

**Update** `useCardInteraction.ts`:

```typescript
const handleTap = useCallback((location: GameLocation) => {
  if (!config.features?.smartTap) {
    // Fall back to regular tap
    return handleRegularTap(location);
  }

  const validMoves = config.actions.getValidMoves?.(state, location) || [];

  if (validMoves.length === 1) {
    // Auto-execute move
    config.executeMove(location, validMoves[0]);
    playMoveAnimation(location, validMoves[0]);
  } else if (validMoves.length > 1) {
    // Highlight options
    setSelectedCard(location);
    setHighlightedCells(validMoves);
  } else {
    // Invalid selection feedback
    playShakeAnimation(location);
  }
}, [state, config]);
```

#### Day 3: Touch Optimization

- Increase hit targets to 44x44px minimum
- Add touch-specific CSS
- Test on real devices

#### Day 4-5: Additional Gestures

- Double-tap for auto-foundation
- Long-press for hints
- Swipe for undo/redo (optional)

#### Day 6: Performance

- Optimize re-renders
- Virtual scrolling for large tableaus
- 60fps validation on mid-range devices

### Week 8: Accessibility

#### Day 1-2: Keyboard Navigation

- Arrow keys to navigate cards
- Enter to select/move
- Esc to cancel
- Tab through interactive elements

#### Day 3: Screen Reader Support

- ARIA labels on all interactive elements
- Announce moves
- Announce game state changes
- Announce win condition

#### Day 4: Visual Accessibility

- High contrast mode
- Colorblind-friendly suits
- Reduced motion mode
- Focus indicators

### Week 9-10: Unified Menu & Settings

#### Day 1-3: Settings Modal

**Create** `shared/components/SettingsModal.tsx`:

```typescript
export function SettingsModal({ config, onClose }) {
  const { globalSettings, updateGlobalSettings } = useAppContext();
  const { gameSettings, updateGameSettings } = useGameSettings(config.metadata.id);

  return (
    <Modal onClose={onClose}>
      <SettingsSection title="Appearance">
        <ThemeSelector value={globalSettings.theme} onChange={...} />
        <CardStyleSelector value={globalSettings.cardStyle} onChange={...} />
      </SettingsSection>

      <SettingsSection title="Sound & Animation">
        <Toggle label="Sound Effects" value={globalSettings.soundEnabled} />
        <Select label="Animation Level" options={['full', 'reduced', 'none']} />
      </SettingsSection>

      {config.settings && (
        <SettingsSection title={`${config.metadata.name} Settings`}>
          {config.settings.map(setting => (
            <SettingControl
              key={setting.id}
              {...setting}
              value={gameSettings[setting.id]}
              onChange={(value) => updateGameSettings(setting.id, value)}
            />
          ))}
        </SettingsSection>
      )}

      <SettingsSection title="More Games">
        <GameSelector />
      </SettingsSection>
    </Modal>
  );
}
```

#### Day 4-5: Global App Context

**Create** `shared/contexts/AppContext.tsx`:

```typescript
interface AppContextValue {
  currentGame: string;
  globalSettings: GlobalSettings;
  gameSettings: Record<string, Record<string, any>>;
  switchGame: (gameId: string) => void;
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  updateGameSettings: (gameId: string, settingId: string, value: any) => void;
}
```

#### Day 6-8: Theme System

**Create** `shared/themes/`:
- Classic theme
- Dark theme
- High contrast theme
- Minimal theme

**Integrate** with all components

#### Day 9-10: Game Selector

- Grid/list view of games
- Thumbnails
- Difficulty badges
- Navigation

---

## Week 11: Validation & Spider

### Day 1-2: Full System Testing

- Test all games with new system
- Cross-browser testing
- Mobile device testing
- Accessibility audit (Lighthouse)
- Performance benchmarks

### Day 3-5: Build Spider

**Demonstrate** the new system by building Spider in <1 day:

**Create** `spider/spider.config.ts`
**Implement** `SpiderGameActions`
**Run** `createGame(SpiderConfig)`
**Test** and validate

---

## Deliverables Checklist

### Phase 1
- [ ] Animation prototypes
- [ ] Mobile interaction patterns tested
- [ ] UI requirements document

### Phase 2
- [ ] `GameActions<TState>` interface
- [ ] `GameConfig<TState>` interface
- [ ] `createGame()` factory
- [ ] Klondike migrated
- [ ] FreeCell migrated
- [ ] Generic components built
- [ ] All tests passing

### Phase 3
- [ ] Animation system
- [ ] Smart tap-to-move
- [ ] Mobile optimization
- [ ] Accessibility features
- [ ] Unified settings modal
- [ ] Theme system
- [ ] Game selector

### Validation
- [ ] Spider built in <1 day
- [ ] All metrics achieved (see 05-testing.md)

---

Next: [05-testing.md](05-testing.md) - Success criteria and validation
