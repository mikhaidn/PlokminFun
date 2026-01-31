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
1. Build shared library (`npm run build:shared`)
2. Build both games (`npm run build:pages`)
3. Create root landing page
4. Deploy to GitHub Pages
5. Live in 1-2 minutes

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
  - Build shared library
  - Build FreeCell (`cd freecell-mvp && npm run build`)
  - Build Klondike (`cd klondike-mvp && npm run build`)
  - Copy builds to `_site/`
  - Deploy to GitHub Pages

### 2. PR Validation (`.github/workflows/pr-validation.yml`)
- **Trigger:** Pull requests to `main`
- **Checks:**
  - Lint (`npm run lint`)
  - Test (`npm test`)
  - Build (`npm run build`)
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

### 5. Update GitHub Actions Deploy Workflow

**⚠️ MOST COMMON MISTAKE** - Edit `.github/workflows/deploy.yml`:

```yaml
- name: Build Pages
  run: |
    npm run build -w freecell-mvp
    npm run build -w klondike-mvp
    npm run build -w dog-care-tracker
    npm run build -w pet-care
    npm run build -w new-app  # ⚠️ ADD THIS

- name: Create root landing page
  run: |
    # ... existing copies ...
    cp -r new-app/dist _site/new-app  # ⚠️ ADD THIS
```

### 6. Update Root Landing Page (index.html)

Add a card for your new app:

```html
<a href="./new-app/" class="game-card">
  <div class="game-icon">🆕</div>
  <h2>New App</h2>
  <p>Description of your app</p>
  <span class="status available">Try Now</span>
</a>
```

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

- [ ] `vite.config.ts` has correct `base` path
- [ ] App added to `.github/workflows/deploy.yml` (2 places: build AND copy)
- [ ] App added to root `package.json` workspaces
- [ ] App added to `index.html` landing page
- [ ] Local build succeeds: `npm run build -w new-app`
- [ ] `dist/` folder exists and contains `index.html`
- [ ] Local preview works: `npm run preview` in app directory
- [ ] Paths in `dist/index.html` include `/PlokminFun/new-app/` prefix

### 10. Common Mistakes to Avoid

❌ **Forgot to add to deploy.yml** - App won't deploy (most common!)
❌ **Wrong base path in vite.config.ts** - 404 errors on production
❌ **Forgot to add to workspaces** - Build fails in CI
❌ **Didn't test local build** - Errors only caught in production

---

## 📊 Deployment Metrics

- **Build time:** ~2-3 minutes
- **Deploy time:** ~30 seconds
- **Total time:** ~3 minutes from push to live
- **Uptime:** 99.9% (GitHub Pages SLA)
- **Cost:** Free (public repositories)
