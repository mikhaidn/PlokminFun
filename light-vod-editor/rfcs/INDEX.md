# RFC Index - Light VOD Editor

**RFCs (Request for Comments)** document major technical decisions before implementation.

---

## 📋 Active RFCs

| # | Title | Status | Summary | Sections |
|---|-------|--------|---------|----------|
| 001 | Video Trimmer MVP | 📝 Proposed | [README](001-video-trimmer-mvp/) | motivation, solution, alternatives, implementation, testing, risks |

---

## 🆕 Creating a New RFC

**Step 1:** Copy the template (if one exists)
```bash
mkdir rfcs/002-your-feature-name
cd rfcs/002-your-feature-name
```

**Step 2:** Create README.md with summary (≤50 lines)

**Step 3:** Create section files as needed:
- `01-motivation.md` - Why this RFC?
- `02-solution.md` - What are we proposing?
- `03-alternatives.md` - What else did we consider?
- `04-implementation.md` - How to build it
- `05-testing.md` - Test strategy
- `06-risks.md` - What could go wrong?

**Step 4:** Update this INDEX.md

---

## 📖 Reading RFCs

1. **Start with README.md** in the RFC folder (quick summary)
2. **Dive into sections** as needed
3. **Never read entire RFC upfront** - use it as reference

---

## 🎯 RFC Lifecycle

```
1. PROPOSED    - Initial draft, gathering feedback
2. APPROVED    - Ready to implement
3. IMPLEMENTING - Work in progress
4. IMPLEMENTED - Done, shipped
5. DEFERRED    - Good idea, wrong time
6. REJECTED    - Not moving forward
```

---

## ✅ When to Write an RFC

**Write an RFC for:**
- ✅ Major features (video editing, export system)
- ✅ Architectural changes (new libraries, APIs)
- ✅ Features taking >1 day to implement
- ✅ Technical decisions with long-term impact

**Don't write an RFC for:**
- ❌ Bug fixes
- ❌ Small UI tweaks
- ❌ Obvious implementations
- ❌ Quick experiments

---

**Current project:** Light VOD Editor - Browser-based video trimming with audio overlay.
