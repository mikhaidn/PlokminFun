# GitHub Pages Deployment

**Current status:** ✅ **Live and auto-deploying**

---

## 🌐 Live URLs

- **Root:** https://mikhaidn.github.io/CardGames/ (game selector)
- **FreeCell:** https://mikhaidn.github.io/CardGames/freecell/
- **Klondike:** https://mikhaidn.github.io/CardGames/klondike/

---

## 🔄 Auto-Deployment

**Trigger:** Push to `main` branch

**Workflow:** `.github/workflows/deploy.yml`

**Steps:**
1. Build shared library (`npm run build:shared`)
2. Build both games (`npm run build:games`)
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

**FreeCell:** `/CardGames/freecell/`
```typescript
// freecell-mvp/vite.config.ts
export default defineConfig({
  base: '/CardGames/freecell/',
  plugins: [react()],
})
```

**Klondike:** `/CardGames/klondike/`
```typescript
// klondike-mvp/vite.config.ts
export default defineConfig({
  base: '/CardGames/klondike/',
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

## 🚀 Adding New Games

To add a new game to the deployment:

1. **Create game directory** (e.g., `spider-mvp/`)
2. **Update `.github/workflows/deploy.yml`:**
   ```yaml
   - name: Build Spider
     run: cd spider-mvp && npm ci && npm run build

   - name: Copy Spider to _site
     run: cp -r spider-mvp/dist _site/spider
   ```
3. **Add to landing page** (`index.html`)
4. **Configure base path** in `spider-mvp/vite.config.ts`:
   ```typescript
   base: '/CardGames/spider/'
   ```

---

## 📊 Deployment Metrics

- **Build time:** ~2-3 minutes
- **Deploy time:** ~30 seconds
- **Total time:** ~3 minutes from push to live
- **Uptime:** 99.9% (GitHub Pages SLA)
- **Cost:** Free (public repositories)
