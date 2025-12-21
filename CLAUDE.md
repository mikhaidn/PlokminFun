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
