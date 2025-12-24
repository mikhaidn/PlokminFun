# AI Agent Quick Guide

**Goal:** Get you productive in 30 seconds, not 15 minutes.

---

## 🚀 30-Second Onboarding

**What is this?**
- Card games monorepo (FreeCell + Klondike + shared library)
- React + TypeScript + Vite
- npm workspaces architecture

**Structure:**
```
CardGames/
├── shared/           # @cardgames/shared (reusable components/hooks)
├── freecell-mvp/     # FreeCell game
├── klondike-mvp/     # Klondike game
└── package.json      # Root workspace config
```

**Essential commands:**
```bash
npm test              # Run all tests
npm run lint          # Check code quality
npm run build         # Build everything
```

---

## ⚡ Start Here (3 Steps)

1. **Read [STATUS.md](STATUS.md)** - What's in progress RIGHT NOW
2. **Read [ROADMAP.md](ROADMAP.md)** - What's coming next
3. **Check [rfcs/INDEX.md](rfcs/INDEX.md)** - Design decisions for major features

**Then:** Start coding! Follow the rules below ⬇️

---

## ⚠️ Critical Rules (Must Follow)

### 1. **ALWAYS Import from @cardgames/shared**
```typescript
// ✅ CORRECT
import { GameControls, useGameHistory } from '@cardgames/shared';

// ❌ WRONG - Never duplicate shared code locally
import { GameControls } from './components/GameControls';
```

### 2. **Immutable State Updates**
```typescript
// ✅ CORRECT
const newState = { ...gameState, moves: gameState.moves + 1 };

// ❌ WRONG
gameState.moves++;
```

### 3. **Run Tests Before Committing**
```bash
npm run lint && npm test && npm run build
```

### 4. **Check STATUS.md Before Starting Work**
- Avoid duplicate work
- See what's blocked or in progress

---

## 🔧 Common Tasks

### Development Workflow
```bash
# Work on specific game
cd freecell-mvp && npm run dev        # Start dev server
cd freecell-mvp && npm run test:watch # TDD mode

# Work on shared library
cd shared && npm run test:watch

# Full monorepo validation (what CI runs)
npm run lint && npm test && npm run build
```

### Finding Information
| Task | Where to Look |
|------|---------------|
| **Current work** | [STATUS.md](STATUS.md) |
| **Priorities** | [ROADMAP.md](ROADMAP.md) |
| **Design decisions** | [rfcs/INDEX.md](rfcs/INDEX.md) |
| **Deployment** | [docs/deployment/README.md](docs/deployment/README.md) |
| **Game rules** | [docs/games/freecell.md](docs/games/freecell.md) |
| **Architecture** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **All docs** | [DOCS.md](DOCS.md) |

---

## 🎯 Decision Tree

**Starting a new task?**

```
1. Is there an RFC?
   → Check rfcs/INDEX.md
   → Read the RFC's README.md (50 lines, not the full RFC!)

2. Need implementation details?
   → Read specific RFC sections (e.g., 04-implementation.md)
   → Check docs/games/ for game-specific info

3. Ready to code?
   → Follow Critical Rules (above)
   → Write tests first (TDD)
   → Run validation before committing
```

---

## 🧪 Testing Strategy

**Test requirements:**
- ✅ Write tests for all game logic
- ✅ Use TDD (test first, then implement)
- ✅ Aim for >95% coverage on core modules
- ✅ Run `npm test` before committing

**Test commands:**
```bash
npm test                     # Run all tests once
npm run test:watch           # Watch mode (TDD)
npm run test:coverage        # Coverage report

# Game-specific tests
cd freecell-mvp && npm test
cd klondike-mvp && npm test
cd shared && npm test
```

---

## 📦 Package Management

**Installing dependencies:**
```bash
# Root dependencies (shared across all packages)
npm install <package> -w root

# Game-specific dependencies
npm install <package> -w freecell-mvp
npm install <package> -w klondike-mvp

# Shared library dependencies
npm install <package> -w shared
```

