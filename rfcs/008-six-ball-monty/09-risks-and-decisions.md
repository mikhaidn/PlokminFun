# Risks & Decisions

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **First real-time loop in repo** — rAF/accumulator, frame pacing on low-end phones | Medium | Engine is render-independent; worst case we drop render frames, never simulation ticks. Board is tiny (≤78 cells) so per-tick cost is trivial |
| **Immutable state at 60Hz** creates GC pressure | Low | State is small; structural sharing (only touched rows copied). Profile in Phase 1 before optimizing |
| **WebRTC NAT failures** (symmetric NAT, no TURN) | Medium | Explicit fallback to async seed/ghost races with clear messaging; TURN deferred until demand proven |
| **Rollback mispredictions cause visual pops on opponent's well** | Low | Inputs are sparse so mispredictions are rare; optionally render remote well a few confirmed ticks behind |
| **Rollback window overflow on very high RTT/jitter** | Low | Brief freeze-and-wait past the ring buffer (~1-2s); repeated stalls treated as disconnect, fall back to async play |
| **Signaling infra** (Phase 4 v2) is the repo's first backend | Medium | v1 copy/paste signaling has zero backend; v2 is ~100 lines on a free tier and holds no game state |
| **Solvability search blowup** (>8-piece puzzles) | Low | Hard cap queue length in editor; "Unknown (timed out)" is an acceptable verdict |
| **Scope creep** (5 phases) | Medium | Every phase independently shippable; Phases 1-2 alone deliver a complete solo game |
| **Card-centric shared lib assumptions** | Low | Reuse audit done (07); non-card gaps are additive extractions, no breaking changes |

## IP & naming (important)

Game *mechanics* are not protectable and the drop-match-chain genre long predates Clubhouse Games (Puyo Puyo, 1991). However:
- **Do not** use the name "6-Ball Puzzle", Nintendo/Clubhouse trade dress, art, sounds, or tuning tables copied from the game
- Ship name: **6 Ball Monty** (slug `sixballmonty`) — owner decision D5. "Monty" is our own naming, distinct from Nintendo's "6-Ball Puzzle"; the genre reference in "6 Ball" is fine (a board dimension, not a brand)
- Our chain-power/score tables are original values chosen by playtesting

## Decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| D1 | Engine architecture | Pure deterministic fixed-tick core | Unlocks replays, netcode, puzzle validation, testing (03) |
| D2 | Netcode model | **Rollback w/ input prediction** (owner, 2026-07-07) | Zero local input delay; inputs are sparse so there's rarely anything to roll back, and the pure engine makes re-simulation cheap and exactly correct (reordered inputs just replay) |
| D3 | Online rollout | Async URLs → P2P copy/paste → tiny signaling worker | Value at every step; infra only when proven needed |
| D4 | Mechanics as data | Single `MechanicsConfig` + presets | RFC-005 alignment; variants/daily modes become config |
| D5 | Ship name | **"6 Ball Monty"** (owner, 2026-07-07) | Slug `sixballmonty`, workspace `sixballmonty-mvp` |
| D6 | Piece shape default | Pair (2 balls) | Genre standard, simplest rotation; triples stay config-possible |
| D7 | Hard drop | Off in `classic`, on in `frantic` | Matches genre feel; cheap toggle |
| D8 | Where engine lives | In-app first, extract `TickEngine` to shared after Phase 3 | Prove pattern before generalizing (repo rule: no premature abstraction) |
| D9 | Puzzle storage | URL-only + localStorage library, no backend | Static-site constraint; consistent with RFC-002/006 |
| D10 | Puzzle URL encoding | Fragment (`#p=…`) for full puzzles/replays; query params OK for short human-readable things (`?preset=classic&seed=123`) | Fragments keep multi-hundred-byte payloads out of request logs/analytics and away from URL-length pitfalls; query params stay for values people might read or hand-edit (owner delegated, 2026-07-07) |

## Resolved in review (2026-07-07)

- **Netcode:** rollback over lockstep (D2) — owner call; keep everything lean and pure so re-simulation stays trivial
- **Tuning values:** all numbers in 02 are explicitly placeholders; real defaults come from a Phase 2 playtesting pass, and presets stay marked experimental until then
- **Puzzle URLs:** fragment-based encoding (D10), delegated to implementation
- **Ship name:** "6 Ball Monty" (D5) — owner call
- **Phase ordering:** multiplayer before puzzle maker (owner call): online versus is Phase 4, puzzle maker moves to Phase 5. Versus core (MatchController + garbage) is built headless in Phase 1
- **Engine/graphics split:** hard phase boundary (owner call) — Phase 1 is a rendering-free library + tests; all graphics start in Phase 2
- **URL envelope / wire contracts (was open question #1):** resolved by folding a repo-wide wire-contracts & versioning policy into RFC-006 (owner call, 2026-07-07). This RFC's replays, `hashState`, `NetMsg`, and `PuzzleDef` are registered contracts — see [RFC-006 06-wire-contracts.md](../006-game-state-serialization/06-wire-contracts.md)

## Open questions for review

None — new serialized formats introduced by later phases must register in the [RFC-006 wire-contract registry](../006-game-state-serialization/06-wire-contracts.md) in the PR that ships them.
