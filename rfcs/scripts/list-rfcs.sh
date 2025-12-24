#!/bin/bash
# Quick overview of all RFCs

echo "📋 RFC Overview"
echo "==============="
echo ""

# Detect if we're in rfcs/ or root
if [ -f "INDEX.md" ]; then
    RFC_DIR="."
else
    RFC_DIR="rfcs"
fi

# Count by status (exclude template and .md files)
TOTAL=$(ls -d $RFC_DIR/[0-9][0-9][0-9]-*/ 2>/dev/null | grep -v "000-template" | wc -l)
IMPLEMENTED=$(grep -c "✅ IMPLEMENTED" $RFC_DIR/INDEX.md 2>/dev/null || echo "0")
IMPLEMENTING=$(grep -c "🔄 IMPLEMENTING\|🔄 In Progress" $RFC_DIR/INDEX.md 2>/dev/null || echo "0")
PROPOSED=$(grep -c "📝 PROPOSED" $RFC_DIR/INDEX.md 2>/dev/null || echo "0")

echo "Total: $TOTAL RFCs"
echo "  ✅ Implemented: $IMPLEMENTED"
echo "  🔄 In Progress: $IMPLEMENTING"
echo "  📝 Proposed: $PROPOSED"
echo ""

# List all RFCs
echo "All RFCs:"
echo "--------"

for dir in $RFC_DIR/[0-9][0-9][0-9]-*/; do
    if [ -d "$dir" ] && [[ ! "$dir" =~ 000-template ]]; then
        RFC_NUM=$(basename "$dir" | cut -d'-' -f1)
        TITLE=$(grep "^# RFC-" "$dir/README.md" 2>/dev/null | head -1 | sed 's/^# RFC-[0-9]*: //' || echo "Unknown")
        STATUS=$(grep "^\*\*Status:\*\*" "$dir/README.md" 2>/dev/null | sed 's/\*\*Status:\*\* //' || echo "Unknown")

        # Get emoji for status
        case $STATUS in
            PROPOSED)       EMOJI="📝" ;;
            "IN REVIEW")    EMOJI="👀" ;;
            APPROVED)       EMOJI="✅" ;;
            IMPLEMENTING)   EMOJI="🔄" ;;
            IMPLEMENTED)    EMOJI="✅" ;;
            "In Progress")  EMOJI="🔄" ;;
            DEFERRED)       EMOJI="⏸️" ;;
            REJECTED)       EMOJI="❌" ;;
            *)              EMOJI="❓" ;;
        esac

        printf "  %s %s - %s (%s)\n" "$EMOJI" "$RFC_NUM" "$TITLE" "$STATUS"
    fi
done

echo ""
echo "💡 Tips:"
echo "  - Read summary: cat rfcs/XXX-name/README.md"
echo "  - Create new RFC: ./scripts/new-rfc.sh XXX \"Title\""
echo "  - Update status: ./scripts/update-status.sh XXX STATUS"
