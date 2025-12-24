# Alternatives Considered

## Alternative 1: Keep Code Separate

**Approach:** Leave FreeCell and Klondike implementations independent.

**Pros:**
- No migration risk
- Games remain fully decoupled
- Each game optimized for its specific needs

**Cons:**
- Continue duplicating bug fixes
- High cost for adding new games
- Testing overhead doubles
- Inconsistent user experience

**Decision:** Rejected. Technical debt will compound over time.

---

## Alternative 2: Use cardIndex Everywhere

**Approach:** Standardize on FreeCell's index-based selection instead of count-based.

**Pros:**
- Matches FreeCell's current implementation
- Precise card selection (by position)

**Cons:**
- Less intuitive than "moving N cards"
- Requires conversion in Klondike (currently uses count)
- More complex mental model for developers

**Decision:** Rejected in favor of cardCount (see Decision 1 in decisions.md).

---

## Alternative 3: Dual Representation (cardIndex AND cardCount)

**Approach:** Support both index and count in shared types, let games choose.

**Pros:**
- Maximum flexibility
- No conversion needed at game boundaries

**Cons:**
- Complex shared types with two ways to represent same thing
- Confusion about which to use
- More error-prone (must handle both cases everywhere)

**Decision:** Rejected. Simplicity beats flexibility for shared abstractions.

---

## Alternative 4: Combined Validation + Execution

**Approach:** Single function that validates AND executes moves atomically.

```typescript
interface CardInteractionConfig {
  // Returns new state if valid, null if invalid
  attemptMove: (from: GameLocation, to: GameLocation) => GameState | null;
}
```

**Pros:**
- Simpler interface (one function instead of two)
- Impossible to execute without validation

**Cons:**
- Can't show validation feedback before executing
- Harder to test validation separately
- Couples pure logic (validation) with side effects (execution)

**Decision:** Rejected. Separation of concerns is more important.

---

## Alternative 5: Consolidate Auto-Move Too

**Approach:** Include auto-move logic in this RFC alongside movement mechanics.

**Pros:**
- Single comprehensive consolidation
- All move-related code unified at once

**Cons:**
- Auto-move strategies are fundamentally different:
  - FreeCell: Automatic on timer, conservative (safe moves only)
  - Klondike: Manual button, aggressive (all valid moves)
- Would complicate this RFC significantly
- Higher risk (too many changes at once)

**Decision:** Deferred to future RFC-005. Focus this RFC on core mechanics.

---

## Alternative 6: Migrate FreeCell First

**Approach:** Start with FreeCell instead of Klondike.

**Pros:**
- FreeCell has more complex rules (supermoves)
- If it works for FreeCell, Klondike will be easy

**Cons:**
- Higher risk (complex migration first)
- Harder to debug issues in complex context
- FreeCell requires cardIndex→cardCount conversion

**Decision:** Rejected in favor of Klondike-first (see Decision 6 in decisions.md).

---

## Alternative 7: Big Bang Migration

**Approach:** Migrate everything at once without feature flags.

**Pros:**
- Faster implementation (no parallel code paths)
- Cleaner git history (one commit)

**Cons:**
- High risk (no rollback mechanism)
- Hard to debug if issues arise
- All-or-nothing deployment

**Decision:** Rejected in favor of phased migration with feature flags.

---

## Alternative 8: Create New Abstraction Layer

**Approach:** Create intermediate "Game Engine" abstraction between games and shared code.

**Pros:**
- Clean separation of concerns
- Could support non-solitaire games eventually
- More extensible architecture

**Cons:**
- Over-engineering for current needs (2 games)
- More complexity without clear benefit
- Longer implementation time

**Decision:** Rejected. YAGNI - build what we need now, refactor later if needed.
