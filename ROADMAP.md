# CardGames Roadmap

**Last Updated:** 2025-12-22
**Current Status:** FreeCell MVP live on GitHub Pages, optimizing for mobile and user growth

---

## Product Strategy

### Vision
Build the best collection of classic card games on the web - mobile-first, accessible, and delightful.

### Current Focus
**Phase: Mobile Optimization & User Acquisition**

We have a working FreeCell game but it's not ready for real users. Before building more games or extracting libraries, we need to make the current game excellent on mobile and accessible to all users.

---

## Priority Roadmap

### 🔥 P0: Mobile-Ready (Week 1-2)
**Goal:** Make FreeCell usable and installable on mobile devices

**Why this first:**
- Game is live and public
- 60-70% of casual game traffic is mobile
- Current experience is poor on phones/tablets
- Blocks all user growth

**Tasks:**
- [ ] **PWA Setup** (2-4 hours)
  - Add vite-plugin-pwa
  - Create app icons (192x192, 512x512)
  - Configure manifest.json
  - Test "Add to Home Screen" on iOS and Android
  - See: `CLAUDE.md` Section "Option A: PWA"

- [ ] **Responsive Layout** (6-8 hours)
  - Convert fixed `px` to viewport units or CSS Grid
  - Add breakpoints: mobile (<768px), tablet (768-1199px), desktop (1200px+)
  - Test on iPhone SE, iPhone 14, iPad, desktop
  - Cards must be readable at all sizes

- [ ] **Touch Optimization** (4-6 hours)
  - Minimum 44x44px tap targets
  - Add touch event handlers (onTouchStart, onTouchEnd)
  - Test drag-and-drop on touch devices
  - Prevent accidental zoom during gameplay
  - Consider tap-to-select as primary interaction

**Success Metrics:**
- ✅ App installs from "Add to Home Screen" on iOS and Android
- ✅ Playable on iPhone without zooming
- ✅ Touch drag-and-drop works smoothly

---

### 🎯 P1: Accessibility & Core Features (Week 2-3)
**Goal:** Make the game accessible to all users and add retention features

**Why this next:**
- Keyboard controls = better UX for everyone
- Accessibility = required for wide distribution
- Undo/redo = basic expectation for card games
- These are table-stakes features

**Tasks:**
- [ ] **Keyboard Controls** (3-4 hours)
  - U = Undo
  - N = New game
  - H = Hint
  - A = Auto-complete
  - 1-8 = Select tableau column
  - Arrow keys = Navigate cards
  - Enter = Select/move card

- [ ] **Screen Reader Support** (2-3 hours)
  - ARIA labels on all cards
  - Announce moves to screen readers
  - Keyboard focus indicators
  - Test with VoiceOver (iOS) and TalkBack (Android)

- [ ] **Undo/Redo System** (6-8 hours)
  - **See:** `rfcs/001-undo-redo-system.md` for detailed design
  - Add moveHistory to game state
  - Implement undo button (pop from history)
  - Keyboard shortcut (U key)
  - Limit history to 100 states
  - Persist to localStorage

- [ ] **Game Persistence** (3-4 hours)
  - Auto-save to localStorage on each move
  - Restore game on page reload
  - "Continue" vs "New Game" option

**Success Metrics:**
- ✅ Can complete full game without mouse
- ✅ Screen reader users can play
- ✅ Undo/redo works correctly
- ✅ Game state persists across page reloads

---

### 🚀 P2: Engagement & Growth (Week 3-4)
**Goal:** Convert casual visitors into daily users

**Why this next:**
- Daily challenge = proven engagement pattern (Wordle, NYT games)
- Social sharing = free marketing
- Analytics = understand user behavior
- These drive retention and growth

**Tasks:**
- [ ] **Daily Challenge** (8-12 hours)
  - Generate daily seed from UTC date
  - Track completion status
  - Show streak counter
  - Leaderboard (moves/time) - optional, can use localStorage first
  - Share results to social media
  - See: CLAUDE.md Section "Tier 3: Daily Challenge"

- [ ] **Social Sharing** (2-3 hours)
  - Share game results (seed, moves, win/loss)
  - Copy link to clipboard
  - Native share API on mobile
  - Format: "I won FreeCell #12345 in 87 moves! 🎉"

- [ ] **Privacy-First Analytics** (1-2 hours)
  - Add Plausible or Simple Analytics
  - Track: games played, completion rate, device types
  - No personal data collection
  - GDPR-compliant

- [ ] **In-Game Bug Reporter** (1 hour)
  - Add "Report Bug" button
  - Use `src/utils/bugReport.ts` (already created)
  - Pre-fill GitHub issue with seed, moves, environment

**Success Metrics:**
- ✅ Daily active users (DAU) > 0
- ✅ Return rate > 20%
- ✅ Social shares tracked
- ✅ Bug reports include game state

---

