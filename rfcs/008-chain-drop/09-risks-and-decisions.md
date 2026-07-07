# Risks & Decisions

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **First real-time loop in repo** — rAF/accumulator, frame pacing on low-end phones | Medium | Engine is render-independent; worst case we drop render frames, never simulation ticks. Board is tiny (≤78 cells) so per-tick cost is trivial |
| **Immutable state at 60Hz** creates GC pressure | Low | State is small; structural sharing (only touched rows copied). Profile in Phase 1 before optimizing |
| **WebRTC NAT failures** (symmetric NAT, no TURN) | Medium | Explicit fallback to async seed/ghost races with clear messaging; TURN deferred until demand proven |
| **Lockstep feels laggy on high RTT** | Medium | Input-delay tuning; cap matchable RTT; rollback upgrade path kept open by pure engine |
| **Signaling infra** (Phase 5 v2) is the repo's first backend | Medium | v1 copy/paste signaling has zero backend; v2 is ~100 lines on a free tier and holds no game state |
| **Solvability search blowup** (>8-piece puzzles) | Low | Hard cap queue length in editor; "Unknown (timed out)" is an acceptable verdict |
| **Scope creep** (5 phases) | Medium | Every phase independently shippable; Phases 1-2 alone deliver a complete solo game |
| **Card-centric shared lib assumptions** | Low | Reuse audit done (07); non-card gaps are additive extractions, no breaking changes |

## IP & naming (important)

Game *mechanics* are not protectable and the drop-match-chain genre long predates Clubhouse Games (Puyo Puyo, 1991). However:
- **Do not** use the name "6-Ball Puzzle", Nintendo/Clubhouse trade dress, art, sounds, or tuning tables copied from the game
- Working name: **Chain Drop** (slug `chaindrop`) — final name is Decision D5
- Our chain-power/score tables are original values chosen by playtesting

## Decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| D1 | Engine architecture | Pure deterministic fixed-tick core | Unlocks replays, netcode, puzzle validation, testing (03) |
| D2 | Netcode model | Lockstep w/ input delay (not rollback) | Simplest correct thing for 1v1 puzzle; rollback path preserved |
| D3 | Online rollout | Async URLs → P2P copy/paste → tiny signaling worker | Value at every step; infra only when proven needed |
| D4 | Mechanics as data | Single `MechanicsConfig` + presets | RFC-005 alignment; variants/daily modes become config |
| D5 | Ship name | **OPEN** — "Chain Drop" placeholder | Needs owner sign-off before Phase 2 landing-page entry |
| D6 | Piece shape default | Pair (2 balls) | Genre standard, simplest rotation; triples stay config-possible |
| D7 | Hard drop | Off in `classic`, on in `frantic` | Matches genre feel; cheap toggle |
| D8 | Where engine lives | In-app first, extract `TickEngine` to shared after Phase 3 | Prove pattern before generalizing (repo rule: no premature abstraction) |
| D9 | Puzzle storage | URL-only + localStorage library, no backend | Static-site constraint; consistent with RFC-002/006 |

## Open questions for review

1. Preset tuning values (gravity curve, power table) — proposed numbers in 02 are starting points for playtesting, not commitments
2. Should Phase 4 (puzzle maker) precede Phase 3 (local versus)? Puzzle mode may have broader solo appeal; order is swappable — only Phase 5 hard-depends on 3
3. Does RFC-006 want to adopt this RFC's URL envelope (deflate+base64url fragment) as its general format?
