# Native App Deployment with Capacitor

This guide covers deploying the CardGames applications as native mobile apps using Capacitor, enabling distribution through the Apple App Store and Google Play Store.

## Overview

**Capacitor** is a cross-platform native runtime that wraps your web app in a native container, providing access to native device features and enabling App Store distribution.

**Official documentation:** https://capacitorjs.com/

### When to Use Native Apps

Choose native app deployment when you need:

- ✅ **App Store presence** - Discoverability through App Store / Play Store
- ✅ **Native device features** - Camera, geolocation, push notifications, etc.
- ✅ **Native look and feel** - Platform-specific UI patterns
- ✅ **Maximum performance** - Native APIs for graphics and animations

### When to Use PWA Instead

Consider PWA deployment if:

- ✅ **Instant updates** - No app store review process (can take days/weeks)
- ✅ **Free distribution** - Avoid $99/year iOS + $25 Android fees
- ✅ **Single deployment** - One build serves all platforms
- ✅ **Web-first audience** - Users prefer browser access

**See also:** [PWA Deployment Guide](./pwa.md)

## Deployment Path Comparison

| Aspect | PWA | Native (Capacitor) |
|--------|-----|-------------------|
| **Development effort** | Low (1-2 days) | Medium (3-5 days) |
| **App Store presence** | No (Add to Home Screen) | Yes (App Store + Play Store) |
| **Offline support** | Yes (service worker) | Yes (bundled assets) |
| **Updates** | Instant (no review) | Requires store submission (2-7 days) |
| **Device features** | Limited (web APIs only) | Full access (camera, notifications, etc.) |
| **Cost** | Free | $99/year iOS + $25 one-time Android |
| **Distribution** | Share URL | Download from stores |
| **Best for** | Prototyping, web-first apps | Store presence, native features |

## Prerequisites

### Development Environment

**For iOS development:**
- macOS (Xcode only runs on Mac)
- Xcode 14+ (download from Mac App Store)
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer account ($99/year for App Store distribution)

**For Android development:**
- Android Studio (Windows/Mac/Linux)
- Java Development Kit (JDK) 11+
- Android SDK (installed via Android Studio)
- Google Play Developer account ($25 one-time fee)

**Note:** You can develop Android apps on any platform, but iOS apps require a Mac.

## Installation Guide

### Step 1: Install Capacitor

Install Capacitor core and CLI in your game directory:

```bash
cd freecell-mvp  # or klondike-mvp
npm install @capacitor/core @capacitor/cli
```

### Step 2: Initialize Capacitor

Create Capacitor configuration:

```bash
npx cap init FreeCell com.yourcompany.freecell --web-dir=dist
```

**Parameters:**
- `FreeCell` - App name (displayed to users)
- `com.yourcompany.freecell` - Unique app identifier (reverse domain format)
- `--web-dir=dist` - Location of built web app (Vite output directory)

This creates `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.freecell',
  appName: 'FreeCell',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

### Step 3: Update Vite Configuration

**Important:** Capacitor requires relative paths, not absolute paths with `base`.

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',  // Use relative paths for Capacitor (not '/CardGames/freecell/')
  plugins: [react()],
})
```

**Note:** This change makes the build incompatible with GitHub Pages at subdirectories. For dual deployment (PWA + Native), use environment variables:

```typescript
export default defineConfig({
  base: process.env.CAPACITOR ? './' : '/CardGames/freecell/',
  plugins: [react()],
})
```

Then build with: `CAPACITOR=true npm run build`

### Step 4: Install Platform SDKs

Add iOS and/or Android platforms:

```bash
# Add iOS support (macOS only)
npm install @capacitor/ios
npx cap add ios

# Add Android support (all platforms)
npm install @capacitor/android
npx cap add android
```

This creates:
- `ios/` directory - Xcode project
- `android/` directory - Android Studio project

### Step 5: Build Web Assets

Build your React app before syncing to native platforms:

```bash
npm run build
```

This creates the `dist/` folder with your compiled web app.

### Step 6: Sync to Native Projects

Copy web assets to native platforms:

```bash
npx cap sync
```

**What `cap sync` does:**
1. Copies `dist/` contents to iOS and Android projects
2. Updates native dependencies
3. Installs Capacitor plugins

**When to run:**
- After building web app (`npm run build`)
- After installing new Capacitor plugins
- After changing `capacitor.config.ts`

## iOS Development

### Opening Xcode

```bash
npx cap open ios
```

This opens the iOS project in Xcode.

### Running on Simulator

1. In Xcode, select a simulator from the device dropdown (e.g., "iPhone 14")
2. Click the Play button (or press `Cmd+R`)
3. App launches in iOS Simulator

### Running on Physical Device

1. Connect iPhone/iPad via USB
2. In Xcode, select your device from the device dropdown
3. Click Play button
4. **First time:** Trust developer certificate on device (Settings → General → Device Management)

### Building for App Store

