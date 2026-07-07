# Online Play

## Constraint

The site is static GitHub Pages — no game servers. The plan exploits the deterministic engine so that online play needs **input exchange only**, and rolls out in three steps of increasing infrastructure.

## Step 1: Async challenges (no infra at all)

Deterministic `(config, seed, inputs)` replays (03-engine.md) enable server-less competition:

- **Seed race:** share a URL encoding `{ preset, seed }`; both players get identical piece sequences; compare scores/times. Same mechanism as RFC-002's shared deals
- **Ghost race:** URL (or pasted code) additionally embeds a compressed replay; opponent's ghost well plays back beside yours while you race it
- Encoding reuses the compact URL serialization direction of **RFC-006** (base64url, versioned header). Replays are small: a 3-minute game is a few hundred input events

This ships real "play against a friend" value with zero servers and is the fallback whenever real-time fails.

## Step 2: Real-time versus over WebRTC (Phase 5)

**Topology:** 1v1 peer-to-peer `RTCDataChannel`, no relay of game traffic.

**Netcode model: deterministic lockstep with input delay.**
- Both peers run the full `MatchController` locally
- Each peer sends its `InputEvent`s stamped for tick `T + delay` (delay ≈ 3-6 ticks, tuned to RTT); engines only advance tick `T` once both peers' inputs for `T` are in hand
- Periodic **state-hash exchange** (every ~60 ticks) detects desync; on mismatch, end the round gracefully with a diagnostic (and a bug-report link via the existing `bugReport` utility)

Why lockstep and not rollback: for a 2-player puzzle game with modest input rates, a few ticks of input delay is imperceptible, and lockstep avoids re-simulation machinery entirely. Rollback (GGPO-style) stays on the table as a later upgrade — the pure `tick` function is exactly what rollback needs, so nothing is foreclosed.

**Signaling (the only infra question):**
1. **v1 — copy/paste signaling:** host generates an offer code, guest pastes it back (manual SDP exchange). Zero backend; clunky but proves the netcode
2. **v2 — minimal signaling service:** a tiny room-code broker (e.g. a free-tier Cloudflare Worker + KV/Durable Object, ~100 lines) exchanging SDP blobs. No game logic server-side, no accounts
3. **STUN:** free public STUN servers for NAT traversal; **no TURN initially** (symmetric-NAT pairs fall back to Step 1 async play with a clear message)

## Step 3 (future, out of scope): matchmaking & persistence

Random-opponent matchmaking, ratings, and daily-challenge leaderboards would require real backend state. Deferred until the game proves engagement; nothing in Steps 1-2 blocks it.

## Protocol sketch (Step 2)

```typescript
type NetMsg =
  | { t: 'hello'; version: string; preset: string; seed: number }
  | { t: 'inputs'; tick: number; events: InputEvent[] }   // sent every tick, empty allowed
  | { t: 'hash'; tick: number; p1: number; p2: number }
  | { t: 'pause' } | { t: 'resume' } | { t: 'forfeit' };
```

Versioned by app build + config hash in `hello`; mismatch → refuse match with upgrade prompt.

## Failure handling

- Data channel drop → 5s reconnect window (ICE restart), else opponent wins by disconnect
- Clock skew is irrelevant (tick-synced, not wall-clock-synced)
- All net code lives in `src/net/`, implementing the same input-producer interface as local adapters (04) — the engine and UI cannot tell the difference
