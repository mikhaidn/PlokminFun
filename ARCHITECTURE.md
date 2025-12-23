# CardGames Architecture & Implementation Plan

## Package Separation - What Goes Where

### 📦 `packages/playing-cards` (Core Library)
**Purpose**: Game-agnostic card primitives and utilities. Zero dependencies on React, UI, or specific game rules.

**What belongs here:**
```typescript
// From current claudeprototype.jsx - EXTRACT THESE:

// ✅ Card/Deck fundamentals
- SUITS, VALUES constants
- Card type/interface
- createDeck()
- SUIT_COLORS (color mapping)

// ✅ Random number generation
- seededRandom() function
- shuffleWithSeed() function

// ✅ Card property utilities (game-agnostic)
- isRed(suit)
- isBlack(suit)
- rankValue(rank) - convert 'A', '2', 'K' to numbers

// ✅ Generic card comparison utilities
- sameColor(card1, card2)
- sameSuit(card1, card2)
- consecutiveRank(card1, card2)
- rankDifference(card1, card2)
```

**What does NOT belong here:**
- ❌ `canStackOnTableau()` - FreeCell-specific rule
- ❌ `canStackOnFoundation()` - FreeCell-specific rule
- ❌ `getMaxMovable()` - FreeCell-specific calculation
- ❌ Any React components
- ❌ Game state management
- ❌ UI/styling

**Public API:**
```typescript
// packages/playing-cards/src/index.ts
export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;  // 1-13
  id: string;     // "A♠"
  color: 'red' | 'black';
}

export const SUITS: readonly Suit[];
export const RANKS: readonly Rank[];
export const SUIT_COLORS: Record<Suit, string>;

// Deck operations
export function createDeck(): Card[];
export function shuffle<T>(array: T[], seed?: number): T[];
export function seededRandom(seed: number): () => number;

// Card utilities
export function isRed(card: Card): boolean;
export function isBlack(card: Card): boolean;
export function sameColor(card1: Card, card2: Card): boolean;
export function sameSuit(card1: Card, card2: Card): boolean;
export function oppositeColor(card1: Card, card2: Card): boolean;
export function rankValue(rank: Rank): number;
export function consecutiveRank(card1: Card, card2: Card, ascending?: boolean): boolean;
```

---

### 📦 `packages/react-playing-cards` (React UI Library)
**Purpose**: Reusable React components and hooks for rendering cards. Game-agnostic but UI-focused.

**What belongs here:**
```typescript
// From current claudeprototype.jsx - EXTRACT THESE:

// ✅ Visual components (make them configurable)
- Card component (with props for styling variants)
- EmptyCell component
- CardStack component (generic stacking with offset)

// ✅ Interaction hooks
- useDragDrop() - generic drag/drop for cards
- useCardSelection() - selection state management
- useCardAnimation() - animation helpers

// ✅ Styling utilities
- Default card styles (overridable)
- Size variants (compact, normal, large)
- Theme support (colors, fonts)
```

**Key design principle**: Components should accept game logic as props, not implement it.

**Example API:**
```typescript
// Card component accepts ANY validation function
<Card
  card={card}
  onClick={onClick}
  canDrag={(card) => myGameRules.canMove(card)}
  style={customStyles}
  size="compact"
/>

// Hook for drag/drop (game provides validation)
const { dragProps, dropProps } = useDragDrop({
  canDrop: (source, target) => freeCellRules.canStack(source, target),
  onDrop: (source, target) => handleMove(source, target)
});
```

---

### 📦 `packages/card-packs` (Card Appearance System)
**Purpose**: Visual theming and customization for playing cards. Enables card backs, custom designs, and future marketplace.

**What belongs here:**
```typescript
// Card pack interface (from RFC-003)

// ✅ CardPack manifest and types
- CardPackManifest interface (versioning, compatibility metadata)
- CardPack interface (rendering functions, animations)
- AnimationDefinition types

// ✅ Default card pack
- DEFAULT_CARD_PACK (current card implementation)
- CSS patterns for card backs (blue, red, etc.)
- Front face rendering (current Card.tsx logic)

// ✅ CardPack registry (future)
- CardPackRegistry interface
- Pack validation and compatibility checks
- Pack installation/loading from CDN or NPM

// ✅ React hooks
- useCardPack(packId) - Get active card pack
- useCardPackRegistry() - Marketplace integration
```

**Design Principles:**
- **Lightweight & Works Everywhere**: CSS-first, targets iPad 2 (2011+)
- **Progressive Enhancement**: Card backs work without JavaScript
- **CardPack-First**: Current cards ARE the default CardPack (marketplace-ready from day 1)
- **Performance Budget**: <10KB per card back pack, <50KB for full pack

