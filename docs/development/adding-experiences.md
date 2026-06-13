# Adding New Experiences to Plokmin Consortium

This guide explains how to add a new experience (app/game/tool) to the Plokmin Consortium.

---

## 🚀 Quick Start (Automated)

Use the initialization script to create a fully-configured experience in ~30 seconds:

```bash
# From repo root
./scripts/init-experience.sh my-experience-name

# Example
./scripts/init-experience.sh habit-tracker
```

**What you get:**
- ✅ Full React + TypeScript + Vite setup
- ✅ PWA-ready (manifest, service worker, default icon)
- ✅ Integrated into monorepo (workspaces, scripts)
- ✅ Discovered automatically by deploy + landing page (via the `plokmin` block in package.json)
- ✅ Ready to deploy to GitHub Pages
- ✅ Basic "Hello World" app that works immediately

**Live URL after deploy:**
```
https://mikhaidn.github.io/PlokminFun/my-experience-name/
```

---

## 📋 What the Script Creates

### Directory Structure
```
my-experience-name/
├── public/
│   ├── icon.svg              # Default icon (first letter)
│   ├── manifest.json         # PWA manifest
│   └── service-worker.js     # Offline support
├── src/
│   ├── App.tsx               # Main component (starter template)
│   ├── App.css               # Styled starter page
│   └── main.tsx              # React entry point + SW registration
├── index.html                # HTML template
├── package.json              # Dependencies + scripts
├── tsconfig.json             # TypeScript config (strict mode)
├── tsconfig.node.json        # Node TypeScript config
├── vite.config.ts            # Vite config (GitHub Pages paths)
├── eslint.config.js          # ESLint config
└── README.md                 # Experience documentation
```

### Monorepo Integration

The script automatically:
1. **Adds workspace** to root `package.json`
2. **Adds npm script**: `dev:experiencename`
3. **Installs dependencies** for the new workspace

Everything else is convention-based — no registration needed:
- **Deploy + landing page** discover the app via the `plokmin` block in its `package.json` (see `scripts/site/`)
- **Root `typecheck`/`lint:fix`/`lint`/`test`** run across all workspaces via `-ws --if-present`
- **`npm run check:site`** verifies the wiring (also runs in CI)

---

## 🎨 Customization Guide

After running the script, customize your experience:

### 1. Update the Icon

**Option A: Edit SVG (simple)**
```bash
# Edit the default letter icon
code my-experience-name/public/icon.svg
```

**Option B: Replace with PNG/ICO**
```bash
# Add your 512x512 icon
cp my-icon.png my-experience-name/public/icon.png

# Update manifest.json to reference it
# Change "icon.svg" to "icon.png" and update type
```

**Option C: Use an Emoji (landing page card)**
```json
// In my-experience-name/package.json
"plokmin": {
  "icon": "🎯"  // Change ✨ to your emoji
}
```

### 2. Update Manifest (PWA Metadata)

Edit `my-experience-name/public/manifest.json`:

```json
{
  "name": "My Awesome App",
  "short_name": "AwesomeApp",
  "description": "A detailed description of what this app does",
  "theme_color": "#4a5568",  // Change brand color
  "background_color": "#f8fafc",
  "categories": ["productivity", "utilities"]  // Relevant categories
}
```

### 3. Update Landing Page Card

The landing page is generated from each app's `plokmin` block — edit it in `my-experience-name/package.json`:

```json
"plokmin": {
  "title": "My Experience Name",
  "icon": "🎯",
  "description": "A compelling description of what this experience does and why someone should try it.",
  "cta": "Try Now",
  "order": 6
}
```

Preview the result with `node scripts/site/generate-landing.mjs /tmp/index.html` or build the full site with `npm run build:site`.

### 4. Build Your Experience

Edit `src/App.tsx` to implement your functionality:

```tsx
import { useState } from 'react';
import './App.css';

function App() {
  // Your state and logic here

  return (
    <div className="app">
      <header className="header">
        <h1>My Experience</h1>
        <p className="subtitle">Part of the Plokmin Consortium</p>
      </header>

      <main className="main">
        {/* Your UI components here */}
      </main>

      <footer className="footer">
        <a href="/PlokminFun/">← Back to Plokmin Consortium</a>
      </footer>
    </div>
  );
}

export default App;
```

### 5. Update README.md

Edit `my-experience-name/README.md` to document:
- What the experience does
- Key features
- Usage instructions
- Architecture notes

---

## 🏗️ Architecture Decisions

### Standalone vs Shared Library

**When to stay standalone:**
- ✅ Unique functionality (dog tracker, habit tracker, etc.)
- ✅ Different domain from existing experiences
- ✅ Self-contained state and logic

**When to use shared library:**
- ✅ Building a card game → use `@plokmin/shared`
- ✅ Reusing existing components (Card, GameControls, etc.)
- ✅ Shared game logic (undo/redo, history, etc.)

**Philosophy:** Don't prematurely extract shared code. Build 2-3 similar experiences first, then extract common patterns.

### File Organization

**Keep experiences self-contained:**
- Each experience directory should be independently understandable
- Minimal cross-references between experiences
- Experience READMEs contain full context
- Only extract to shared libraries when patterns are truly universal

---

## 🧪 Development Workflow

### 1. Run Dev Server
```bash
# From repo root
npm run dev:experiencename

# Or from experience directory
cd my-experience-name
npm run dev
```

