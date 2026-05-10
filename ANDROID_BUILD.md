# FountainHome Android APK Build Guide

Complete guide for building, testing, and releasing the FountainHome Android application using React Native, Capacitor, and Java.

## Architecture

The app uses a hybrid approach:
- **Frontend**: Next.js React web application
- **Native Bridge**: Capacitor for web-to-Android communication
- **Native Code**: Java modules for streaming, caching, and native features
- **Build System**: Gradle with Kotlin DSL for compilation
- **Platform**: Android 15 (API 35) with support back to Android 7 (API 24)

## Prerequisites

### Required Software
- **Node.js 20+** - For building Next.js frontend
- **pnpm 8+** - Package manager
- **Java JDK 11+** - Temurin or OpenJDK recommended
- **Android SDK** - API Level 35 (Android 15)
- **Gradle 8.2+** - Build system
- **Android Build Tools 35.0.0**
- **Android NDK 26.1** (optional, for native code)

### Installation

**macOS (Homebrew)**
```bash
brew install openjdk@11
brew install android-sdk
export ANDROID_HOME=/usr/local/share/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Ubuntu/Debian**
```bash
sudo apt-get install openjdk-11-jdk
sudo apt-get install android-sdk
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows**
- Download Android Studio from https://developer.android.com/studio
- Install through SDK Manager: API 35, Build Tools 35.0.0, NDK 26.1

## Project Structure

```
/vercel/share/v0-project/
├── app/                           # Next.js web app
├── android/                       # Android native project
│   ├── app/
│   │   ├── src/main/java/com/fountainstream/app/
│   │   │   ├── MainActivity.java                # Entry point
│   │   │   ├── StreamingModule.java             # Streaming logic
│   │   │   ├── CacheManager.java                # Cache management
│   │   │   ├── FountainWebViewClient.java       # WebView handler
│   │   │   └── FountainWebChromeClient.java     # Media handling
│   │   ├── src/main/res/values/
│   │   │   ├── strings.xml
│   │   │   ├── colors.xml
│   │   │   └── themes.xml
│   │   ├── src/main/AndroidManifest.xml
│   │   ├── build.gradle.kts
│   │   └── proguard-rules.pro
│   ├── build.gradle.kts           # Project-level config
│   ├── settings.gradle.kts        # Gradle settings
│   ├── gradle.properties          # Build properties
│   ├── local.properties           # SDK paths (local only)
│   └── key.properties.example     # Signing template
├── app-config.json                # App configuration
├── capacitor.config.json          # Capacitor config
├── .github/workflows/build-apk.yml # CI/CD automation
└── ANDROID_BUILD.md               # This file
```

## Setup Instructions

### 1. Environment Configuration

Create `android/local.properties` with SDK paths:
```properties
sdk.dir=/path/to/android/sdk
ndk.dir=/path/to/android/ndk
java.home=/path/to/java
```

**Common Paths:**
- **macOS:** `~/Library/Android/sdk`
- **Ubuntu:** `~/Android/Sdk`
- **Windows:** `C:\Users\YourUsername\AppData\Local\Android\sdk`

### 2. Install Dependencies

```bash
cd /vercel/share/v0-project
pnpm install --frozen-lockfile
```

### 3. Build Next.js Application

```bash
pnpm run build
pnpm run export
```

This generates static files in `out/` directory that embed in the APK.

## Building APK

### Debug APK (Testing)

```bash
pnpm run build:android:debug
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Production)

**Step 1: Configure Signing**
```bash
cp android/key.properties.example android/key.properties
# Edit android/key.properties with your credentials
```

**Step 2: Generate Keystore (if needed)**
```bash
keytool -genkey -v -keystore android/release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias fountain_key -storepass your_password -keypass your_password
```

**Step 3: Build Release APK**
```bash
pnpm run build:android
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

## Testing APK

### Android Emulator

```bash
emulator -avd Pixel_API_35
adb install android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.fountainstream.app.debug/.MainActivity
```

### Physical Device

