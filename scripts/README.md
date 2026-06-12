# Development Scripts

Helper scripts for the Plokmin Consortium monorepo.

---

## 🚀 init-experience.sh - Create New Experiences

**Create a new Plokmin Consortium experience in ~30 seconds.**

### Usage

```bash
./scripts/init-experience.sh experience-name

# Example
./scripts/init-experience.sh habit-tracker
```

**What it creates:**
- ✅ Full React + TypeScript + Vite PWA setup
- ✅ Default icon, manifest, service worker
- ✅ Integrated into monorepo (workspaces, scripts)
- ✅ Discovered automatically by deploy + landing page (via the `plokmin` package.json block)
- ✅ Ready to deploy to GitHub Pages immediately

**📖 Full documentation:** [docs/development/adding-experiences.md](../docs/development/adding-experiences.md)

---

## 🌐 site/ - Site Build & App Discovery

The `scripts/site/` directory makes apps **discovered, not registered** — the deploy workflow and landing page never need editing when an app is added:

- **`apps.mjs`** — discovers deployable apps: every workspace whose `package.json` has a `plokmin` block (title, icon, description, optional slug/cta/order)
- **`generate-landing.mjs`** — generates the landing page from app metadata (+ `planned-apps.json` for coming-soon cards); run with a file argument to preview
- **`build-site.mjs`** (`npm run build:site`) — builds every deployable app, copies each `dist/` to `_site/<slug>/`, generates `_site/index.html`; this is exactly what the deploy workflow runs
- **`check-site.mjs`** (`npm run check:site`) — integrity check, runs in `validate` and CI; fails on missing build scripts, duplicate slugs, or a vite base path that doesn't match `<basePath>/<slug>/`

The site base path (`/PlokminFun`) lives in one place: the `plokmin.basePath` field of the root `package.json`.

---

## 🛠️ Code Quality Scripts

Helper scripts for maintaining code quality and preventing issues before they reach GitHub.

### Quick Start

```bash
# Install git hooks (one-time setup)
npm run setup-hooks

# Auto-format code (recommended before committing)
npm run format

# Run full validation (what CI runs)
npm run validate
```

## Available Scripts

### `npm run format`
**⚡ Quick Win!** Auto-formats all code with Prettier (spaces, quotes, semicolons, line length, etc.)

**What it fixes:**
- ✅ Inconsistent spacing and indentation
- ✅ Quote style (single vs double)
- ✅ Semicolons (adds/removes based on config)
- ✅ Line length (wraps at 100 chars)
- ✅ Trailing commas
- ✅ Arrow function parentheses

**When to use:**
- Before committing (pre-commit hook checks this!)
- After writing code (keep it clean)
- After refactoring (consistent style)

**Example:**
```bash
npm run format
# ✨ Formatted 140 files in 2 seconds
```

**Tip:** Pre-commit hook will suggest this command if you forget!

### `npm run format:check`
Checks if files are formatted without changing them. This is what CI runs.

**Example:**
```bash
npm run format:check
# ✓ All files formatted correctly
```

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

### `npm run lint:fix`
**⚡ Quick Win!** Auto-fixes most lint issues (unused imports, spacing, quotes, etc.)

**What it fixes:**
- ✅ Unused imports and variables
- ✅ Missing/extra semicolons
- ✅ Quote style inconsistencies
- ✅ Spacing and formatting
- ❌ Does NOT fix type errors (use typecheck for those)

**When to use:**
- When pre-commit hook blocks you with lint errors
- After refactoring (cleans up unused imports)
- Before committing (as a final polish)

**Example:**
```bash
npm run lint:fix
# Automatically fixes all auto-fixable issues
# Then stage the changes: git add -u
```

**Tip:** The pre-commit hook will suggest this command when it finds lint errors!

### `npm run validate`
Runs the full CI pipeline locally: format:check → typecheck → lint → test → build

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
Installs both pre-commit and pre-push hooks that run checks automatically.

**What it does:**
- Links `scripts/pre-commit.sh` to `.git/hooks/pre-commit` (fast checks)
- Links `scripts/pre-push.sh` to `.git/hooks/pre-push` (comprehensive checks)
- Prevents committing broken code
- Ensures all builds work before pushing

**Example:**
```bash
npm run setup-hooks
# ✅ Git hooks installed (pre-commit + pre-push)!

git commit -m "fix: broken code"
# 🔍 Running pre-commit checks...
#   ✗ TypeScript errors in klondike-mvp
# Commit blocked!

git push
# 🚀 Running pre-push checks (comprehensive validation)...
#   ✗ Build failed for pet-care
# Push blocked!
```

## Git Hooks

### Pre-Commit Hook

The pre-commit hook (`pre-commit.sh`) runs automatically before every commit:
1. **Prettier format check** - Ensures consistent code style
2. **TypeScript type check** - Catches type errors (all workspaces)
3. **ESLint** - Catches unused vars, style issues (all workspaces)
4. **Tests** - Runs all tests
5. **Build** - Verifies all code compiles

### Pre-Push Hook (NEW!)

The pre-push hook (`pre-push.sh`) runs comprehensive checks before pushing:
1. **Prettier format check** - Final format validation
2. **TypeScript type check** - All workspaces
3. **ESLint** - All workspaces
4. **Tests** - All tests must pass
5. **Build ALL workspaces** - Critical for deployment
6. **Verify dist/ folders** - Ensures deployment artifacts exist

**Why this matters:** Prevents pushing code that will break deployment on GitHub Pages.
Without this hook, you might forget to build a new workspace and it won't deploy!

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
