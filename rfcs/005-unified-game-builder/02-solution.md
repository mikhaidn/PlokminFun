# 02: Solution

## Three-Phase Approach

```
Phase 1: UI Prototype (2-3 days)
         ↓
Phase 2: Unification (3-4 weeks)
         ↓
Phase 3: Perfect UI (4-5 weeks)
```

**Total**: 9-10 weeks to achieve config-driven games + polished UI

## Phase 1: UI Exploration & Requirements (2-3 days)

### Goal
Understand what "perfect UI" requires from the architecture **before** building the abstraction.

### Activities

**Pick one game** (Klondike) as prototype sandbox:

1. **Animation experiments**:
   - Smooth drag with spring physics
   - Card flip animations (3D transforms)
   - Win celebration effects
   - Auto-move animations
   - Undo/redo transitions

2. **Mobile interactions**:
   - Smart tap-to-move (single tap if only one valid move)
   - Touch-friendly hit targets
   - Double-tap for auto-foundation
   - Long-press for hints
   - Swipe gestures for undo/redo

3. **Visual polish**:
   - Shadows and depth
   - Hover effects
   - Theme variations (dark mode, high contrast)
   - Card style variations

### Deliverables

- **Document**: `/docs/architecture/ui-requirements.md`
  - What perfect UI needs from the abstraction
  - Animation state requirements
  - Component lifecycle hooks needed
  - Props required for customization

- **Prototype branch**: `prototype/ui-exploration`
  - Working examples of target UX
  - Performance benchmarks
  - Mobile device testing results

### Why This First?

**Prevents architectural mistakes**:
- Don't build an abstraction that makes perfect UI impossible
- Cheap to experiment before committing to interfaces
- Provides concrete requirements for Phase 2

**Example insight from prototyping**:
```typescript
// Might discover: "Animations need a callback when move completes"
interface GameActions<TState> {
  executeMove: (...) => TState;
  onMoveAnimationComplete?: () => void;  // ← Added based on prototype
}
```

## Phase 2: Unification (3-4 weeks)

### Goal
Build a config-driven game builder system that supports perfect UI.

### Week 1-2: Standardize Move Execution

**Create shared action interface**:

```typescript
// shared/types/GameActions.ts (NEW)
export interface GameActions<TState> {
  // Core game logic
  validateMove: (state: TState, from: GameLocation, to: GameLocation) => boolean;
  executeMove: (state: TState, from: GameLocation, to: GameLocation) => TState | null;
  getCardAt: (state: TState, location: GameLocation) => Card | Card[] | null;

  // Game lifecycle
  initializeGame: (seed: number) => TState;
  isGameWon: (state: TState) => boolean;

  // Auto-actions (optional)
  getAutoMoves?: (state: TState) => Array<{from: GameLocation, to: GameLocation}>;

  // Smart tap-to-move: get all valid destinations for a card
  getValidMoves?: (state: TState, from: GameLocation) => GameLocation[];
}
```

**Extract shared patterns**:

```typescript
// shared/state/moveExecution.ts (NEW)
export function createMoveExecutor<TState>(actions: GameActions<TState>) {
  return {
    executeMove: (state: TState, from: GameLocation, to: GameLocation) => {
      if (!actions.validateMove(state, from, to)) return null;
      return actions.executeMove(state, from, to);
    },

    executeSmartTap: (state: TState, from: GameLocation) => {
      const validMoves = actions.getValidMoves?.(state, from) || [];
      if (validMoves.length === 1) {
        // Only one valid move - auto-execute it
        return actions.executeMove(state, from, validMoves[0]);
      }
      // Multiple or zero moves - return valid destinations for UI to show
      return { validMoves, state };
    }
  };
}
```

**Migration**:
- Refactor Klondike to implement `GameActions<KlondikeGameState>`
- Refactor FreeCell to implement `GameActions<FreeCellGameState>`
- Extract common validation patterns to `shared/rules/`

**Effort**: 6-8 days

### Week 2-3: Create Game Config System

**Define configuration interface**:

```typescript
// shared/types/GameConfig.ts (NEW)
export interface GameConfig<TState> {
  metadata: {
    name: string;           // "Klondike Solitaire"
    id: string;             // "klondike"
    description: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    thumbnail?: string;     // For game selector
  };

  layout: {
    numTableauColumns: number;        // 7 (Klondike), 8 (FreeCell), 10 (Spider)
    numFoundations: number;           // Usually 4 or 8
    specialAreas: Array<'stock' | 'waste' | 'freeCells'>;
  };

  rules: {
    tableauStackRule: 'alternatingColors' | 'sameSuit' | 'any';
    emptyTableauRule: 'kingOnly' | 'anyCard' | 'none';
    foundationRule: 'sameSuit' | 'completeSuit';
  };

  actions: GameActions<TState>;
  component: React.ComponentType<GameLayoutProps<TState>>;

  // UI customization (from Phase 1 findings)
  animations?: {
    flipDuration?: number;
    dragSpring?: SpringConfig;
    winCelebration?: boolean;
    autoMoveDelay?: number;
  };

  // Feature flags
  features?: {
    hints?: boolean;
    autoComplete?: boolean;
    statistics?: boolean;
    smartTap?: boolean;      // Enable tap-to-move
  };

  // Game-specific settings (for unified settings menu)
  settings?: Array<{
    id: string;              // 'draw-count', 'difficulty', etc.
    label: string;           // 'Draw Count'
    type: 'select' | 'toggle' | 'slider';
    options?: Array<{ value: any; label: string }>;
    default: any;
    description?: string;
  }>;
}
```

