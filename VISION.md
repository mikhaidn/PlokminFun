# Plokmin Consortium Vision

**The Big Picture:** A collection of diverse interactive web experiences, each standalone and delightful.

---

## 🎯 What is Plokmin Consortium?

**Plokmin Consortium** is a collection of interactive web experiences - NOT just card games. Think Neal.fun but for varied interactive tools, games, and utilities.

### Current Experiences
1. **Dog Care Tracker** 🐕 - Mobile-first PWA for tracking dog activities and coordinating with caretakers
2. **FreeCell** 🃏 - Strategic solitaire with perfect information
3. **Klondike** 🎴 - Classic solitaire everyone knows

### Planned Experiences
- Habit Tracker - Track and build positive habits
- More card games (Spider, Pyramid, Tri-Peaks)
- Other interactive tools and mini-experiences

---

## 🏗️ Architecture Philosophy

### Monorepo Strategy
Each experience is **independently deployable** but shares common infrastructure:

```
Plokmin/
├── shared/              # @plokmin/shared (will become @plokmin/shared)
│   └── card-common/     # Card-specific utilities (future split)
├── pwa-common/          # PWA, localStorage patterns (future extraction)
├── dog-care-tracker/    # Standalone experience #1
├── habit-tracker/       # Standalone experience #2 (planned)
├── freecell-mvp/        # Card game experience
├── klondike-mvp/        # Card game experience
└── index.html           # Landing page (experience selector)
```

### Shared vs. Specific
**Shared Library Goals:**
- Extract **universal patterns** only (don't prematurely abstract)
- Current: Card game components (GameControls, useGameHistory, etc.)
- Future: PWA setup, localStorage hooks, common UI patterns

**When to share:**
1. Pattern appears in 3+ experiences
2. Clear abstraction boundary
3. Saves meaningful maintenance burden

**When NOT to share:**
1. Experience-specific logic
2. Unclear abstraction
3. Would complicate rather than simplify

---

## 🎨 Design Principles

### 1. Experience-First
Each experience should be:
- **Self-contained** - Can understand it without context from others
- **Mobile-first** - Optimized for on-the-go use
- **Offline-capable** - PWA with service worker
- **Delightful** - Polish the details

### 2. Experiment-Driven Evolution
**Strategy:**
1. Build 2-3 experiences standalone
2. Observe common patterns naturally emerging
3. Extract shared libraries only when patterns are clear
4. Keep experiences decoupled

**Don't:** Design abstract systems upfront
**Do:** Let abstractions emerge from real use cases

### 3. AI Agent Optimization
Documentation optimized for AI context efficiency:
- Clear vision in one place (this file)
- Experience-specific READMEs with all context
- Minimal cross-references needed
- Each experience understandable in isolation

---

## 📦 Per-Experience Requirements

Every experience should have:

### Technical
- ✅ TypeScript + React (for consistency)
- ✅ Vite build setup
- ✅ ESLint + Prettier configuration
- ✅ Basic test coverage (vitest)
- ✅ PWA manifest
- ✅ Service worker for offline
- ✅ localStorage for persistence

### Documentation
- ✅ README.md with full context
- ✅ Clear use case explanation
- ✅ Screenshots or demo GIFs
- ✅ Mobile-first design notes

### Deployment
- ✅ GitHub Pages deployment
- ✅ Subdirectory route (`/dog-care-tracker/`)
- ✅ Independent build process
- ✅ Listed on root landing page

---

## 🔮 Future Evolution

### Phase 1: Experiment (Current)
- Build 2-3 diverse experiences (card games + dog tracker + habit tracker)
- Keep mostly independent
- Identify natural patterns

### Phase 2: Extract PWA Patterns
Once we have 3+ experiences, extract:
- `@plokmin/pwa-common` - PWA setup, service worker templates
- `useLocalStorage<T>()` hook
- `usePersistedState<T>()` hook
- PWA manifest generation utilities

### Phase 3: Split Shared Library
When card-specific code becomes burden:
- `@plokmin/card-common` - Card components, game utilities
- `@plokmin/pwa-common` - PWA and storage patterns
- `@plokmin/ui-common` - Generic UI primitives (if needed)

### Phase 4: Scale
- 10+ diverse experiences
- Mature shared libraries
- Clear documentation patterns
- Efficient AI agent onboarding

---

## 🎯 Success Metrics

### User-Facing
- Each experience is **delightful** to use
- Mobile experience is **excellent**
- Works **offline** reliably
- **Fast** page loads (<2s)

### Developer-Facing
- AI agents can **understand any experience** in <1 minute
- New experiences can **launch in 1-2 days**
- Shared libraries **reduce boilerplate** by 50%+
- Code quality stays **high** (>95% test coverage on core)

### Collection-Level
- **Diverse** experiences (not just one category)
- **Regular** new additions (1-2 per month)
- **Consistent** quality bar across all experiences
- **Low maintenance** burden per experience

---

## 📘 For AI Agents

**Starting work on an experience?**
1. Read `/[experience]/README.md` first (full context)
2. Read `VISION.md` (this file) for big picture
3. Check `STATUS.md` for current work
4. Start coding!

**Don't need to read:**
- Other experience directories (unless sharing code)
- Full architecture docs (unless changing architecture)
- Historical RFC context (unless touching that system)

**The goal:** Get productive in <2 minutes, not 15 minutes.

---

## 🚀 Why "Plokmin Consortium"?

- **Plokmin** - Unique, memorable, brandable
- **Consortium** - Collection of independent entities working together
- **Playful** - Not too serious, invites experimentation
- **Distinct** - Not tied to any single category (cards, habits, etc.)

---

## 📞 Quick Links

- **Vision** - This file (VISION.md)
- **Current Work** - STATUS.md
- **Getting Started** - README.md
- **AI Quick Guide** - AI_GUIDE.md
- **Architecture** - ARCHITECTURE.md (deep dive)
