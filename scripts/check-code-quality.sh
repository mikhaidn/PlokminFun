#!/bin/bash
# Code Quality Check Script
# Detects unused variables, type errors, and formatting issues

set -e  # Exit on first error

echo "🔍 Running Code Quality Checks..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Function to print section header
print_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 1. TypeScript Type Checking (catches unused variables!)
print_section "1️⃣  TypeScript Type Checking (includes unused variable detection)"
echo "Running: tsc --noEmit"
echo ""
if npm run typecheck; then
    echo -e "${GREEN}✅ TypeScript: No type errors or unused variables${NC}"
else
    echo -e "${RED}❌ TypeScript: Found type errors or unused variables${NC}"
    OVERALL_STATUS=1
fi

# 2. Prettier Formatting
print_section "2️⃣  Prettier Formatting Check"
echo "Running: prettier --check ."
echo ""
if npm run format:check; then
    echo -e "${GREEN}✅ Prettier: All files properly formatted${NC}"
else
    echo -e "${YELLOW}⚠️  Prettier: Formatting issues found${NC}"
    echo ""
    echo "Fix with: npm run format"
    OVERALL_STATUS=1
fi

# 3. ESLint (if available)
print_section "3️⃣  ESLint (if available)"
if command -v eslint &> /dev/null; then
    echo "Running: eslint ."
    echo ""
    if npm run lint; then
        echo -e "${GREEN}✅ ESLint: No linting errors${NC}"
    else
        echo -e "${RED}❌ ESLint: Linting errors found${NC}"
        echo ""
        echo "Fix with: npm run lint:fix"
        OVERALL_STATUS=1
    fi
else
    echo -e "${YELLOW}⚠️  ESLint not available (install with: npm install)${NC}"
fi

# Summary
print_section "📊 Summary"
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your code is ready to commit."
else
    echo -e "${RED}❌ Some checks failed${NC}"
    echo ""
    echo "Fix the issues above before committing."
    echo ""
    echo "Quick fixes:"
    echo "  • Formatting: npm run format"
    echo "  • ESLint: npm run lint:fix"
    echo "  • TypeScript: Check the errors above"
fi

exit $OVERALL_STATUS
