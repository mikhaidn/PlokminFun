# AI Agent Quick Guide

**Goal:** Get you productive in <2 minutes, not 15 minutes.

---

## 🚀 30-Second Onboarding

**What is this?**
- **Plokmin Consortium** - Collection of diverse interactive web experiences
- NOT just card games → Dog tracker, card games, habit tracker, etc.
- React + TypeScript + Vite monorepo
- Mobile-first PWAs with offline support

**Structure:**
```
Plokmin/
├── shared/              # @plokmin/shared (card game utilities - will split later)
├── dog-care-tracker/    # Dog activity tracking PWA (NEW!)
├── freecell-mvp/        # FreeCell solitaire
├── klondike-mvp/        # Klondike solitaire
└── scripts/site/        # Site build: app discovery + generated landing page
```

**Essential commands:**
```bash
npm run validate         # Full check: lint + test + build (what CI runs)
npm run dev:dog          # Dog Care Tracker
npm run dev:freecell     # FreeCell
npm run dev:klondike     # Klondike
```

💡 **Full command reference:** [NPM_SCRIPTS.md](NPM_SCRIPTS.md)

---

## ⚡ Start Here (3 Steps)

1. **Read [VISION.md](VISION.md)** - What is Plokmin Consortium? **(THE BIG PICTURE - READ FIRST!)**
2. **Read [STATUS.md](STATUS.md)** - What's in progress RIGHT NOW
3. **Read experience README** - `/dog-care-tracker/README.md` or `/freecell-mvp/README.md`

**Then:** Start coding! Follow the rules below ⬇️

---

## 🎯 Understanding the Architecture Strategy

### The Pivot: From Card Games to Diverse Experiences
**Originally:** Just card games (FreeCell, Klondike, Spider, etc.)
**Now:** Plokmin Consortium - diverse interactive experiences (games + productivity + utilities)

### Philosophy: Experiment → Discover → Extract
1. **Build 2-3 diverse experiences** (card game + dog tracker + habit tracker)
2. **Observe natural patterns** (PWA setup, localStorage, etc.)
3. **Extract shared libraries** only when patterns are clear
4. **Don't prematurely abstract** - let patterns emerge from real use

### Current Shared Library State
- `@plokmin/shared` - Card game components/hooks (will rename to `@plokmin/card-common`)
- **Future extractions:**
  - `@plokmin/pwa-common` - PWA setup, localStorage hooks
  - `@plokmin/ui-common` - Generic UI primitives (if needed)

