# CardGames Roadmap

**Last Updated:** 2025-12-23
**Current Status:** Both FreeCell and Klondike live, monorepo complete, focusing on user growth and polish

---

## Product Strategy

### Vision
Build the best collection of classic card games on the web - mobile-first, accessible, and delightful.

### Current Focus
**Phase: Polish & User Growth**

We have TWO working games (FreeCell and Klondike), a monorepo architecture, shared component library, and comprehensive accessibility features. The technical foundation is solid. Now we need to focus on user retention (persistence, daily challenges) and understanding our users (analytics).

---

## Priority Roadmap

### ✅ COMPLETED: P0-P4 Foundation

**P0: Mobile-Ready** ✅ COMPLETE
- ✅ PWA setup (vite-plugin-pwa, manifest, app icons)
- ✅ Responsive layout (accessibility settings with card sizing)
- ✅ Touch optimization (shared interaction system with touch events)

**P1: Accessibility & Core Features** ✅ COMPLETE
- ✅ Keyboard controls (GameControls component with shortcuts)
- ✅ Screen reader support (ARIA labels in components)
- ✅ Undo/Redo system (useGameHistory hook #16)
- ❌ Game persistence (NOT DONE - moved to current priorities)

**P2: Second Game** ✅ COMPLETE
- ✅ Klondike Solitaire implemented (#19)
- ✅ Draw-1 and Draw-3 modes
- ✅ 1415+ comprehensive tests
- ✅ Live at https://mikhaidn.github.io/CardGames/klondike/

**P3: Library Extraction** ✅ COMPLETE
- ✅ Monorepo setup (#25) - npm workspaces
- ✅ @cardgames/shared library (#21)
- ✅ Shared components (GameControls, DraggingCardPreview)
- ✅ Shared hooks (useGameHistory, useCardInteraction)
- ✅ Both games using shared library

---

### 🔥 P5: Polish & Visual Feedback (Current)
**Goal:** Complete card back integration and improve visual experience

**Why this now:**
- RFC-003 Phase 1 is complete (CardPack interface, CardBack component)
- Klondike stock pile needs face-down cards for proper gameplay feel
- Sets foundation for flip animations in future phases
- Small scope, high visual impact

**Tasks:**
- [ ] **RFC-003 Phase 2: Klondike Card Backs** (2-3 hours) ⬅️ CURRENT
  - Update Klondike game state to track faceUp status
  - Implement isCardFaceUp(state, location, index) helper
  - Render card backs for stock pile
  - Add visual regression tests

**Success Metrics:**
- ✅ Stock pile shows card backs
- ✅ Card flips when moved to waste
- ✅ Tests validate faceUp state transitions

---

### 🎯 P6: User Retention (Next Priority)
**Goal:** Keep users coming back by saving their progress

**Why this next:**
- Users lose progress when refreshing = frustration
- Basic expectation for modern web apps
- Enables "Continue" vs "New Game" UX pattern
- Foundation for daily challenges later

**Tasks:**
- [ ] **Game Persistence** (4-6 hours)
  - Auto-save to localStorage on each move
  - Restore game on page reload
  - "Continue" vs "New Game" dialog on startup
  - Handle localStorage quota exceeded gracefully
  - Implement for both FreeCell and Klondike
  - Add tests for save/restore logic
  - See: localStorage best practices in web APIs

**Success Metrics:**
- ✅ Game state persists across page reloads
- ✅ Users can continue interrupted games
- ✅ Graceful handling of storage errors
- ✅ Works offline (PWA + localStorage)

---

### 📊 P7: Analytics & Understanding Users
**Goal:** Understand how users play to make informed decisions

**Why this next:**
- Currently flying blind - no data on usage
- Need to understand device distribution (mobile vs desktop)
- Need completion rates to validate difficulty
- Informs future feature priorities
- Privacy-first approach builds trust

**Tasks:**
- [ ] **Privacy-First Analytics** (2-3 hours)
  - Add Plausible or Simple Analytics (privacy-focused)
  - Track events: games_started, games_won, games_lost, undo_used, hint_used
  - Track properties: game_type (freecell/klondike), mode (draw1/draw3), device_type
  - No personal data, no cookies, GDPR-compliant
  - Add to both games
  - Document in CLAUDE.md

- [ ] **Basic Metrics Dashboard** (1-2 hours)
  - Set up Plausible dashboard
  - Define key metrics: DAU, completion rate, avg moves, device breakdown
  - Share read-only dashboard link (optional)

**Success Metrics:**
- ✅ Analytics tracking games played
- ✅ Device type distribution visible
- ✅ Completion rates measurable
- ✅ Zero PII collected

---

### 🚀 P8: Daily Challenge & Social (Future)
**Goal:** Convert casual visitors into daily users

**Why later:**
- Need game persistence first (P6)
- Need analytics first to measure impact (P7)
- Daily challenge is high-effort, high-reward
- Focus on core experience before growth mechanics

**Tasks (Future):**
- [ ] **Daily Challenge** (8-12 hours)
  - Generate daily seed from UTC date
  - Track completion status in localStorage
  - Show streak counter
  - Persist streak across page loads
  - Same seed for all players globally
  - See: Wordle-style sharing format

- [ ] **Social Sharing** (2-3 hours)
  - Share game results (seed, moves, win/loss)
  - Copy link to clipboard
  - Native share API on mobile
  - Format: "I won FreeCell #12345 in 87 moves! 🎉"
  - Include daily challenge branding

**Success Metrics:**
- ✅ Daily active users (DAU) > 10
- ✅ Return rate > 20%
- ✅ Social shares tracked in analytics
- ✅ Daily challenge completion rate > 50%

---

## Anti-Priorities (What NOT to Do Yet)

### ❌ Don't Build Backend/Accounts Yet
- **Why not:** Adds complexity, costs money, no proven demand
- **When:** After 1000+ daily users or when localStorage limits are hit

### ❌ Don't Build Leaderboards Yet
- **Why not:** Requires backend, moderation, anti-cheat
- **When:** After daily challenge has proven engagement

### ❌ Don't Add Flip Animations Yet
- **Why not:** RFC-003 Phases 3-4, defer until card backs are integrated
- **When:** After RFC-003 Phase 2 complete and analytics show user engagement

### ❌ Don't Optimize Bundle Size Yet
- **Why not:** Both games are small (~200KB each), no performance issues
- **When:** Only if metrics show slow load times

### ❌ Don't Build Game #3 (Spider) Yet
- **Why not:** Focus on polishing existing 2 games first
- **When:** After analytics show strong engagement and daily challenges are live

### ✅ Already Done - Don't Redo
- ✅ ~~Extract Libraries~~ - @cardgames/shared exists (#21)
- ✅ ~~Build Second Game~~ - Klondike is live (#19)
- ✅ ~~Mobile Optimization~~ - Accessibility settings handle this
- ✅ ~~Undo/Redo~~ - useGameHistory hook is implemented (#16)

---

## Success Metrics

### ✅ Completed Milestones

**Foundation (P0-P4)** ✅ COMPLETE
- [x] PWA installable on iOS and Android
- [x] 100% keyboard navigable (GameControls)
- [x] Undo/redo works correctly (useGameHistory)
- [x] Game #2 launched (Klondike)
- [x] Landing page with 2+ games
- [x] Shared library extracted (@cardgames/shared)
- [x] Monorepo setup (npm workspaces)
- [x] 1600+ tests passing

### Current Goals (P5-P7)

**P5: Polish & Visual Feedback** - Target: This sprint
- [ ] Klondike card backs integrated (RFC-003 Phase 2)
- [ ] Visual tests for card orientation

**P6: User Retention** - Target: Next 2 weeks
- [ ] Game persistence to localStorage
- [ ] "Continue" vs "New Game" UX
- [ ] Works offline with PWA

**P7: Analytics** - Target: Next 2 weeks
- [ ] Plausible analytics integrated
- [ ] Metrics dashboard showing DAU, completion rate, device types
- [ ] 10+ daily active users (first milestone)

### Future Goals (P8+)

**P8: Daily Challenge & Social** - Target: When P6-P7 complete
- [ ] Daily challenge live
- [ ] 50+ daily active users
- [ ] 20%+ return rate
- [ ] Social sharing working

---

## Decision Log

### 2025-12-23: Monorepo Complete - Focus on User Growth
**Decision:** With monorepo, 2 games, and shared library complete, shift focus to user retention and analytics
**Rationale:** Technical foundation is solid. Now need to understand users and keep them engaged.
**Trade-off:** Delays flip animations and game #3, but prioritizes sustainable growth.

### 2025-12-23: Defer Flip Animations (RFC-003 Phase 3-4)
**Decision:** Complete card backs integration (Phase 2) but defer flip animations until analytics show demand
**Rationale:** Card backs are functional requirement for Klondike. Animations are polish that can wait.
**Trade-off:** Less visual polish short-term, but faster delivery of persistence and analytics.

### 2025-12-22: Build Klondike and Extract Libraries - COMPLETED ✅
**Decision:** Built Klondike (#19) and extracted shared library (#21)
**Outcome:** Successful! Monorepo setup validated architecture. Shared components working well.
**Learning:** Rule of three was right - needed 2 games to know what to abstract.

### 2025-12-22: Prioritize Mobile First - COMPLETED ✅
**Decision:** Focus on PWA + mobile optimization before building game #2
**Outcome:** PWA configured, accessibility settings provide mobile optimization.
**Learning:** Accessibility settings (card sizing, touch targets) solved mobile UX more elegantly than breakpoints.

### 2025-12-22: Skip Backend for Now - STILL VALID ✅
**Decision:** Use localStorage for all persistence, no backend yet
**Rationale:** No proven demand, adds complexity and cost, localStorage sufficient for thousands of users.
**Status:** Continuing with localStorage for persistence (P6) and daily challenges (P8 future).

---

## How to Use This Roadmap

**For AI Agents:**
1. Read this file to understand current priorities
2. Check `STATUS.md` for what's in progress
3. Review `rfcs/` for technical design decisions
4. Refer to `CLAUDE.md` for implementation details
5. Update this file when priorities change

**For Developers:**
1. Pick tasks from the current priority phase
2. Check off completed items
3. Write RFCs for major features (see `rfcs/README.md`)
4. Update STATUS.md when starting new work
5. Consult ARCHITECTURE.md for long-term vision

**Review Cadence:**
- Update weekly based on progress
- Re-prioritize monthly based on metrics
- Major strategy changes require decision log entry
- RFCs required for features >1 day of work