**Example game configs**:

```typescript
// klondike-mvp/src/klondike.config.ts
export const KlondikeConfig: GameConfig<KlondikeGameState> = {
  metadata: {
    name: 'Klondike Solitaire',
    id: 'klondike',
    description: 'Classic solitaire game',
    difficulty: 'medium'
  },
  layout: {
    numTableauColumns: 7,
    numFoundations: 4,
    specialAreas: ['stock', 'waste']
  },
  rules: {
    tableauStackRule: 'alternatingColors',
    emptyTableauRule: 'kingOnly',
    foundationRule: 'sameSuit'
  },
  actions: new KlondikeGameActions(),
  component: KlondikeLayout,
  features: {
    hints: false,
    autoComplete: true,
    smartTap: true
  },
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
```

```typescript
// freecell-mvp/src/freecell.config.ts
export const FreeCellConfig: GameConfig<FreeCellGameState> = {
  metadata: {
    name: 'FreeCell Solitaire',
    id: 'freecell',
    description: 'Strategic solitaire with free cells',
    difficulty: 'hard'
  },
  layout: {
    numTableauColumns: 8,
    numFoundations: 4,
    specialAreas: ['freeCells']
  },
  rules: {
    tableauStackRule: 'alternatingColors',
    emptyTableauRule: 'anyCard',
    foundationRule: 'sameSuit'
  },
  actions: new FreeCellGameActions(),
  component: FreeCellLayout,
  features: {
    hints: true,
    autoComplete: true,
    smartTap: true
  }
  // No game-specific settings - omitted
};
```

**Build game factory**:

```typescript
// shared/core/createGame.ts (NEW)
export function createGame<TState>(config: GameConfig<TState>) {
  return {
    GameComponent: () => {
      const [seed, setSeed] = useState(() => Date.now());
      const { currentState, pushState, undo, redo } = useGameHistory({
        initialState: config.actions.initializeGame(seed)
      });

      return (
        <GenericGameBoard
          config={config}
          gameState={currentState}
          onMove={(from, to) => {
            const newState = config.actions.executeMove(currentState, from, to);
            if (newState) pushState(newState);
          }}
          onUndo={undo}
          onRedo={redo}
          onNewGame={() => {
            const newSeed = Date.now();
            setSeed(newSeed);
            pushState(config.actions.initializeGame(newSeed));
          }}
        />
      );
    },
    metadata: config.metadata
  };
}
```

**Effort**: 2-3 days

### Week 3-4: Generic Components

**Build flexible game board**:

```typescript
// shared/components/GenericGameBoard.tsx (NEW)
export function GenericGameBoard<TState>({
  config,
  gameState,
  onMove,
  onUndo,
  onRedo,
  onNewGame
}: GenericGameBoardProps<TState>) {

  const { state: interactionState, handlers } = useCardInteraction({
    validateMove: (from, to) => config.actions.validateMove(gameState, from, to),
    executeMove: (from, to) => {
      const newState = config.actions.executeMove(gameState, from, to);
      if (newState) onMove(from, to);
    },
    getValidMoves: config.features?.smartTap
      ? (from) => config.actions.getValidMoves?.(gameState, from) || []
      : undefined
  });

  return (
    <div className="game-container">
      <GameTopRow
        config={config}
        state={gameState}
        onUndo={onUndo}
        onRedo={onRedo}
        onNewGame={onNewGame}
      />

      <GenericTableau
        columns={getTableauColumns(gameState, config)}
        numColumns={config.layout.numTableauColumns}
        interactionState={interactionState}
        handlers={handlers}
      />

      {/* Conditional special areas based on config */}
      {config.layout.specialAreas.includes('stock') && (
        <StockWasteArea state={gameState} handlers={handlers} />
      )}

      {config.layout.specialAreas.includes('freeCells') && (
        <FreeCellArea state={gameState} handlers={handlers} />
      )}
    </div>
  );
}
```

**Design for animation hooks** (from Phase 1 requirements):

```typescript
// shared/hooks/useGameAnimations.ts (NEW)
export function useGameAnimations(config: GameConfig) {
  const [animationState, setAnimationState] = useState({
    flippingCards: [],
    celebrationActive: false
  });

  return {
    playCardFlip: (cardId: string) => { ... },
    playCelebration: () => { ... },
    playAutoMove: (from, to) => { ... }
  };
}
```

