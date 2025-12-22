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

#### 2.3 Responsive Layout
- [ ] Convert fixed `px` values to relative units (`vw`, `vh`, `%`)
- [ ] Implement breakpoints: desktop (1200px+), tablet (768-1199px), mobile (< 768px)
- [ ] Test on iPad (1024x768) and common mobile sizes
- [ ] Ensure cards remain readable at all sizes

#### 2.4 Touch Optimization
- [ ] Minimum 44x44px tap targets for cards
- [ ] Add touch event handlers (`onTouchStart`, `onTouchEnd`) alongside mouse events
- [ ] Implement long-press as alternative to drag on mobile
- [ ] Disable browser zoom/scroll during gameplay

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
The game is **live on GitHub Pages** and accessible on mobile browsers, but not optimized:
- ✅ Accessible via web browser on any device
- ❌ No PWA manifest or service worker
- ❌ Layout uses fixed pixels (not responsive)
- ❌ Touch interactions need optimization
- ❌ No app icons for "Add to Home Screen"

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

### Pre-Deployment Checklist for Mobile

Before deploying to mobile, address these issues:

1. **Responsive Layout**
   - [ ] Replace fixed `px` values with viewport units (`vw`, `vh`) or CSS Grid
   - [ ] Test at 1024x768 (iPad) and 360x640 (mobile)
   - [ ] Add CSS media queries or responsive sizing logic

2. **Touch Optimization**
   - [ ] Increase tap targets to minimum 44x44px
   - [ ] Test drag-and-drop on touch devices (may need touch event handlers)
   - [ ] Consider tap-to-select as primary interaction

3. **Viewport Configuration**
   - [ ] Update `freecell-mvp/index.html` with mobile viewport meta:
     ```html
     <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
     <meta name="apple-mobile-web-app-capable" content="yes">
     ```

4. **Icons & Splash Screens**
   - [ ] Create app icons (192x192, 512x512 minimum)
   - [ ] For iOS: Add Apple touch icons and splash screens
   - [ ] Use a tool like [realfavicongenerator.net](https://realfavicongenerator.net)

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
2. 🔄 Make game responsive for mobile (Phase 2.3)
3. 🔄 Add touch optimization (Phase 2.4)
4. 🔄 Implement undo/redo (Phase 2.1)
5. 📱 Configure PWA for "Add to Home Screen"

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

### Quick Commands for AI Assistants:
```bash
# Full validation (what CI runs)
cd freecell-mvp && npm run lint && npm run test && npm run build

# Quick feedback loop
cd freecell-mvp && npm run test:watch

# Check coverage
cd freecell-mvp && npm run test:coverage
```
