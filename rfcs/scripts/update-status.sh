#!/bin/bash
# Update RFC status in INDEX.md

set -e

# Usage info
if [ "$#" -ne 2 ]; then
    echo "Usage: ./scripts/update-status.sh <rfc-number> <new-status>"
    echo ""
    echo "Examples:"
    echo "  ./scripts/update-status.sh 005 APPROVED"
    echo "  ./scripts/update-status.sh 003 IMPLEMENTED"
    echo ""
    echo "Status options:"
    echo "  PROPOSED      📝 - Initial draft"
    echo "  IN_REVIEW     👀 - Under review"
    echo "  APPROVED      ✅ - Approved, ready to implement"
    echo "  IMPLEMENTING  🔄 - Work in progress"
    echo "  IMPLEMENTED   ✅ - Done and shipped"
    echo "  DEFERRED      ⏸️  - Good idea, wrong time"
    echo "  REJECTED      ❌ - Not moving forward"
    exit 1
fi

RFC_NUM=$1
NEW_STATUS=$2

# Validate RFC number
if ! [[ $RFC_NUM =~ ^[0-9]{3}$ ]]; then
    echo "Error: RFC number must be 3 digits (e.g., 005)"
    exit 1
fi

# Validate status
VALID_STATUSES=("PROPOSED" "IN_REVIEW" "APPROVED" "IMPLEMENTING" "IMPLEMENTED" "DEFERRED" "REJECTED")
if [[ ! " ${VALID_STATUSES[@]} " =~ " ${NEW_STATUS} " ]]; then
    echo "Error: Invalid status '$NEW_STATUS'"
    echo "Valid options: ${VALID_STATUSES[@]}"
    exit 1
fi

# Determine emoji
case $NEW_STATUS in
    PROPOSED)       EMOJI="📝" ;;
    IN_REVIEW)      EMOJI="👀" ;;
    APPROVED)       EMOJI="✅" ;;
    IMPLEMENTING)   EMOJI="🔄" ;;
    IMPLEMENTED)    EMOJI="✅" ;;
    DEFERRED)       EMOJI="⏸️" ;;
    REJECTED)       EMOJI="❌" ;;
esac

# Find RFC directory
RFC_DIR=$(ls -d rfcs/${RFC_NUM}-* 2>/dev/null | head -1)

if [ -z "$RFC_DIR" ]; then
    echo "Error: RFC $RFC_NUM not found"
    exit 1
fi

echo "Updating RFC $RFC_NUM to: $EMOJI $NEW_STATUS"
echo "Directory: $RFC_DIR"
echo ""

# Update README.md in RFC directory
if [ -f "$RFC_DIR/README.md" ]; then
    sed -i "s/\*\*Status:\*\* .*/\*\*Status:\*\* $NEW_STATUS/" "$RFC_DIR/README.md"
    sed -i "s/\*\*Updated:\*\* .*/\*\*Updated:\*\* $(date +%Y-%m-%d)/" "$RFC_DIR/README.md"
    echo "✅ Updated $RFC_DIR/README.md"
fi

# Update INDEX.md
# Find the line with this RFC number and update status column
sed -i "/^| $RFC_NUM |/ s/| [📝👀✅🔄⏸️❌]* [A-Z_]* |/| $EMOJI $NEW_STATUS |/" rfcs/INDEX.md
echo "✅ Updated rfcs/INDEX.md"

# Update statistics
IMPLEMENTED=$(grep -c "| ✅ IMPLEMENTED |" rfcs/INDEX.md || echo "0")
IMPLEMENTING=$(grep -c "| 🔄 IMPLEMENTING |" rfcs/INDEX.md || echo "0")
IN_PROGRESS=$IMPLEMENTING
PROPOSED=$(grep -c "| 📝 PROPOSED |" rfcs/INDEX.md || echo "0")
IN_REVIEW=$(grep -c "| 👀 IN_REVIEW |" rfcs/INDEX.md || echo "0")
PROPOSED_TOTAL=$((PROPOSED + IN_REVIEW))

sed -i "s/- \*\*Implemented:\*\* [0-9]* .*/- **Implemented:** $IMPLEMENTED (RFC-$(grep -o "^| [0-9][0-9][0-9] .*| ✅ IMPLEMENTED |" rfcs/INDEX.md | cut -d'|' -f2 | tr -d ' ' | paste -sd, -))/" rfcs/INDEX.md
sed -i "s/- \*\*In Progress:\*\* [0-9]* .*/- **In Progress:** $IN_PROGRESS (RFC-$(grep -o "^| [0-9][0-9][0-9] .*| 🔄 IMPLEMENTING |" rfcs/INDEX.md | cut -d'|' -f2 | tr -d ' ' | paste -sd, - || echo "none"))/" rfcs/INDEX.md
sed -i "s/- \*\*Proposed:\*\* [0-9]* .*/- **Proposed:** $PROPOSED_TOTAL (RFC-$(grep -o "^| [0-9][0-9][0-9] .*| 📝 PROPOSED |\\|^| [0-9][0-9][0-9] .*| 👀 IN_REVIEW |" rfcs/INDEX.md | cut -d'|' -f2 | tr -d ' ' | paste -sd, -))/" rfcs/INDEX.md

echo ""
echo "Status updated successfully!"
echo ""
echo "Don't forget to:"
echo "  1. Add status update note in $RFC_DIR/README.md"
echo "  2. Commit the changes"
