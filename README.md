# ✨ Plokmin Consortium

A collection of interactive web experiences - each standalone, delightful, and mobile-first.

🌐 **Live:** [mikhaidn.github.io/PlokminFun](https://mikhaidn.github.io/PlokminFun/)

---

## 🎯 What is This?

**Plokmin Consortium** is a collection of diverse interactive web experiences. Think Neal.fun - each page is its own experience, from games to productivity tools.

**Current Philosophy:** Build experiences, discover patterns, extract commonalities naturally (not upfront).

---

## 🎮 Experiences

| Experience | Type | Status | Try It |
|------------|------|--------|--------|
| **Dog Care Tracker** 🐕 | Productivity | ✅ Live | [Track](https://mikhaidn.github.io/PlokminFun/dog-care-tracker/) |
| **FreeCell** 🃏 | Card Game | ✅ Live | [Play](https://mikhaidn.github.io/PlokminFun/freecell/) |
| **Klondike** 🎴 | Card Game | ✅ Live | [Play](https://mikhaidn.github.io/PlokminFun/klondike/) |
| Habit Tracker | Productivity | 🚧 Planned | - |
| Spider Solitaire | Card Game | 🚧 Planned | - |

---

## 🏗️ Architecture

### Monorepo Structure

```
Plokmin/
├── shared/              # @plokmin/shared (card game utilities)
├── dog-care-tracker/    # Dog activity tracking PWA
├── freecell-mvp/        # FreeCell solitaire
├── klondike-mvp/        # Klondike solitaire
└── index.html           # Landing page (experience selector)
```

### Tech Stack
- **React + TypeScript** - Type-safe components
- **Vite** - Fast builds and dev server
- **npm workspaces** - Monorepo management
- **GitHub Pages** - Zero-cost hosting
- **PWA** - Offline-capable, installable

### Design Philosophy

**Self-contained experiences:**
- Each experience is independently understandable
- Minimal shared dependencies (avoid coupling)
- Own README with full context

**Extract patterns naturally:**
- Build 2-3 experiences first
- Identify truly common patterns
- Extract shared libraries when clear benefit
- Don't prematurely abstract

**AI-optimized documentation:**
- Clear vision (VISION.md)
- Experience-specific context (per-directory READMEs)
- Quick onboarding (<2 min to productivity)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Installation & Development

```bash
# Install all dependencies
npm install

# Run specific experience
npm run dev:dog         # Dog Care Tracker
npm run dev:freecell    # FreeCell
npm run dev:klondike    # Klondike

# Run validation (what CI runs)
npm run validate        # lint + test + build

# Auto-fix issues
npm run format          # Prettier formatting
npm run lint:fix        # ESLint auto-fixes
```

---

## 📚 Documentation

### 🎯 Start Here
- **[VISION.md](VISION.md)** - Big picture: What is Plokmin Consortium and why? **(READ FIRST)**
- **[AI_GUIDE.md](AI_GUIDE.md)** - 30-second quick start for AI agents
- **[STATUS.md](STATUS.md)** - Current work and recent completions

### 📖 Deep Dives
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture and design patterns
- **[ROADMAP.md](ROADMAP.md)** - Future plans and priorities
- **[rfcs/](rfcs/)** - Design proposals (Request for Comments)

### 🎮 Per-Experience Docs
- **[dog-care-tracker/README.md](dog-care-tracker/README.md)** - Dog tracking PWA
- **[freecell-mvp/](freecell-mvp/)** - FreeCell card game
- **[klondike-mvp/](klondike-mvp/)** - Klondike card game

---

## 🤝 Contributing

### Before Starting Work
1. **Read [VISION.md](VISION.md)** - Understand the big picture
2. **Check [STATUS.md](STATUS.md)** - See current work
3. **Review experience README** - Get specific context

### Development Workflow
```bash
# 1. Make changes
npm run dev:dog

# 2. Validate before committing
npm run validate

# 3. Auto-fix common issues
npm run format
npm run lint:fix

# 4. Commit and push
git add .
git commit -m "feat: your changes"
git push
```

### Quality Standards
- ✅ Write tests first (TDD approach)
- ✅ Run `npm run validate` before push
- ✅ Lint and format must pass
- ✅ >95% coverage on core logic
- ✅ Mobile-first design
- ✅ PWA-capable (offline, installable)

---

## 📦 Project Stats

### Code Quality
- **Tests:** 560+ across all experiences
- **Coverage:** >95% on core modules
- **Type Safety:** TypeScript strict mode
- **Linting:** ESLint + Prettier, zero errors

### Experiences
- **Live:** 3 (Dog Tracker, FreeCell, Klondike)
- **Planned:** 3+ (Habit Tracker, Spider, Pyramid)
- **Architecture:** Monorepo with shared libraries

### Deployment
- **Platform:** GitHub Pages (auto-deploy on push to `main`)
- **Uptime:** 100%
- **Build Time:** ~2-3 minutes
- **Bundle Sizes:** 48KB (dog), 101KB (freecell), 104KB (klondike) gzipped

---

## 🎨 Design Principles

### 1. Experience-First
- Self-contained and understandable alone
- Mobile-first design
- Offline-capable PWA
- Polished details

### 2. Experiment-Driven
- Build → Observe → Extract patterns
- Don't design abstractions upfront
- Let shared libraries emerge naturally

### 3. AI-Optimized Docs
- Clear vision in one place
- Experience-specific READMEs
- Quick context (<2 min onboarding)

---

## 🌐 Deployment

**Live Site:** https://mikhaidn.github.io/PlokminFun/

### Per-Experience URLs
- Root: `/` (experience selector)
- Dog Tracker: `/dog-care-tracker/`
- FreeCell: `/freecell/`
- Klondike: `/klondike/`

### Deployment Process
1. Push to `main` branch
2. GitHub Actions runs CI/CD
3. Builds all experiences
4. Deploys to GitHub Pages
5. Live in ~2-3 minutes

See **[docs/deployment/github-pages.md](docs/deployment/github-pages.md)** for details.

---

## 🔮 Future Plans

### Near-Term (Next 2 Months)
- Habit tracker (experiment with non-card PWA patterns)
- Extract `@plokmin/pwa-common` (localStorage, PWA setup)
- Split `@plokmin/shared` → `@plokmin/card-common`
- Add 2-3 more card games

### Long-Term Vision
- 10+ diverse experiences
- Mature shared library ecosystem
- <2 minute AI agent onboarding
- 1-2 day new experience launch time

See **[ROADMAP.md](ROADMAP.md)** for detailed plans.

---

## 📄 License

[Add your license here]

---

## 🐛 Issues & Feedback

- **Bug Reports:** [Create an issue](https://github.com/mikhaidn/PlokminFun/issues)
- **Feature Requests:** Check [ROADMAP.md](ROADMAP.md) first, then create issue
- **Questions:** See [DOCS.md](DOCS.md) for full documentation index

---

**Built with ❤️ by the Plokmin Consortium**
