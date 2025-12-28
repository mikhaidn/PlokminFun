# Known Issues & Improvements

**Last Updated:** 2025-12-28
**Source:** Comprehensive usability analysis (see [usability-analysis.md](usability-analysis.md))

This file tracks all known usability issues, bugs, and potential improvements identified through player testing and code analysis.

---

## 🎯 Quick Wins (Completed)

- [x] **#1** Smart tap-to-move OFF by default on mobile → **FIXED** ✅
- [x] **#2** No invalid move feedback → **FIXED** ✅
- [x] **#3** Stock recycle button unclear → **FIXED** ✅
- [x] **#4** No face-down card count indicator → **FIXED** ✅
- [x] **#5** Draw-3 mode not implemented → **FIXED** ✅ (2025-12-28)
- [x] **#6** No Help/Rules screen → **FIXED** ✅ (2025-12-28)

---

## 🔥 Critical Priority (Implement Next)

**No critical issues remaining!** 🎉

All critical usability issues have been addressed. The next priorities are high-priority improvements to enhance the player experience.

---

## 🔴 High Priority

### **#7 - Auto-Move Behavior Unclear (FreeCell)**
**Status:** ⚠️ High
**Game:** FreeCell
**Effort:** 2 hours
**Impact:** MEDIUM - Confuses new players

**Description:**
Cards automatically move to foundations after 300ms with no visual warning. Players don't understand why cards are moving on their own.

**Tasks:**
- [ ] Add setting: "Auto-move Delay" (0ms, 300ms, 500ms, 1000ms, OFF)
- [ ] Show pulse/glow animation before auto-move
- [ ] Add first-time tooltip: "Cards auto-move to foundations when safe"
- [ ] Update SettingsModal

**Files:**
- `freecell-mvp/src/components/GameBoard.tsx:118-149`
- `shared/components/SettingsModal.tsx`

---

### **#8 - Hints System Unclear (FreeCell)**
**Status:** ⚠️ High
**Game:** FreeCell
**Effort:** 2 hours
**Impact:** MEDIUM - Hints don't explain what they show

**Description:**
Hints button highlights cards without explaining which/why. No indication of WHERE to move them.

**Tasks:**
- [ ] Add hint levels: "Basic" (current), "Detailed" (shows arrows), "Off"
- [ ] First-time tooltip: "Hints highlight cards that can move to foundations"
- [ ] Consider showing best move suggestion
- [ ] Update hint button tooltip

**Files:**
- `freecell-mvp/src/rules/hints.ts`
- `freecell-mvp/src/components/GameBoard.tsx`

---

### **#9 - No Hints System in Klondike**
**Status:** ⚠️ High
**Game:** Klondike
**Effort:** 2-3 hours
**Impact:** MEDIUM - Inconsistent with FreeCell

**Description:**
FreeCell has hints, Klondike doesn't. Creates inconsistent experience. Klondike is harder for beginners.

**Tasks:**
- [ ] Port FreeCell hints logic to Klondike
- [ ] Highlight foundation-ready cards
- [ ] Suggest strategic moves (flip face-down, empty columns for Kings)
- [ ] Add hints button to GameControls
- [ ] Add 8+ tests

**Files:**
- `klondike-mvp/src/rules/hints.ts` (new)
- `klondike-mvp/src/components/GameBoard.tsx`

---

### **#10 - Empty Tableau Rule Not Explained (Klondike)**
**Status:** ⚠️ High
**Game:** Klondike
**Effort:** 30 min
**Impact:** MEDIUM - Frequent confusion

**Description:**
Players try to move non-King cards to empty columns (works in FreeCell). No feedback explaining WHY it failed.

**Tasks:**
- [x] Tooltip on empty column: "Only Kings can start a new column" → In progress via invalid move system
- [ ] When invalid move attempted, show reason in shake tooltip
- [ ] Add to Help modal rules

**Files:**
- `klondike-mvp/src/rules/moveValidation.ts`
- Will use existing invalid move feedback system

---

### **#11 - Max Stack Movement Not Explained (FreeCell)**
**Status:** ⚠️ High
**Game:** FreeCell
**Effort:** 1 hour
**Impact:** MEDIUM - Players don't understand blocked moves

