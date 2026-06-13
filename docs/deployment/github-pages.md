# GitHub Pages Deployment

**Current status:** ✅ **Live and auto-deploying**

---

## 🌐 Live URLs

- **Root:** https://mikhaidn.github.io/PlokminFun/ (game selector)
- **FreeCell:** https://mikhaidn.github.io/PlokminFun/freecell/
- **Klondike:** https://mikhaidn.github.io/PlokminFun/klondike/
- **Dog Care Tracker:** https://mikhaidn.github.io/PlokminFun/dog-care-tracker/
- **Pet Care Instructions:** https://mikhaidn.github.io/PlokminFun/pet-care/

---

## 🔄 Auto-Deployment

**Trigger:** Push to `main` branch

**Workflow:** `.github/workflows/deploy.yml`

**Steps:**
1. Site integrity check (`npm run check:site`)
2. Build site (`npm run build:site`) — discovers every workspace with a `plokmin` block in its package.json, builds it, copies `dist/` to `_site/<slug>/`, and generates the landing page
3. Deploy to GitHub Pages
4. Live in 1-2 minutes

Apps are **discovered, not registered**: the workflow and landing page never need editing when an app is added.

**To deploy manually:**
```bash
git push origin main
```

---

## 🛠️ CI/CD Workflows

### 1. Deployment (`.github/workflows/deploy.yml`)
- **Trigger:** Push to `main` or manual dispatch
- **Actions:**
  - Install dependencies
  - Site integrity check (`npm run check:site`)
  - Build site (`npm run build:site`) — builds all deployable apps and assembles `_site/`
  - Deploy to GitHub Pages

### 2. PR Validation (`.github/workflows/pr-validation.yml`)
- **Trigger:** Pull requests to `main`
- **Checks:**
  - Site integrity (`npm run check:site`)
  - Typecheck (`npm run typecheck`)
  - Lint (`npm run lint`)
  - Test (`npm test`)
  - Build site (`npm run build:site`) — same assembly as deploy
- **Requirement:** Must pass before merging

---

## ⚙️ Base Path Configuration

Games are configured to run at specific paths on GitHub Pages:

**FreeCell:** `/PlokminFun/freecell/`
```typescript
// freecell-mvp/vite.config.ts
export default defineConfig({
  base: '/PlokminFun/freecell/',
  plugins: [react()],
})
```

**Klondike:** `/PlokminFun/klondike/`
```typescript
// klondike-mvp/vite.config.ts
export default defineConfig({
  base: '/PlokminFun/klondike/',
  plugins: [react()],
})
```

⚠️ **Important:** The base path only applies to production builds. Use `npm run dev` for local development (ignores base path).

---

## 🧪 Testing Production Build Locally

```bash
# Build everything
npm run build

# Preview FreeCell
cd freecell-mvp && npm run preview

# Preview Klondike
cd klondike-mvp && npm run preview
```

---

## 🐛 Troubleshooting

**Issue:** Deployment failed
- **Check:** GitHub Actions tab for error logs
- **Common causes:** Build errors, test failures, lint issues

**Issue:** Site not updating
- **Wait:** Deployments take 1-2 minutes
- **Check:** GitHub Actions to see if deployment completed
- **Hard refresh:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)

**Issue:** 404 errors on deployed site
- **Cause:** Incorrect base path in vite.config.ts
- **Fix:** Ensure base path matches GitHub Pages URL structure

---

## 📁 Deployment Structure

```
_site/                          # GitHub Pages root
├── index.html                  # Game selector (landing page)
├── freecell/                   # FreeCell app
│   ├── index.html
│   ├── assets/
│   └── ...
└── klondike/                   # Klondike app
    ├── index.html
    ├── assets/
    └── ...
```

---

## 🔐 Repository Settings

**GitHub Pages configuration:**
- **Source:** GitHub Actions
- **Branch:** N/A (deployed from workflow)
- **Custom domain:** Not configured
- **HTTPS:** ✅ Enforced

**To check settings:**
1. Go to repository → Settings → Pages
2. Verify "Source" is set to "GitHub Actions"

---

## 🚀 Adding New Apps/Games

**⚠️ CRITICAL CHECKLIST** - Follow ALL steps to avoid deployment issues!

To add a new app or game to the deployment:

### 1. Create App Directory Structure

```bash
mkdir -p new-app/{src,public}
cd new-app
```

### 2. Configure Vite Build (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/PlokminFun/new-app/',  // ⚠️ CRITICAL: Must match GitHub Pages path
  build: {
    outDir: 'dist',
  },
});
```

### 3. Create Package.json with Build Scripts

```json
{
  "name": "@plokmin/new-app",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 4. Add to Root Workspace (package.json)

```json
{
  "workspaces": [
    "freecell-mvp",
    "klondike-mvp",
    "dog-care-tracker",
    "pet-care",
    "new-app"  // ⚠️ ADD THIS
  ]
}
```

### 5. Add the `plokmin` Block (deploy + landing card)

Add a `plokmin` block to the new app's `package.json` — this is what makes the app deployable and gives it a landing-page card. The deploy workflow and landing page are generated from it; **neither needs editing**:

```json
{
  "name": "@plokmin/new-app",
  "plokmin": {
    "title": "New App",
    "icon": "🆕",
    "description": "Description of your app",
    "cta": "Try Now",
    "order": 6
  }
}
```

Optional fields: `slug` (deployed path, defaults to the directory name), `cta` (defaults to "Try Now"), `order` (landing-page position, defaults to last).

### 6. Verify the Wiring

```bash
npm run check:site
```

This fails with an actionable message if the base path doesn't match the slug, the slug collides with another app, the build script is missing, or the landing card can't be generated. It runs in CI on every PR, so mistakes can't silently reach production.

### 7. Update Deployment Documentation

Add your app to the "Live URLs" section at the top of this file.

### 8. Test Locally Before Pushing

```bash
# Build and test locally
npm run build -w new-app

# Check that dist/ folder was created
ls -la new-app/dist/

# Preview production build
cd new-app && npm run preview
```

### 9. Verification Checklist

Before merging to main:

- [ ] App added to root `package.json` workspaces
- [ ] `plokmin` block added to the app's `package.json`
- [ ] `npm run check:site` passes (validates base path, slug, build script, landing card)
- [ ] Local build succeeds: `npm run build -w new-app`
- [ ] Full site assembles: `npm run build:site` (check `_site/new-app/`)
- [ ] Local preview works: `npm run preview` in app directory

### 10. Common Mistakes to Avoid

❌ **Forgot to add to workspaces** - App won't be discovered at all
❌ **Forgot the `plokmin` block** - App builds but won't deploy or appear on the landing page
❌ **Wrong base path in vite.config.ts** - Caught by `npm run check:site` before it can 404 in production

---

## 📊 Deployment Metrics

- **Build time:** ~2-3 minutes
- **Deploy time:** ~30 seconds
- **Total time:** ~3 minutes from push to live
- **Uptime:** 99.9% (GitHub Pages SLA)
- **Cost:** Free (public repositories)
