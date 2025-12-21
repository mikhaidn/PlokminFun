# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FreeCell card game implementation built with React, TypeScript, and Vite. The codebase follows a modular architecture with clear separation between core logic, game rules, state management, and UI components.

See `ARCHITECTURE.md` for the long-term vision of extracting reusable libraries for other card games.

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
npm run lint         # ESLint
```

## Project Structure

```
CardGames/
├── CLAUDE.md              # This file
├── ARCHITECTURE.md        # Long-term architectural plans
└── freecell-mvp/          # Main application
    ├── src/
    │   ├── core/          # Game-agnostic card primitives
    │   │   ├── types.ts   # Card, Suit, Value types
    │   │   ├── deck.ts    # createDeck(), shuffleWithSeed()
    │   │   ├── rng.ts     # seededRandom() for reproducible shuffles
    │   │   └── __tests__/ # Unit tests for core modules
    │   │
    │   ├── rules/         # FreeCell-specific game rules
    │   │   ├── validation.ts   # canStackOnTableau(), canStackOnFoundation()
    │   │   ├── movement.ts     # getMaxMovable(), getValidMoveableStack()
    │   │   ├── autoComplete.ts # Auto-move logic
    │   │   ├── hints.ts        # Hint calculation
    │   │   └── __tests__/      # Rule tests
    │   │
    │   ├── state/         # Game state management
    │   │   ├── gameState.ts    # GameState type, initializeGame(), checkWinCondition()
    │   │   ├── gameActions.ts  # Move operations (immutable state updates)
    │   │   └── __tests__/      # State tests
    │   │
    │   ├── components/    # React UI components
    │   │   ├── Card.tsx
    │   │   ├── EmptyCell.tsx
    │   │   ├── Tableau.tsx
    │   │   ├── FreeCellArea.tsx
    │   │   ├── FoundationArea.tsx
    │   │   └── GameBoard.tsx
    │   │
    │   ├── config/        # Configuration
    │   │   └── featureFlags.ts # Feature flag definitions
    │   │
    │   ├── App.tsx        # Main game component
    │   └── main.tsx       # Entry point
    │
    ├── package.json
    └── TESTING.md         # Manual testing guide
```

## Architecture

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
The game uses `seededRandom()` in `src/core/rng.ts` based on bit manipulation to ensure reproducible shuffles. Each game is identified by a numeric seed, allowing players to replay specific deals.

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
- See `TESTING.md` for manual testing scenarios

### Adding New Features
When extending the game:
- Core card utilities go in `src/core/`
- FreeCell-specific rules go in `src/rules/`
- State mutations go through `src/state/gameActions.ts`
- UI components go in `src/components/`
- Use feature flags in `src/config/featureFlags.ts` for toggleable features

### Feature Flags
Feature flags are defined in `src/config/featureFlags.ts`. Check this file before implementing new toggleable features.

## Beta Release Roadmap

### Phase 1: Core Functionality (Current State ✅)
- [x] Game logic with full FreeCell rules
- [x] Click-to-select card interaction
- [x] Drag-and-drop support
- [x] Auto-complete for safe moves
- [x] Hints system
- [x] Win detection
- [x] Seed-based reproducible games
- [x] Unit tests for core modules

### Phase 2: Beta-Ready Features (Required)

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
- [ ] Deploy to staging URL (Vercel/Netlify)
- [ ] Test on real devices: iPhone, iPad, Android phone, Android tablet
- [ ] Gather feedback on usability and bugs
- [ ] Fix critical issues before public release

### Phase 4: Nice-to-Have (Post-Beta)
- [ ] Animations for card movement
- [ ] Sound effects (optional, with mute)
- [ ] Game statistics (wins, losses, best times)
- [ ] Timer and scoring system
- [ ] Dark mode theme
- [ ] Share game seed feature

---

## Deployment to iOS/Android

### Current Status
The game is **ready for desktop browser prototyping** but requires additional work for mobile deployment:
- ❌ No PWA manifest or service worker
- ❌ Layout uses fixed pixels (not responsive)
- ❌ No touch-optimized interactions
- ❌ No app icons

### Deployment Options

#### Option A: PWA (Recommended for Prototyping)
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
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
```

**Step 3: Add Icons**
Create `public/icon-192.png` and `public/icon-512.png`

**Step 4: Deploy to Static Host**
```bash
npm run build
# Deploy dist/ to Vercel, Netlify, or GitHub Pages
```

**Step 5: Install on Device**
- **iOS**: Open in Safari → Share → "Add to Home Screen"
- **Android**: Open in Chrome → Menu → "Install app"

