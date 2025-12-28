# Code Quality Guide

## How to Detect Issues Programmatically

### TL;DR - Quick Commands

```bash
npm run check          # Quick validation (typecheck + format)
npm run typecheck      # TypeScript only (detects unused vars!)
npm run validate       # Full CI validation (everything)
```

### Auto-Fix Commands

```bash
npm run format         # Fix formatting issues
npm run lint:fix       # Fix ESLint issues (requires dependencies)
```

---

## Detecting Unused Variables

### ✅ TypeScript Compiler (Always Available)

The TypeScript compiler **automatically detects unused variables** thanks to these flags in `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,        // ← Catches unused variables
    "noUnusedParameters": true     // ← Catches unused function parameters
  }
}
```

**Run it:**
```bash
npm run typecheck
```

**Example Error:**
```
error TS6133: 'lastCard' is assigned a value but never used.
```

### ⚙️ ESLint (Requires Dependencies)

ESLint provides more detailed linting but requires `npm install` first.

**Run it:**
```bash
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix what's possible
```

**Rule:**
```javascript
// Configured in eslint.config.js
'@typescript-eslint/no-unused-vars': 'error'
```

---

## Code Quality Checklist

Before committing, run:

1. **TypeScript Type Check** - `npm run typecheck`
   - ✅ Detects type errors
   - ✅ Detects unused variables
   - ✅ Detects unused parameters
   - ⚡ Fast (no build needed)

2. **Prettier Format** - `npm run format`
   - ✅ Auto-fixes formatting
   - ✅ Ensures consistent style

3. **ESLint** - `npm run lint:fix`
   - ✅ Detects code quality issues
   - ✅ Auto-fixes many issues
   - ⚠️ Requires dependencies installed

4. **Full Validation** - `npm run validate`
   - Runs all of the above + tests + build
   - This is what CI runs

---

## Git Hooks (Recommended)

Install pre-commit hooks to catch issues before committing:

```bash
npm run setup-hooks
```

This will:
- Run TypeScript type checking
- Run Prettier formatting
- Block commits if issues found

---

## Common Issues & Solutions

### Issue: "Cannot find package '@eslint/js'"

**Solution:** Dependencies not installed in sandbox. TypeScript checking still works!

```bash
npm run typecheck    # ✅ Works without dependencies
npm run lint         # ❌ Requires npm install
```

### Issue: "No parser could be inferred for file"

**Solution:** Prettier doesn't format shell scripts (.sh files). This is expected.

### Issue: Formatting keeps changing

**Solution:** Run format before committing:

```bash
npm run format       # Auto-fix all formatting
git add -A           # Stage formatted files
git commit -m "..."  # Commit
```

---

## Scripts Reference

### Quick Checks
- `npm run check` - Fast quality check (typecheck + format check)
- `npm run typecheck` - TypeScript only
- `npm run format:check` - Check formatting without changing files

### Auto-Fix
- `npm run format` - Fix formatting
- `npm run lint:fix` - Fix ESLint issues

### Full Validation
- `npm run validate` - Everything (what CI runs)
- `npm test` - Run all tests
- `npm run build` - Build all packages

### Development
- `npm run dev:freecell` - Start FreeCell dev server
- `npm run dev:klondike` - Start Klondike dev server
- `npm run test:watch` - Run tests in watch mode

---

## Why TypeScript Catches Unused Variables

Unlike some languages, TypeScript's compiler has **built-in unused variable detection** when these flags are enabled:

- `noUnusedLocals` - Local variables that are declared but never read
- `noUnusedParameters` - Function parameters that are never used

This means you get **unused variable detection for free** without needing ESLint!

**Example:**
```typescript
function example() {
  const usedVar = 42;
  const unusedVar = 100;  // ❌ Error: 'unusedVar' is declared but never used
  return usedVar;
}
```

---

## Best Practices

1. **Always run `npm run typecheck` before committing**
   - Catches unused variables
   - Catches type errors
   - Fast and reliable

2. **Use `npm run format` to auto-fix formatting**
   - Don't manually adjust spacing
   - Let Prettier handle it

3. **Install git hooks for automatic checking**
   - `npm run setup-hooks` (one-time setup)
   - Prevents bad commits

4. **CI runs `npm run validate`**
   - If typecheck passes locally, CI will pass
   - Match CI by running `npm run validate` before pushing

---

## Configuration Files

- `tsconfig.app.json` - TypeScript compiler settings (includes unused var detection)
- `eslint.config.js` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `scripts/pre-commit.sh` - Git pre-commit hook
- `scripts/check-code-quality.sh` - Comprehensive quality check

---

## Summary

**The easiest way to catch issues like unused variables:**

```bash
npm run typecheck
```

That's it! TypeScript has you covered. ✅