**Public API:**
```typescript
// packages/card-packs/src/index.ts
export interface CardPackManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  license?: string;
  requirements: {
    maxBundleSize: string;
    minSafariVersion?: string;
    requiresJS: boolean;
    gpuAccelerated?: boolean;
  };
  assets: {
    cardBacks: {
      type: 'css-pattern' | 'svg' | 'png' | 'custom';
      estimatedSize: string;
    };
    cardFronts?: {
      type: 'default' | 'svg-inline' | 'image-atlas';
      estimatedSize: string;
    };
  };
}

export interface CardPack {
  manifest: CardPackManifest;
  renderFront: (card: Card, size: CardSize) => React.ReactNode;
  renderBack: (size: CardSize, theme?: string) => React.ReactNode;
  animations?: {
    flip?: AnimationDefinition;
    deal?: AnimationDefinition;
    collect?: AnimationDefinition;
  };
}

// Hook for using card packs
export function useCardPack(packId?: string): CardPack;

// Default card pack (includes current Card and CardBack components)
export const DEFAULT_CARD_PACK: CardPack;
```

**Future: Card Marketplace (Phase 6+)**
```typescript
// Marketplace registry interface
export interface CardPackRegistry {
  listPacks(): CardPackManifest[];
  searchPacks(query: string, tags?: string[]): CardPackManifest[];
  installPack(packId: string): Promise<void>;
  uninstallPack(packId: string): Promise<void>;
  validatePack(manifest: CardPackManifest): ValidationResult;
  getInstalledPacks(): CardPackManifest[];
  setActivePack(packId: string): void;
  getActivePack(): CardPack;
}

// Distribution options
// - NPM packages: @cardgames/bicycle-deck
// - CDN-hosted: https://cardpacks.cdn.com/bicycle/v1.0.0/
// - Built-in registry: Curated official + community packs
```

**References:**
- See **RFC-003** for full specification
- See **CLAUDE.md** for implementation guide

---

### 📦 `apps/freecell` (FreeCell Game)
**Purpose**: FreeCell-specific implementation using the libraries.

**What belongs here:**
```typescript
// From current claudeprototype.jsx - KEEP THESE:

// ✅ FreeCell game rules
- canStackOnTableau() - alternating colors, descending rank
- canStackOnFoundation() - same suit, ascending rank
- getMaxMovable() - FreeCell supermove calculation
- getMovableStack() - valid sequence detection

// ✅ FreeCell game state
- GameState type (tableau, freeCells, foundations)
- Game state management hooks
- Move history and undo logic

// ✅ FreeCell-specific components
- TableauColumn (knows about FreeCell stacking)
- MenuModal
- HistoryModal
- Win screen

// ✅ FreeCell features
- Hints system (getLowestPlayableCards)
- Auto-complete logic
- Game statistics
- Seed-based replay

// ✅ Storage & persistence
- window.storage integration
- Game history tracking
```

**File structure:**
```
apps/freecell/
├── src/
│   ├── rules/
│   │   ├── validation.ts       # canStackOnTableau, canStackOnFoundation
│   │   ├── moves.ts            # getMaxMovable, getMovableStack
│   │   └── autoComplete.ts    # Auto-move logic
│   ├── state/
│   │   ├── gameState.ts        # State types & initial state
│   │   ├── useGameState.ts     # Game state management hook
│   │   └── useMoveHistory.ts   # Undo/redo logic
│   ├── components/
│   │   ├── TableauColumn.tsx   # FreeCell tableau
│   │   ├── FreeCellArea.tsx    # Free cells section
│   │   ├── FoundationArea.tsx  # Foundation piles
│   │   ├── MenuModal.tsx
│   │   ├── HistoryModal.tsx
│   │   └── WinScreen.tsx
│   ├── features/
│   │   ├── hints.ts            # Hint calculation
│   │   ├── analytics.ts        # Game stats
│   │   └── storage.ts          # Persistence layer
│   ├── config/
│   │   └── features.ts         # Feature flags
│   ├── App.tsx
│   └── main.tsx
```

---

## Feature Flag Architecture

### Design Principles
1. **App-level by default** - Each game controls its own features
2. **Library configuration** - Libraries can be configured by apps (not flagged)
3. **Runtime + Build-time** - Support both for flexibility

### Implementation

