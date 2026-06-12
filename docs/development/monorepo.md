# Monorepo Management

This document describes the monorepo architecture for the CardGames project, including npm workspaces, package management, build order, and dependencies between packages.

## Table of Contents

- [Monorepo Overview](#monorepo-overview)
- [Repository Structure](#repository-structure)
- [npm Workspaces](#npm-workspaces)
- [Package Management](#package-management)
- [Build Order and Dependencies](#build-order-and-dependencies)
- [Workspace Commands](#workspace-commands)
- [Adding New Packages](#adding-new-packages)
- [Best Practices](#best-practices)
- [Common Gotchas](#common-gotchas)

## Monorepo Overview

The CardGames project uses a **monorepo architecture** with **npm workspaces** to manage multiple packages:

- **@plokmin/shared** - Shared component library
- **freecell-mvp** - FreeCell game implementation
- **klondike-mvp** - Klondike game implementation

### Why Monorepo?

**Benefits:**
- **Code sharing** - Shared components, hooks, and utilities
- **Atomic commits** - Update multiple packages in one commit
- **Unified dependencies** - Single package-lock.json
- **Easier refactoring** - Change shared code and see immediate impact
- **Consistent tooling** - Shared ESLint, TypeScript, Vitest configs

**Trade-offs:**
- **Build complexity** - Must build in correct order
- **Larger repository** - More code to clone and navigate
- **Coordination required** - Changes affect multiple packages

## Repository Structure

```
CardGames/                    # Monorepo root (npm workspaces)
├── package.json              # Root workspace config
├── package-lock.json         # Unified lockfile for all packages
│
├── shared/                   # @plokmin/shared library
│   ├── components/           # Shared React components
│   │   ├── GameControls.tsx  # New Game, Undo, Redo, Settings, Help
│   │   └── DraggingCardPreview.tsx # Visual feedback during drag
│   ├── hooks/                # Shared React hooks
│   │   ├── useGameHistory.ts # Undo/redo state management
│   │   └── useCardInteraction.ts # Unified drag-and-drop
│   ├── utils/                # Shared utilities
│   │   └── HistoryManager.ts # Generic history management
│   ├── types/                # Shared TypeScript types
│   ├── index.ts              # Barrel exports
│   └── package.json          # Library package config
│
├── freecell-mvp/             # FreeCell game implementation
│   ├── src/
│   │   ├── core/             # Game-agnostic card primitives
│   │   ├── rules/            # FreeCell-specific game rules
│   │   ├── state/            # Game state management
│   │   ├── components/       # React UI components
│   │   └── App.tsx           # Main game component
│   ├── package.json          # Dependencies include "@plokmin/shared"
│   └── vite.config.ts        # Vite config
│
├── klondike-mvp/             # Klondike game implementation
│   ├── src/
│   │   ├── core/             # Card primitives
│   │   ├── rules/            # Klondike-specific game rules
│   │   ├── state/            # Game state management
│   │   ├── components/       # React UI components
│   │   └── App.tsx           # Main game component
│   ├── package.json          # Dependencies include "@plokmin/shared"
│   └── vite.config.ts        # Vite config
│
└── .github/
    └── workflows/
        ├── deploy.yml         # GitHub Pages deployment
        └── pr-validation.yml  # CI checks
```

## npm Workspaces

### Workspace Configuration

The root `package.json` defines workspaces:

```json
{
  "name": "cardgames-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "shared",
    "freecell-mvp",
    "klondike-mvp"
  ],
  "scripts": {
    "build": "npm run build:shared && npm run build:pages",
    "build:shared": "npm run build -w shared",
    "build:pages": "npm run build -w freecell-mvp -w klondike-mvp",
    "test": "npm test -ws",
    "lint": "npm run lint -ws"
  }
}
```

### Workspace Benefits

1. **Unified lockfile** - Single `package-lock.json` for all packages
2. **Hoisted dependencies** - Shared dependencies in root `node_modules`
3. **Local package linking** - `@plokmin/shared` linked automatically
4. **Workspace commands** - Run scripts across all packages

## Package Management

### Installing Dependencies

```bash
# Install all dependencies for all packages
npm install

# Install in specific workspace
npm install -w freecell-mvp
npm install -w shared

# Add dependency to specific workspace
npm install react -w freecell-mvp
npm install -D typescript -w shared

# Add dependency to root (dev tools)
npm install -D eslint -w root
```

### Package Dependencies

Each game depends on the shared library:

```json
// freecell-mvp/package.json
{
  "name": "freecell-mvp",
  "version": "0.2.0",
  "dependencies": {
    "@plokmin/shared": "*",  // Links to local package
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

The `"*"` version means "use the local workspace version."

### Shared Library Exports

The shared library exports via barrel file:

```typescript
// shared/index.ts
export { GameControls } from './components/GameControls';
export { DraggingCardPreview } from './components/DraggingCardPreview';
export { useGameHistory } from './hooks/useGameHistory';
export { useCardInteraction } from './hooks/useCardInteraction';
export { HistoryManager } from './utils/HistoryManager';
export * from './types';
```

Games import from the shared package:

```typescript
// freecell-mvp/src/components/GameBoard.tsx
import { GameControls, useGameHistory } from '@plokmin/shared';
```

## Build Order and Dependencies

### Dependency Graph

```
@plokmin/shared (no dependencies)
       ↑
       |
       ├── freecell-mvp (depends on shared)
       └── klondike-mvp (depends on shared)
```

### Distribution Decision: No-Emit Source Library

**Decision (June 2026):** `@plokmin/shared` is a **no-emit source library** — apps import its TypeScript source directly. There is no compile step and no `dist/`; the shared `build` script is intentionally a no-op. Each app's Vite config aliases `@plokmin/shared` to `../shared/index.ts`, and the package's `main`/`types` point at `index.ts`.

This means **there is no real build-order dependency**: changes to shared code are picked up immediately by every app's dev server, type check, and production build — no rebuild step required.

The decision is deliberately easy to reverse if the library ever needs to be consumed outside the monorepo (e.g., published to npm). See [shared/README.md](../../shared/README.md) for the full rationale and reversal path.

### Build Order

The root `build` script still runs `build:shared` before `build:pages`:

```bash
npm run build            # build:shared (no-op) → build:pages
```

`build:shared` is currently a no-op kept for pipeline ordering — if the library ever switches to emitting build artifacts, the root scripts and CI need no changes.

## Workspace Commands

### Running Commands Across All Workspaces

```bash
# Run in all workspaces
npm test -ws              # Run tests in all packages
npm run lint -ws          # Lint all packages
npm run build -ws         # Build all packages

# Skip root workspace
npm test -ws --if-present
```

### Running Commands in Specific Workspaces

```bash
# Single workspace
npm test -w freecell-mvp
npm run lint -w shared

# Multiple workspaces
npm run build -w freecell-mvp -w klondike-mvp
npm test -w shared -w freecell-mvp
```

### Development Workflows

```bash
# Full monorepo validation (what CI runs)
npm run lint && npm test && npm run build

# Work on specific game
cd freecell-mvp
npm run dev              # Start dev server
npm run test:watch       # Watch mode for TDD

# Work on shared library
cd shared
npm run test:watch       # TDD for shared components
npm run build            # Build library

# Then test in game
cd ../freecell-mvp
npm run dev              # See changes in game
```

### Common Development Commands

```bash
# Install all dependencies
npm install

# Build everything (shared + games)
npm run build

# Run all tests
npm test

# Lint everything
npm run lint

# Build all games (shared needs no build — no-emit source library)
npm run build:pages

# Clean and reinstall
rm -rf node_modules package-lock.json
rm -rf */node_modules
npm install
```

## Adding New Packages

### Creating a New Game Package

**Step 1: Create directory and package.json**

```bash
mkdir spider-mvp
cd spider-mvp

# Create package.json
npm init -y
```

**Step 2: Configure package.json**

```json
{
  "name": "spider-mvp",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "@plokmin/shared": "*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "vitest": "^0.34.0"
  }
}
```

**Step 3: Add to root workspaces**

```json
// Root package.json
{
  "workspaces": [
    "shared",
    "freecell-mvp",
    "klondike-mvp",
    "spider-mvp"  // Add new package
  ]
}
```

**Step 4: Install dependencies**

```bash
cd ..
npm install  # Installs for all workspaces
```

**Step 5: Update build scripts**

```json
// Root package.json
{
  "scripts": {
    "build:pages": "npm run build -w freecell-mvp -w klondike-mvp -w spider-mvp"
  }
}
```

### Creating a New Shared Package

For additional shared libraries (e.g., `@cardgames/analytics`):

```bash
mkdir shared-analytics
cd shared-analytics

# Create package.json with name @cardgames/analytics
# Add to root workspaces
# Other packages can depend on it
```

## Best Practices

### 1. Keep Shared Library Minimal

Only move code to `@plokmin/shared` when:

- Used by 2+ games
- Truly reusable and generic
- Stable and well-tested

**Don't** prematurely extract to shared:

```typescript
// ❌ Bad - game-specific logic in shared
export function isFreeCellGameWon(state: FreeCellState) { ... }

// ✅ Good - generic utility in shared
export function areAllCardsInFoundations(foundations: Card[][]) { ... }
```

### 2. Use Workspace Protocol

Always use `"*"` for local workspace dependencies:

```json
// ✅ Good
{
  "dependencies": {
    "@plokmin/shared": "*"
  }
}

// ❌ Bad - specific version
{
  "dependencies": {
    "@plokmin/shared": "0.2.0"  // Will not auto-update
  }
}
```

### 3. No Build Step for Shared

The shared library is consumed as TypeScript source (see [Distribution Decision](#distribution-decision-no-emit-source-library)) — there is nothing to build. Don't add a compile step or `dist/` output to `shared/` without revisiting that decision.

### 4. Test Changes Across Packages

When changing shared library:

```bash
# 1. Make changes to shared (picked up by apps immediately — no rebuild)
cd shared
npm run test:watch

# 2. Test in both games
cd ../freecell-mvp && npm test
cd ../klondike-mvp && npm test
```

### 5. Version in Sync

Keep package versions synchronized:

```bash
# Bump all packages to same version
npm version minor -w shared
npm version minor -w freecell-mvp
npm version minor -w klondike-mvp
```

### 6. Use Unified Lockfile

**Never** create separate `package-lock.json` files in workspaces:

```bash
# ❌ Bad - creates separate lockfile
cd freecell-mvp
npm install react

# ✅ Good - updates root lockfile
cd /path/to/CardGames
npm install react -w freecell-mvp
```

## Common Gotchas

### 1. Module Not Found: @plokmin/shared

**Problem**: Game can't find shared library

**Solution**: The library is resolved via the workspace link and each app's Vite alias (`'@plokmin/shared': '../shared/index.ts'`) — not via a build. Check that:

```bash
npm install                       # Workspace link exists in node_modules
grep "@plokmin/shared" <app>/vite.config.ts   # Alias is present
```

### 2. Changes to Shared Not Reflected

**Problem**: Updated shared library but game doesn't see changes

**Solution**: Shared code is imported as source, so changes apply immediately — no rebuild exists. If a dev server seems stale, restart it; for production output, rebuild the app itself (`npm run build -w <app>`).

### 3. Dependency Version Conflicts

**Problem**: Different packages use different versions of same dependency

**Solution**: Check and align versions

```bash
# Check all package.json files
npm ls react

# Update to same version
npm install react@18.2.0 -w freecell-mvp
npm install react@18.2.0 -w klondike-mvp
```

### 4. TypeScript Can't Find Types

**Problem**: TypeScript errors in game importing from shared

**Solution**: Ensure shared library exports types

```typescript
// shared/index.ts
export type { Card, Suit, Value } from './types';
```

### 5. Circular Dependencies

**Problem**: Shared depends on game package (circular)

**Solution**: Never let shared depend on games. Dependencies should flow one way:

```
Games → Shared (✅ Correct)
Shared → Games (❌ Wrong)
```

### 6. Hoisting Issues

**Problem**: Package expects dependency in its own node_modules

**Solution**: Install directly in workspace

```bash
npm install specific-package -w problematic-workspace
```

### 7. CI/CD Build Failures

**Problem**: Build works locally but fails in CI

**Solution**: Ensure CI builds in correct order

```yaml
# .github/workflows/pr-validation.yml
- name: Install dependencies
  run: npm ci

- name: Build shared library
  run: npm run build:shared

- name: Build games
  run: npm run build:pages

- name: Run tests
  run: npm test
```

## Related Documentation

- [Testing Guide](./testing.md) - Running tests across packages
- [Version Management](./version-management.md) - Managing versions in monorepo
- `CLAUDE.md` - Implementation guide
- `ARCHITECTURE.md` - Long-term architectural vision
