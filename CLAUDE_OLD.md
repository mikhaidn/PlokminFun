# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a card games collection featuring **FreeCell** and **Klondike** as playable games, built with React, TypeScript, and Vite in a **monorepo architecture** (npm workspaces). The codebase features a shared component library (@cardgames/shared) with reusable game controls, drag-and-drop interactions, undo/redo system, and card interaction hooks.

**Live Demo**: https://mikhaidn.github.io/CardGames/
- **FreeCell**: https://mikhaidn.github.io/CardGames/freecell/
- **Klondike**: https://mikhaidn.github.io/CardGames/klondike/

## 📚 Documentation Map

This repository has multiple documentation files for different purposes:

- **CLAUDE.md** (this file) - Implementation guide for AI assistants working with the codebase
- **ROADMAP.md** - Strategic priorities, what to build next and why
- **STATUS.md** - Current sprint status, what's being worked on now
- **ARCHITECTURE.md** - Long-term technical vision for library extraction
- **rfcs/** - Technical design documents for major features (Request for Comments)
- **freecell-mvp/README.md** - FreeCell-specific documentation
- **freecell-mvp/TESTING.md** - Manual testing guide

**Quick Start for AI Agents:**
1. Read **STATUS.md** to see what's currently in progress
2. Check **ROADMAP.md** for priorities and next tasks
3. Review **rfcs/** for technical design decisions on major features
4. Use **CLAUDE.md** (this file) for implementation details
5. Consult **ARCHITECTURE.md** for long-term decisions

## Repository Structure

```
CardGames/                    # Monorepo root (npm workspaces)
├── .github/
│   └── workflows/
│       ├── deploy.yml         # GitHub Pages deployment (builds both games)
│       └── pr-validation.yml  # CI checks (lint, test, build on PRs)
│
├── package.json              # Root workspace config
├── package-lock.json         # Unified lockfile for all packages
│
├── shared/                   # @cardgames/shared library
│   ├── components/           # Shared React components
│   │   ├── GameControls.tsx  # New Game, Undo, Redo, Settings, Help buttons
│   │   └── DraggingCardPreview.tsx # Visual feedback during drag
│   ├── hooks/                # Shared React hooks
│   │   ├── useGameHistory.ts # Undo/redo state management
│   │   └── useCardInteraction.ts # Unified drag-and-drop + click-to-select
│   ├── utils/                # Shared utilities
│   │   └── HistoryManager.ts # Generic history management
│   ├── types/                # Shared TypeScript types
│   ├── index.ts              # Barrel exports
│   └── package.json          # Library package config
│
├── freecell-mvp/             # FreeCell game implementation
│   ├── src/
│   │   ├── core/             # Game-agnostic card primitives (deck, types, RNG, cardPack)
│   │   ├── rules/            # FreeCell-specific game rules
│   │   ├── state/            # Game state management
│   │   ├── components/       # React UI components
│   │   ├── config/           # Configuration (feature flags, accessibility)
│   │   ├── utils/            # Utility functions (responsive layout, accessibility)
│   │   ├── App.tsx           # Main game component
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets (app icons, manifest)
│   ├── package.json          # Dependencies include "@cardgames/shared"
│   ├── vite.config.ts        # Vite config (base: /CardGames/freecell/)
│   └── vitest.config.ts      # Test runner config
│
├── klondike-mvp/             # Klondike game implementation
│   ├── src/
│   │   ├── core/             # Card primitives (deck, types, RNG, cardPack)
│   │   ├── rules/            # Klondike-specific game rules
│   │   ├── state/            # Game state management
│   │   ├── components/       # React UI components
│   │   ├── config/           # Configuration
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main game component
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json          # Dependencies include "@cardgames/shared"
│   ├── vite.config.ts        # Vite config (base: /CardGames/klondike/)
│   └── vitest.config.ts      # Test runner config
│
├── rfcs/                     # Technical design documents (Request for Comments)
│   ├── 001-undo-redo-system.md
│   ├── 002-game-sharing-replay.md
│   └── 003-card-backs-and-animations.md
│
├── index.html                # Root landing page (game selector)
├── CLAUDE.md                 # This file (AI assistant implementation guide)
├── ROADMAP.md                # Strategic priorities and next steps
├── STATUS.md                 # Current sprint status and metrics
└── ARCHITECTURE.md           # Long-term architectural plans
```

## Build & Test Commands

### Monorepo Commands (Root Level)

```bash
# Install all dependencies for all packages
npm install

# Build shared library first (required before building games)
npm run build:shared

# Build all games
npm run build:pages

# Build everything (shared + games)
npm run build

# Run tests across all packages
npm test

# Lint across all packages
npm run lint
```

### Individual Package Commands

```bash
# FreeCell development
cd freecell-mvp
npm run dev          # Start dev server at localhost:5173
npm run test         # Run FreeCell tests
npm run lint         # Lint FreeCell code
npm run build        # Build FreeCell

# Klondike development
cd klondike-mvp
npm run dev          # Start dev server at localhost:5173
npm run test         # Run Klondike tests (1415+ tests)
npm run lint         # Lint Klondike code
npm run build        # Build Klondike

# Shared library development
cd shared
npm run test         # Run shared library tests
npm run test:watch   # Watch mode for TDD
npm run test:coverage # Coverage report
```

## Version Management

### Current Approach (Manual)

Version numbers follow **Semantic Versioning** (MAJOR.MINOR.PATCH):
- **MAJOR** (1.0.0): Breaking changes, incompatible API changes
- **MINOR** (0.2.0): New features, backwards-compatible
- **PATCH** (0.2.1): Bug fixes, backwards-compatible

**Current version**: `0.2.0` (displayed in bottom-right corner of game)

### Updating Versions

**Using npm (Recommended)**:
```bash
cd freecell-mvp

# Bump patch version (0.2.0 → 0.2.1) - for bug fixes
npm version patch

# Bump minor version (0.2.0 → 0.3.0) - for new features
npm version minor

# Bump major version (0.2.0 → 1.0.0) - for breaking changes
npm version major
```

**What npm version does:**
1. Updates `package.json` and `package-lock.json`
2. Creates a git commit with message "Bump version to X.Y.Z"
3. Creates a git tag (e.g., `v0.2.0`)

**After running npm version:**
```bash
# Push changes and tags
git push && git push --tags
```

**Manual approach** (not recommended):
- Edit `freecell-mvp/package.json` version field directly
- Must manually commit and tag

### Version Display

The version is automatically displayed in the game footer:
```typescript
// freecell-mvp/src/components/GameBoard.tsx
import { version } from '../../package.json';

// Rendered in footer
<div>v{version}</div>
```

### Version History

- **v0.1.0** (Initial Release)
  - Core FreeCell gameplay
  - Click-to-select and drag-and-drop
  - Hints system
  - Seed-based games
  - GitHub Pages deployment

- **v0.2.0** (Responsive Layout)
  - Viewport-based dynamic sizing
  - Touch optimization
  - Mobile/tablet/desktop support
  - Responsive UI elements

### Future: Automated Versioning

**Option 1: GitHub Actions on Merge**

Add version bump automation when PRs are merged to `main`:

```yaml
# .github/workflows/version-bump.yml
name: Auto Version Bump
on:
  push:
    branches: [main]

jobs:
  bump-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Bump version
        run: |
          cd freecell-mvp
          npm version patch -m "chore: bump version to %s [skip ci]"
      - name: Push changes
        run: |
          git push
          git push --tags
```

**Option 2: Semantic Release**

Automatically determine version bumps from commit messages:

```bash
cd freecell-mvp
npm install -D semantic-release @semantic-release/git @semantic-release/changelog

# Configure with .releaserc.json
```

Commit message format:
- `feat: ...` → Minor version bump (0.2.0 → 0.3.0)
- `fix: ...` → Patch version bump (0.2.0 → 0.2.1)
- `BREAKING CHANGE: ...` → Major version bump (0.2.0 → 1.0.0)

**Option 3: Changesets**

Manual changeset files + automated versioning:

```bash
npm install -D @changesets/cli
npx changeset init

# When making changes:
npx changeset  # Interactive prompt for version bump type
npx changeset version  # Updates versions
```

**Recommendation**: Start with **manual versioning** using `npm version` until version 1.0.0. Then consider semantic-release for automated versioning based on commit messages.

### When to Bump Versions

**PATCH** (0.2.0 → 0.2.1):
- Bug fixes
- Performance improvements
- Documentation updates
- Refactoring (no behavior change)

**MINOR** (0.2.0 → 0.3.0):
- New features (like responsive layout, undo/redo)
- New game modes or options
- Backwards-compatible enhancements

**MAJOR** (0.2.0 → 1.0.0):
- Breaking changes to saved games
- Major architectural changes
- Removal of features
- API changes (if this becomes a library)

**Beta releases** (pre-1.0.0): Current project status
- Use 0.x.y versioning to indicate pre-release
- Bump to 1.0.0 when ready for stable public release

## Deployment

### Current Status
✅ **Deployed to GitHub Pages** via GitHub Actions
- **Repository**: `mikhaidn/CardGames`
- **Live URL**: https://mikhaidn.github.io/CardGames/
- **Auto-deploy**: Pushes to `main` trigger deployment

### CI/CD Workflows

#### 1. GitHub Pages Deployment (`.github/workflows/deploy.yml`)
- **Trigger**: Push to `main` or manual workflow dispatch
- **Steps**:
  1. Build FreeCell app (`cd freecell-mvp && npm ci && npm run build`)
  2. Create root landing page structure
  3. Deploy to GitHub Pages
- **Output**:
  - Root: `index.html` (game selector)
  - FreeCell: `/freecell/` subdirectory

#### 2. PR Validation (`.github/workflows/pr-validation.yml`)
- **Trigger**: Pull requests to `main`
- **Checks**: Lint → Test → Build
- **Must pass** before merging

### Base Path Configuration
The FreeCell app is configured to run at `/CardGames/freecell/`:

```typescript
// freecell-mvp/vite.config.ts
export default defineConfig({
  base: '/CardGames/freecell/',
  plugins: [react()],
})
```

⚠️ **Important**: When testing locally, use `npm run dev` (which ignores the base path). The base path only applies to production builds.

## FreeCell Application Structure

### Core Types (`src/core/types.ts`)
```typescript
type Suit = '♠' | '♥' | '♦' | '♣';
type Value = 'A' | '2' | ... | 'K';

interface Card {
  suit: Suit;
  value: Value;
  rank: number;  // 1-13 (A=1, K=13)
  id: string;    // e.g., "A♠", "K♥"
}
```

### Game State (`src/state/gameState.ts`)
```typescript
interface GameState {
  tableau: Card[][];        // 8 columns (main playing area)
  freeCells: (Card | null)[]; // 4 temporary holding cells
  foundations: Card[][];    // 4 suit piles (A→K)
  seed: number;             // For reproducible games
  moves: number;            // Move counter
}
```

### Seeded Random Number Generation
The game uses `seededRandom()` in `src/core/rng.ts` based on XorShift algorithm to ensure reproducible shuffles. Each game is identified by a numeric seed, allowing players to replay specific deals.

### Game Rules
- **Tableau stacking**: Alternating colors, descending rank (Red 7 on Black 8)
- **Foundation building**: Same suit, ascending rank (A→2→3...→K)
- **Free cells**: Single card storage only
- **Stack movement**: Limited by available free cells and empty columns

### Maximum Movable Stack Calculation
`getMaxMovable()` determines how many cards can be moved as a sequence:
```
maxMovable = (emptyFreeCells + 1) × 2^(emptyTableauColumns)
```

### Responsive Design System (`src/utils/responsiveLayout.ts`)

The game uses a **viewport-based dynamic sizing system** that automatically scales all UI elements to fit any screen size while maintaining readability and the proper card aspect ratio (5:7).

#### How It Works

**Key Function**: `calculateLayoutSizes(viewportWidth, viewportHeight)`

This function:
1. Calculates available space (subtracting padding and UI elements)
2. Determines optimal card width based on:
   - **Horizontal constraint**: Fitting 8 tableau columns + gaps
   - **Vertical constraint**: Fitting stacked cards in the viewport
3. Uses the smaller constraint to ensure everything fits
4. Scales all related dimensions proportionally (gaps, overlaps, fonts)

**Constraints:**
- Maximum card size: 60×84px (default/original size)
- Minimum card size: Dynamically calculated based on viewport
- Aspect ratio: Always maintains 5:7 (width:height)

**Output:**
```typescript
interface LayoutSizes {
  cardWidth: number;      // Calculated card width
  cardHeight: number;     // Calculated card height (maintains 5:7 ratio)
  cardGap: number;        // Gap between cards (scaled)
  cardOverlap: number;    // Vertical overlap in tableau (scaled)
  fontSize: {
    large: number;        // Suit symbol size
    medium: number;       // Card value size
    small: number;        // Corner text size
  };
}
```

#### Responsive Breakpoints

**Mobile** (< 600px):
- Compact header (stacked layout)
- Smaller buttons and text
- Reduced padding (12px vs 24px)

**Tablet** (600-900px):
- Medium sizing for UI elements
- Side-by-side header layout

**Desktop** (> 900px):
- Full-size layout
- Maximum card size (up to 60×84px)

#### Component Integration

All card-rendering components accept responsive sizing props:
- `Card.tsx` - Individual card rendering
- `EmptyCell.tsx` - Empty slot placeholders
- `Tableau.tsx` - Main playing area
- `FreeCellArea.tsx` - Top-left holding cells
- `FoundationArea.tsx` - Top-right foundation piles

**Example usage:**
```typescript
<Card
  card={myCard}
  cardWidth={layoutSizes.cardWidth}
  cardHeight={layoutSizes.cardHeight}
  fontSize={layoutSizes.fontSize}
  // ... other props
/>
```

#### Window Resize Handling

The game listens for window resize and orientation change events:
```typescript
useEffect(() => {
  const handleResize = () => {
    setLayoutSizes(calculateLayoutSizes(window.innerWidth, window.innerHeight));
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
}, []);
```

**Performance consideration**: Currently recalculates on every resize event. For production, consider debouncing (150ms delay) to reduce re-renders during active window resizing.

#### Testing Responsive Behavior

**Browser DevTools:**
```bash
npm run dev
# Then use browser DevTools to test different viewports:
# - iPhone SE (375×667)
# - iPad (768×1024 or 1024×768)
# - Desktop (1920×1080)
```

**Real Device Testing:**
```bash
npm run dev -- --host
# Access from mobile: http://<your-local-ip>:5173
```

### Accessibility Features (`src/config/accessibilitySettings.ts`)

The game includes comprehensive accessibility settings to improve visibility and one-handed usability. Settings are stored in localStorage and persist across sessions.

#### Available Settings

**1. High Contrast Mode** (boolean)
- Bolder card borders (4px vs 1-2px)
- Stronger colors: Pure black (#000) for black suits, bright red (#ff0000) for red suits
- Enhanced selection/highlight indicators
- Higher contrast shadows
- Better for users with vision impairments or in bright sunlight

**2. Card Size** (small | medium | large | extra-large)
- **Small**: Up to 60px width (default responsive behavior)
- **Medium**: Up to 75px width (25% larger)
- **Large**: Up to 90px width (50% larger)
- **Extra Large**: Up to 110px width (80% larger)
- Larger cards are easier to see and tap on mobile devices

**3. Font Size Multiplier** (1.0 - 2.0)
- Scales all text elements independently from card size
- Default: 1.0 (normal)
- Range: 1.0x to 2.0x (double size)
- Improves readability for users with vision impairments

**4. Button Position** (top | bottom)
- **Top**: Default position in header (traditional layout)
- **Bottom**: Fixed position at bottom of screen (one-handed mode)
- Bottom position is easier to reach with thumb on mobile devices
- Ideal for playing on smartphones or tablets

**5. Touch Target Size** (normal | large)
- **Normal**: Standard button sizing
- **Large**: Minimum 44px height (WCAG AAA guideline)
- Larger targets reduce tapping errors on touchscreens

#### Implementation Details

**Settings Storage:**
```typescript
// Load settings
const settings = loadAccessibilitySettings();

// Save settings
saveAccessibilitySettings(settings);

// Stored in localStorage under key: 'freecell-accessibility-settings'
```

**High Contrast Styling** (`src/utils/highContrastStyles.ts`):
```typescript
// Get colors for a card based on high contrast mode
const colors = getCardColors(card, highContrastMode, isSelected, isHighlighted);
// Returns: { text, background, border, borderWidth }

// Get box shadow based on selection state
const boxShadow = getCardBoxShadow(isSelected, isHighlighted, highContrastMode);
```

**Responsive Layout Integration:**
The `calculateLayoutSizes()` function accepts accessibility overrides:
```typescript
calculateLayoutSizes(
  window.innerWidth,
  window.innerHeight,
  getMaxCardWidth(settings.cardSize),      // Override max card size
  settings.fontSizeMultiplier               // Override font scaling
)
```

**Component Props:**
All card-rendering components accept `highContrastMode` prop:
- `Card.tsx`
- `FreeCellArea.tsx`
- `FoundationArea.tsx`
- `Tableau.tsx`

#### User Interface

**Settings Button:**
- Located in header/bottom bar (depending on buttonPosition setting)
- Gear icon (⚙️) with "Settings" label
- Opens modal dialog with all accessibility options

**Settings Modal** (`src/components/SettingsModal.tsx`):
- Checkbox for high contrast mode
- Dropdown for card size
- Slider for font size (visual feedback with multiplier value)
- Dropdown for button position
- Dropdown for touch target size
- Save and Cancel buttons
- Settings preview in real-time when modal is open

#### Testing Accessibility Features

**Manual Testing Checklist:**
1. Open settings and enable high contrast mode → Cards should have bolder colors and thicker borders
2. Increase card size to "Extra Large" → Cards should scale larger (up to 110px)
3. Increase font size to 2.0x → All text should be double size
4. Switch button position to "Bottom" → Controls should move to fixed bottom bar
5. Set touch target size to "Large" → Buttons should be taller (44px minimum)
6. Reload page → Settings should persist

**Device Testing:**
- Test on real mobile devices (iPhone, Android)
- Test with one hand to verify bottom button bar usability
- Test in bright sunlight to verify high contrast mode effectiveness
- Test with screen readers (ARIA labels should be present)

#### Key Files for Accessibility

**Configuration:**
- `src/config/accessibilitySettings.ts` - Settings types, defaults, storage functions
- `src/utils/highContrastStyles.ts` - High contrast color calculations
- `src/utils/responsiveLayout.ts` - Layout calculations with accessibility overrides

**Components:**
- `src/components/SettingsModal.tsx` - Settings UI
- `src/components/Card.tsx` - Card rendering with high contrast support
- `src/components/GameBoard.tsx` - Main integration point

**Usage in GameBoard:**
```typescript
// Load settings on mount
const [accessibilitySettings, setAccessibilitySettings] = useState(() =>
  loadAccessibilitySettings()
);

// Apply to layout calculation
const layoutSizes = calculateLayoutSizes(
  window.innerWidth,
  window.innerHeight,
  getMaxCardWidth(accessibilitySettings.cardSize),
  accessibilitySettings.fontSizeMultiplier
);

// Pass to card components
<Card highContrastMode={accessibilitySettings.highContrastMode} />
```

## Development Notes

### State Management Pattern
- State updates are immutable (return new objects, don't mutate)
- `gameActions.ts` contains all move operations
- Each action validates the move before applying

### Testing Approach
- Unit tests co-located with source files in `__tests__/` directories
- Vitest as test runner with jsdom environment
- Test setup in `src/test/setup.ts`
- See `TESTING.md` for manual testing scenarios
- High coverage (>95% on core logic)

### Adding New Features
When extending the game:
1. **Core card utilities** → `src/core/`
2. **FreeCell-specific rules** → `src/rules/`
3. **State mutations** → `src/state/gameActions.ts`
4. **UI components** → `src/components/`
5. **Feature flags** → `src/config/featureFlags.ts`

### Feature Flags
Feature flags are defined in `src/config/featureFlags.ts`. Check this file before implementing new toggleable features.

### Code Quality Standards
- **ESLint**: All code must pass `npm run lint`
- **TypeScript**: Strict mode enabled, no `any` types without justification
- **Tests**: Write tests for all new game logic (TDD approach preferred)
- **Immutability**: Never mutate state directly; always return new objects

## Beta Release Roadmap

### Phase 1: Core Functionality ✅ COMPLETE
- [x] Game logic with full FreeCell rules
- [x] Click-to-select card interaction
- [x] Drag-and-drop support
- [x] Auto-complete for safe moves
- [x] Hints system
- [x] Win detection
- [x] Seed-based reproducible games
- [x] Unit tests for core modules
- [x] GitHub Pages deployment
- [x] CI/CD workflows

### Phase 2: Beta-Ready Features ✅ MOSTLY COMPLETE

#### 2.1 Undo/Redo ✅ COMPLETE (#16)
- [x] useGameHistory hook with state snapshots
- [x] Undo/Redo buttons in GameControls component
- [x] Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- [x] History limit configuration (default 100 states)
- [x] Implemented in both FreeCell and Klondike via @cardgames/shared

#### 2.2 Game Persistence ❌ NOT DONE (Moved to P6 in ROADMAP.md)
- [ ] Save current game to localStorage on each move
- [ ] Restore game state on page reload
- [ ] "Continue" vs "New Game" dialog
- [ ] Handle localStorage quota exceeded

#### 2.3 Responsive Layout ✅ COMPLETE
- [x] Accessibility settings with card size presets (small, medium, large, extra-large)
- [x] Font size multiplier (1.0x - 2.0x)
- [x] Cards scale automatically via accessibility controls
- [x] Responsive header, buttons, and modals
- [x] One-handed mode (button position: top/bottom)

#### 2.4 Touch Optimization ✅ COMPLETE (via @cardgames/shared)
- [x] useCardInteraction hook with touch drag-and-drop support
- [x] Touch event handlers integrated into shared interaction system
- [x] Tap-to-select interaction (click-to-select fallback)
- [x] Touch target size controls in accessibility settings

#### 2.5 Basic Polish ✅ COMPLETE
- [x] GameControls component (shared across both games)
- [x] Keyboard shortcuts (Ctrl+Z undo, Ctrl+Y redo, N new game, H help)
- [x] SettingsModal for accessibility options
- [x] Bug reporter utility (src/utils/bugReport.ts)

### Phase 3: Architecture & Library Extraction ✅ COMPLETE

#### 3.1 Second Game (Klondike) ✅ COMPLETE (#19)
- [x] Full Klondike Solitaire implementation
- [x] Draw-1 and Draw-3 modes
- [x] Stock pile, waste pile, tableau (7 columns), foundations
- [x] 1415+ comprehensive tests (cardPack, deck, rng, rules, actions, state)
- [x] Live at https://mikhaidn.github.io/CardGames/klondike/

#### 3.2 Shared Library ✅ COMPLETE (#21)
- [x] @cardgames/shared extracted
- [x] GameControls component (New Game, Undo, Redo, Settings, Help)
- [x] DraggingCardPreview component
- [x] useGameHistory hook (undo/redo)
- [x] useCardInteraction hook (drag-and-drop + click-to-select)
- [x] HistoryManager utility
- [x] TypeScript types exported

#### 3.3 Monorepo Setup ✅ COMPLETE (#25)
- [x] npm workspaces configuration
- [x] Root package.json with workspace scripts
- [x] Unified package-lock.json
- [x] Updated CI/CD workflows for monorepo builds
- [x] Both games deployed from monorepo

### Phase 4: Current Priorities (See ROADMAP.md P5-P7)
- [ ] RFC-003 Phase 2: Klondike card backs integration
- [ ] Game persistence to localStorage
- [ ] Privacy-first analytics (Plausible or Simple Analytics)
- [ ] Daily challenge system (future)

## Mobile Deployment Options

### Current Status
Both games are **live on GitHub Pages** and fully optimized for mobile:
- ✅ **FreeCell**: https://mikhaidn.github.io/CardGames/freecell/
- ✅ **Klondike**: https://mikhaidn.github.io/CardGames/klondike/
- ✅ Accessible via web browser on any device
- ✅ **Responsive layout** - accessibility settings provide card sizing and one-handed mode
- ✅ **Touch optimized** - useCardInteraction hook handles drag-and-drop and tap interactions
- ✅ **PWA configured** - manifest and service worker via vite-plugin-pwa
- ✅ **Custom app icons** - 192x192 and 512x512 icons with FreeCell branding
- ✅ **Installable** - "Add to Home Screen" works on iOS Safari and Android Chrome

### Option A: PWA (Recommended for Prototyping)
Progressive Web App - works on both iOS Safari and Android Chrome.

**Step 1: Add PWA Plugin**
```bash
cd freecell-mvp
npm install -D vite-plugin-pwa
```

**Step 2: Configure vite.config.ts**
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/CardGames/freecell/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FreeCell',
        short_name: 'FreeCell',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#2c5f2d',
        theme_color: '#2c5f2d',
        icons: [
          { src: '/CardGames/freecell/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/CardGames/freecell/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
```

**Step 3: Add Icons**
Create `freecell-mvp/public/icon-192.png` and `freecell-mvp/public/icon-512.png`

**Step 4: Deploy**
Push to `main` branch - GitHub Actions will automatically deploy

**Step 5: Install on Device**
- **iOS**: Open in Safari → Share → "Add to Home Screen"
- **Android**: Open in Chrome → Menu → "Install app"

### Option B: Capacitor (Native App Wrapper)
For App Store/Play Store distribution or native features.

**Step 1: Install Capacitor**
```bash
cd freecell-mvp
npm install @capacitor/core @capacitor/cli
npx cap init FreeCell com.yourname.freecell
npm install @capacitor/ios @capacitor/android
```

**Step 2: Update vite.config.ts**
```typescript
export default defineConfig({
  base: './',  // Use relative paths for Capacitor
  plugins: [react()],
})
```

**Step 3: Build and Sync**
```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

**Step 4: Open in Native IDEs**
```bash
npx cap open ios      # Opens Xcode (macOS only)
npx cap open android  # Opens Android Studio
```

**Step 5: Run on Device**
- **iOS**: Requires Mac with Xcode, Apple Developer account ($99/year for App Store)
- **Android**: Android Studio, can test on device via USB

### Mobile Deployment Checklist

**Completed:**
- [x] **Responsive Layout** - Dynamic viewport-based sizing
- [x] **Touch Optimization** - Touch event handlers and tap-to-select
- [x] **Viewport Configuration** - Mobile meta tags configured
- [x] **PWA Setup** - Service worker and manifest configured

**Optional Enhancements:**
- [ ] Create custom app icons (192x192, 512x512)
- [ ] Add iOS-specific icons and splash screens
- [ ] Test on real devices (iPhone, iPad, Android)
- [ ] Add orientation lock preference

### Quick Mobile Testing
To test the current build on a mobile device on the same network:
```bash
cd freecell-mvp
npm run dev -- --host
```
Then open `http://<your-local-ip>:5173` on your mobile device.

## Deployment Path Comparison

| Aspect | GitHub Pages (Current) | PWA | Native (Capacitor) |
|--------|------------------------|-----|-------------------|
| **Current status** | ✅ Live | Not configured | Not configured |
| **Development effort** | None (done) | Low | Medium |
| **App Store presence** | No | No (Add to Home Screen) | Yes |
| **Offline support** | No | Yes (service worker) | Yes |
| **Updates** | Instant (push to main) | Instant (no review) | Requires store submission |
| **Device features** | Web APIs only | Limited | Full access |
| **Cost** | Free | Free hosting | $99/year iOS, $25 one-time Android |
| **Best for** | Web play, testing | Prototyping, web-first | Store distribution, native feel |

## Git Workflow

### Branch Strategy
- **`main`**: Production branch (auto-deploys to GitHub Pages)
- **Feature branches**: Use descriptive names (e.g., `feature/undo-system`, `fix/card-stacking-bug`)
- **PR branches**: Claude creates branches like `claude/feature-description-xxxxx`

### Making Changes
```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "Add feature X"

# Push and create PR
git push -u origin feature/my-feature
```

### CI/CD Checks
All PRs must pass:
1. ESLint checks
2. TypeScript compilation
3. Unit tests
4. Production build

### Deployment
Merging to `main` automatically triggers:
1. Build process
2. GitHub Pages deployment
3. Live site update within 1-2 minutes

## Landing Page

The root `index.html` serves as a game selector with:
- FreeCell (playable now)
- Future games (Spider, Klondike, Pyramid, Tri-Peaks, Yukon) marked "Coming Soon"

### Adding New Games
1. Create new directory (e.g., `spider-mvp/`)
2. Update `.github/workflows/deploy.yml` to build new game
3. Add game card to `index.html`
4. Update deployment script to copy built game to `_site/`

## Common Tasks

### Run the game locally
```bash
cd freecell-mvp
npm install  # First time only
npm run dev
```

### Run tests
```bash
cd freecell-mvp
npm run test          # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Check for errors before pushing
```bash
cd freecell-mvp
npm run lint    # Check linting
npm run build   # Check TypeScript and build
npm run test    # Run tests
```

### View production build locally
```bash
cd freecell-mvp
npm run build
npm run preview  # Serves dist/ folder
```

### Deploy to GitHub Pages
```bash
git push origin main  # Automatic via GitHub Actions
# Or manually trigger via GitHub Actions UI
```

## Recommended Path Forward

**For fastest iteration:**
1. Complete Phase 2 (Beta-Ready Features) - responsive design, undo/redo, persistence
2. Add PWA support for offline play and "Add to Home Screen"
3. Test with real users on mobile devices
4. Gather feedback and iterate
5. Consider native apps only if App Store presence is required

**Current priorities (see ROADMAP.md P5-P7):**
1. ✅ Both games deployed (FreeCell & Klondike)
2. ✅ Monorepo & shared library complete
3. ✅ Undo/redo system complete (#16)
4. 🔄 RFC-003 Phase 2: Klondike card backs - **Current priority**
5. 🔄 Game persistence with localStorage (P6)
6. 🔄 Privacy-first analytics (P7)

## Key Files Reference

### Monorepo Configuration
- `package.json` - Root workspace config (npm workspaces)
- `package-lock.json` - Unified lockfile for all packages
- `.github/workflows/deploy.yml` - Deployment pipeline (builds both games)
- `.github/workflows/pr-validation.yml` - CI checks (lint, test, build)

### Shared Library (@cardgames/shared) **MOST IMPORTANT**
- `shared/index.ts` - Barrel exports for all shared code
- `shared/components/GameControls.tsx` - New Game, Undo, Redo, Settings, Help buttons
- `shared/components/DraggingCardPreview.tsx` - Visual feedback during drag
- `shared/hooks/useGameHistory.ts` - Undo/redo state management
- `shared/hooks/useCardInteraction.ts` - Unified drag-and-drop + click-to-select
- `shared/utils/HistoryManager.ts` - Generic history management
- `shared/types/` - Shared TypeScript types
- `shared/package.json` - Library dependencies

**Note**: All redundant local copies of shared components/hooks have been removed from individual games. Both FreeCell and Klondike now exclusively import from `@cardgames/shared`.

### FreeCell Game
- `freecell-mvp/src/core/` - Card primitives (types, deck, RNG, cardPack)
- `freecell-mvp/src/rules/` - FreeCell game rules
- `freecell-mvp/src/state/` - Game state management
- `freecell-mvp/src/components/` - React UI components
- `freecell-mvp/src/config/accessibilitySettings.ts` - Accessibility configuration
- `freecell-mvp/vite.config.ts` - Build config (base: /CardGames/freecell/)
- `freecell-mvp/package.json` - Depends on @cardgames/shared

### Klondike Game
- `klondike-mvp/src/core/` - Card primitives (types, deck, RNG, cardPack)
- `klondike-mvp/src/rules/` - Klondike game rules (draw-1, draw-3)
- `klondike-mvp/src/state/` - Game state management
- `klondike-mvp/src/components/` - React UI components
- `klondike-mvp/vite.config.ts` - Build config (base: /CardGames/klondike/)
- `klondike-mvp/package.json` - Depends on @cardgames/shared

### Documentation
- `ROADMAP.md` - Strategic priorities and what to build next
- `STATUS.md` - Current sprint status and active work
- `CLAUDE.md` - This file (AI assistant implementation guide)
- `ARCHITECTURE.md` - Long-term architectural vision
- `rfcs/001-undo-redo-system.md` - Undo/redo RFC
- `rfcs/002-game-sharing-replay.md` - Game sharing RFC
- `rfcs/003-card-backs-and-animations.md` - Card backs and flip animations RFC
- `freecell-mvp/README.md` - FreeCell app documentation
- `freecell-mvp/TESTING.md` - Testing guide

## Notes for AI Assistants

### Before Starting Any Work:
1. **Read STATUS.md** - See what's currently in progress and what's next
2. **Check ROADMAP.md** - Understand current priorities and strategic direction
3. **Review this file** - For implementation details and conventions

### When Working on This Codebase:
1. **Always run tests** after making changes to game logic
2. **Check ESLint** before committing (`npm run lint`)
3. **Don't mutate state** - all state updates must be immutable
4. **Use shared library** - Import GameControls, useGameHistory, useCardInteraction, and HistoryManager from `@cardgames/shared`, never create local copies
5. **Use feature flags** for new optional features
6. **Write tests first** when possible (TDD approach)
7. **Update documentation** if making architectural changes
8. **Update STATUS.md** when starting/completing work
9. **Test locally** before pushing (`npm run build` should succeed)

### Common Gotchas:
- The `base` path in vite.config.ts is for production only (GitHub Pages)
- Tests run in jsdom environment (browser APIs available)
- Feature flags are in `src/config/featureFlags.ts`, not environment variables
- Card IDs are strings like "A♠", not numeric indices
- The RNG seed must be an integer for reproducible games
- **Responsive sizing**: All card components must receive `cardWidth`, `cardHeight`, and `fontSize` props from the parent's `layoutSizes` state
- Card dimensions are calculated dynamically - never use hardcoded pixel values for card sizing in new components

### Quick Commands for AI Assistants:
```bash
# Full monorepo validation (what CI runs)
npm run lint && npm test && npm run build

# Work on specific game
cd freecell-mvp && npm run test:watch   # FreeCell TDD
cd klondike-mvp && npm run test:watch   # Klondike TDD

# Work on shared library
cd shared && npm run test:watch

# Check coverage
cd freecell-mvp && npm run test:coverage
cd klondike-mvp && npm run test:coverage

# Build for deployment
npm run build:shared && npm run build:pages
```
