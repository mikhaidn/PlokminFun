# RFCs (Request for Comments)

This directory contains design documents for significant technical decisions in the CardGames project.

## What is an RFC?

An RFC (Request for Comments) is a lightweight design document that:
- **Proposes** a solution to a technical problem
- **Analyzes** alternatives and trade-offs
- **Documents** the decision-making process
- **Guides** implementation

RFCs are written **before coding** to clarify thinking and gather feedback.

## When to Write an RFC

✅ **Write an RFC for:**
- Major features (undo/redo, multiplayer, etc.)
- Architectural changes (state management, library extraction)
- Technical decisions with long-term impact
- Features that affect multiple games
- Anything that takes >1 day to implement

❌ **Don't write an RFC for:**
- Bug fixes
- Small UI tweaks
- Obvious implementations
- Experiments/prototypes

## RFC Process

### 1. Write
- Copy `000-template.md` to `NNN-feature-name.md`
- Fill in all sections
- Focus on **why** not just **what**
- Consider alternatives
- Define success metrics

### 2. Review
- Share with team (or future you)
- Gather feedback
- Revise based on comments

### 3. Decide
- Update status to APPROVED, REJECTED, or DEFERRED
- Document rationale

### 4. Implement
- Reference RFC in PR descriptions
- Update RFC if implementation diverges
- Mark as IMPLEMENTED when done

### 5. Learn
- Revisit after implementation
- Document what worked / didn't work
- Update with lessons learned

## RFC Format

Each RFC should include:

1. **Executive Summary** - TL;DR of the proposal
2. **Problem Statement** - What problem are we solving?
3. **Proposed Solution** - How will we solve it?
4. **Alternatives Considered** - What else did we consider?
5. **Technical Deep Dive** - Implementation details
6. **Implementation Plan** - Phased rollout
7. **Success Metrics** - How do we measure success?
8. **Risks and Mitigations** - What could go wrong?
9. **Open Questions** - What's unclear?
10. **Future Enhancements** - What comes next?

## RFC Lifecycle

```
PROPOSED → IN REVIEW → APPROVED → IMPLEMENTING → IMPLEMENTED
                    ↓
                REJECTED / DEFERRED
```

## Current RFCs

| Number | Title | Status | Author | Date |
|--------|-------|--------|--------|------|
| [001](./001-undo-redo-system.md) | Universal Undo/Redo System | Proposed | Team | 2025-12-22 |

## Tips for Writing Good RFCs

### L5-Level Thinking
- **Think in systems, not features** - How does this affect future work?
- **Optimize for change** - What will we learn? How will this evolve?
- **Create leverage** - Can others reuse this pattern?
- **Document trade-offs** - Why this approach over alternatives?
- **Define success** - How will we know if this worked?

### Be Concise
- Aim for 2-5 pages
- Use code examples
- Bullet points over paragraphs
- Tables for comparisons

### Show Your Work
- Explain the **why** behind decisions
- Show alternatives you rejected
- Include data/benchmarks if available
- Be honest about unknowns

### Make It Actionable
- Clear implementation plan
- Defined success metrics
- Identified risks
- Concrete next steps

## Resources

- [Rust RFC Process](https://rust-lang.github.io/rfcs/) - Gold standard
- [React RFCs](https://github.com/reactjs/rfcs) - Good examples
- [6-Page Narrative (Amazon)](https://www.amazon.jobs/en/landing_pages/narrative) - Writing advice

## Questions?

For questions about the RFC process, see:
- `CLAUDE.md` - Implementation guide
- `ROADMAP.md` - Strategic priorities
- `ARCHITECTURE.md` - Long-term vision
