# Motivation: Why FreeCell Mini?

## Problem Statement

### Current State
- **FreeCell completion time:** 15-30 minutes for average players
- **Mobile experience:** Full 8-column layout requires significant horizontal scrolling or tiny cards
- **Daily challenge opportunity:** Need quick-play variants for daily rotation
- **Engagement gap:** Users want shorter sessions for commute/break gameplay

### User Feedback Patterns
From similar card game apps (Solitaire, Spider):
- 60%+ of daily challenge engagement is on "easier/quicker" variants
- Mobile players prefer games under 10 minutes
- Daily streaks perform best with 5-10 minute commitment
- Mix of difficulty levels increases overall engagement

### Strategic Alignment
Current roadmap (P8) calls for daily challenges. FreeCell Mini provides:
- **Quick variant** for rotation (Mini Monday, Full Friday pattern)
- **Mobile optimization** without compromising desktop experience
- **Lower barrier** for new players to learn mechanics
- **Replayability** through daily format

---

## Market Analysis

### Successful Mini Variants
- **Wordle:** 5-10 minute daily word game - 2M+ daily players
- **Mini Crossword (NYT):** Quick variant alongside full puzzle - 40% of crossword DAU
- **Solitaire Daily Challenges:** Mix of 1-suit, 2-suit, 4-suit Spider rotations

### Mobile Gaming Trends
- **Session length:** 5-10 minutes optimal for mobile (Google Play stats)
- **Daily habits:** Short sessions = higher consistency = better retention
- **Commute-friendly:** Games under 10 minutes fit public transit patterns

---

## Technical Motivation

### Code Reuse Opportunity
FreeCell Mini can reuse 80%+ of existing FreeCell codebase:
- ✅ Game state management (partial deck instead of full)
- ✅ Move validation logic (same rules, fewer locations)
- ✅ Undo/redo system (useGameHistory hook)
- ✅ Drag-and-drop/smart tap interaction
- ✅ Shared components (Card, EmptyCell, GameControls)
- ✅ Settings and accessibility features

### Low Implementation Cost
- **New code:** Mainly tableau layout (4 columns vs 8)
- **Modified logic:** Initial deal, foundation targets, win condition
- **Testing:** Adapt existing test suite for smaller game
- **Estimated effort:** 2-3 days vs 5-7 days for new game

---

## Success Criteria

1. **Play time:** Average 5-10 minutes (50% faster than full FreeCell)
2. **Win rate:** 95%+ solvability (high enough for daily confidence)
3. **Mobile UX:** No horizontal scroll on 375px viewport (iPhone SE)
4. **Engagement:** Daily challenge completion rate >60% (vs <40% for complex games)
5. **Code quality:** Reuses existing patterns, minimal duplication