#### **App-Level Flags** (apps/freecell/src/config/features.ts)
```typescript
export interface FeatureConfig {
  enabled: boolean;
  rollout?: number;  // 0-100 percentage
  config?: Record<string, any>;
}

export const features = {
  // Gameplay features
  hints: {
    enabled: true,
    rollout: 100,
    config: { highlightColor: '#4caf50' }
  },
  autoComplete: {
    enabled: true,
    rollout: 100,
    config: { safetyMargin: 2 } // auto-move if rank <= min + 2
  },

  // UI features
  animations: { enabled: true, rollout: 100 },
  compactMode: { enabled: true, rollout: 100 },
  darkMode: { enabled: false, rollout: 0 },

  // Data features
  analytics: { enabled: false, rollout: 0 },
  cloudSync: { enabled: false, rollout: 0 },
  leaderboard: { enabled: false, rollout: 0 },

  // Social features
  shareGame: { enabled: false, rollout: 0 },
  multiplayer: { enabled: false, rollout: 0 },
} as const;

export type FeatureKey = keyof typeof features;

// Simple hook
export function useFeature(key: FeatureKey) {
  const feature = features[key];
  // Could add rollout logic here later
  return feature.enabled;
}

// Get feature config
export function getFeatureConfig<K extends FeatureKey>(
  key: K
): typeof features[K]['config'] {
  return features[key].config;
}
```

#### **Library Configuration** (NOT feature flags)
Libraries should be configurable through props/options, not feature flags:

```typescript
// ❌ BAD - Library shouldn't have feature flags
export function Card({ card, enableAnimations }: CardProps) {
  const animated = useFeature('animations'); // DON'T DO THIS
}

// ✅ GOOD - Library accepts configuration
export function Card({
  card,
  animated = true,  // App controls this
  animationDuration = 250
}: CardProps) {
  // Use the props
}

// App decides what to pass
function MyGame() {
  const showAnimations = useFeature('animations');
  return <Card card={card} animated={showAnimations} />;
}
```

#### **Advanced: Runtime Feature Flags** (Future)
For A/B testing and remote config:

```typescript
// apps/freecell/src/config/featureProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

interface FeatureFlags {
  [key: string]: boolean;
}

const FeatureFlagContext = createContext<FeatureFlags>({});

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState(features);

  useEffect(() => {
    // Fetch from CDN/API in production
    fetch('https://cdn.example.com/features.json')
      .then(r => r.json())
      .then(remoteFlags => setFlags({ ...flags, ...remoteFlags }));
  }, []);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeature(key: FeatureKey) {
  const flags = useContext(FeatureFlagContext);
  return flags[key]?.enabled ?? false;
}
```

---

## Task Breakdown for Implementation

### Phase 1: Setup Monorepo Structure
**Agent Task 1.1**: Initialize monorepo
- [ ] Create `pnpm-workspace.yaml`
- [ ] Set up `packages/` and `apps/` directories
- [ ] Configure root `package.json` with workspace scripts
- [ ] Add Turborepo config (optional but recommended)

**Agent Task 1.2**: Create `packages/playing-cards`
- [ ] Initialize TypeScript package
- [ ] Set up build tooling (tsup or vite lib mode)
- [ ] Create `src/` structure (card.ts, deck.ts, random.ts, utils.ts)
- [ ] Configure exports in package.json

**Agent Task 1.3**: Create `packages/react-playing-cards`
- [ ] Initialize React + TypeScript package
- [ ] Add dependency on `playing-cards`
- [ ] Set up build tooling for React library
- [ ] Create `src/components/` and `src/hooks/`

**Agent Task 1.4**: Create `apps/freecell`
- [ ] Initialize Vite + React + TypeScript app
- [ ] Add dependencies on both packages
- [ ] Configure Vite for PWA
- [ ] Set up folder structure (rules/, state/, components/, features/)

---

### Phase 2: Extract Core Library
**Agent Task 2.1**: Build `playing-cards` core
Extract from `claudeprototype.jsx`:
- [ ] Card types and constants (lines 6-8)
- [ ] `seededRandom()` (lines 10-17)
- [ ] `createDeck()` (lines 19-27)
- [ ] `shuffleWithSeed()` (lines 29-37)
- [ ] `isRed()`, `isBlack()` (lines 39-40)
- [ ] Add: `sameColor()`, `sameSuit()`, `oppositeColor()`, `consecutiveRank()`
- [ ] Write unit tests for all utilities

**Agent Task 2.2**: Build `react-playing-cards` components
Extract and generalize from `claudeprototype.jsx`:
- [ ] `Card` component (lines 54-86) - make size/style configurable
- [ ] `EmptyCell` component (lines 88-97) - make styling flexible
- [ ] Create `CardStack` component for cascading cards
- [ ] Create `useDragDrop` hook (extract drag logic from lines 251-296)
- [ ] Create `useCardSelection` hook (extract selection logic)
- [ ] Add Storybook for component documentation

