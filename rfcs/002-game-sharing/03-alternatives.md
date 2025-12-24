# Alternatives Considered

## Alternative 1: Current State-Based Serialization

### Approach

Use existing `HistoryManager.serialize()` which stores full game states.

```typescript
const encoded = btoa(JSON.stringify(historyManager.serialize()));
// Result: ~700KB base64 string
```

### Pros

- ✅ Already implemented
- ✅ Captures full state (no replay needed)
- ✅ No move validation required

### Cons

- ❌ **520KB per game** - Too large for URLs (2KB limit)
- ❌ Can't share via URL, only file download
- ❌ Not human-readable
- ❌ Bloated for simple sharing

### Decision

**REJECTED** for sharing (keep for local persistence)

**Rationale:** Size makes URL sharing impractical. Good for save/load, bad for social sharing.

---

## Alternative 2: Backend Move Registry

### Approach

Store moves on server, share short IDs like `freecell.game/abc123`

```typescript
// Client encodes, uploads to server
const gameId = await uploadGame(session);
// Share: https://freecell.game/abc123
```

### Pros

- ✅ Ultra-short URLs (8 chars)
- ✅ Can track popularity/leaderboards
- ✅ Analytics on game difficulty

### Cons

- ❌ Requires backend infrastructure ($$$)
- ❌ Requires maintenance
- ❌ Single point of failure
- ❌ Violates "no backend" design goal
- ❌ Privacy concerns (all games stored)

### Decision

**DEFERRED** until 10k+ daily users

**Rationale:** Premature optimization. Start with client-side, add backend if needed.

---

## Alternative 3: PNG/QR Code Encoding

### Approach

Encode game as QR code or steganography in win screen image.

```typescript
// Generate QR code with encoded game
const qr = generateQR(encodeGame(session));
// User shares image on social media
```

### Pros

- ✅ Works on platforms that strip URLs (Instagram)
- ✅ Visual sharing appeal
- ✅ Can embed in win screenshot

### Cons

- ❌ Requires QR scanning (friction)
- ❌ Image format harder to work with
- ❌ Still need text encoding anyway

### Decision

**NICE-TO-HAVE** addition (Phase 3)

**Rationale:** Complement to URL sharing, not replacement. Add in Phase 2 if time permits.

---

## Alternative 4: Local Storage Registry

### Approach

Store games in localStorage with short keys, share keys instead of full encoding.

```typescript
// Save to localStorage
const key = generateShortKey(); // "G4Z3M"
localStorage.setItem(`game_${key}`, JSON.stringify(session));
// Share: "FreeCell #G4Z3M"
```

### Pros

- ✅ Ultra-short share codes
- ✅ No backend needed
- ✅ Fast lookup

### Cons

- ❌ Only works on same device/browser
- ❌ Can't share with others
- ❌ localStorage can be cleared

### Decision

**REJECTED** for cross-device sharing

**Rationale:** Defeats the purpose of sharing. Only useful for local bookmarks, not social features.

---

## Open Questions Resolved

### 1. Should we support partial game sharing (mid-game)?

**Decision:** Start with completed games, add partial in Phase 2

**Rationale:**
- Completed games: Simpler UX, smaller size, clear goal
- Partial games: Better for "help me solve this", bug reports
- Can add partial sharing later without breaking existing shares

---

### 2. What replay speed is default?

**Decision:** Default 2x, allow speed control (0.5x, 1x, 2x, 4x)

**Rationale:**
- Real-time (1 move/sec) is too slow for 100-move games
- 2x is fast enough to be engaging but slow enough to follow
- Users can adjust to preference

---

### 3. Should we record timestamps for moves?

**Decision:** Optional in Phase 3, not Phase 1

**Rationale:**
- **Pros:** Can replay at original speed, analyze solve time
- **Cons:** Adds ~2 bytes per move (×100 = 200 bytes)
- Most shares don't need timestamps
- Can add as optional metadata later

---

### 4. Compression: gzip or custom?

**Decision:** Start without, add gzip if size >2KB in testing

**Analysis:**
- Games are ~400 bytes uncompressed
- gzip: ~250 bytes (37% savings)
- Custom run-length encoding: potentially better, but more complex

**Rationale:**
- Keep implementation simple for Phase 1
- Add compression only if needed based on real usage data
- Premature optimization risk