```bash
adb devices  # Verify connection
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Java Modules Overview

### StreamingModule.java
Handles streaming-specific features:
- Network quality monitoring (5 levels: offline to excellent)
- Adaptive bitrate calculation based on network
- Playback state management
- Bandwidth optimization

**Key Methods:**
- `getNetworkQuality()` - Returns quality level 0-4
- `getOptimalBitrate()` - Returns recommended bitrate in kbps
- `onAppResume()` / `onAppPause()` - Lifecycle management

### CacheManager.java
Manages app caching strategy:
- Local cache directory management
- Cache size monitoring and cleanup
- Storage space calculation
- Automatic cleanup when threshold exceeded

**Key Methods:**
- `getCacheSizeInMB()` - Current cache size
- `clearCache()` - Delete all cached data
- `cleanupIfNeeded()` - Auto-cleanup at 400MB threshold
- `getAvailableCacheSpace()` - Available device storage

### MainActivity.java
Entry point for hybrid app:
- Initializes Capacitor bridge
- Configures WebView for streaming
- Manages resource lifecycle
- Handles native module registration

### FountainWebViewClient.java
Handles WebView page loading:
- Page load events
- Error handling with custom error pages
- SSL certificate management
- Resource loading optimization

### FountainWebChromeClient.java
Handles media and UI:
- JavaScript console logging
- Progress tracking
- Fullscreen video handling
- Window creation management

## Gradle Configuration Details

### build.gradle.kts (App Level)
- **Namespace:** com.fountainstream.app
- **Compilation SDK:** 35
- **Min SDK:** 24
- **Target SDK:** 35
- **Java Version:** 11
- **Build Types:** Debug + Release
- **Code Obfuscation:** R8 with ProGuard rules
- **Resource Shrinking:** Enabled in release

### build.gradle.kts (Project Level)
- Declares Android plugin versions
- Configures shared build settings
- Sets packaging options for all modules

### gradle.properties
- JVM heap allocation: 2048MB
- Parallel builds enabled
- Gradle build caching enabled
- AndroidX enabled
- R8 optimization enabled

## Signing Configuration

### Debug APK
- Automatically signed with debug keystore
- No password required
- Debug-only suffix (.debug)

### Release APK
- Signed with release keystore
- Configured via key.properties
- Environment variable fallback for CI/CD
- Shrinking and obfuscation enabled

**For CI/CD environment variables:**
```bash
export ANDROID_STORE_PASSWORD="password"
export ANDROID_KEY_ALIAS="fountain_app"
export ANDROID_KEY_PASSWORD="password"
```

## GitHub Actions CI/CD

Automated workflow (`.github/workflows/build-apk.yml`):

1. **Checkout** - Git clone
2. **Setup** - Node.js 20, Java 17, Android SDK
3. **Build Web** - Next.js compilation
4. **Build APK** - Debug and release APK builds
5. **Upload** - 30-day artifact retention
6. **Release** - Optional GitHub release creation

**Triggers:**
- Push to main branch
- Manual workflow_dispatch

## Troubleshooting

### Build Errors

**SDK location not found**
```bash
# Ensure local.properties exists with correct paths
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

**Gradle sync failed**
```bash
cd android && ./gradlew clean build && cd ..
```

**Out of memory**
```bash
# Edit android/gradle.properties
org.gradle.jvmargs=-Xmx4096m
```

### Runtime Issues

**White screen on launch**
```bash
# Clear cache
adb shell pm clear com.fountainstream.app

# Check WebView logs
adb logcat com.fountainstream.app:V
```

**Network errors**
- Verify AndroidManifest.xml permissions
- Check usesCleartextTraffic setting
- Test domain accessibility

## Publishing to Google Play Store

1. Create Play Store Developer account ($25 one-time)
2. Create app listing and fill metadata
3. Upload signed release APK
4. Test in internal/alpha tracks
5. Promote to production

## Performance Optimization

- **Code Obfuscation:** ProGuard rules reduce size 30-50%
- **Resource Shrinking:** Remove unused resources
- **Network Quality:** StreamingModule adapts bitrate
- **Caching:** CacheManager enables offline support
- **App Size:** ~50-80MB final APK (includes Next.js)

## Advanced Features

### Custom Network Quality Levels
- Level 0: Offline
- Level 1: Poor (500 kbps, 480p)
- Level 2: Fair (1500 kbps, 720p)
- Level 3: Good (3000 kbps, 1080p)
- Level 4: Excellent (6000 kbps, 4K)

### Cache Management
- Automatic cleanup at 400MB threshold
- Maximum cache size: 500MB
- Per-app cache isolation
- Configurable in CacheManager.java

## Resources

- [Android Developer Docs](https://developer.android.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Gradle Build System](https://gradle.org/docs)
- [Google Play Console](https://play.google.com/console)
- [ProGuard Configuration](https://www.guardsquare.com/proguard)

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Platform:** Android 7+ (API 24-35)  
**Architecture:** ARM64, ARM32, x86, x86_64
