# RFC Index

**RFCs (Request for Comments)** document major technical decisions before implementation.

**Quick tip:** Always read the **README.md** in each RFC folder first (50-line summary). Only dive into specific sections when you need implementation details.

---

## 📋 Active RFCs

| # | Title | Status | Summary | Sections |
|---|-------|--------|---------|----------|
| 001 | Undo/Redo System | ✅ Implemented | [README](001-undo-redo/) | motivation, solution, implementation, testing |
| 002 | Game Sharing & Replay | 📝 Proposed | [README](002-game-sharing/) | motivation, solution, alternatives, implementation |
| 003 | Card Backs & Animations | 🔄 In Progress | [README](003-card-backs/) | motivation, solution, implementation (phases), testing |
| 004 | Movement Mechanics | 📋 Draft | [README](004-movement-mechanics/) | motivation, solution, implementation (phases), decisions |

---

## 🆕 Creating a New RFC

**Step 1:** Copy the template
```bash
cp -r rfcs/000-template rfcs/005-your-feature-name
cd rfcs/005-your-feature-name
```

**Step 2:** Edit README.md (the summary)
- Write a 50-line overview
- Link to sections you'll create

**Step 3:** Create section files as needed
- `01-motivation.md` - Why this RFC?
- `02-solution.md` - What are we proposing?
- `03-alternatives.md` - What else did we consider?
- `04-implementation.md` - How to build it
- `05-testing.md` - Test strategy
- `06-risks.md` - What could go wrong?
- `07-decisions.md` - Key decisions made

**Step 4:** Keep each section <200 lines
- If a section grows too large, split it into a subdirectory
- Example: `04-implementation/` with `phase-1.md`, `phase-2.md`, etc.

**Step 5:** Update this INDEX.md
- Add your RFC to the table above

---

## 📖 Reading RFCs

**As an AI agent:**
1. **Start with README.md** in the RFC folder (50-line summary)
2. **If you need more context**, read specific sections:
   - Need to understand the problem? → `01-motivation.md`
   - Need implementation steps? → `04-implementation.md`
   - Need test strategy? → `05-testing.md`
3. **Never read the entire RFC upfront** - it's designed to be modular

**Example workflow:**
```bash
# Starting work on card backs feature
cat rfcs/003-card-backs/README.md          # Quick overview
cat rfcs/003-card-backs/04-implementation/phase-1.md  # Phase 1 details
# Now start coding!
```

---

## 📏 RFC Size Guidelines

**Per-section limits:**
- `README.md` - 50 lines max (summary + navigation)
- `01-motivation.md` - 100 lines max
- `02-solution.md` - 150 lines max
- `03-alternatives.md` - 100 lines max
- `04-implementation.md` - 200 lines max (or split into subdirectory)
- `05-testing.md` - 100 lines max
- `06-risks.md` - 100 lines max
- `07-decisions.md` - 100 lines max

**If a section exceeds the limit:**
```bash
# Convert to subdirectory
mkdir 04-implementation
mv 04-implementation.md 04-implementation/README.md
# Then split into smaller files
touch 04-implementation/phase-1.md
touch 04-implementation/phase-2.md
```

---

## 🎯 RFC Lifecycle

```
1. PROPOSED    - Initial draft, gathering feedback
2. IN REVIEW   - Team reviewing, discussing
3. APPROVED    - Approved, ready to implement
4. IMPLEMENTING - Work in progress
5. IMPLEMENTED - Done, shipped
6. DEFERRED    - Good idea, wrong time
7. REJECTED    - Not moving forward
```

Update the status in the RFC's README.md.

---

## ✅ When to Write an RFC

**Write an RFC for:**
- ✅ Major features (undo/redo, multiplayer, etc.)
- ✅ Architectural changes (state management, library extraction)
- ✅ Features affecting multiple games
- ✅ Anything taking >1 day to implement
- ✅ Technical decisions with long-term impact

**Don't write an RFC for:**
- ❌ Bug fixes
- ❌ Small UI tweaks
- ❌ Obvious implementations
- ❌ Quick experiments

---

## 📚 Resources

- **Template:** [000-template/](000-template/) - Copy this for new RFCs
- **Examples:** See RFCs 001-004 for reference
- **Process details:** See [000-template/README.md](000-template/README.md)

---

## 🔍 Quick Search

Looking for a specific topic?

```bash
# Search all RFC summaries
grep -r "your topic" rfcs/*/README.md

# Search all implementation sections
grep -r "your topic" rfcs/*/04-implementation*

# Search entire RFC directory
grep -r "your topic" rfcs/
```

---

## 📊 RFC Statistics

- **Total RFCs:** 4
- **Implemented:** 1 (RFC-001)
- **In Progress:** 1 (RFC-003)
- **Proposed:** 2 (RFC-002, RFC-004)
- **Average sections per RFC:** 4-6
- **Max lines per RFC:** ~800 (split across sections)

---

**Remember:** RFCs are meant to be **modular and navigable**. Read summaries first, sections as needed, never the whole thing at once! 🚀
