# GitHub Actions APK Build Workflow

Since the GitHub App doesn't have `workflows` permission, you need to manually add this workflow file.

## Steps to Add the Workflow:

1. Go to your GitHub repository: https://github.com/FountainPDL/v0-fountain-stream-website

2. Create the file: `.github/workflows/build-apk.yml`

3. Copy and paste the following content:

```yaml
name: Build Android APK

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      actions: read
      
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        with:
          api-levels: 35
          ndk-version: 26.1.10909125
          build-tools-version: 35.0.0

      - name: Create local.properties
        run: |
          echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties
          echo "ndk.dir=$ANDROID_NDK_HOME" >> android/local.properties

      - name: Install Dependencies
        run: npm install --legacy-peer-deps

      - name: Build Web Assets
        run: npm run build && npm run export

      - name: Build Debug APK
        run: npm run build:android:debug

      - name: Build Release APK
        run: npm run build:android || true

      - name: Upload APKs
        uses: actions/upload-artifact@v4
        with:
          name: apk-builds
          path: |
            android/app/build/outputs/apk/debug/app-debug.apk
            android/app/build/outputs/apk/release/app-release.apk
          retention-days: 30

      - name: Create Release
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        uses: softprops/action-gh-release@v2
        with:
          files: |
            android/app/build/outputs/apk/debug/app-debug.apk
            android/app/build/outputs/apk/release/app-release.apk
          tag_name: v${{ github.run_number }}
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

4. Commit and push this file to the repository

5. The workflow will automatically run on next push to `main` or `develop` branch

## What the Workflow Does:

- Installs Node.js 20 and Java 17
- Sets up Android SDK (API 35) and NDK 26.1
- Builds the Next.js web app
- Exports static assets
- Builds both debug and release APKs
- Uploads APKs as 30-day artifacts
- Creates GitHub Release with APKs (on main branch pushes)

## Viewing Build Results:

1. Go to **Actions** tab in your GitHub repository
2. Click on the build workflow run
3. Download APKs from "Artifacts" section or GitHub Release

## Manual Workflow Trigger:

You can also manually trigger the workflow:
1. Go to **Actions** tab
2. Select "Build Android APK" workflow
3. Click "Run workflow" → "Run workflow"

---

**Note:** The workflow file needs to be created manually due to GitHub App permission limitations. Once created, it will automatically build APKs for every push.