### Key Principle: Self-Contained Experiences
- Each experience directory is **independently understandable**
- Minimal cross-references (you shouldn't need to read other experiences)
- Experience READMEs contain full context
- Shared libraries only for truly universal patterns

---

## ⚠️ Critical Rules (Must Follow)

### 1. **Working on Card Games? Import from @plokmin/shared**
```typescript
// ✅ CORRECT (FreeCell/Klondike)
import { GameControls, useGameHistory } from '@plokmin/shared';

// ❌ WRONG
import { GameControls } from './components/GameControls';
```

**Note:** Dog tracker and other non-card experiences don't use `@plokmin/shared`. They're standalone.

### 2. **Immutable State Updates**
```typescript
// ✅ CORRECT
const newState = { ...gameState, moves: gameState.moves + 1 };

// ❌ WRONG
gameState.moves++;
```

### 3. **Run Validation Before Committing/Pushing**
```bash
npm run validate   # Runs: format:check + typecheck + lint + test + build (exactly what CI runs)
npm run format     # Auto-format code (Prettier)
npm run lint:fix   # Auto-fix most lint issues (unused imports, spacing, etc.)
npm run setup-hooks # One-time: Install pre-commit + pre-push hooks
```

**Pre-commit hook automatically checks:**
1. ✅ Format (Prettier)
2. ✅ TypeScript errors (all workspaces)
3. ✅ Lint issues (all workspaces)
4. ✅ Tests
5. ✅ Build

**Pre-push hook verifies deployment readiness:**
1. ✅ All workspaces typecheck
2. ✅ All workspaces lint clean
3. ✅ All tests pass
4. ✅ **ALL workspaces build successfully** (critical for deployment!)
5. ✅ All dist/ folders exist (deployment artifacts)

If hook blocks you: `npm run format && npm run lint:fix` will fix most issues!

### 4. **Check VISION.md and STATUS.md Before Starting**
- **VISION.md** - Understand the big picture (Plokmin Consortium philosophy)
- **STATUS.md** - See what's blocked or in progress
- Avoid duplicate work

---

## 🔧 Common Tasks

### Development Workflow
```bash
# First-time setup (recommended)
npm run setup-hooks    # Install pre-commit validation

# Start dev server (from repo root)
npm run dev:dog          # Dog Care Tracker
npm run dev:freecell     # FreeCell
npm run dev:klondike     # Klondike

# TDD mode
npm run test:watch       # All packages in watch mode

# Code formatting
npm run format           # Auto-format all files
npm run format:check     # Check without changing

# Quick validation
npm run typecheck        # Fast type checking
npm run lint:fix         # Auto-fix lint issues

# Full monorepo validation (what CI runs)
npm run validate         # format + typecheck + lint + test + build
```

### Finding Information
| Task | Where to Look |
|------|---------------|
| **Big picture** | [VISION.md](VISION.md) ⭐ |
| **Current work** | [STATUS.md](STATUS.md) |
| **Priorities** | [ROADMAP.md](ROADMAP.md) |
| **Dog tracker context** | [dog-care-tracker/README.md](dog-care-tracker/README.md) |
| **Card game design** | [rfcs/INDEX.md](rfcs/INDEX.md) |
| **Architecture** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **All docs** | [DOCS.md](DOCS.md) |

---

## 🎯 Decision Tree

**Starting work on an experience?**

```
1. Which experience?
   → Dog tracker: Read /dog-care-tracker/README.md (full context)
   → FreeCell/Klondike: Read /[game]/README.md + relevant RFCs
   → New experience: Read VISION.md for architecture strategy

2. Need design context?
   → Card games: Check rfcs/INDEX.md
   → Other experiences: Check experience README

3. Ready to code?
   → Follow Critical Rules (above)
   → Write tests first (TDD)
   → Run validation before committing
```

---

## 🧪 Testing Strategy

**Test requirements:**
- ✅ Write tests for all core logic
- ✅ Use TDD (test first, then implement)
- ✅ Aim for >95% coverage on core modules
- ✅ Run `npm test` before committing

**Test commands:**
```bash
npm test                     # Run all tests once
npm run test:watch           # Watch mode (TDD)
npm run test:coverage        # Coverage report

# Experience-specific tests
npm test -w dog-care-tracker
npm test -w freecell-mvp
npm test -w klondike-mvp
npm test -w shared
```

---

## 📦 Package Management

**Installing dependencies:**
```bash
# Root dependencies
npm install <package> -w root

# Experience-specific
npm install <package> -w dog-care-tracker
npm install <package> -w freecell-mvp
npm install <package> -w klondike-mvp

# Shared library
npm install <package> -w shared
```

**Shared library has no build step:**
- `@plokmin/shared` is a no-emit source library — apps import its TypeScript source directly (via workspace link + Vite alias), so shared changes apply immediately. See [shared/README.md](shared/README.md).
```bash
npm run build:pages    # Build apps (build:shared is a no-op kept for ordering)
```

**Dog tracker:** Standalone, no shared library dependency

---

## 🐛 Common Gotchas

### 1. **Vite base path**
- `vite.config.ts` has `base: '/PlokminFun/[experience]/'` for GitHub Pages
- Only applies to production builds
- Use `npm run dev` for local development

### 2. **Card games: Card IDs are strings**
```typescript
// ✅ CORRECT
const cardId = "A♠";  // String like "A♠", "K♥"

// ❌ WRONG
const cardId = 0;     // Not a numeric index
```

### 3. **Experience isolation**
- Dog tracker doesn't import from `@plokmin/shared`
- Card games don't import from dog-care-tracker
- Keep experiences decoupled (shared libraries only)

### 4. **PWA patterns (dog tracker)**
- localStorage keys: `dog-log-YYYY-MM-DD`
- Service worker: `/PlokminFun/dog-care-tracker/service-worker.js`
- Each experience has own manifest.json

---

## 🚢 Deployment

**Current deployment:**
- GitHub Pages (auto-deploy on push to `main`)
- Root: https://mikhaidn.github.io/PlokminFun/
- Dog Tracker: https://mikhaidn.github.io/PlokminFun/dog-care-tracker/
- Pet Care: https://mikhaidn.github.io/PlokminFun/pet-care/
- FreeCell: https://mikhaidn.github.io/PlokminFun/freecell/
- Klondike: https://mikhaidn.github.io/PlokminFun/klondike/

**Deployment process:**
```bash
git push origin main  # Triggers GitHub Actions
# Wait 2-3 minutes
# All experiences deployed
```

### When Adding New Apps/Experiences

Apps are **discovered, not registered** — deploy and the landing page pick them up automatically. Checklist:

1. ✅ Add to root package.json workspaces
2. ✅ Add a `plokmin` block to the app's package.json (title, icon, description) — this makes it deployable and generates its landing card
3. ✅ Set base path in vite.config.ts: `base: '/PlokminFun/new-app/'`
4. ✅ Verify wiring: `npm run check:site` (also runs in CI — catches base path/slug mistakes)
5. ✅ Test local build: `npm run build -w new-app`

`.github/workflows/deploy.yml` and the landing page never need editing.

**📖 Full deployment checklist:** [docs/deployment/github-pages.md](docs/deployment/github-pages.md#-adding-new-appsgames)

---

## 🎓 Best Practices for Plokmin Consortium

**When building new experiences:**
- ✅ Make it self-contained (own README with full context)
- ✅ Mobile-first design
- ✅ PWA-capable (offline, installable)
- ✅ Use localStorage for persistence
- ✅ Test on mobile devices
- ❌ Don't prematurely extract patterns
- ❌ Don't couple to other experiences

**Code quality:**
- TypeScript strict mode
- ESLint must pass
- Immutable state updates
- >95% test coverage on core logic

**Don't do unless requested:**
- Add features beyond what's asked
- Refactor unrelated code
- Add unnecessary abstractions
- Create helpers for one-time operations

**Do:**
- Read existing code first
- Write tests first (TDD)
- Keep changes focused
- Update documentation when changing architecture

---

## 🆘 Need Help?

**Common issues:**
- Build failing? Run `npm install` (shared needs no build — it's a no-emit source library)
- Tests failing? Check you're in right directory
- Import errors? Check tsconfig path mappings
- Type errors? Run `npm run lint` for details

**For dog tracker:**
- Check `/dog-care-tracker/README.md` for full context
- PWA issues? Check manifest.json and service-worker.js
- localStorage issues? Verify key format (`dog-log-YYYY-MM-DD`)

**Still stuck?**
1. Check [VISION.md](VISION.md) for big picture
2. Check [DOCS.md](DOCS.md) for full documentation
3. Search codebase: `grep -r "your query" src/`

---

## 📊 Quick Stats

- **Experiences:** 3 live (Dog Tracker, FreeCell, Klondike)
- **Tests:** 560+ across all experiences
- **Coverage:** >95% on core modules
- **Shared components:** 9 (GameControls, Card, CardBack, etc.)
- **Type Safety:** TypeScript strict mode
- **Mobile-first:** All experiences optimized for mobile

---

## 🔮 What's Next?

**Near-term:**
- Habit tracker (next diverse experience)
- Extract `@plokmin/pwa-common` (after 2-3 non-card experiences)
- Split `@plokmin/shared` → `@plokmin/card-common`

**See [ROADMAP.md](ROADMAP.md) for detailed plans**

---

**Remember:**
1. Read [VISION.md](VISION.md) for big picture
2. Read experience README for specific context
3. Follow Critical Rules
4. Write tests first
5. Run `npm run validate`

You'll be productive in <2 minutes! 🚀
