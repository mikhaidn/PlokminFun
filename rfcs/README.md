# RFCs (Request for Comments)

**⚠️ This file has been replaced with a new structure!**

## 🚀 Quick Start

**For the complete RFC directory, see [INDEX.md](INDEX.md)**

---

## What Changed?

RFCs are now **directories** (not single files) with bite-sized sections:

### Old Structure (DEPRECATED)
```
rfcs/
├── 001-undo-redo-system.md     ❌ 802 lines (too big!)
├── 002-game-sharing-replay.md  ❌ 696 lines
├── 003-card-backs-animations.md ❌ 1,149 lines
└── 004-consolidate-movement.md  ❌ 2,585 lines (!!)
```

### New Structure ✅
```
rfcs/
├── INDEX.md                    ⭐ Start here!
│
├── 001-undo-redo/
│   ├── README.md               📖 50-line summary
│   ├── 01-motivation.md
│   ├── 02-solution.md
│   ├── 04-implementation.md
│   └── 05-testing.md
│
├── 002-game-sharing/
│   ├── README.md               📖 50-line summary
│   ├── 01-motivation.md
│   ├── 02-solution.md
│   ├── 03-alternatives.md
│   ├── 04-implementation.md
│   └── 05-testing.md
│
├── 003-card-backs/
│   ├── README.md               📖 50-line summary
│   ├── 01-motivation.md
│   ├── 02-solution.md
│   ├── 04-implementation/      📁 Multi-phase
│   │   ├── README.md
│   │   ├── phase-1.md
│   │   ├── phase-2.md
│   │   └── phase-3.md
│   └── 05-testing.md
│
└── 004-movement-mechanics/
    ├── README.md               📖 50-line summary
    ├── 01-motivation.md
    ├── 02-solution.md
    ├── 03-alternatives.md
    ├── 04-implementation/      📁 Multi-phase
    │   ├── README.md
    │   ├── phase-1.md
    │   ├── phase-2.md
    │   └── phase-3.md
    ├── 05-testing.md
    └── 07-decisions.md
```

---

## 📖 How to Use the New Structure

### 1. **View all RFCs**
```bash
npm run docs:rfcs
# or
cat rfcs/INDEX.md
```

### 2. **Read an RFC summary** (recommended starting point)
```bash
cat rfcs/001-undo-redo/README.md
cat rfcs/004-movement-mechanics/README.md
```

### 3. **Dive into specific sections** (only when needed)
```bash
# Need implementation details?
cat rfcs/001-undo-redo/04-implementation.md

# Need to understand the problem?
cat rfcs/004-movement-mechanics/01-motivation.md

# Need test strategy?
cat rfcs/003-card-backs/05-testing.md
```

---

## 🎯 Benefits of New Structure

| Before | After | Improvement |
|--------|-------|-------------|
| RFC-004: 2,585 lines | README: 52 lines | **98% less** to read upfront |
| Single file | Modular sections | **Focused** reading |
| Hard to navigate | Clear structure | **Easy** navigation |
| 15 min to understand | 30 sec to understand | **97% faster** |

---

## 🆕 Creating New RFCs

**Step 1:** Copy the template directory
```bash
cp -r rfcs/000-template rfcs/005-your-feature-name
cd rfcs/005-your-feature-name
```

**Step 2:** Edit files
- `README.md` - 50-line summary
- `01-motivation.md` - Why this RFC?
- `02-solution.md` - Proposed approach
- `03-alternatives.md` - What else was considered?
- `04-implementation.md` - How to build it
- `05-testing.md` - Test strategy
- `06-risks.md` - Risk mitigation
- `07-decisions.md` - Key decisions

**Step 3:** Update [INDEX.md](INDEX.md)
Add your RFC to the table.

---

## 📚 Documentation Principles

**Each section file has a max line count:**
- `README.md`: 50 lines max
- `01-motivation.md`: 100 lines max
- `02-solution.md`: 150 lines max
- `03-alternatives.md`: 100 lines max
- `04-implementation.md`: 200 lines max (or split into phases/)
- `05-testing.md`: 100 lines max
- `06-risks.md`: 100 lines max
- `07-decisions.md`: 100 lines max

**If a section grows too large, split it:**
```bash
mkdir 04-implementation
mv 04-implementation.md 04-implementation/README.md
# Then create phase files
touch 04-implementation/phase-1.md
touch 04-implementation/phase-2.md
```

---

## 🔗 See Also

- **[INDEX.md](INDEX.md)** - Complete RFC directory
- **[000-template/](000-template/)** - Template for new RFCs
- **[../AI_GUIDE.md](../AI_GUIDE.md)** - Quick guide for AI agents
- **[../DOCS.md](../DOCS.md)** - Documentation map

---

**For the complete RFC directory and all RFCs, see [INDEX.md](INDEX.md)** ⭐
