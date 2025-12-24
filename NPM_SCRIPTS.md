# NPM Scripts Reference

Quick reference for all npm commands in the monorepo.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run dev server (pick a game)
npm run dev:klondike
npm run dev:freecell

# Full validation (what CI runs)
npm run validate
```

---

## 📦 Build Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build everything (shared + all games) |
| `npm run build:shared` | Build shared library only |
| `npm run build:games` | Build all games (requires shared built first) |

**Typical workflow:**
```bash
# During development
npm run build:shared   # After changing shared library
npm run build          # Before deployment
```

---

## 🧪 Test Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode (TDD) |
| `npm run test:coverage` | Generate coverage report |

**TDD workflow:**
```bash
# Start watch mode in separate terminals
cd freecell-mvp && npm run test:watch
cd klondike-mvp && npm run test:watch
cd shared && npm run test:watch
```

---

## 🔍 Quality Scripts

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint on all packages |
| `npm run validate` | **Full validation: lint + test + build** |

**Before committing:**
```bash
npm run validate   # Ensures everything passes
```

This is what CI runs, so if this passes locally, CI will pass!

---

## 🎮 Dev Servers

| Command | Description |
|---------|-------------|
| `npm run dev:klondike` | Start Klondike dev server |
| `npm run dev:freecell` | Start FreeCell dev server |

**Quick start:**
```bash
npm run dev:klondike
# Opens http://localhost:5173
```

---

## 📚 Documentation Scripts

| Command | Description |
|---------|-------------|
| `npm run docs` | Show main documentation index |
| `npm run docs:ai` | Show AI agent quick guide |
| `npm run docs:rfcs` | Show RFC index |
| `npm run docs:deployment` | Show deployment guide |
| `npm run docs:accessibility` | Show accessibility docs |
| `npm run docs:games` | Show game-specific docs |

**Quick reference:**
```bash
npm run docs:ai   # Fast onboarding for AI agents
```

---

## 📝 RFC Management Scripts

| Command | Description | Example |
|---------|-------------|---------|
| `npm run rfc:list` | List all RFCs with status | `npm run rfc:list` |
| `npm run rfc:new` | Create new RFC from template | `npm run rfc:new 006 "Dark Mode"` |
| `npm run rfc:status` | Update RFC status | `npm run rfc:status 005 APPROVED` |

**RFC workflow:**
```bash
# 1. Create new RFC
npm run rfc:new 006 "Feature Name"

# 2. Check all RFCs
npm run rfc:list

# 3. Update status
npm run rfc:status 006 IN_REVIEW
npm run rfc:status 006 APPROVED
npm run rfc:status 006 IMPLEMENTED
```

**Note:** These are wrappers around bash scripts in `rfcs/scripts/`

---

## 🎯 Common Workflows

### Starting Development

```bash
# First time setup
npm install

# Start dev server
npm run dev:klondike
```

### Making Changes to Shared Library

```bash
# 1. Make changes in shared/
# 2. Rebuild shared
npm run build:shared

# 3. Test changes
npm test

# 4. Restart dev server (picks up changes)
npm run dev:klondike
```

### Before Committing

```bash
# Run full validation
npm run validate

# If all passes, commit
git add .
git commit -m "your message"
```

### Creating a New RFC

```bash
# Quick way
npm run rfc:new 006 "Mobile Gestures"

# Or use bash directly
cd rfcs
./scripts/new-rfc.sh 006 "Mobile Gestures"
```

### TDD Development

```bash
# Terminal 1: Run tests in watch mode
npm run test:watch

# Terminal 2: Dev server
npm run dev:klondike

# Write test → See it fail → Implement → See it pass
```

---

## 🔧 Workspace Commands

Run commands in specific packages:

```bash
# Build specific package
npm run build -w freecell-mvp
npm run build -w klondike-mvp
npm run build -w shared

# Test specific package
npm test -w freecell-mvp
npm test -w shared

# Lint specific package
npm run lint -w klondike-mvp
```

---

## 💡 Pro Tips

**Parallel execution:**
```bash
# npm workspaces runs in parallel by default
npm test  # Tests all packages in parallel!
```

**Conditional execution:**
```bash
# --if-present runs only if script exists
npm run build:games  # Skips packages without build script
```

**Watch for changes:**
```bash
# Most packages support watch mode
npm run test:watch
npm run dev:klondike  # Auto-reloads on changes
```

**Check what a script does:**
```bash
# View package.json scripts
cat package.json | grep -A 20 '"scripts"'
```

---

## 🚨 Troubleshooting

### "Command not found" errors

**Problem:** Script not found in workspace

**Solution:**
```bash
# Check if script exists in package
cd freecell-mvp
cat package.json | grep test:watch

# If missing, run from package directly
cd freecell-mvp
npm run test:watch
```

### Build failures

**Problem:** Games fail to build

**Solution:**
```bash
# Always build shared first!
npm run build:shared
npm run build:games
```

### Tests failing

**Problem:** Tests pass locally but fail in CI

**Solution:**
```bash
# Run exactly what CI runs
npm run validate

# Clean install
rm -rf node_modules package-lock.json
npm install
npm run validate
```

### RFC scripts not working

**Problem:** Permission denied on RFC scripts

**Solution:**
```bash
# Make scripts executable
chmod +x rfcs/scripts/*.sh

# Or run via npm (already executable)
npm run rfc:list
```

---

## 📊 Script Cheat Sheet

**Daily development:**
```bash
npm run dev:klondike        # Start dev server
npm run test:watch          # TDD mode
npm run validate            # Before commit
```

**Working on shared library:**
```bash
npm run build:shared        # Rebuild after changes
npm test                    # Verify all games work
```

**Documentation:**
```bash
npm run docs:ai             # Quick onboarding
npm run rfc:list            # Check RFC status
```

**RFC management:**
```bash
npm run rfc:new 006 "Title" # New RFC
npm run rfc:status 006 APPROVED  # Update status
```

---

## 📝 Adding New Scripts

To add scripts to the monorepo:

**Root package.json** (affects all packages):
```json
{
  "scripts": {
    "my-script": "echo 'runs from root'"
  }
}
```

**Package-specific** (e.g., `freecell-mvp/package.json`):
```json
{
  "scripts": {
    "my-script": "echo 'runs in freecell only'"
  }
}
```

**Run in all workspaces:**
```bash
npm run my-script -ws --if-present
```

---

**Quick reference:** Run `npm run` (no arguments) to see all available scripts!
