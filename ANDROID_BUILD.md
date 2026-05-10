# FountainHome Android APK Build Guide

This document describes how to build and deploy the FountainHome streaming app as an Android APK using React Native, Capacitor, and Next.js.

## Architecture

The app uses a hybrid approach:
- **Frontend**: Next.js (React) web application
- **Native Bridge**: Capacitor for React to Android communication
- **Native Code**: Java for Android-specific functionality
- **Build System**: Gradle for APK compilation

## Prerequisites

### Local Development
- Node.js 18+ and npm
- Java Development Kit (JDK) 11+
- Android SDK (API level 26+)
- Android Build Tools 34.0.0+
- Gradle 8.1.0+

### Environment Setup
```bash
# Install Android SDK
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export ANDROID_HOME=$ANDROID_SDK_ROOT
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools

# Or on Linux:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Build Instructions

### 1. Build Web Assets
```bash
npm install --legacy-peer-deps
npm run build
```

This generates the optimized Next.js build in the `out/` directory.

### 2. Build Debug APK
```bash
npm run build:android:debug
```

The debug APK will be available at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Build Release APK
```bash
npm run build:android
```

The release APK will be available at:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## Custom Java Modules

### StreamingUtils.java
Located in `android/app/src/main/java/com/fountainpdl/stream/utils/StreamingUtils.java`

Provides utilities for:
- **Cache Management**: Store downloaded streaming content
- **Storage Info**: Check available device storage
- **Device Info**: Get device model and Android version
- **Streaming Cache**: Dedicated directory for media files

### MainActivity.java
The main Android activity that bridges Capacitor with native Android APIs.

Initializes:
1. Cache management system
2. Storage permission handling
3. Media player configuration

## GitHub Actions CI/CD

The `.github/workflows/build-apk.yml` workflow automatically:
1. Checks out code
2. Installs dependencies
3. Builds Next.js application
4. Compiles Android APK
5. Uploads APK as artifact
6. Creates release with APK on main branch

### Triggering Builds
- Push to `main` or `develop` branch
- Pull requests to `main`
- Manual workflow dispatch

### Accessing Built APKs
1. Go to GitHub Actions
2. Select the completed workflow run
3. Download the APK from "Artifacts" section

## Gradle Configuration

### Project Structure
```
android/
├── app/
│   ├── build.gradle.kts          # App module configuration
│   ├── proguard-rules.pro        # Code obfuscation rules
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml
│       │   ├── java/com/fountainpdl/stream/
│       │   │   ├── MainActivity.java
│       │   │   └── utils/StreamingUtils.java
│       │   └── res/
│       │       ├── values/colors.xml
│       │       ├── values/strings.xml
│       │       └── values/themes.xml
├── build.gradle.kts              # Project-level configuration
└── settings.gradle.kts           # Project settings
```

### Key Gradle Settings
- **Namespace**: `com.fountainpdl.stream`
- **Target SDK**: 34 (Android 14)
- **Min SDK**: 26 (Android 8)
- **Java Version**: 11

## Signing & Deployment

### Debug APK
Debug builds are automatically signed with the debug keystore.

### Release APK
For production releases, you need a signing key:

```bash
# Generate keystore (one time only)
keytool -genkey -v -keystore my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias

# Configure in android/app/build.gradle.kts
signingConfigs {
    release {
        storeFile file("../my-release-key.keystore")
        storePassword "your-keystore-password"
        keyAlias "my-key-alias"
        keyPassword "your-key-password"
    }
}
```

## Publishing to Google Play

1. Create Google Play Developer account
2. Set up app listing with screenshots and description
3. Generate signed APK:
   ```bash
   npm run build:android
   ```
4. Upload APK to Google Play Console
5. Configure release notes and rollout percentage
6. Submit for review

## Troubleshooting

### Build Fails with Gradle Error
```bash
# Clean build
cd android
./gradlew clean
./gradlew assembleRelease
```

### Out of Memory During Build
```bash
# Increase Gradle heap
export GRADLE_OPTS="-Xmx4096m"
npm run build:android
```

### Dependency Issues
```bash
# Update dependencies
npm install --legacy-peer-deps --force
cd android
./gradlew dependencyUpdates
```

### APK Not Found After Build
Check build output:
```bash
cd android
./gradlew assembleRelease --info | grep -i "apk"
```

## Development Tips

1. **Hot Reload**: Use `npm run dev` for web development
2. **Android Emulator**: Test with Android Studio emulator
3. **Device Testing**: Connect physical Android device via USB
4. **Logs**: View device logs with `adb logcat`
5. **Profiling**: Use Android Studio Profiler for performance analysis

## Performance Optimization

- **Code Obfuscation**: ProGuard rules in `proguard-rules.pro`
- **Image Optimization**: Already configured in Next.js
- **Caching**: StreamingUtils provides efficient cache management
- **Bundle Size**: ~50-100 MB final APK size

## Resources

- [Capacitor Documentation](https://capacitorjs.com/)
- [Android Developer Guide](https://developer.android.com/)
- [Gradle Documentation](https://gradle.org/)
- [Next.js Static Export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)

---

For questions or issues, refer to the project README or open an issue on GitHub.
