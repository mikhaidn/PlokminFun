# Wire Contracts & Versioning Policy (repo-wide)

**Adopted 2026-07-07 by owner decision.** This section is *active policy* for the
whole repo, even while RFC-006's card-position encoding itself remains proposed.
It also resolves RFC-008's open question: the versioned-envelope approach is
adopted repo-wide, and this file is the registry.

---

## The distinction that matters

The repo has two kinds of API, and they deserve opposite treatment:

**In-tree interfaces** — `@plokmin/shared` exports, `sixballmonty-mvp/src/engine`,
`GameConfig`. Every consumer compiles in the same CI run; the TypeScript compiler
and the test suite *are* the contract. These stay freely refactorable. No semver,
no deprecation cycles, no API docs beyond code comments. Adding that ceremony
would violate the repo's no-unnecessary-abstraction rule.

**Wire contracts** — anything serialized that *escapes the build*: a URL someone
texts a friend, a localStorage save, a network message between two peers, a
state-hash fingerprint. The producer and consumer can be **different versions of
the app**, so no compiler protects them. These are first-class and follow the
rules below.

---

## Rules for every wire contract

1. **Version first.** The payload's first field/byte identifies the format
   version (`v1…`, `{"version":1,…}`).
2. **Validate on decode.** Decoders reject malformed or unknown-version payloads
   with an explicit error — never misparse, never crash. Unknown *newer* version
   → "please update" message, not garbage state.
3. **Golden fixtures in CI.** Checked-in encoded samples must keep decoding;
   any format change fails tests until fixtures are regenerated *deliberately*.
   (6 Ball Monty's golden replays are the model — engine tick semantics are
   themselves a wire contract, since a stored replay is meaningless if they drift.)
4. **Registered home.** Every contract has one owning document (table below).
   Shipping a new serialized format means adding a row here in the same PR.
5. **Evolve deliberately, per kind:**
   - **URLs** never expire: old versions stay decodable forever (a shared puzzle
     link must work next year).
   - **Storage** migrates forward: `migrateOldSettings` in
     `shared/utils/settingsStorage` is the precedent.
   - **Network protocols** refuse on mismatch: peers exchange version + config
     hash in `hello` and decline the match cleanly (RFC-008 05-online.md).

---

## Envelope standard (resolves RFC-008 open question #1)

- **Fragment (`#p=…`) for opaque payloads** — anything long (≳100 chars),
  compressed, or containing user content (puzzle defs, replays). Fragments stay
  out of request logs/analytics and clear of URL-length pitfalls. Encoding:
  payload → deflate (when it helps) → base64url, version inside.
- **Query params for short, human-readable values** — things a person might
  read or hand-edit: `?preset=classic&seed=123`, RFC-006's ~73-119-char card
  positions (`?p=v1K03…`).
- Bit-packed (RFC-006 positions) and deflated-JSON (RFC-008 puzzles/replays)
  encodings both comply — the envelope rule is about versioning + transport,
  not one binary format.

---

## Contract registry

| Contract | Kind | Owning doc / code | Status |
|---|---|---|---|
| Card position encoding (`v1F…`/`v1K…`) | URL | RFC-006 [02-solution.md](02-solution.md) | Proposed |
| 6BM replay `(seed, inputs, ticks)` | JSON now, URL in ph5 | RFC-008 [03-engine.md](../008-six-ball-monty/03-engine.md); `engine/replay.ts` | Shipped (Phase 1) |
| 6BM engine tick semantics | behavioral | golden replays in `engine/__tests__/` | Shipped (Phase 1) |
| 6BM `hashState` fingerprint | network/test | `engine/replay.ts` | Shipped (Phase 1) |
| 6BM `NetMsg` rollback protocol | network | RFC-008 [05-online.md](../008-six-ball-monty/05-online.md) | Planned (Phase 4) |
| 6BM `PuzzleDef` | URL + storage | RFC-008 [06-puzzle-maker.md](../008-six-ball-monty/06-puzzle-maker.md) | Planned (Phase 5) |
| Settings storage | localStorage | `shared/utils/settingsStorage.ts` | Shipped (has migration) |
| Game saves (persistence, P6) | localStorage | RFC-006 + P6 roadmap item | Planned |

---

## Explicit non-goals

- No semver/publishing for `@plokmin/shared` or game engines (in-tree only).
- No OpenAPI/REST design — the repo stays static-hosted; the Phase 4 signaling
  worker relays opaque blobs and defines no game-facing API.
- No speculative backend contracts (leaderboards, accounts) before demand.
