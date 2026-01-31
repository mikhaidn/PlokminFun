# Progressive Web App (PWA) Deployment

This guide covers deploying the CardGames applications as Progressive Web Apps (PWAs), enabling offline functionality, app-like experience, and "Add to Home Screen" installation on mobile devices.

## Current PWA Status

Both FreeCell and Klondike games are **live on GitHub Pages** with PWA support:

- ✅ **FreeCell**: https://mikhaidn.github.io/PlokminFun/freecell/
- ✅ **Klondike**: https://mikhaidn.github.io/PlokminFun/klondike/
- ✅ **PWA configured** - manifest and service worker via vite-plugin-pwa
- ✅ **Custom app icons** - 192x192 and 512x512 icons with game-specific branding
- ✅ **Installable** - "Add to Home Screen" works on iOS Safari and Android Chrome
- ✅ **Responsive layout** - accessibility settings provide card sizing and one-handed mode
- ✅ **Touch optimized** - useCardInteraction hook handles drag-and-drop and tap interactions

## Why PWA?

Progressive Web Apps offer several advantages for card game deployment:

**Benefits:**
- ✅ No app store approval process - updates are instant
- ✅ Works on both iOS Safari and Android Chrome
- ✅ Offline functionality via service workers
- ✅ Installable to home screen without app stores
- ✅ Free hosting (GitHub Pages, Netlify, Vercel)
- ✅ Single codebase for all platforms
- ✅ No $99/year iOS developer fee or $25 Android fee

**Limitations:**
- ❌ No app store presence (discoverability)
- ❌ Limited access to native device features
- ❌ Users must find and install via web browser

**Best for:** Web-first distribution, prototyping, instant updates, avoiding app store review

## PWA Implementation Guide

### Step 1: Install vite-plugin-pwa

The PWA plugin handles manifest generation and service worker setup automatically.

```bash
cd freecell-mvp  # or klondike-mvp
npm install -D vite-plugin-pwa
```

**Official documentation:** https://vite-pwa-org.netlify.app/

### Step 2: Configure vite.config.ts