---

### Phase 3: Build FreeCell App
**Agent Task 3.1**: Implement FreeCell rules
Extract from `claudeprototype.jsx`:
- [ ] Create `rules/validation.ts`: `canStackOnTableau()` (lines 42-46), `canStackOnFoundation()` (lines 48-52)
- [ ] Create `rules/moves.ts`: `getMaxMovable()` (lines 242), `getMovableStack()` (lines 244-249)
- [ ] Create `rules/autoComplete.ts`: Auto-move logic (lines 346-374)
- [ ] Write tests for all rule functions

**Agent Task 3.2**: Implement game state management
Extract from `claudeprototype.jsx`:
- [ ] Create `state/gameState.ts`: GameState type, initial state
- [ ] Create `state/useGameState.ts`: Game state hook (lines 183-214)
- [ ] Create `state/useMoveHistory.ts`: Undo/redo (lines 190, 233-240)
- [ ] Create `features/storage.ts`: Persistence (lines 198-199)

**Agent Task 3.3**: Build FreeCell components
Refactor from `claudeprototype.jsx`:
- [ ] `TableauColumn.tsx` (lines 99-116) - use library components
- [ ] `FreeCellArea.tsx` - free cells section
- [ ] `FoundationArea.tsx` - foundation piles
- [ ] `MenuModal.tsx` (lines 118-148)
- [ ] `HistoryModal.tsx` (lines 150-180)
- [ ] `WinScreen.tsx` (lines 451-463)
- [ ] `App.tsx` - main game orchestration

**Agent Task 3.4**: Implement features
- [ ] `features/hints.ts`: `getLowestPlayableCards()` (lines 216-223)
- [ ] `features/analytics.ts`: Game statistics (lines 225-229)
- [ ] `config/features.ts`: Feature flag config

---

### Phase 4: Feature Flags & Configuration
**Agent Task 4.1**: Implement feature flag system
- [ ] Create feature flag types and config file
- [ ] Implement `useFeature()` hook
- [ ] Add feature flag guards to FreeCell features (hints, auto-complete)
- [ ] Document feature flag usage

**Agent Task 4.2**: Add build-time optimization
- [ ] Configure Vite to tree-shake disabled features
- [ ] Add environment-based flag overrides
- [ ] Test production builds with different flag combinations

---

### Phase 5: PWA & Deployment
**Agent Task 5.1**: Configure PWA
- [ ] Add vite-plugin-pwa
- [ ] Create `manifest.json` with app metadata
- [ ] Generate app icons (512x512, 192x192, etc.)
- [ ] Implement service worker for offline support
- [ ] Add install prompt

**Agent Task 5.2**: Deployment setup
- [ ] Configure Vercel/Netlify deployment
- [ ] Set up custom domain (if applicable)
- [ ] Configure CDN and caching headers
- [ ] Set up error monitoring (Sentry)
- [ ] Add basic analytics (Plausible/Simple Analytics)

---

### Phase 6: Testing & Documentation
**Agent Task 6.1**: Testing
- [ ] Unit tests for `playing-cards` (100% coverage goal)
- [ ] Unit tests for FreeCell rules
- [ ] Integration tests for game flows
- [ ] E2E tests with Playwright (win game, undo, seed replay)

**Agent Task 6.2**: Documentation
- [ ] Library API documentation
- [ ] FreeCell game README
- [ ] Contributing guide
- [ ] Architecture decision records (ADRs)

---

## Decision Log

### ✅ Decided
1. **Monorepo structure** with pnpm workspaces
2. **Three-layer architecture**: core library → React library → game apps
3. **Feature flags live at app level**, libraries accept configuration
4. **TypeScript + Vite** for all packages
5. **PWA deployment** for cross-platform support
6. **Static hosting** (Vercel/Netlify) - no backend initially

### 🤔 To Discuss
1. Library naming: `@cardgames/playing-cards` or `playing-cards`?
2. Should hints be an optional plugin or core feature?
3. When to add cloud sync? (Phase 7 or wait for user demand?)
4. Multi-game routing: Single app with game switcher or separate deployments?

---

## Next Steps

**Immediate actions:**
1. Review this architecture document
2. Assign Phase 1 tasks to set up monorepo
3. Create GitHub repo and initialize structure
4. Begin extraction of `playing-cards` library

**Timeline estimate:**
- Phase 1-2: 1 week (setup + library)
- Phase 3: 1 week (FreeCell app)
- Phase 4: 2-3 days (feature flags)
- Phase 5: 2-3 days (PWA + deploy)
- Phase 6: Ongoing (testing + docs)

**Total: ~3 weeks to production-ready FreeCell with library foundation**
