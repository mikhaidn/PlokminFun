# Claude Code Guide

This file provides guidance for Claude Code and AI agents working with this repository.

## 🚀 Start Here

**For the fastest onboarding (30 seconds), read [AI_GUIDE.md](AI_GUIDE.md) first.**

That guide contains:
- Essential commands
- Critical rules you must follow
- Common tasks and workflows
- Testing strategy
- Common gotchas

## 📋 Quick Reference

### Before Starting Work
1. **Read [STATUS.md](STATUS.md)** - What's being worked on RIGHT NOW
2. **Read [ROADMAP.md](ROADMAP.md)** - What's coming next and why
3. **Check [rfcs/INDEX.md](rfcs/INDEX.md)** - Design decisions for major features

### Repository Structure
```
PlokminFun/
├── shared/           # @plokmin/shared library (reusable components/hooks)
├── freecell-mvp/     # FreeCell game
├── klondike-mvp/     # Klondike game
├── index.html        # Root landing page (GitHub Pages)
├── docs/             # Documentation
└── rfcs/             # Design documents (Request for Comments)
```

### Essential Commands
```bash
npm run validate      # Full check: typecheck + lint + test + build (what CI runs)
npm run typecheck     # Fast type checking (no build)
npm run lint:fix      # Auto-fix lint issues (unused imports, spacing, etc.)
npm test              # Run all tests
npm run build         # Build everything
```

## 🎯 Critical Rules

### 1. Always Import from @plokmin/shared
```typescript
// ✅ CORRECT
import { GameControls, useGameHistory } from '@plokmin/shared';

// ❌ WRONG - Never duplicate shared code locally
import { GameControls } from './components/GameControls';
```

### 2. Immutable State Updates
```typescript
// ✅ CORRECT
const newState = { ...gameState, moves: gameState.moves + 1 };

// ❌ WRONG
gameState.moves++;
```

### 3. Run Validation Before Committing
```bash
npm run validate      # Runs: typecheck + lint + test + build (same as CI)
npm run lint:fix      # If lint fails, auto-fix most issues
```

**Pro tip:** Install pre-commit hooks to catch issues automatically:
```bash
npm run setup-hooks   # One-time setup, blocks bad commits
```

### 4. Read Code Before Modifying
- NEVER propose changes to code you haven't read
- Use the Read tool to understand existing patterns
- Follow the existing code style

## 📖 Documentation Map

| Task | File to Read |
|------|-------------|
| **Quick start** | [AI_GUIDE.md](AI_GUIDE.md) |
| **Current work** | [STATUS.md](STATUS.md) |
| **Priorities** | [ROADMAP.md](ROADMAP.md) |
| **Design decisions** | [rfcs/INDEX.md](rfcs/INDEX.md) |
| **Validation/CI** | [scripts/README.md](scripts/README.md) |
| **Architecture** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Deployment** | [docs/deployment/README.md](docs/deployment/README.md) |
| **Game rules** | [docs/games/](docs/games/) |
| **All docs** | [DOCS.md](DOCS.md) |
| **For humans** | [README.md](README.md) |

## 🧪 Testing Requirements

- ✅ Write tests for all game logic
- ✅ Use TDD (test first, then implement)
- ✅ Aim for >95% coverage on core modules
- ✅ Run `npm test` before committing

## 🛠️ Common Tasks

### Development Workflow
```bash
# First-time setup (recommended)
npm run setup-hooks    # Install pre-commit validation

# Work on specific game (from repo root)
npm run dev:freecell   # Or npm run dev:klondike
npm run test:watch     # TDD mode (all workspaces)

# Quick validation
npm run typecheck      # Fast type checking (no build)
npm run lint:fix       # Auto-fix lint issues

# Full validation (what CI runs)
npm run validate       # Runs: typecheck + lint + test + build
```

### Adding New Features
1. Check if there's an RFC in [rfcs/INDEX.md](rfcs/INDEX.md)
2. Read the RFC's README.md (not the full RFC unless needed)
3. Follow the implementation plan
4. Write tests first (TDD)
5. Run validation before committing

## 🚫 Don't Do (Unless Explicitly Requested)

- Add features beyond what's asked
- Refactor unrelated code
- Add unnecessary abstractions
- Create helpers for one-time operations
- Add error handling for impossible scenarios
- Add comments to code you didn't change

## ✅ Always Do

- Read existing code before modifying
- Write tests first (TDD)
- Keep changes focused and minimal
- Update documentation when changing architecture
- Follow existing patterns and conventions

## 🌐 Deployment

- **Live site:** https://mikhaidn.github.io/PlokminFun/
- **Deployment:** Automatic on push to `main`
- **Root page:** `/index.html` (game selector landing page)
- **CI/CD:** `.github/workflows/deploy.yml`

See [docs/deployment/github-pages.md](docs/deployment/github-pages.md) for details.

## 🆘 Common Issues

**Build failing?**
- Check if shared library is built: `npm run build:shared`

**Tests failing?**
- Make sure you're in the right directory

**Import errors?**
- Check tsconfig path mappings
- Ensure you're importing from `@plokmin/shared`

**Type errors?**
- Run `npm run lint` for details

## 📊 Project Stats

- **Languages:** TypeScript, React
- **Tests:** 1,600+ across all packages
- **Coverage:** >95% on core modules
- **Games:** 2 live (FreeCell, Klondike)
- **Shared components:** GameControls, DraggingCardPreview, Card, CardBack
- **Shared hooks:** useGameHistory, useCardInteraction

---

**For detailed implementation guidance, see [AI_GUIDE.md](AI_GUIDE.md)** 🚀
