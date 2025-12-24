# Deployment Guide

This directory contains deployment documentation for the CardGames project.

---

## 📖 Documentation

- **[github-pages.md](github-pages.md)** - Current deployment (GitHub Pages, CI/CD)
- **[pwa.md](pwa.md)** - Progressive Web App setup (installable web app)
- **[native-apps.md](native-apps.md)** - Native app deployment (Capacitor, App Store)

---

## 🚀 Quick Start

**Current deployment:**
- **Live URL:** https://mikhaidn.github.io/CardGames/
- **FreeCell:** https://mikhaidn.github.io/CardGames/freecell/
- **Klondike:** https://mikhaidn.github.io/CardGames/klondike/
- **Auto-deploy:** Push to `main` branch triggers deployment

**To deploy:**
```bash
git push origin main
# Wait 1-2 minutes
# Check live site
```

---

## 📊 Deployment Comparison

| Platform | Status | Effort | Best For |
|----------|--------|--------|----------|
| **GitHub Pages** | ✅ Live | None (done) | Web play, testing |
| **PWA** | ✅ Configured | Low | Offline play, mobile |
| **Native Apps** | ❌ Not configured | Medium | App Store distribution |

---

## 🔍 Choose Your Deployment

**I want to...**
- See current deployment → [github-pages.md](github-pages.md)
- Make app installable → [pwa.md](pwa.md)
- Deploy to App Store → [native-apps.md](native-apps.md)