### 2. Type Checking
```bash
# Check all workspaces (includes your new experience)
npm run typecheck

# Or just your experience
npm run typecheck -w my-experience-name
```

### 3. Linting
```bash
# Auto-fix lint issues (all workspaces)
npm run lint:fix

# Or just your experience
npm run lint -w my-experience-name
```

### 4. Validation (Pre-commit)
```bash
# Run full validation (what CI runs)
npm run validate

# This runs:
# - format:check (Prettier)
# - typecheck (all TypeScript)
# - lint (all ESLint)
# - test (all tests)
# - build (all workspaces)
```

---

## 🚀 Deployment

### Automatic Deployment

**Your experience deploys automatically when you push to `main`:**

```bash
# 1. Commit your changes
git add .
git commit -m "feat: add my-experience-name"

# 2. Push to main
git push origin main

# 3. GitHub Actions builds and deploys
# Wait ~2 minutes for deployment
```

**Live URL:**
```
https://mikhaidn.github.io/PlokminFun/my-experience-name/
```

### How It Works

- **CI/CD**: `.github/workflows/deploy.yml`
- **Process**: Build all workspaces → Deploy to `gh-pages` branch
- **Routing**: GitHub Pages serves from root, Vite handles subpaths

### Testing Before Deploy

```bash
# Build and preview locally
npm run build -w my-experience-name
npm run preview -w my-experience-name

# Visit: http://localhost:4173/PlokminFun/my-experience-name/
```

---

## 🐛 Troubleshooting

### Script Fails: "Directory already exists"
```bash
# Remove the directory and try again
rm -rf my-experience-name
./scripts/init-experience.sh my-experience-name
```

### Script Fails: "Invalid name format"
```bash
# Use kebab-case (lowercase, hyphens only)
./scripts/init-experience.sh habit-tracker  # ✅ Valid
./scripts/init-experience.sh HabitTracker   # ❌ Invalid
./scripts/init-experience.sh habit_tracker  # ❌ Invalid
```

### Build Fails: "Cannot find module"
```bash
# Reinstall dependencies (restores the @plokmin/shared workspace link;
# shared itself needs no build — it's a no-emit source library)
npm install
npm run build -w my-experience-name
```

### Landing Page Card Not Showing
```bash
# The landing page is generated from each app's plokmin block —
# check the wiring:
npm run check:site

# If the app isn't listed, add a "plokmin" block to its package.json
# (see "Customization Guide" section above) and make sure the app is
# in the root package.json workspaces list
```

### Dev Server Wrong Port/Path
```bash
# The experience MUST use the correct base path for GitHub Pages
# Check vite.config.ts has: base: '/PlokminFun/my-experience-name/'
```

### Service Worker Not Working
```bash
# Service worker only works in production or HTTPS
# Test with: npm run build && npm run preview
# Or deploy to GitHub Pages (automatic HTTPS)
```

---

## 📚 Examples

### Minimal Experience (Counter App)
See the generated starter in `src/App.tsx` after running the script.

### Complex Experience (Dog Tracker)
See `dog-care-tracker/` for a full-featured example with:
- Multiple components
- Custom hooks
- localStorage persistence
- Import/export functionality
- Mobile-optimized UI

### Card Game Experience (FreeCell)
See `freecell-mvp/` for an example using `@plokmin/shared`:
- Shared components (Card, GameControls, etc.)
- Shared hooks (useGameHistory, useCardInteraction)
- Game-specific logic in local files

---

## 🎯 Best Practices

### ✅ Do
- Run `npm run validate` before committing
- Write a clear README.md for your experience
- Use TypeScript strict mode (already configured)
- Keep experiences self-contained
- Test on mobile (PWA target audience)
- Update landing page description

### ❌ Don't
- Don't commit without running validation
- Don't duplicate code from other experiences (yet)
  - Build 2-3 similar experiences first
  - Then extract common patterns to shared library
- Don't break existing experiences
- Don't skip PWA manifest/icon updates
- Don't use relative imports from other workspaces
  - Use package imports (e.g., `@plokmin/shared`)

---

## 🔄 Manual Process (If Script Fails)

If the script doesn't work, you can create an experience manually:

1. **Copy an existing experience**
   ```bash
   cp -r dog-care-tracker my-experience-name
   ```

2. **Update all references**
   - `package.json`: Change name to `@plokmin/my-experience-name` and update the `plokmin` block (title, icon, description — this drives deploy and the landing card)
   - `vite.config.ts`: Update base path to `/PlokminFun/my-experience-name/`
   - `manifest.json`: Update name, description, start_url, icons
   - The app's `index.html`: Update title, description
   - `README.md`: Update content

3. **Update root package.json**
   - Add to `workspaces` array
   - Add `dev:experiencename` script

   (Deploy, the landing page, and the root `typecheck`/`lint`/`lint:fix`/`test` scripts pick the app up automatically.)

4. **Install and validate**
   ```bash
   npm install
   npm run check:site
   npm run validate
   ```

---

## 📞 Questions?

- **Architecture**: See [ARCHITECTURE.md](../../ARCHITECTURE.md)
- **Deployment**: See [docs/deployment/github-pages.md](../deployment/github-pages.md)
- **AI Guide**: See [AI_GUIDE.md](../../AI_GUIDE.md)
- **Vision**: See [VISION.md](../../VISION.md)
- **Status**: See [STATUS.md](../../STATUS.md)

---

**Happy building! 🚀**
