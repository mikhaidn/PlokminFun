# RFC Management Scripts

Helper scripts to streamline RFC creation and management.

## Quick Reference

```bash
# List all RFCs
./scripts/list-rfcs.sh

# Create new RFC
./scripts/new-rfc.sh 006 "Dark Mode Support"

# Update RFC status
./scripts/update-status.sh 005 APPROVED
```

---

## Scripts

### 1. `list-rfcs.sh` - Overview of All RFCs

**Usage:**
```bash
cd /home/user/CardGames/rfcs
./scripts/list-rfcs.sh
```

**Output:**
```
📋 RFC Overview
===============

Total: 5 RFCs
  ✅ Implemented: 1
  🔄 In Progress: 1
  📝 Proposed: 3

All RFCs:
--------
  ✅ 001 - Undo/Redo System (IMPLEMENTED)
  📝 002 - Game Sharing & Replay (PROPOSED)
  🔄 003 - Card Backs & Animations (In Progress)
  📝 004 - Movement Mechanics (PROPOSED)
  📝 005 - Unified Game Builder (PROPOSED)
```

### 2. `new-rfc.sh` - Create New RFC from Template

**Usage:**
```bash
./scripts/new-rfc.sh <number> "<title>" [status]
```

**Examples:**
```bash
# Default status (PROPOSED)
./scripts/new-rfc.sh 006 "Dark Mode Support"

# With custom status
./scripts/new-rfc.sh 007 "Multiplayer Mode" APPROVED
```

**What it does:**
1. Creates new RFC directory from template
2. Updates README.md with title, status, and date
3. Adds entry to INDEX.md
4. Updates statistics

**Valid statuses:**
- `PROPOSED` (default) - 📝
- `IN_REVIEW` - 👀
- `APPROVED` - ✅
- `IMPLEMENTING` - 🔄
- `IMPLEMENTED` - ✅
- `DEFERRED` - ⏸️
- `REJECTED` - ❌

### 3. `update-status.sh` - Update RFC Status

**Usage:**
```bash
./scripts/update-status.sh <rfc-number> <new-status>
```

**Examples:**
```bash
# Mark as approved
./scripts/update-status.sh 005 APPROVED

# Mark as implementing
./scripts/update-status.sh 005 IMPLEMENTING

# Mark as implemented
./scripts/update-status.sh 003 IMPLEMENTED
```

**What it does:**
1. Updates status in RFC's README.md
2. Updates "Updated" date to today
3. Updates emoji and status in INDEX.md
4. Recalculates statistics in INDEX.md

---

## Workflow Examples

### Creating a New RFC

```bash
# 1. Create RFC
./scripts/new-rfc.sh 006 "Mobile Touch Gestures"

# 2. Edit the summary
cd 006-mobile-touch-gestures
vim README.md

# 3. Create sections as needed
vim 01-motivation.md
vim 02-solution.md

# 4. Commit
git add .
git commit -m "docs: add RFC-006 for mobile touch gestures"
```

### Updating RFC Through Lifecycle

```bash
# Start with proposed (automatic from new-rfc.sh)
./scripts/new-rfc.sh 006 "Feature X"

# Move to review
./scripts/update-status.sh 006 IN_REVIEW

# Approve
./scripts/update-status.sh 006 APPROVED

# Start implementing
./scripts/update-status.sh 006 IMPLEMENTING

# Mark as done
./scripts/update-status.sh 006 IMPLEMENTED

# Commit each status change
git add rfcs/
git commit -m "docs: mark RFC-006 as IMPLEMENTED"
```

---

## Manual Updates (When Needed)

### Update Sections List in INDEX.md

After creating section files, update the "Sections" column:

```bash
vim rfcs/INDEX.md

# Change from:
| 006 | Feature X | 📝 PROPOSED | [README](006-feature-x/) | (sections TBD) |

# To:
| 006 | Feature X | 📝 PROPOSED | [README](006-feature-x/) | motivation, solution, implementation |
```

### Add Status Update Notes

Add a status update in the RFC's README.md:

```markdown
## Status Updates

**2025-12-25 - APPROVED:**
- Team reviewed and approved
- Ready for implementation
- Starting Phase 1 next week
```

---

## Tips

**For AI Agents:**
- Always run `./scripts/list-rfcs.sh` first to see current state
- Use `new-rfc.sh` instead of copying template manually
- Use `update-status.sh` to keep INDEX.md in sync

**For Humans:**
- Scripts handle INDEX.md updates automatically
- Still need to manually update sections list in INDEX.md
- Remember to commit after each status change

**Troubleshooting:**
```bash
# If script fails, check:
ls -la rfcs/scripts/*.sh  # Should be executable (-rwxr-xr-x)

# Make executable if needed:
chmod +x rfcs/scripts/*.sh

# Run from rfcs directory:
cd /home/user/CardGames/rfcs
./scripts/list-rfcs.sh
```

---

## Future Enhancements

Possible additions:
- `validate-rfc.sh` - Check RFC structure is valid
- `archive-rfc.sh` - Move implemented/rejected RFCs to archive
- `search-rfcs.sh` - Search across all RFC content
- `generate-toc.sh` - Auto-generate table of contents for RFC

---

**Remember:** These scripts save time but don't replace good documentation. Always write clear, concise RFCs! 📝
