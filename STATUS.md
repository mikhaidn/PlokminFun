# Project Status

**Last Updated:** 2026-07-07
**Current Phase:** RFC-008 6 Ball Monty — Phase 1 ✅ complete, Phase 2 (graphics & solo app) next
**Next Milestone:** Playable Marathon/Sprint on phone, shipped to the landing page as "6 Ball Monty"

---

## 🎯 Current Sprint

### Active Work
- **RFC-008 6 Ball Monty** ⬅️ **OWNER PRIORITY (2026-07-07)**
  - Falling-ball chain puzzle (6-Ball-Puzzle / Puyo genre); first real-time game, first multiplayer capability, first puzzle-maker/UGC capability
  - **Phase 1 (headless engine) is DONE** — see Recently Completed below
  - Next: Phase 2 per [rfcs/008-six-ball-monty/07-implementation.md](rfcs/008-six-ball-monty/07-implementation.md) — all rendering, keyboard+touch adapters, app chrome, PWA, landing-page entry, and the tuning/playtest pass
  - Owner decisions locked in: name **"6 Ball Monty"** (slug `sixballmonty`), rollback netcode, multiplayer (ph3-4) before puzzle maker (ph5), MechanicsConfig-as-data with placeholder tuning, fragment puzzle URLs — see [09-risks-and-decisions.md](rfcs/008-six-ball-monty/09-risks-and-decisions.md)

### Blocked/Waiting
- None

---

## ✅ Recently Completed

### Week of 2026-07-07

**MILESTONE: RFC-008 Phase 1 — 6 Ball Monty headless engine 🎱**

- [x] **Deterministic engine library** (`sixballmonty-mvp/src/engine/`) ✅ COMPLETE
  - Pure fixed-60Hz `tick(state, inputs, config)` — no React, no DOM, no ambient time/randomness
  - Full phase machine: spawn → fall → lock (with lock-delay + capped resets) → resolve ⇄ cascade → garbage drop
  - Chains, placeholder scoring/power tables, garbage with offsetting and adjacent-pop clearing
  - Versus core: `MatchController` routing garbage between two engine instances (multiplayer-first)
  - Replays (`(seed, inputs, ticks)` + JSON round-trip) and `hashState` fingerprinting for netcode/golden tests
  - Pure RNG step proven identical to `@plokmin/shared` `seededRandom` sequence by test
  - `classic` / `mini` / `frantic` presets — **all numeric tuning is placeholder** until the Phase 2 playtest pass
  - **Zero rendering by owner direction** — graphics start in Phase 2; workspace has no `plokmin` block yet so it stays off the landing page
  - **Tests:** 77 across 10 files — determinism (identical hash timelines), purity (deep-frozen states), 20-match random self-play soak with invariant checks, chain/garbage fixtures
  - **Coverage:** 100% lines/functions, 96.6% branches on `src/engine/`
  - Full `npm run validate` green (format, site check, typecheck, lint, tests, build)

### Week of 2026-06-13

**MILESTONE: Spider Solitaire Launched 🕷️**

