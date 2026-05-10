plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.fountainstream.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fountainstream.app"
        minSdk = 24
        targetSdk = 35
        versionCode = System.getenv("APP_VERSION_CODE")?.toIntOrNull() ?: 1
        versionName = System.getenv("APP_VERSION_NAME") ?: "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // App configuration from app-config.json
        manifestPlaceholders["appName"] = "FountainHome"
        manifestPlaceholders["appVersion"] = versionName
    }

    signingConfigs {
        // Debug signing configuration (auto-generated keystore)
        getByName("debug") {
            storeFile = file("$rootDir/../android-debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }

        // Release signing configuration
        create("release") {
            val keyFile = rootProject.file("key.properties")
            if (keyFile.exists()) {
                val props = java.util.Properties()
                props.load(keyFile.inputStream())
                
                storeFile = rootProject.file(props.getProperty("store_file", "app.keystore"))
                storePassword = props.getProperty("store_password")
                keyAlias = props.getProperty("key_alias")
                keyPassword = props.getProperty("key_password")
            } else {
                // Fallback for CI/CD with environment variables
                storeFile = rootProject.file("build.keystore")
                storePassword = System.getenv("ANDROID_STORE_PASSWORD") ?: "default"
                keyAlias = System.getenv("ANDROID_KEY_ALIAS") ?: "fountain_app"
                keyPassword = System.getenv("ANDROID_KEY_PASSWORD") ?: "default"
            }
        }
    }

    buildTypes {
        getByName("debug") {
            debuggable = true
            signingConfig = signingConfigs.getByName("debug")
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            isDebuggable = true
        }

        getByName("release") {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
            
            buildConfigField("String", "APP_NAME", "\"FountainHome\"")
            buildConfigField("String", "VERSION_NAME", "\"${defaultConfig.versionName}\"")
            buildConfigField("int", "VERSION_CODE", "${defaultConfig.versionCode}")
            buildConfigField("boolean", "DEBUG_MODE", "false")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }

    buildFeatures {
        aidl = true
        renderScript = false
        resValues = false
        shaders = false
        viewBinding = true
    }

    packagingOptions {
        resources {
            excludes += setOf(
                "META-INF/proguard/androidx-*.pro",
                "META-INF/proguard/retrofit2.pro",
                "META-INF/LICENSE",
                "META-INF/NOTICE"
            )
        }
    }

    lint {
        disable += setOf(
            "MissingTranslation",
            "ExtraTranslation",
            "ChromeOsAbiMismatch"
        )
    }
}

dependencies {
    // Core Android
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.core:core:1.12.0")
    implementation("androidx.activity:activity:1.8.0")
    implementation("androidx.fragment:fragment:1.6.2")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // Material Design
    implementation("com.google.android.material:material:1.11.0")

    // Capacitor
    implementation("com.getcapacitor:core:5.7.0")
    implementation("com.getcapacitor.plugins:splashscreen:5.0.7")
    implementation("com.getcapacitor.plugins:statusbar:5.0.7")
    implementation("com.getcapacitor.plugins:storage:5.1.0")

    // WebView
    implementation("androidx.webkit:webkit:1.7.0")

    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    implementation("com.squareup.retrofit2:retrofit:2.10.0")
    implementation("com.squareup.retrofit2:converter-gson:2.10.0")

    // JSON parsing
    implementation("com.google.code.gson:gson:2.10.1")

    // Local data storage
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // Lifecycle
    implementation("androidx.lifecycle:lifecycle-runtime:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata:2.7.0")

    // Concurrency
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Image loading
    implementation("com.github.bumptech.glide:glide:4.16.0")

    // Logging
    implementation("com.jakewharton.timber:timber:5.0.1")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}

// Task to copy Next.js output to Android assets
tasks.register("copyWebAssets") {
    doLast {
        val webOutDir = file("../../out")
        val webDistDir = file("../../.next/standalone/.next")
        val assetsDir = file("src/main/assets/www")

        assetsDir.deleteRecursively()
        assetsDir.mkdirs()

        when {
            webOutDir.exists() -> copy {
                from(webOutDir)
                into(assetsDir)
            }
            webDistDir.exists() -> copy {
                from(webDistDir)
                into(assetsDir)
            }
            else -> {
                println("WARNING: Web assets directory not found. Expected either $webOutDir or $webDistDir")
            }
        }
    }
}

// Run copyWebAssets before building APK
preBuild.dependsOn("copyWebAssets")