**Description:**
Formula `(emptyFreeCells + 1) × 2^(emptyTableauColumns)` is not shown. When blocked, no explanation why.

**Tasks:**
- [ ] Show tooltip on blocked move: "Need X free cells or empty columns to move this sequence"
- [ ] Add visual indicator on sequences (checkmark if movable)
- [ ] Document formula in Help modal

**Files:**
- `freecell-mvp/src/rules/validation.ts`
- Use invalid move feedback system with calculated reason

---

## 🟡 Medium Priority

### **#12 - No "Show Valid Moves" Toggle**
**Status:** ⏸️ Medium
**Game:** Both
**Effort:** 1-2 hours

**Description:**
Valid destinations only highlighted with smart tap enabled. Beginners want to see valid moves always.

**Tasks:**
- [ ] Add setting: "Highlight Valid Moves" (Always / Smart Tap Only / Never)
- [ ] Update useCardInteraction to support "always" mode
- [ ] Helps beginners learn rules

---

### **#13 - Win Celebration Not Granular**
**Status:** ⏸️ Medium
**Game:** Both
**Effort:** 1 hour

**Description:**
Win celebration is binary (on/off). Some players want animation without confetti.

**Tasks:**
- [ ] Change to: "Win Celebration Style"
  - Confetti + Animation (current)
  - Animation Only
  - Simple Message
  - None
- [ ] Update SettingsModal

**Files:**
- `shared/types/GameSettings.ts`
- `shared/components/SettingsModal.tsx`
- `shared/components/WinCelebration.tsx`

---

### **#14 - Game Mode Settings Confusing**
**Status:** ⏸️ Medium
**Game:** Both
**Effort:** 2 hours

**Description:**
Four game modes with overlapping features. "Standard" vs "Easy to See" differences unclear.

**Tasks:**
- [ ] Rename "Easy to See" → "High Visibility"
- [ ] Show detailed list of what each mode changes
- [ ] Add preview thumbnails or examples
- [ ] Allow custom mode (mix-and-match settings)

**Files:**
- `shared/components/SettingsModal.tsx`

---

### **#15 - Drag Physics Setting Hidden**
**Status:** ⏸️ Medium
**Game:** Both
**Effort:** 1 hour

**Description:**
"Bouncy" vs "Smooth" vs "Instant" drag physics buried in settings, not well explained.

**Tasks:**
- [ ] Show example animation on hover
- [ ] Explain hardware acceleration
- [ ] Make more discoverable (first-run tutorial)

---

### **#16 - No Settings Reset Confirmation**
**Status:** ⏸️ Medium
**Game:** Both
**Effort:** 30 min

**Description:**
"Reset to Defaults" button has no confirmation. Easy to click accidentally.

**Tasks:**
- [ ] Add confirmation dialog: "Reset all settings to defaults?"
- [ ] Show what will change before confirming
- [ ] Add "Restore Last Session" option

**Files:**
- `shared/components/SettingsModal.tsx`

---

### **#17 - No Visual Distinction Between Move Types**
**Status:** ⏸️ Medium
**Game:** Both
**Effort:** 1-2 hours

**Description:**
All valid moves look the same. No indication if move is to foundation vs tableau.

**Tasks:**
- [ ] Color-code destinations:
  - Green: Foundation
  - Yellow: Tableau
  - Blue: Free cell
- [ ] Add icons or labels to highlighted cells
- [ ] Option to disable for minimalists

---

### **#18 - No Flip Animation Speed Control**
**Status:** ⏸️ Medium
**Game:** Klondike
**Effort:** 30 min

**Description:**
Card flip is fixed at 300ms. Some players want faster/slower.

**Tasks:**
- [ ] Add setting: "Card Flip Speed" (Instant / Fast / Normal / Slow)
  - Instant: 0ms
  - Fast: 150ms
  - Normal: 300ms
  - Slow: 500ms

**Files:**
- `shared/components/SettingsModal.tsx`
- `klondike-mvp/src/components/StockWaste.tsx`

---

### **#19 - No Undo Limit Configuration**
**Status:** ⏸️ Medium
**Game:** Both
**Effort:** 1 hour

**Description:**
Undo history is fixed at 100 moves. Some players want unlimited.

**Tasks:**
- [ ] Add setting: "Undo History" (50 / 100 / 200 / Unlimited)
- [ ] Show warning if reaching limit
- [ ] Consider memory implications