### 🎮 P3: Second Game (Week 5-7)
**Goal:** Build Spider Solitaire or Klondike to validate architecture

**Why this next:**
- Need 2+ games to know what's actually reusable
- Can't abstract effectively with only one example
- Validates the core library approach
- 2x content for users

**Strategy: Copy-Paste First, Abstract Later**
1. Create `spider-mvp/` or `klondike-mvp/`
2. Copy `core/` from FreeCell
3. Implement new rules in `rules/`
4. Note what's duplicated vs. what's different
5. **After game #2 works**, extract shared code

**Tasks:**
- [ ] **Choose Game** - Spider or Klondike based on rule similarity
- [ ] **Implement Game Logic** - Copy core, write new rules
- [ ] **Build UI** - Reuse Card/EmptyCell components
- [ ] **Add to Landing Page** - Update index.html
- [ ] **Test Thoroughly** - Add unit tests
- [ ] **Document Learnings** - What's shared? What's not?

**Success Metrics:**
- ✅ Second game playable
- ✅ Clear list of shared vs. game-specific code
- ✅ Landing page shows both games

---

### 🏗️ P4: Library Extraction (Week 8-10)
**Goal:** Extract reusable libraries for future games

**Why this last:**
- Need 2+ games to know what's actually shared
- Premature abstraction is expensive
- Users and engagement matter more than code organization
- Only do this if you're building 3+ games

**Decision Point:**
- If daily active users < 10: **Don't extract yet, build game #3**
- If daily active users > 100: **Extract to enable faster game development**

**Tasks:**
- [ ] **Analyze Shared Code** - Review FreeCell + Game #2
- [ ] **Create Monorepo** - pnpm workspaces or Turborepo
- [ ] **Extract `@cardgames/core`** - Deck, types, RNG, card utilities
- [ ] **Extract `@cardgames/react-cards`** - Card, EmptyCell, drag/drop hooks
- [ ] **Migrate FreeCell** - Use extracted packages
- [ ] **Migrate Game #2** - Use extracted packages
- [ ] **Document Libraries** - API docs, usage examples
- [ ] **See:** ARCHITECTURE.md for detailed plan

**Success Metrics:**
- ✅ Both games use shared libraries
- ✅ Adding game #3 is 50% faster
- ✅ Clear separation of concerns

---

## Anti-Priorities (What NOT to Do Yet)

### ❌ Don't Build Backend/Accounts Yet
- **Why not:** Adds complexity, costs money, no proven demand
- **When:** After 1000+ daily users or when localStorage limits are hit

### ❌ Don't Build Leaderboards Yet
- **Why not:** Requires backend, moderation, anti-cheat
- **When:** After daily challenge has proven engagement

### ❌ Don't Add Animations Yet
- **Why not:** Polish before core functionality is wrong priority order
- **When:** After mobile optimization and accessibility are done

### ❌ Don't Optimize Bundle Size Yet
- **Why not:** It's already small (~200KB), no performance issues
- **When:** Only if metrics show slow load times

### ❌ Don't Extract Libraries Yet (Repeated for emphasis!)
- **Why not:** Only one game, premature abstraction
- **When:** After game #2 is built and patterns are clear

---

## Success Metrics

### Phase 1 (Mobile-Ready) - Target: End of Week 2
- [ ] 95+ Lighthouse mobile score
- [ ] < 3 second load time on 3G
- [ ] Installable on iOS and Android
- [ ] Playable without pinch-zoom

### Phase 2 (Accessibility) - Target: End of Week 3
- [ ] WCAG 2.1 AA compliance
- [ ] 100% keyboard navigable
- [ ] Screen reader compatible
- [ ] Undo/redo works correctly

### Phase 3 (Engagement) - Target: End of Week 4
- [ ] Daily challenge live
- [ ] 10+ daily active users
- [ ] 20%+ return rate
- [ ] Analytics tracking

### Phase 4 (Growth) - Target: Week 5-7
- [ ] Game #2 launched
- [ ] 50+ daily active users
- [ ] Landing page with 2+ games

---

## Decision Log

### 2025-12-22: Prioritize Mobile First
**Decision:** Focus on PWA + mobile optimization before building game #2
**Rationale:** Game is live and public, but unusable on mobile. This blocks all user growth.
**Trade-off:** Delays library extraction and game #2, but gets real users faster.

### 2025-12-22: Skip Backend for Now
**Decision:** Use localStorage for all persistence, no backend yet
**Rationale:** No proven demand, adds complexity and cost, localStorage sufficient for thousands of users.
**Trade-off:** Can't have cross-device sync or real leaderboards yet.

### 2025-12-22: Build Game #2 Before Extracting Libraries
**Decision:** Wait until 2+ games exist before creating shared packages
**Rationale:** Rule of three - don't abstract until you have 2-3 examples. Premature abstraction is expensive.
**Trade-off:** Some code duplication short-term, but better long-term abstractions.

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