Add PWA configuration to your Vite config:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/PlokminFun/freecell/',  // Adjust for your deployment path
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FreeCell Solitaire',
        short_name: 'FreeCell',
        description: 'Classic FreeCell card game with touch support',
        display: 'standalone',
        orientation: 'any',  // or 'landscape' / 'portrait'
        background_color: '#2c5f2d',
        theme_color: '#2c5f2d',
        icons: [
          {
            src: '/PlokminFun/freecell/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/PlokminFun/freecell/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Runtime caching for fonts and images
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
```

### Step 3: Create App Icons

Create two icon files in the `public/` directory:

**Requirements:**
- `icon-192.png` - 192x192 pixels (minimum size for Android)
- `icon-512.png` - 512x512 pixels (recommended for high-DPI displays)
- PNG format with transparent or solid background
- Should be recognizable at small sizes

**Icon design tips:**
- Use solid background color (avoid transparency for better visibility)
- Keep design simple - avoid fine details that blur at small sizes
- Include game name or recognizable symbol (e.g., card suits for FreeCell)
- Test on actual devices to verify appearance

**File locations:**
```
freecell-mvp/public/icon-192.png
freecell-mvp/public/icon-512.png
```

### Step 4: Build and Deploy

Build your application with PWA support:

```bash
npm run build
```

The build output (`dist/`) will include:
- `manifest.webmanifest` - App manifest file
- `sw.js` - Service worker for offline functionality
- Your app icons (copied from `public/`)

**For GitHub Pages:**
Push to `main` branch - GitHub Actions will automatically deploy the PWA-enabled build.

**For other hosts:**
Upload the entire `dist/` folder to your hosting provider (Netlify, Vercel, etc.)

### Step 5: Install on Devices

Once deployed, users can install your PWA:

**iOS (Safari):**
1. Open the game URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Customize name if desired
5. Tap "Add"

**Android (Chrome):**
1. Open the game URL in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"
4. Confirm installation

**Desktop (Chrome/Edge):**
1. Look for install icon in address bar
2. Click to install
3. App opens in standalone window

## Manifest Configuration Reference

### Key Manifest Fields

```json
{
  "name": "Full app name displayed during installation",
  "short_name": "Name shown under home screen icon (max 12 chars)",
  "description": "App description for search and discovery",
  "display": "standalone",  // Hides browser UI (fullscreen, standalone, minimal-ui, browser)
  "orientation": "any",     // Lock orientation (any, landscape, portrait)
  "start_url": "/",         // URL to open when launching app
  "scope": "/",             // URLs that are part of the PWA
  "background_color": "#2c5f2d",  // Splash screen background
  "theme_color": "#2c5f2d",       // Browser toolbar color
  "icons": [...]            // App icons for home screen and splash
}
```

**Display modes:**
- `fullscreen` - Full screen, no browser controls (immersive games)
- `standalone` - App-like, no browser UI (recommended for card games)
- `minimal-ui` - Minimal browser controls (back button)
- `browser` - Normal browser tab

**Orientation options:**
- `any` - Allow rotation (recommended for responsive apps)
- `landscape` - Lock to landscape (wide card layouts)
- `portrait` - Lock to portrait (mobile-first apps)

### iOS-Specific Meta Tags

For better iOS support, add these meta tags to your `index.html`:

```html
<!-- iOS Safari -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="FreeCell">

<!-- iOS app icons -->
<link rel="apple-touch-icon" href="/PlokminFun/freecell/icon-180.png">
```

**Note:** iOS requires a 180x180 icon in addition to the 192x192 and 512x512 icons.

## Service Worker Configuration

### Auto-Update Strategy (Recommended)

The `registerType: 'autoUpdate'` option automatically updates the service worker when new versions are deployed:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  // Service worker updates automatically in background
  // Users see new version on next page reload
})
```

### Prompt for Update Strategy

For more control, prompt users to update:

```typescript
VitePWA({
  registerType: 'prompt',
  // Requires manual update prompt implementation
})
```

Then add update prompt in your app:

```typescript
import { useRegisterSW } from 'virtual:pwa-register/react'

function App() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <>
      {needRefresh && (
        <div className="update-banner">
          New version available!
          <button onClick={() => updateServiceWorker(true)}>
            Update Now
          </button>
          <button onClick={() => setNeedRefresh(false)}>
            Dismiss
          </button>
        </div>
      )}
      {/* Your app content */}
    </>
  )
}
```

## Testing PWA Features

### Local Testing

1. **Build production version:**
   ```bash
   npm run build
   npm run preview  # Serves dist/ folder
   ```

2. **Test service worker:**
   - Open DevTools → Application tab → Service Workers
   - Verify service worker is registered and activated
   - Check "Offline" to test offline functionality

3. **Test manifest:**
   - DevTools → Application tab → Manifest
   - Verify all fields are correct
   - Check icons are loading

### Device Testing

1. **Deploy to test URL** (GitHub Pages, Netlify preview, etc.)

2. **Test on real devices:**
   - iOS Safari (iPhone, iPad)
   - Android Chrome
   - Desktop Chrome/Edge

3. **Verify installation flow:**
   - Check "Add to Home Screen" prompt appears
   - Install and verify app opens in standalone mode
   - Test offline functionality (disconnect WiFi)

### Lighthouse PWA Audit

Run Lighthouse audit to verify PWA compliance:

```bash
# In Chrome DevTools
# Lighthouse tab → Categories: Progressive Web App → Generate report
```

**PWA criteria:**
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Uses HTTPS
- ✅ Redirects HTTP to HTTPS
- ✅ Viewport is mobile-friendly
- ✅ Icons for home screen

## Troubleshooting

### Service Worker Not Updating

**Problem:** Changes not appearing after deployment

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Clear service worker: DevTools → Application → Service Workers → Unregister
3. Clear cache: DevTools → Application → Storage → Clear site data
4. Verify `registerType: 'autoUpdate'` in config

### Icons Not Appearing

**Problem:** Default browser icon shown instead of custom icon

**Solutions:**
1. Verify icon paths match manifest configuration
2. Check icon files exist in `public/` directory
3. Ensure icons are at least 192x192 and 512x512 pixels
4. Use absolute paths in manifest: `/PlokminFun/freecell/icon-192.png`
5. Clear browser cache and reinstall app

### App Not Installing

**Problem:** "Add to Home Screen" option not appearing

**Solutions:**
1. Verify HTTPS is enabled (required for PWA)
2. Check manifest is valid: DevTools → Application → Manifest
3. Verify service worker is registered: DevTools → Application → Service Workers
4. Test on supported browsers (Safari on iOS, Chrome on Android)
5. Some browsers require user interaction before showing install prompt

## Additional Resources

- **Vite PWA Plugin:** https://vite-pwa-org.netlify.app/
- **PWA Builder:** https://www.pwabuilder.com/ (validate and test PWAs)
- **MDN PWA Guide:** https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Google PWA Checklist:** https://web.dev/pwa-checklist/
- **Workbox (Service Worker Library):** https://developers.google.com/web/tools/workbox
- **Web App Manifest Spec:** https://www.w3.org/TR/appmanifest/

## Next Steps

After deploying your PWA:

1. **Test on multiple devices** - iOS, Android, desktop
2. **Monitor analytics** - Track installation rate, usage patterns
3. **Consider native apps** - If you need App Store presence or native features, see [Native Apps Deployment Guide](./native-apps.md)
4. **Add push notifications** - Engage returning users (requires backend)
5. **Optimize performance** - Use Lighthouse to identify improvements