- [x] **Spider Solitaire (game #3)** ✅ COMPLETE
  - New `spider-mvp` workspace built on the Klondike pattern and `@plokmin/shared`
  - Two-deck (104-card) play with 1-suit, 2-suit, and 4-suit difficulty
  - 10-column tableau, deal-from-stock (10 at a time), same-suit run moves, automatic King→Ace run collection to 8 foundations
  - Reuses shared GenericTableau, GameControls, useCardInteraction, useGameHistory, SettingsModal, HelpModal, WinCelebration
  - Spider-specific 10-column responsive layout wrapper (shared sizing is tuned for 8 columns)
  - 37 unit tests (rules, state, actions); full `npm run validate` green
  - Auto-discovered by the site builder; deploys to `/PlokminFun/spider/`

### Week of 2025-12-28

**MILESTONE: Usability Quick Wins Complete - 4 Critical Improvements Shipped 🎉**

- [x] **Usability Quick Wins** ✅ ALL 4 COMPLETE
  - Quick Win 1: Smart tap-to-move enabled by default on mobile ✅
    - Auto-detect mobile devices (viewport < 768px)
    - Enable smartTapToMove for first-time mobile users
    - Reduces mobile confusion significantly
  - Quick Win 2: Invalid move feedback with shake animation ✅
    - Shake animation on invalid moves (600ms)
    - Contextual tooltips ("No valid moves", "Invalid move", etc.)
    - Respects prefers-reduced-motion
    - Works with drag, touch, and tap interactions
  - Quick Win 3: Improved game tooltips ✅
    - Stock: "Click to draw cards from stock"
    - Empty stock: "Click to recycle waste pile (unlimited)"
    - Auto-complete: Detailed explanation of when it works
    - Added title prop to CardFlip and EmptyCell
  - Quick Win 4: Face-down card counter badges ✅
    - Show "N↓" badge on Klondike tableau columns
    - Helps strategic planning
    - Non-intrusive design (top-right corner)
  - **Deliverables:**
    - shared/utils/settingsStorage.ts: Mobile detection
    - shared/hooks/useCardInteraction.ts: Invalid move tracking
    - shared/types/CardInteraction.ts: InvalidMoveAttempt type
    - shared/styles/animations.css: Shake animation
    - shared/docs/INVALID_MOVE_FEEDBACK.md: Usage guide
    - shared/components/CardFlip.tsx: Title prop support
    - shared/components/EmptyCell.tsx: Title prop support
    - shared/components/GenericTableau.tsx: Face-down count badge
    - klondike-mvp/src/components/StockWaste.tsx: Enhanced tooltips
    - klondike-mvp/src/utils/tableauAdapter.ts: Face-down count
  - **Test Results:** TypeScript compilation passed, no type errors
  - **Impact:** Immediate UX improvements for mobile users and new players

**PIVOT: Usability Analysis Complete - Identified 25 Improvements 🎯**

- [x] **Comprehensive Usability Analysis** ✅ COMPLETE
  - Analyzed FreeCell and Klondike from player perspective
  - Identified 25 potentially confusing elements and missing configurations
  - Prioritized issues: 3 Critical, 8 High, 9 Medium, 5 Low
  - Created implementation roadmap with effort estimates
  - **Deliverables:**
    - usability-analysis.md: Full analysis with priority matrix
  - **Impact:** Clear roadmap for improving player experience
  - **Next Steps:** Implementing quick wins (4 issues, 3-4 hours total)

### Week of 2025-12-27

**MILESTONE: RFC-005 Phase 3 Win Celebration & Analytics Complete 🎉**

- [x] **RFC-005 Phase 3: Win Celebration** ✅ COMPLETE
  - Integrated WinCelebration component into both FreeCell and Klondike
  - Confetti animation on game wins (3-second duration)
  - Respects user settings (winCelebration toggle & animationLevel)
  - Honors prefers-reduced-motion accessibility preference
  - **Deliverables:**
    - freecell-mvp/src/components/GameBoard.tsx: WinCelebration integration
    - klondike-mvp/src/components/GameBoard.tsx: WinCelebration integration
  - **Test Results:** All 557 tests passing, zero regressions
  - **Impact:** Delightful win feedback for players! 🎉

- [x] **Analytics Event Structure** ✅ COMPLETE
  - Created comprehensive React-based analytics system
  - Type-safe event definitions (GameStartEvent, GameWonEvent, etc.)
  - Hook-based interface via useAnalytics()
  - Pluggable AnalyticsProvider interface (ready for Plausible)
  - No-op by default (console.debug in dev mode)
  - **Deliverables:**
    - shared/types/Analytics.ts: Comprehensive event types
    - shared/contexts/AnalyticsContext.tsx: React context provider
    - shared/hooks/useAnalytics.ts: Hook interface for tracking
  - **Test Results:** All 557 tests passing
  - **Impact:** Foundation ready for P7 analytics implementation

**MILESTONE: RFC-005 Phase 3 Card Flip Animations Complete 🎉**

- [x] **RFC-005 Phase 3: Card Flip Animations** ✅ COMPLETE
  - Created CardFlip component with 3D CSS transforms
  - Integrated CardFlip into Klondike StockWaste component
  - Added 17 comprehensive tests (all passing, TDD)
  - **Animation Features:**
    - Hardware-accelerated 3D transforms (rotateY)
    - Configurable duration (300ms default)
    - Respects prefers-reduced-motion for accessibility
    - Mobile-optimized performance
  - **Deliverables:**
    - shared/components/CardFlip.tsx: 3D flip animation component
    - shared/components/__tests__/CardFlip.test.tsx: 7 test cases
    - klondike-mvp/src/components/StockWaste.tsx: Integrated CardFlip
    - klondike-mvp/src/components/__tests__/StockWaste.flip.test.tsx: 10 test cases
    - shared/index.ts: Exported CardFlip component
  - **Test Results:** All 557 tests passing (172 + 201 + 184), zero regressions
  - **Impact:** Smooth, delightful card reveals for Klondike stock pile!

**MILESTONE: RFC-005 Phase 3 Week 7 Complete - Smart Tap-to-Move 🎉**

- [x] **RFC-005 Phase 3 Week 7: Smart Tap-to-Move** ✅ COMPLETE
  - Moved useSmartTap hook to shared library
  - Enhanced useCardInteraction with smart tap logic and highlightedCells state
  - Integrated getValidMoves in both FreeCell and Klondike GameBoards
  - Added 24+ comprehensive tests (all passing, TDD)
  - **Smart Tap Behavior:**
    - Setting OFF by default (opt-in via Settings)
    - 1 valid move → auto-execute immediately
    - Multiple valid moves → highlight destinations for selection
    - 0 valid moves → clear selection
    - Traditional click-to-select works when disabled
  - **Deliverables:**
    - shared/hooks/useSmartTap.ts: Smart tap logic hook
    - shared/hooks/useCardInteraction.ts: Enhanced with smart tap integration
    - shared/hooks/__tests__/useSmartTap.test.ts: 13 test cases
    - Enhanced useCardInteraction tests: 11 new smart tap test cases
    - freecell-mvp/src/components/GameBoard.tsx: getValidMoves integration
    - klondike-mvp/src/components/GameBoard.tsx: getValidMoves integration
  - **Test Results:** All 540 tests passing, zero regressions
  - **Impact:** Makes mobile play significantly easier - tap once to move when obvious!

### Week of 2025-12-26

**MILESTONE: RFC-005 Phase 2 Complete - Generic Components & Unification 🎉**

- [x] **RFC-005 Phase 2 Weeks 4-5: Create Generic Components** ✅ COMPLETE
  - Built GenericTableau component in shared library
  - Migrated Klondike to use GenericTableau (absolute positioning)
  - Migrated FreeCell to use GenericTableau (margin positioning)
  - Fixed Klondike scrolling issue (removed unnecessary overflow: auto)
  - Added 8 comprehensive tests for GenericTableau
  - Created tableau adapters for both games
  - **Deliverables:**
    - shared/components/GenericTableau.tsx: Flexible tableau renderer
    - shared/components/__tests__/GenericTableau.test.tsx: Component tests
    - klondike-mvp/src/utils/tableauAdapter.ts: Klondike adapter
    - freecell-mvp/src/utils/tableauAdapter.ts: FreeCell adapter
  - **Impact:** ~200 lines of duplicate code eliminated, foundation ready for new games
  - **Test Results:** All 145 shared tests passing, zero regressions

**MILESTONE: RFC-005 Phase 2 Week 3 Complete - Game Config System Created 🎉**

- [x] **RFC-005 Phase 2 Week 3: Create Game Config System** ✅ COMPLETE
  - Defined GameConfig<TState> interface with AnimationConfig
  - Added GameLifecycleHooks<TState> to GameConfig (8 lifecycle methods)
  - Created AnimationQueue utility class (enqueue, executeNext, clear, pause/resume)
  - Created lifecycle hook integration patterns (LifecycleHookExecutor)
  - Built createGame() factory function
  - Created Klondike config file (klondike.config.ts)
  - Created FreeCell config file (freecell.config.ts)
  - Added 440+ comprehensive tests (all passing)
  - **Deliverables:**
    - shared/types/GameConfig.ts: Extended with GameLifecycleHooks
    - shared/utils/animationQueue.ts: Animation queue management
    - shared/utils/lifecycleHooks.ts: Hook integration patterns
    - shared/core/createGame.ts: Game factory and registry
    - klondike-mvp/src/klondike.config.ts: Klondike configuration
    - freecell-mvp/src/freecell.config.ts: FreeCell configuration
  - **Impact:** Foundation ready for generic components in Weeks 4-5

**MILESTONE: RFC-005 Phase 2 Week 2 Complete - getValidMoves() Implemented 🎉**

- [x] **RFC-005 Phase 2 Week 2: Standardize Move Execution** ✅ COMPLETE
  - Implemented `getValidMoves()` in Klondike gameActions.ts
  - Implemented `getValidMoves()` in FreeCell gameActions.ts
  - Added 24 comprehensive integration tests (12 per game)
  - All 440 tests passing (172 FreeCell + 191 Klondike + 77 Shared)
  - Zero regressions - all existing functionality preserved
  - **Deliverables:**
    - klondike-mvp/src/state/gameActions.ts: `getValidMoves()` function
    - freecell-mvp/src/state/gameActions.ts: `getValidMoves()` function + location types
    - Comprehensive test coverage for smart tap scenarios
    - Ready for smart tap-to-move UI integration in Phase 3
  - **Impact:** Smart tap toggle in settings can now be activated!

**MILESTONE: RFC-005 Phase 1 Complete - UI Prototype Ready 🎉**

- [x] **RFC-005 Phase 1: UI Prototype with Settings Integration** ✅ COMPLETE
  - Day 1: Animation experiments (spring drag, flip, win celebration)
  - Day 2: Settings UI + Shared component consolidation
  - Day 3: Created comprehensive UI requirements documentation
  - **Deliverables:**
    - docs/architecture/ui-requirements.md (comprehensive requirements doc)
    - Unified settings system (animation, interaction, accessibility)
    - Smart tap-to-move toggle (ready for Phase 2 implementation)
    - Performance targets defined (60fps, <100ms response)
    - Lifecycle hooks designed for animation coordination
    - Animation queue requirements documented
  - **Ready for Phase 2:** GameActions interface extension and move execution standardization

**RFC-005 Shared Component Consolidation 🎉**

- [x] **SettingsModal → Shared Library**
  - Moved Klondike's advanced SettingsModal to @plokmin/shared
  - Unified settings UI with animation/interaction controls
  - Both games now use shared SettingsModal component
  - Wrapped both games with SettingsProvider for global settings
  - ~470 lines of duplicate code eliminated

- [x] **FoundationArea → Shared Library**
  - Created unified FoundationArea component
  - Works for FreeCell, Klondike, and future solitaire games
  - Standardized foundation pile rendering across all games
  - ~90 lines of duplicate code eliminated

- [x] **Shared Library Expansion**
  - 7 shared components total (was 5)
  - Settings work consistently across all games
  - Foundation rendering standardized
  - All tests passing (415 total)
  - Build successful, linter clean

### Week of 2025-12-24

**MAJOR MILESTONE: RFC-005 Planning & RFC-003 Phase 2 Complete 🎉**

- [x] **RFC-005 Draft Interfaces**
  - Created complete GameActions<TState> interface for unified system
  - Created GameConfig<TState> for config-driven game builder
  - CardDisplayConfig integration with RFC-003 card backs
  - isCardFaceUp() as key method for card display logic
  - All interfaces exported from @plokmin/shared
  - Comprehensive documentation for future compatibility

- [x] **RFC-005 Compatibility Guide**
  - docs/architecture/rfc-005-compatibility.md (380 lines)
  - How to implement features with RFC-005 patterns today
  - Zero-refactoring migration path documented
  - Design patterns and testing strategies
  - Code examples for Klondike implementation

- [x] **RFC-003 Phase 2: Klondike Card Backs Integration**
  - Created klondike-mvp/src/state/cardDisplay.ts (RFC-005 compatible)
  - isCardFaceUp() using GameLocation from @plokmin/shared
  - Helper functions matching GameActions interface signatures
  - 25 new comprehensive tests (all passing)
  - Updated Tableau.tsx to use RFC-005 compatible helpers
  - Stock pile: face-down cards (CardBack component)
  - Waste pile: face-up cards (Card component)
  - Tableau: mixed face-up/down based on faceUpCount
  - All 179 tests passing, build successful

### Week of 2025-12-23

**MAJOR MILESTONE: Monorepo & Library Extraction Complete 🎉**

- [x] **Monorepo Setup (#25)** - "woop" commit
  - Converted to npm workspaces (freecell-mvp, klondike-mvp, shared)
  - Consolidated to single root package-lock.json
  - Updated CI/CD workflows for monorepo builds
  - Both games now building and deploying from monorepo

- [x] **Shared Library Extracted (#21)** - @plokmin/shared
  - GameControls component (New Game, Undo, Redo, Settings, Help)
  - DraggingCardPreview component (visual feedback during drag)
  - useGameHistory hook (undo/redo system)
  - useCardInteraction hook (unified drag-and-drop + click-to-select)
  - HistoryManager utility (state management)
  - Comprehensive TypeScript types exported

- [x] **Klondike Solitaire Complete (#19)**
  - Full Klondike implementation (draw-1 and draw-3 modes)
  - Stock pile, waste pile, tableau (7 columns), foundations
  - Shared interaction system integration
  - 665+ test cases for game actions
  - 391+ test cases for game state
  - 359+ test cases for game rules
  - Live at: https://mikhaidn.github.io/PlokminFun/klondike/

- [x] **Undo/Redo System (#16)**
  - useGameHistory hook with state snapshots
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - History limit configuration
  - Full test coverage
  - Integrated into both FreeCell and Klondike

- [x] **RFC-003 Phase 1: CardPack Interface & Card Backs (#17, #18)**
  - CardBack.tsx component (CSS diamond checkerboard patterns)
  - CardPack interface in src/core/cardPack.ts
  - faceUp prop added to Card.tsx (defaults to true)
  - 31 new tests, all 191 tests passing
  - Bundle impact: ~2KB, meets performance budget
  - Backwards compatible, FreeCell unaffected

- [x] **Accessibility Features (#11-13)**
  - High contrast mode
  - Card size presets (small, medium, large, extra-large)
  - Font size multiplier (1.0x - 2.0x)
  - Button position (top/bottom for one-handed mode)
  - Touch target size controls
  - Settings modal with persistent localStorage

### Week of 2025-12-22
- [x] PWA setup and configuration (vite-plugin-pwa, service worker, manifest)
- [x] App icons created (192x192, 512x512) with FreeCell branding
- [x] Mobile viewport and Apple-specific meta tags
- [x] Create bug tracking infrastructure (GitHub issue templates)
- [x] Create in-game bug reporter utility

### Week of 2025-12-15
- [x] GitHub Pages deployment with landing page
- [x] CI/CD workflows (deploy.yml, pr-validation.yml)
- [x] FreeCell MVP fully functional
- [x] Auto-complete feature
- [x] Hints system
- [x] Seed-based reproducible games

---

## 📊 Current Metrics

### Deployment
- **Status:** ✅ Both games live on GitHub Pages
- **FreeCell:** https://mikhaidn.github.io/PlokminFun/freecell/
- **Klondike:** https://mikhaidn.github.io/PlokminFun/klondike/
- **Landing:** https://mikhaidn.github.io/PlokminFun/
- **Last Deploy:** Auto-deploys on push to main
- **Uptime:** 100% (GitHub Pages)

### Code Quality
- **Tests:** 557 tests passing across monorepo (172 + 201 + 184)
  - FreeCell: 172 tests including 12 getValidMoves tests, 95%+ coverage on core logic
  - Klondike: 201 tests including 12 getValidMoves tests, 25 card display tests, and 10 CardFlip integration tests
  - Shared: 184 tests (includes CardFlip component tests and smart tap tests), full coverage on utilities, hooks, and components
- **Linting:** All files pass ESLint
- **TypeScript:** Strict mode, zero errors
- **Build:** ✅ Monorepo builds succeed (shared → games)
- **Shared Components:** 9 components (Card, CardBack, CardFlip, EmptyCell, GameControls, DraggingCardPreview, SettingsModal, FoundationArea, GenericTableau)

### User Metrics
- **DAU:** 0 (no tracking yet)
- **Games Played:** Unknown (no analytics)
- **Completion Rate:** Unknown
- **Mobile vs Desktop:** Unknown

**Action:** Add Plausible analytics in P2

---

## 🚧 Known Issues

### High Priority
- [x] ~~Not mobile-responsive~~ ✅ FIXED: Accessibility settings with card sizing
- [x] ~~No touch optimization~~ ✅ FIXED: Touch events in shared interaction system
- [x] ~~No keyboard controls~~ ✅ FIXED: GameControls component with keyboard shortcuts
- [x] ~~No undo/redo~~ ✅ FIXED: useGameHistory hook (#16)

### Medium Priority
- [ ] No game persistence (refreshing page loses progress)
- [ ] No daily challenge (no retention mechanism)
- [ ] No analytics (flying blind)
- [x] ~~Klondike card backs not integrated~~ ✅ FIXED: RFC-003 Phase 2 complete

### Low Priority
- [x] ~~No flip animations for cards~~ ✅ FIXED: CardFlip component with 3D transforms integrated in Klondike
- [ ] No dark mode (nice-to-have)
- [ ] No sound effects (nice-to-have)

---

## 📦 Technical Debt

### Immediate (Address This Sprint)
- None blocking current work

### Short-term (Next 2 Sprints)
- Add TypeScript types for game actions (some `any` types remaining)
- Extract CSS variables for theming (partially done in shared library)
- Add error boundaries for graceful failures
- Add game persistence to localStorage

### Completed ✅
- [x] Library extraction (@plokmin/shared) - ✅ DONE (#21)
- [x] Monorepo setup (npm workspaces) - ✅ DONE (#25)
- [x] Shared component library (GameControls, DraggingCardPreview, hooks) - ✅ DONE (#21)

---

## 🎮 Games Status

### FreeCell
- **Status:** ✅ Live and Playable (PWA-enabled)
- **Features:** Core gameplay, hints, auto-complete, seed-based, undo/redo, accessibility settings, shared interaction system, smart tap-to-move
- **URL:** https://mikhaidn.github.io/PlokminFun/freecell/
- **Missing:** Game persistence, daily challenge
- **Next:** Game persistence, analytics

### Klondike
- **Status:** ✅ Live and Playable (#19)
- **Features:** Core gameplay (draw-1 and draw-3), card backs (stock face-down), card flip animations, undo/redo, shared interaction system, smart tap-to-move, comprehensive test coverage (201 tests)
- **URL:** https://mikhaidn.github.io/PlokminFun/klondike/
- **Missing:** Daily challenge, game persistence
- **Next:** Game persistence (localStorage)

### Spider Solitaire
- **Status:** ✅ Live and Playable
- **Features:** 1/2/4-suit difficulty, two-deck (104-card) play, same-suit run building, automatic completed-run collection, deal-from-stock, undo/redo, smart tap-to-move, accessibility settings, win celebration
- **URL:** https://mikhaidn.github.io/PlokminFun/spider/
- **Tests:** 37 (rules, state, actions)
- **Next:** Game persistence, daily challenge

---

## 📋 Next 3 Tasks

1. **RFC-008 6 Ball Monty — Phase 2: Graphics & solo app** (2-3 days) ⬅️ NEXT (OWNER PRIORITY)
   - All rendering: well/ball components, keyboard + touch adapters, chrome, PWA, landing-page entry as "6 Ball Monty" (add the `plokmin` block + vite config)
   - Includes the tuning/playtesting pass that sets real preset values (placeholders until then)
   - Engine is done and frozen behind `src/engine/index.ts` — Phase 2 only consumes it

2. **RFC-008 6 Ball Monty — Phase 3: Local versus** (2 days)
   - UI over the already-tested versus core (`MatchController`): side-by-side layout, P2 keyboard + gamepad adapters, best-of-N

3. **Game State Serialization (RFC-006)** (1-2 days)
   - Pushed down by RFC-008 priority, and now informed by it: 6 Ball Monty's puzzle/replay
     URL envelope (deflate + base64url fragment) is a candidate general format
   - Still the foundation for card-game persistence, daily challenges, and sharing
   - See: [RFC-006](rfcs/006-game-state-serialization/README.md)

(Previously queued Game Persistence and Daily Challenge move behind these; see ROADMAP.md)

---

## 🔄 How to Update This File

**When starting work:**
```bash
# Move task from "Next 3 Tasks" to "Active Work"
# Update "Last Updated" date
```

**When completing work:**
```bash
# Check off task in "Active Work"
# Move to "Recently Completed"
# Add new task to "Next 3 Tasks"
```

**Weekly:**
- Archive "Recently Completed" older than 2 weeks
- Review "Known Issues" and re-prioritize
- Update metrics if available

**Monthly:**
- Review technical debt
- Update games status
- Sync with ROADMAP.md priorities

---

## 📞 Quick Reference

- **ROADMAP.md** - Strategic vision and priorities
- **CLAUDE.md** - Implementation guide for AI agents
- **ARCHITECTURE.md** - Long-term technical vision
- **STATUS.md** - This file (current state)
