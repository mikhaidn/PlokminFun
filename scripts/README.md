# Development Scripts

Helper scripts for maintaining code quality and preventing issues before they reach GitHub.

## Quick Start

```bash
# Install git hooks (one-time setup)
npm run setup-hooks

# Run full validation (what CI runs)
npm run validate
```

## Available Scripts

### `npm run typecheck`
Fast TypeScript type checking without building. Catches type errors immediately.

**When to use:**
- Before committing
- After updating shared types
- When you see weird type errors in IDE

**Example:**
```bash
npm run typecheck
# ✓ No type errors found
```

### `npm run validate`
Runs the full CI pipeline locally: typecheck → lint → test → build

**When to use:**
- Before creating a PR
- Before pushing to main
- When making large changes

**Example:**
```bash
npm run validate
# Runs: typecheck, lint, test, build
# Takes ~30 seconds
```

### `npm run setup-hooks`
Installs pre-commit hook that runs checks automatically.

**What it does:**
- Links `scripts/pre-commit.sh` to `.git/hooks/pre-commit`
- Runs typecheck + lint before every commit
- Prevents committing broken code

**Example:**
```bash
npm run setup-hooks
# ✅ Git hooks installed!

git commit -m "fix: broken code"
# 🔍 Running pre-commit checks...
#   ✗ TypeScript errors in klondike-mvp
# Commit blocked!
```

## Pre-Commit Hook

The pre-commit hook (`pre-commit.sh`) runs:
1. **TypeScript type check** - Catches type errors
2. **ESLint** - Catches unused vars, style issues
3. ~~**Tests**~~ - Commented out (too slow), but you can enable it

**Skipping the hook (not recommended):**
```bash
git commit --no-verify -m "emergency fix"
```

## CI/CD Pipeline

GitHub Actions runs these checks on every PR:

1. **TypeScript Type Check** (`.github/workflows/pr-validation.yml`)
2. **Lint** (ESLint)
3. **Test** (Vitest)
4. **Build** (Vite)

The type check step was added to catch issues like:
- `Type 'string' is not assignable to type 'ios' | 'android' | ...`
- Unused imports/variables
- Redundant type modifiers

## Troubleshooting

**"tsc: command not found"**
```bash
npm install
```

**Hook not running:**
```bash
npm run setup-hooks
chmod +x .git/hooks/pre-commit
```

**Type errors in node_modules:**
```bash
# Type checking only checks our code, not dependencies
# If you see errors in node_modules, check your tsconfig.json
```

## Adding New Checks

To add a new validation step:

1. Add to `scripts/pre-commit.sh`
2. Add to `.github/workflows/pr-validation.yml`
3. Add to `package.json` scripts (for manual running)
4. Update this README

**Example: Adding Prettier**
```bash
# 1. Install prettier
npm install --save-dev prettier

# 2. Add to pre-commit.sh
echo "  ✓ Formatting..."
npx prettier --check . || exit 1

# 3. Add to package.json
"format": "prettier --write .",
"format:check": "prettier --check .",

# 4. Add to PR validation workflow
- name: Format Check
  run: npm run format:check
```
