#!/bin/bash
# Create a new RFC from template

set -e

# Usage info
if [ "$#" -lt 1 ]; then
    echo "Usage: ./scripts/new-rfc.sh <rfc-number> <title> [status]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/new-rfc.sh 006 \"Dark Mode Support\""
    echo "  ./scripts/new-rfc.sh 007 \"Multiplayer Mode\" PROPOSED"
    echo ""
    echo "Status options: PROPOSED, IN_REVIEW, APPROVED, IMPLEMENTING, IMPLEMENTED, DEFERRED, REJECTED"
    echo "Default: PROPOSED"
    exit 1
fi

RFC_NUM=$1
TITLE=$2
STATUS=${3:-PROPOSED}

# Validate RFC number format
if ! [[ $RFC_NUM =~ ^[0-9]{3}$ ]]; then
    echo "Error: RFC number must be 3 digits (e.g., 006)"
    exit 1
fi

# Create RFC directory
RFC_DIR="rfcs/${RFC_NUM}-$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"

if [ -d "$RFC_DIR" ]; then
    echo "Error: RFC directory already exists: $RFC_DIR"
    exit 1
fi

echo "Creating RFC $RFC_NUM: $TITLE"
echo "Directory: $RFC_DIR"
echo "Status: $STATUS"
echo ""

# Copy template
cp -r rfcs/000-template "$RFC_DIR"

# Update README.md with title and status
sed -i "s/RFC-000: \[Feature Name\]/RFC-$RFC_NUM: $TITLE/" "$RFC_DIR/README.md"
sed -i "s/Status:** PROPOSED | IN REVIEW | APPROVED | IMPLEMENTING | IMPLEMENTED | DEFERRED | REJECTED/Status:** $STATUS/" "$RFC_DIR/README.md"
sed -i "s/Author:** \[Your Name\]/Author:** Architecture Team/" "$RFC_DIR/README.md"
sed -i "s/Created:** YYYY-MM-DD/Created:** $(date +%Y-%m-%d)/" "$RFC_DIR/README.md"
sed -i "s/Updated:** YYYY-MM-DD/Updated:** $(date +%Y-%m-%d)/" "$RFC_DIR/README.md"

# Determine emoji based on status
case $STATUS in
    PROPOSED)       EMOJI="📝" ;;
    IN_REVIEW)      EMOJI="👀" ;;
    APPROVED)       EMOJI="✅" ;;
    IMPLEMENTING)   EMOJI="🔄" ;;
    IMPLEMENTED)    EMOJI="✅" ;;
    DEFERRED)       EMOJI="⏸️" ;;
    REJECTED)       EMOJI="❌" ;;
    *)              EMOJI="📝" ;;
esac

# Add to INDEX.md
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
NEW_LINE="| $RFC_NUM | $TITLE | $EMOJI $STATUS | [README]($RFC_NUM-$SLUG/) | (sections TBD) |"

# Find the line with RFC 004 or last RFC and insert after it
sed -i "/| 00[0-9] |/a\\$NEW_LINE" rfcs/INDEX.md

# Update statistics
TOTAL=$(ls -d rfcs/[0-9][0-9][0-9]-* 2>/dev/null | wc -l)
sed -i "s/- \*\*Total RFCs:\*\* [0-9]*/- **Total RFCs:** $TOTAL/" rfcs/INDEX.md

echo "✅ Created $RFC_DIR"
echo "✅ Updated rfcs/INDEX.md"
echo ""
echo "Next steps:"
echo "  1. cd $RFC_DIR"
echo "  2. Edit README.md (TL;DR summary)"
echo "  3. Create section files as needed (01-motivation.md, etc.)"
echo "  4. Update sections list in INDEX.md when done"
echo ""
echo "Quick edit:"
echo "  vim $RFC_DIR/README.md"