**Prerequisites:**
- Apple Developer account ($99/year)
- App registered in App Store Connect
- Provisioning profiles and certificates configured

**Steps:**

1. **Set version and build number** in Xcode:
   - Select project root → General tab
   - Version: `1.0.0` (user-facing version)
   - Build: `1` (increment for each submission)

2. **Configure signing:**
   - Signing & Capabilities tab
   - Select your team
   - Choose automatic or manual signing

3. **Archive for distribution:**
   - Product → Archive (or `Cmd+B`)
   - Wait for archive to complete
   - Organizer window opens automatically

4. **Upload to App Store Connect:**
   - In Organizer, select archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow prompts to upload

5. **Submit for review:**
   - Go to https://appstoreconnect.apple.com
   - Select your app
   - Add screenshots, description, keywords
   - Submit for review

**Review time:** Typically 1-7 days

**Official guide:** https://developer.apple.com/app-store/submissions/

## Android Development

### Opening Android Studio

```bash
npx cap open android
```

This opens the Android project in Android Studio.

### Running on Emulator

1. In Android Studio, click "Device Manager" (phone icon)
2. Create a virtual device (e.g., Pixel 5, Android 13)
3. Click Run (green play button)
4. App launches in emulator

### Running on Physical Device

1. Enable Developer Options on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. Click Run in Android Studio
5. Select your device from the list

### Building for Play Store

**Prerequisites:**
- Google Play Developer account ($25 one-time fee)
- App registered in Play Console

**Steps:**

1. **Generate signing key** (first time only):
   ```bash
   cd android
   keytool -genkey -v -keystore my-release-key.keystore \
     -alias freecell -keyalg RSA -keysize 2048 -validity 10000
   ```

   **Important:** Store this keystore securely - you cannot update your app without it!

2. **Configure signing** in `android/app/build.gradle`:
   ```gradle
   android {
     ...
     signingConfigs {
       release {
         storeFile file("../my-release-key.keystore")
         storePassword "your-password"
         keyAlias "freecell"
         keyPassword "your-password"
       }
     }
     buildTypes {
       release {
         signingConfig signingConfigs.release
         minifyEnabled false
         proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
       }
     }
   }
   ```

3. **Build release AAB** (Android App Bundle):
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

   Output: `android/app/build/outputs/bundle/release/app-release.aab`

4. **Upload to Play Console:**
   - Go to https://play.google.com/console
   - Select your app
   - Production → Create new release
   - Upload `app-release.aab`
   - Fill in release notes
   - Review and rollout

**Review time:** Typically 1-3 days (faster than iOS)

**Official guide:** https://developer.android.com/studio/publish

## App Configuration

### App Icons

**iOS:**
Add icons in Xcode:
1. Open `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
2. Add icon images at required sizes:
   - 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5 (all @1x, @2x, @3x)
3. Or use Xcode: Select AppIcon → Inspector → Click icon sizes to add images

**Android:**
Add icons in Android Studio:
1. Right-click `android/app/src/main/res/`
2. New → Image Asset
3. Select icon type: "Launcher Icons"
4. Choose source image (512x512 recommended)
5. Customize shape, background, foreground
6. Click "Next" → "Finish"

**Tip:** Use [App Icon Generator](https://www.appicon.co/) to create all sizes from one source image.

### Splash Screen

**iOS:**
Edit `ios/App/App/Assets.xcassets/Splash.imageset/` or use LaunchScreen.storyboard in Xcode.

**Android:**
Edit `android/app/src/main/res/drawable/splash.png` and related resources.

**Using Capacitor Splash Screen plugin:**
```bash
npm install @capacitor/splash-screen

# Configure in capacitor.config.ts
{
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2c5f2d",
      showSpinner: false,
    }
  }
}
```

### App Name and Metadata

**iOS** (`ios/App/App/Info.plist`):
```xml
<key>CFBundleDisplayName</key>
<string>FreeCell</string>
<key>CFBundleName</key>
<string>FreeCell</string>
```

**Android** (`android/app/src/main/res/values/strings.xml`):
```xml
<resources>
    <string name="app_name">FreeCell</string>
    <string name="title_activity_main">FreeCell</string>
    <string name="package_name">com.yourcompany.freecell</string>
