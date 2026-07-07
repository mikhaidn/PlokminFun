# Motivation

## The inspiration

*6-Ball Puzzle* is the falling-ball chain game in **Clubhouse Games: 51 Worldwide Classics** (Nintendo Switch). It belongs to the Puyo-Puyo family of action puzzlers:

- Colored balls drop into a narrow well as player-controlled pieces
- Connecting **4+ same-colored balls** (orthogonally) pops them
- Pops make balls above fall, which can trigger new pops — **chains**
- In versus mode, chains send **garbage balls** to the opponent's well
- You lose when your well fills to the top

The *essence* we want is not Nintendo's specific implementation — it's the genre core: **drop, match, chain, attack**. It's easy to learn, deep to master, and unlike everything we've built so far, it's real-time and inherently competitive.

## Why this game, why now

The repo has two shipped solitaire games, a shared library, and a config-driven game-builder direction (RFC-005). What we *don't* have:

| Capability gap | How Chain Drop fills it |
|---|---|
| **Real-time gameplay** | Fixed-timestep engine with gravity, lock delay, input queue |
| **Multiplayer (any kind)** | Local 2P versus is a core mode, not an add-on |
| **Online play** | Deterministic engine makes input-only netcode (lockstep) viable on static hosting |
| **User-generated content** | Puzzle maker + shareable puzzle URLs |
| **Non-card games** | Proves the shared library's game-agnostic pieces (controls, settings, RNG, analytics) beyond solitaire |

Each of these is a *repo capability*, not just a game feature. The deterministic-engine pattern (03-engine.md) is designed to be lifted into `@plokmin/shared` later so future action games (Tetris-likes, match-3s) inherit replays, netcode, and puzzle authoring for free.

## Why an RFC

Per [INDEX.md](../INDEX.md) criteria this hits four triggers: major feature, multiplayer, affects multiple games (via shared extraction), >1 day of work, long-term architectural impact.

## Strategic fit

- **VISION alignment:** mobile-first, accessible, delightful — the genre works great on touch and short sessions
- **RFC-005 alignment:** mechanics are expressed as a declarative `MechanicsConfig`, same philosophy as the unified game builder, so variants (mini boards, speed modes, daily puzzles) are config, not code
- **RFC-002/006 alignment:** puzzle sharing and replays reuse the URL-serialization direction already proposed for card games

## Non-goals (for this RFC)

- Cloning Nintendo's exact tuning, art, or name (see 09-risks-and-decisions.md on IP)
- Ranked matchmaking / accounts / server infrastructure beyond minimal signaling
- More than 2 players per match (engine won't preclude it; UI will not attempt it yet)
