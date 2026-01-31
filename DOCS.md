# Documentation Guide

**⚡ New here? Start with these 3 files:**
1. **[STATUS.md](STATUS.md)** - What's being worked on right now
2. **[ROADMAP.md](ROADMAP.md)** - What's coming next and why
3. **[AI_GUIDE.md](AI_GUIDE.md)** - Quick reference for AI agents

**Then run:** `npm install && npm run build && npm test`

---

## 📚 Documentation Map

### For AI Agents
- **[AI_GUIDE.md](AI_GUIDE.md)** ⭐ Essential rules, commands, and gotchas (~150 lines)
- **[NPM_SCRIPTS.md](NPM_SCRIPTS.md)** - Complete npm command reference

### Current Work
- **[STATUS.md](STATUS.md)** - Sprint status (updated weekly)
- **[ROADMAP.md](ROADMAP.md)** - Strategic priorities and next steps

### Understanding the System
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Long-term architectural vision
- **[rfcs/INDEX.md](rfcs/INDEX.md)** - Technical design decisions (RFCs)

### Specific Topics
- **[docs/deployment/](docs/deployment/)** - Deployment guides (GitHub Pages, PWA, native)
- **[docs/accessibility/](docs/accessibility/)** - Responsive design and accessibility
- **[docs/games/](docs/games/)** - Game-specific documentation (FreeCell, Klondike)
- **[docs/development/](docs/development/)** - Development guides (testing, versioning, monorepo)

---

## 🔍 Quick Navigation

### "I want to..."

| Goal | Documentation |
|------|---------------|
| Add a new feature | Read [STATUS.md](STATUS.md), check [rfcs/INDEX.md](rfcs/INDEX.md) |
| Fix a bug | See [docs/games/](docs/games/) for game-specific info |
| Deploy the app | Read [docs/deployment/README.md](docs/deployment/README.md) |
| Understand architecture | Read [ARCHITECTURE.md](ARCHITECTURE.md) |
| See what's next | Read [ROADMAP.md](ROADMAP.md) |
| Write an RFC | Copy [rfcs/000-template/](rfcs/000-template/) |
| Run tests | See [docs/development/testing.md](docs/development/testing.md) |
| Work on accessibility | Read [docs/accessibility/README.md](docs/accessibility/README.md) |

---

## 📦 Repository Structure

```
CardGames/                    # Monorepo root
├── shared/                   # @plokmin/shared library
├── freecell-mvp/             # FreeCell game
├── klondike-mvp/             # Klondike game
├── docs/                     # Detailed documentation
├── rfcs/                     # Technical design documents
└── package.json              # Root workspace config
```

---

## 🎯 Decision Tree for AI Agents

```
Starting a task?
│
├─ Is it already in progress?
│  └─ YES → Read STATUS.md to see current state
│  └─ NO → Continue
│
├─ Is there an RFC for this?
│  └─ Check rfcs/INDEX.md
│  └─ YES → Read the RFC's README.md
│  └─ NO → Consider writing one (if major feature)
│
├─ Need implementation details?
│  └─ Game-specific? → docs/games/
│  └─ Deployment? → docs/deployment/
│  └─ Accessibility? → docs/accessibility/
│  └─ Testing? → docs/development/testing.md
│
└─ Start coding!
   └─ Follow rules in AI_GUIDE.md
   └─ Run: npm run lint && npm test
```

---

## 🚀 Common Commands

```bash
# Full validation (what CI runs)
npm run lint && npm test && npm run build

# Work on specific package
cd freecell-mvp && npm run test:watch
cd klondike-mvp && npm run test:watch
cd shared && npm run test:watch

# View documentation
npm run docs              # This file
npm run docs:ai           # AI_GUIDE.md
npm run docs:rfcs         # RFC index
npm run docs:deployment   # Deployment guide
```

---

## 📖 Documentation Principles

**Keep it:**
- **Bite-sized:** No file >200 lines (use subdirectories for large topics)
- **Focused:** One topic per file
- **Current:** Update STATUS.md weekly, ROADMAP.md monthly
- **Navigable:** Always provide "next steps" and links

**Avoid:**
- Duplicating information across files
- Historical information (use git history instead)
- Implementation details in overview docs (link to details instead)

---

## 🆘 Still Lost?

**Can't find what you need?**
1. Check the table above ("I want to...")
2. Search all docs: `npm run docs:search "your query"`
3. Ask in GitHub Discussions

**Something outdated?**
- Create an issue or PR to update the docs
- Docs live alongside code - keep them in sync!