**Build order matters:**
```bash
npm run build:shared   # Always build shared first
npm run build:games    # Then build games
```

---

## 🐛 Common Gotchas

### 1. **Vite base path**
- `vite.config.ts` has `base: '/CardGames/freecell/'` for GitHub Pages
- This only applies to production builds
- Use `npm run dev` for local development (ignores base path)

### 2. **Card IDs are strings**
```typescript
// ✅ CORRECT
const cardId = "A♠";  // String like "A♠", "K♥"

// ❌ WRONG
const cardId = 0;     // Not a numeric index
```

### 3. **RNG seed must be an integer**
```typescript
// ✅ CORRECT
const seed = 12345;

// ❌ WRONG
const seed = 123.45;  // No decimals
```

### 4. **Responsive sizing**
All card components must receive props from parent's layout state:
```typescript
// ✅ CORRECT
<Card
  card={card}
  cardWidth={layoutSizes.cardWidth}
  cardHeight={layoutSizes.cardHeight}
  fontSize={layoutSizes.fontSize}
/>

// ❌ WRONG
<Card card={card} />  // Missing responsive props
```

### 5. **Feature flags**
- Defined in `src/config/featureFlags.ts` (not environment variables)
- Check before implementing new optional features

---

## 🚢 Deployment

**Current deployment:**
- GitHub Pages (auto-deploy on push to `main`)
- FreeCell: https://mikhaidn.github.io/CardGames/freecell/
- Klondike: https://mikhaidn.github.io/CardGames/klondike/

**Deployment process:**
```bash
git push origin main  # Triggers GitHub Actions
# Wait 1-2 minutes
# Check live site
```

**For details:** See [docs/deployment/README.md](docs/deployment/README.md)

---

## 📖 Deep Dives

Need more detailed information?

- **Accessibility features:** [docs/accessibility/README.md](docs/accessibility/README.md)
- **Responsive design:** [docs/accessibility/responsive-design.md](docs/accessibility/responsive-design.md)
- **Version management:** [docs/development/version-management.md](docs/development/version-management.md)
- **Testing guide:** [docs/development/testing.md](docs/development/testing.md)
- **Monorepo setup:** [docs/development/monorepo.md](docs/development/monorepo.md)
- **All documentation:** [DOCS.md](DOCS.md)

---

## 🎓 Best Practices

**Code quality:**
- TypeScript strict mode (no `any` without justification)
- ESLint must pass
- Immutable state updates
- Avoid over-engineering (YAGNI principle)

**Don't do these unless explicitly requested:**
- Add features beyond what's asked
- Refactor unrelated code
- Add unnecessary abstractions
- Create helpers for one-time operations
- Add error handling for impossible scenarios

**Do:**
- Read the code before modifying it
- Write tests first (TDD)
- Keep changes focused and minimal
- Update documentation when changing architecture

---

## 🆘 Need Help?

**Common issues:**
- Build failing? Check if shared library is built: `npm run build:shared`
- Tests failing? Make sure you're in the right directory
- Import errors? Check tsconfig path mappings
- Type errors? Run `npm run lint` for details

**Still stuck?**
1. Check [DOCS.md](DOCS.md) for full documentation map
2. Search the codebase: `grep -r "your query" src/`
3. Check relevant RFC: [rfcs/INDEX.md](rfcs/INDEX.md)

---

## 📊 Quick Stats

- **Languages:** TypeScript, React
- **Tests:** 1,600+ (FreeCell + Klondike + shared)
- **Coverage:** >95% on core modules
- **Games:** 2 (FreeCell, Klondike)
- **Shared components:** GameControls, DraggingCardPreview, useGameHistory, useCardInteraction

---

**Remember:** Read STATUS.md first, follow the Critical Rules, write tests, and you'll be productive in no time! 🚀