</resources>
```

### Version Numbers

**iOS** (Xcode → General tab):
- **Version:** 1.0.0 (user-facing, semantic versioning)
- **Build:** 1 (increment for each submission)

**Android** (`android/app/build.gradle`):
```gradle
android {
    defaultConfig {
        versionCode 1        // Integer, increment for each release
        versionName "1.0.0"  // String, user-facing version
    }
}
```

## Updating Your App

### Development Workflow

1. **Make changes** to web app (React components, styles, logic)

2. **Build web assets:**
   ```bash
   npm run build
   ```

3. **Sync to native platforms:**
   ```bash
   npx cap sync
   ```

4. **Test in IDE:**
   - iOS: `npx cap open ios` → Run in Xcode
   - Android: `npx cap open android` → Run in Android Studio

5. **Iterate:** Repeat steps 1-4 as needed

### Releasing Updates

**For App Store (iOS):**
1. Increment build number in Xcode
2. Archive and upload new version
3. Submit for review in App Store Connect
4. Wait for approval (1-7 days)
5. Release to users (manual or automatic)

**For Play Store (Android):**
1. Increment `versionCode` in `build.gradle`
2. Build new AAB: `./gradlew bundleRelease`
3. Upload to Play Console
4. Submit for review (1-3 days)
5. Rollout to users (staged or full)

**Important:** Unlike PWA (instant updates), native apps require store approval for each update.

## Adding Native Features

### Capacitor Plugins

Capacitor provides plugins for native device features:

**Common plugins:**
```bash
# Camera
npm install @capacitor/camera

# Push notifications
npm install @capacitor/push-notifications

# Local storage
npm install @capacitor/preferences

# Haptics (vibration)
npm install @capacitor/haptics

# Share dialog
npm install @capacitor/share
```

**Usage example (Camera):**
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri
  });

  const imageUrl = image.webPath;
  // Use imageUrl in your app
};
```

**Plugin directory:** https://capacitorjs.com/docs/plugins

### Platform-Specific Code

Detect platform and customize behavior:

```typescript
import { Capacitor } from '@capacitor/core';

const platform = Capacitor.getPlatform(); // 'web', 'ios', 'android'

if (platform === 'ios') {
  // iOS-specific code
} else if (platform === 'android') {
  // Android-specific code
} else {
  // Web-specific code
}

// Check if running as native app
const isNative = Capacitor.isNativePlatform(); // true on iOS/Android
```

## Troubleshooting

### Build Errors

**"Command failed: npm run build"**
- Solution: Fix TypeScript/ESLint errors in web app first
- Run: `npm run lint && npm run build` locally

**"capacitor.config.ts not found"**
- Solution: Run `npx cap init` to create config file
- Verify you're in the correct directory (freecell-mvp/)

### iOS Issues

**"No profiles for 'com.yourcompany.freecell' were found"**
- Solution: Configure signing in Xcode (Signing & Capabilities tab)
- Ensure you're logged into Xcode with Apple Developer account

**"App installation failed"**
- Solution: Delete app from device, then re-run from Xcode
- Check device is trusted (Settings → General → Device Management)

**"Module 'Capacitor' not found"**
- Solution: Run `npx cap sync ios` to install dependencies
- Run `pod install` in `ios/App/` directory

### Android Issues

**"Gradle sync failed"**
- Solution: Open Android Studio → File → Invalidate Caches → Restart
- Update Android Studio and SDK to latest versions

**"App not installed" on device**
- Solution: Uninstall old version, then reinstall
- Check device has enough storage space

**"Unable to locate adb"**
- Solution: Install Android SDK Platform Tools via SDK Manager
- Add to PATH: `export ANDROID_HOME=/path/to/sdk`

## Testing on Real Devices

### Live Reload During Development

Enable live reload to see changes instantly on device:

1. **Start dev server with host flag:**
   ```bash
   npm run dev -- --host
   ```

2. **Note your local IP address** (e.g., 192.168.1.100:5173)

3. **Update capacitor.config.ts:**
   ```typescript
   const config: CapacitorConfig = {
     appId: 'com.yourcompany.freecell',
     appName: 'FreeCell',
     webDir: 'dist',
     server: {
       url: 'http://192.168.1.100:5173',  // Your dev server
       cleartext: true
     }
   };
   ```

4. **Sync and run:**
   ```bash
   npx cap sync
   npx cap open ios  # or android
   ```

5. **Make changes** - app reloads automatically

**Important:** Remove `server.url` before building production release!

## Additional Resources

### Official Documentation
- **Capacitor:** https://capacitorjs.com/
- **iOS Development:** https://developer.apple.com/documentation/
- **Android Development:** https://developer.android.com/docs
- **App Store Connect:** https://developer.apple.com/app-store-connect/
- **Google Play Console:** https://play.google.com/console

### Tools and Services
- **App Icon Generator:** https://www.appicon.co/
- **Splash Screen Generator:** https://apetools.webprofusion.com/app/#/tools/imagegorilla
- **App Store Screenshots:** https://www.appstorescreenshot.com/
- **TestFlight (iOS Beta):** https://developer.apple.com/testflight/
- **Google Play Beta Testing:** https://support.google.com/googleplay/android-developer/answer/3131213

### Community
- **Capacitor Discord:** https://discord.gg/UPYYRhtyzp
- **Ionic Forum:** https://forum.ionicframework.com/c/capacitor/

## Next Steps

After setting up native apps:

1. **Test thoroughly** on real iOS and Android devices
2. **Submit to stores** and navigate review process
3. **Plan update strategy** - Balance features vs. review time
4. **Monitor analytics** - Track installations, engagement, crashes
5. **Consider hybrid approach** - PWA for instant updates, native for store presence
