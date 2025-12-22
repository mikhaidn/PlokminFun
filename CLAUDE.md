# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a card games collection featuring FreeCell as the first playable game, built with React, TypeScript, and Vite. The codebase follows a modular architecture with clear separation between core logic, game rules, state management, and UI components.

**Live Demo**: https://mikhaidn.github.io/CardGames/
- **FreeCell**: https://mikhaidn.github.io/CardGames/freecell/

## 📚 Documentation Map

This repository has multiple documentation files for different purposes:

- **CLAUDE.md** (this file) - Implementation guide for AI assistants working with the codebase
- **ROADMAP.md** - Strategic priorities, what to build next and why
- **STATUS.md** - Current sprint status, what's being worked on now
- **ARCHITECTURE.md** - Long-term technical vision for library extraction
- **freecell-mvp/README.md** - FreeCell-specific documentation
- **freecell-mvp/TESTING.md** - Manual testing guide

**Quick Start for AI Agents:**
1. Read **STATUS.md** to see what's currently in progress
2. Check **ROADMAP.md** for priorities and next tasks
3. Use **CLAUDE.md** (this file) for implementation details
4. Consult **ARCHITECTURE.md** for long-term decisions

## Repository Structure

```
CardGames/
├── .github/
│   └── workflows/
│       ├── deploy.yml         # GitHub Pages deployment (on push to main)
│       └── pr-validation.yml  # CI checks (lint, test, build on PRs)
│
├── freecell-mvp/             # FreeCell game implementation
│   ├── src/
│   │   ├── core/             # Game-agnostic card primitives
│   │   ├── rules/            # FreeCell-specific game rules
│   │   ├── state/            # Game state management
│   │   ├── components/       # React UI components
│   │   ├── config/           # Configuration (feature flags)
│   │   ├── utils/            # Utility functions (responsive layout)
│   │   ├── test/             # Test setup and utilities
│   │   ├── App.tsx           # Main game component
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json
│   ├── vite.config.ts        # Vite config (base: /CardGames/freecell/)
│   ├── vitest.config.ts      # Test runner config
│   ├── tsconfig.json
│   ├── README.md             # FreeCell-specific documentation
│   └── TESTING.md            # Manual testing guide
│
├── index.html                # Root landing page (game selector)
├── CLAUDE.md                 # This file (AI assistant implementation guide)
├── ROADMAP.md                # Strategic priorities and next steps
├── STATUS.md                 # Current sprint status and metrics
└── ARCHITECTURE.md           # Long-term architectural plans
```

## Build & Test Commands

```bash
cd freecell-mvp

# Development
npm run dev          # Start dev server at localhost:5173

# Testing
npm run test         # Run all tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Build & Lint
npm run build        # TypeScript check + production build
npm run lint         # ESLint check
npm run preview      # Preview production build locally
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

### Phase 2: Beta-Ready Features (In Progress)

#### 2.1 Undo/Redo
- [ ] Add `moveHistory: GameState[]` to track states
- [ ] Implement undo button (pop from history)
- [ ] Optional: Implement redo with separate stack
- [ ] Limit history size to prevent memory issues (~100 states)

#### 2.2 Game Persistence
- [ ] Save current game to localStorage on each move
- [ ] Restore game state on page reload
- [ ] Save/load game seed for "continue" functionality

#### 2.3 Responsive Layout ✅ COMPLETE
- [x] Viewport-based dynamic sizing system
- [x] Implemented responsive breakpoints: mobile (< 600px), tablet (600-900px), desktop (> 900px)
- [x] Cards scale automatically to fit all screen sizes
- [x] Maintains aspect ratio and readability
- [x] Responsive header, buttons, and modals

#### 2.4 Touch Optimization ✅ COMPLETE
- [x] Touch drag-and-drop support
- [x] Touch event handlers (`onTouchStart`, `onTouchEnd`, `onTouchMove`)
- [x] Tap-to-select interaction
- [x] Disabled browser zoom/scroll during gameplay (`touchAction: 'none'`)

#### 2.5 Basic Polish
- [ ] Loading state while initializing
- [ ] Error boundaries for graceful failure
- [ ] Keyboard shortcuts (U for undo, N for new game, H for hints)
- [ ] Confirm dialog before starting new game mid-play

### Phase 3: Beta Testing
- [ ] Test on real devices: iPhone, iPad, Android phone, Android tablet
- [ ] Gather feedback on usability and bugs
- [ ] Fix critical issues before wider release

### Phase 4: Nice-to-Have (Post-Beta)
- [ ] Animations for card movement
- [ ] Sound effects (optional, with mute)
- [ ] Game statistics (wins, losses, best times)
- [ ] Timer and scoring system
- [ ] Dark mode theme
- [ ] Share game seed feature

## Mobile Deployment Options

### Current Status
The game is **live on GitHub Pages** and optimized for mobile:
- ✅ Accessible via web browser on any device
- ✅ **Responsive layout** - scales for all screen sizes (mobile, tablet, desktop)
- ✅ **Touch optimized** - drag-and-drop and tap interactions work on touch devices
- ✅ PWA configured (manifest and service worker via vite-plugin-pwa)
- ❌ No custom app icons (uses default icons)

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

**Current priorities:**
1. ✅ Core game working and deployed
2. ✅ Responsive layout for all devices (Phase 2.3)
3. ✅ Touch optimization (Phase 2.4)
4. 🔄 Implement undo/redo (Phase 2.1) - **Next priority**
5. 🔄 Game persistence with localStorage (Phase 2.2)

## Key Files Reference

### Configuration
- `freecell-mvp/vite.config.ts` - Build config, base path
- `freecell-mvp/vitest.config.ts` - Test config
- `freecell-mvp/tsconfig.json` - TypeScript config
- `freecell-mvp/eslint.config.js` - Linting rules
- `.github/workflows/deploy.yml` - Deployment pipeline
- `.github/workflows/pr-validation.yml` - CI checks

### Game Logic (Most important for AI assistants)
- `freecell-mvp/src/core/` - Card primitives (types, deck, RNG)
- `freecell-mvp/src/rules/` - FreeCell game rules
- `freecell-mvp/src/state/` - Game state management
- `freecell-mvp/src/components/` - React UI components
- `freecell-mvp/src/utils/responsiveLayout.ts` - Responsive sizing calculations
- `freecell-mvp/src/config/featureFlags.ts` - Feature toggles

### Documentation
- `ROADMAP.md` - Strategic priorities and what to build next
- `STATUS.md` - Current sprint status and active work
- `CLAUDE.md` - This file (AI assistant implementation guide)
- `ARCHITECTURE.md` - Long-term architectural vision
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
4. **Use feature flags** for new optional features
5. **Write tests first** when possible (TDD approach)
6. **Update documentation** if making architectural changes
7. **Update STATUS.md** when starting/completing work
8. **Test locally** before pushing (`npm run build` should succeed)

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
# Full validation (what CI runs)
cd freecell-mvp && npm run lint && npm run test && npm run build

# Quick feedback loop
cd freecell-mvp && npm run test:watch

# Check coverage
cd freecell-mvp && npm run test:coverage
```