**Files:**
- `freecell-mvp/src/components/GameBoard.tsx:41`
- `klondike-mvp/src/components/GameBoard.tsx:41`

---

## 🟢 Low Priority (Future)

### **#20 - No Color Blind Mode**
**Status:** 📋 Low
**Effort:** 8-10 hours

**Tasks:**
- [ ] Add presets: Protanopia, Deuteranopia, Tritanopia
- [ ] Use patterns/symbols in addition to colors
- [ ] Test with color blindness simulators

---

### **#21 - No Dark Mode**
**Status:** 📋 Low
**Effort:** 6-8 hours

**Tasks:**
- [ ] Add "Theme" setting: Light / Dark / Auto
- [ ] Update all UI elements
- [ ] Adjust felt colors for dark mode

---

### **#22 - No Keyboard Shortcut Customization**
**Status:** 📋 Low
**Effort:** 4-6 hours

**Tasks:**
- [ ] Add "Keyboard Shortcuts" section in settings
- [ ] Allow remapping all shortcuts
- [ ] Show hints on button hover
- [ ] Export/import profiles

---

### **#23 - No Sound Effect Volume Control**
**Status:** 📋 Low
**Effort:** 2 hours (when sound implemented)

**Tasks:**
- [ ] Master volume slider
- [ ] Individual effect volumes
- [ ] Mute button
- [ ] Sound effect preview

---

### **#24 - No Stack Movement Visual Assistance**
**Status:** 📋 Low
**Effort:** 2 hours

**Tasks:**
- [ ] Add "Stack Movement Assistance" setting:
  - Full: Highlight entire movable sequence
  - Minimal: Show number badge
  - Off: Current behavior

---

### **#25 - No Interactive Tutorial**
**Status:** 📋 Low
**Effort:** 10-15 hours

**Tasks:**
- [ ] First-time user onboarding
- [ ] Interactive step-by-step tutorial
- [ ] Game-specific guides
- [ ] Skip option

---

## 📊 Summary

| Priority | Count | Total Effort |
|----------|-------|--------------|
| **Critical** | 1 | 3-4 hours |
| **High** | 5 | 8-10 hours |
| **Medium** | 9 | 11-14 hours |
| **Low** | 6 | 34-48 hours |
| **Completed** | 5 | 7-10 hours ✅ |
| **TOTAL** | 26 | 63-86 hours |

---

## 🎯 Recommended Next Steps

### Sprint 1 (5-6 hours)
1. **#6** - Create Help/Rules modal (3-4h)
2. **#7** - Auto-move configuration (2h)

### Sprint 2 (8-10 hours)
4. **#9** - Add Klondike hints (2-3h)
5. **#8** - Improve FreeCell hints (2h)
6. **#10** - Better empty column feedback (30m)
7. **#11** - Stack movement tooltips (1h)
8. **#13** - Win celebration options (1h)

### Sprint 3+ (Medium/Low Priority)
- Settings improvements (#12, #14-#19)
- Accessibility features (#20-#22)
- Polish and tutorials (#24-#25)

---

## 🐛 How to Report New Issues

Found a bug or improvement? Please:

1. **Check this file first** - Issue might already be tracked
2. **Check [usability-analysis.md](usability-analysis.md)** - Full details there
3. **Create GitHub Issue** - Use issue templates in `.github/ISSUE_TEMPLATE/`
4. **Or edit this file** - Add to appropriate priority section

---

## 📝 Issue Template

When adding new issues, use this format:

```markdown
### **#XX - Short Title**
**Status:** 🚨 Critical / ⚠️ High / ⏸️ Medium / 📋 Low
**Game:** FreeCell / Klondike / Both
**Effort:** X hours
**Impact:** HIGH / MEDIUM / LOW - One sentence

**Description:**
[1-2 paragraph explanation]

**Tasks:**
- [ ] Task 1
- [ ] Task 2

**Files:**
- `path/to/file.ts`

**References:**
- Related: #XX
- Source: [Link or description]
```

---

**See also:**
- [usability-analysis.md](usability-analysis.md) - Full analysis with examples
- [ROADMAP.md](ROADMAP.md) - Strategic priorities
- [STATUS.md](STATUS.md) - Current work status