**Effort**: 8-10 days

## Phase 3: Perfect UI (4-5 weeks)

### Goal
Polish the unified system once, all games benefit automatically.

### Week 1: Animation System (5-6 days)

**Implement**:
- Card drag with spring physics (Framer Motion or React Spring)
- Card flip animations (3D CSS transforms)
- Win celebration (confetti, card cascade)
- Undo/redo transitions
- Auto-move animations

**Configure per-game**:
```typescript
const KlondikeConfig = {
  animations: {
    flipDuration: 300,
    dragSpring: { tension: 300, friction: 25 },
    winCelebration: true,
    autoMoveDelay: 150
  }
};
```

### Week 2: Mobile & Touch Optimization (5-6 days)

**Smart tap-to-move** (requested feature):
```
User taps a card:
  ↓
getValidMoves(from) → [destinations]
  ↓
If 1 destination: Auto-execute move
If 2+ destinations: Highlight valid targets, wait for second tap
If 0 destinations: Visual feedback (shake/pulse)
```

**Implementation**:
```typescript
const handleCardTap = (location: GameLocation) => {
  const validMoves = config.actions.getValidMoves?.(gameState, location) || [];

  if (validMoves.length === 1) {
    // Smart tap: only one valid move, execute immediately
    executeMove(location, validMoves[0]);
  } else if (validMoves.length > 1) {
    // Show highlighted destinations
    setHighlightedLocations(validMoves);
    setSelectedCard(location);
  } else {
    // No valid moves - shake animation
    playInvalidMoveAnimation(location);
  }
};
```

**Additional mobile features**:
- Touch-friendly hit targets (minimum 44x44px)
- Double-tap for auto-foundation
- Long-press for hints
- Swipe gestures for undo/redo (optional)
- Orientation handling
- Performance optimization (60fps on mid-range devices)

### Week 3: Accessibility (3-4 days)

- ARIA labels and keyboard navigation
- Screen reader support (announce moves)
- High contrast mode
- Reduced motion mode
- Colorblind-friendly suits
- Focus management

### Week 4-5: Unified Menu & Settings System (4-5 days)

**Unified Settings Modal** (requested feature):

```typescript
// shared/components/SettingsModal.tsx (NEW)
<SettingsModal>
  {/* Global settings - always shown */}
  <SettingsSection title="Appearance">
    <ThemeSelector />
    <CardStyleSelector />
  </SettingsSection>

  <SettingsSection title="Sound & Animation">
    <Toggle setting="soundEnabled" />
    <Select setting="animationLevel" options={['full', 'reduced', 'none']} />
  </SettingsSection>

  {/* Game-specific - conditional */}
  {config.settings && (
    <SettingsSection title={`${config.metadata.name} Settings`}>
      {config.settings.map(setting => (
        <SettingControl key={setting.id} {...setting} />
      ))}
    </SettingsSection>
  )}

  {/* Game selector */}
  <SettingsSection title="More Games">
    <GameGrid games={allGames} currentGame={config.metadata.id} />
  </SettingsSection>
</SettingsModal>
```

**Global settings** (apply to all games):
- Theme (Classic, Dark, High Contrast, Minimal)
- Card style (Classic, Modern, Minimal)
- Sound effects on/off
- Animation level (Full, Reduced, None)
- Colorblind mode
- Left-handed mode

**Game-specific settings** (conditional):
- Only shown if `GameConfig.settings` is defined
- Klondike: Draw count (1 or 3)
- Spider: Difficulty (1-suit, 2-suit, 4-suit)
- FreeCell: None (omitted)

**Unified theme system**:
```typescript
// shared/themes/index.ts (NEW)
export const themes = {
  classic: {
    colors: {
      background: 'linear-gradient(135deg, #2d5016 0%, #1a3d0c 100%)',
      cardFace: '#ffffff',
      cardBack: '#1a4d2e',
      // ...
    }
  },
  dark: { /* ... */ },
  highContrast: { /* ... */ }
};
```

**Navigation flow**:
```
Settings button → SettingsModal
  ├─ Change theme → Applies to all games
  ├─ Change game settings → Persists to localStorage
  └─ Click game thumbnail → Navigate to that game
```

**Benefits**:
- Consistent UX across all games
- Settings work the same everywhere
- Easy game discovery via "More Games"
- One theme change applies instantly to all games

### Week 5: Visual Polish & Themes (3-4 days)

- Card shadows and depth
- Hover effects
- Empty slot indicators
- Move preview highlights
- 4 built-in themes

## Summary

**Phase 1**: Understand requirements (2-3 days)
**Phase 2**: Build unified system (3-4 weeks)
**Phase 3**: Perfect UI once (4-5 weeks)

**Result**: Config-driven games + polished UI + unified menu experience

---

Next: [03-alternatives.md](03-alternatives.md) - Other approaches considered