#### Option B: Capacitor (Native App Wrapper)
For App Store/Play Store distribution or native features.

**Step 1: Install Capacitor**
```bash
cd freecell-mvp
npm install @capacitor/core @capacitor/cli
npx cap init FreeCell com.yourname.freecell
npm install @capacitor/ios @capacitor/android
```

**Step 2: Build and Sync**
```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

**Step 3: Open in Native IDEs**
```bash
npx cap open ios      # Opens Xcode (macOS only)
npx cap open android  # Opens Android Studio
```

**Step 4: Run on Device**
- **iOS**: Requires Mac with Xcode, Apple Developer account ($99/year for App Store)
- **Android**: Android Studio, can test on device via USB

### Pre-Deployment Checklist

Before deploying to mobile, address these issues:

1. **Responsive Layout**
   - [ ] Replace fixed `px` values with viewport units (`vw`, `vh`) or CSS Grid
   - [ ] Test at 1024x768 (iPad) and 360x640 (mobile)
   - [ ] Add CSS media queries or use `window.innerWidth` for sizing

2. **Touch Optimization**
   - [ ] Increase tap targets to minimum 44x44px
   - [ ] Test drag-and-drop on touch devices (may need touch event handlers)
   - [ ] Consider tap-to-select as primary interaction (drag as secondary)

3. **Viewport Configuration**
   - [ ] Add to `index.html`:
     ```html
     <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
     <meta name="apple-mobile-web-app-capable" content="yes">
     ```

4. **Icons & Splash Screens**
   - [ ] Create app icons (192x192, 512x512 minimum)
   - [ ] For iOS: Add Apple touch icons and splash screens
   - [ ] Consider using a generator like realfavicongenerator.net

### Quick Test on Mobile (No Changes Needed)
To test the current build on a mobile device immediately:
```bash
cd freecell-mvp
npm run dev -- --host
```
Then open `http://<your-ip>:5173` on your mobile device (same network).

---

## Deployment Path Comparison

### PWA vs Native App

| Aspect | PWA | Native (Capacitor) |
|--------|-----|-------------------|
| **Development effort** | Low | Medium |
| **App Store presence** | No (Add to Home Screen) | Yes |
| **Offline support** | Yes (service worker) | Yes |
| **Updates** | Instant (no app store review) | Requires store submission |
| **Device features** | Limited (no haptics, etc.) | Full access |
| **Cost** | Free hosting | $99/year iOS, $25 one-time Android |
| **Best for** | Prototyping, web-first | Store distribution, native feel |

### PWA Deployment Checklist

**Minimum Requirements:**
- [ ] Install `vite-plugin-pwa` and configure manifest
- [ ] Create app icons (192x192, 512x512)
- [ ] Deploy to HTTPS host (required for service workers)
- [ ] Test "Add to Home Screen" on iOS Safari and Android Chrome

**Recommended:**
- [ ] Add Apple-specific meta tags in `index.html`:
  ```html
  <link rel="apple-touch-icon" href="/icon-192.png">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ```
- [ ] Configure service worker for offline gameplay
- [ ] Add splash screen images for iOS

**Deploy Commands:**
```bash
npm run build
# Then deploy dist/ folder to:
# - Vercel: vercel --prod
# - Netlify: netlify deploy --prod --dir=dist
# - GitHub Pages: push dist/ to gh-pages branch
```

### Native App Deployment Checklist

**iOS (App Store):**
- [ ] Mac with Xcode installed
- [ ] Apple Developer account ($99/year)
- [ ] App icons: 1024x1024 + all required sizes
- [ ] Screenshots for App Store listing
- [ ] Privacy policy URL
- [ ] Build with `npx cap build ios`
- [ ] Submit via App Store Connect

**Android (Play Store):**
- [ ] Android Studio installed
- [ ] Google Play Developer account ($25 one-time)
- [ ] App icons: 512x512 + adaptive icons
- [ ] Feature graphic (1024x500)
- [ ] Screenshots for store listing
- [ ] Generate signed APK/AAB
- [ ] Submit via Google Play Console

**TestFlight / Internal Testing:**
```bash
# iOS - TestFlight
npx cap open ios
# Archive in Xcode → Upload to App Store Connect → TestFlight

# Android - Internal testing
npx cap open android
# Build → Generate Signed Bundle → Upload to Play Console
```

---

## Recommended Path

**For fastest iteration:**
1. Complete Phase 2 (Beta-Ready Features) above
2. Deploy as PWA to Vercel/Netlify
3. Test with real users via "Add to Home Screen"
4. Iterate based on feedback
5. Consider native apps only if App Store presence is required
