#!/bin/bash
#
# Pre-push validation script
# Runs comprehensive checks before pushing to ensure deployment will succeed
#
# To use automatically, run: npm run setup-hooks
# Or manually: ln -s ../../scripts/pre-push.sh .git/hooks/pre-push
#

set -e  # Exit on first error

echo "🚀 Running pre-push checks (comprehensive validation)..."

# 1. Format check
echo "  ✓ Format checking..."
npx prettier --check . > /dev/null 2>&1 || {
  echo ""
  echo "  ✗ Format errors found"
  echo ""
  echo "💡 Quick fix: Run 'npm run format' to auto-fix formatting issues"
  echo ""
  exit 1
}

# 2. TypeScript type checking (all workspaces)
echo "  ✓ Type checking all workspaces..."
npm run typecheck > /dev/null 2>&1 || {
  echo ""
  echo "  ✗ TypeScript errors found"
  echo ""
  npm run typecheck
  echo ""
  exit 1
}

# 3. Linting (all workspaces)
echo "  ✓ Linting all workspaces..."
npm run lint -ws --if-present > /dev/null 2>&1 || {
  echo ""
  echo "  ✗ Lint errors found"
  echo ""
  npm run lint -ws --if-present
  echo ""
  echo "💡 Quick fix: Run 'npm run lint:fix' to auto-fix most issues"
  echo ""
  exit 1
}

# 4. Tests (all workspaces)
echo "  ✓ Running all tests..."
npm test -- --run > /dev/null 2>&1 || {
  echo ""
  echo "  ✗ Tests failed"
  echo ""
  npm test -- --run
  echo ""
  exit 1
}

# 5. Build ALL workspaces (CRITICAL for deployment)
echo "  ✓ Building all workspaces (deployment verification)..."
npm run build > /dev/null 2>&1 || {
  echo ""
  echo "  ✗ Build failed"
  echo ""
  npm run build
  echo ""
  exit 1
}

# 6. Verify all dist folders exist (deployment sanity check)
echo "  ✓ Verifying deployment artifacts..."
MISSING_DIST=""
for workspace in freecell-mvp klondike-mvp dog-care-tracker pet-care; do
  if [ ! -d "$workspace/dist" ]; then
    MISSING_DIST="$MISSING_DIST $workspace"
  fi
done

if [ -n "$MISSING_DIST" ]; then
  echo ""
  echo "  ✗ Missing dist folders for:$MISSING_DIST"
  echo ""
  echo "  These apps won't deploy to production!"
  echo "  Run 'npm run build' to fix."
  echo ""
  exit 1
fi

echo ""
echo "✅ All pre-push checks passed!"
echo "   All workspaces built successfully and ready for deployment."
echo ""
