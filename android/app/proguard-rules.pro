# Capacitor
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# FountainHome
-keep class com.fountainpdl.stream.** { *; }
-keep interface com.fountainpdl.stream.** { *; }

# React Native
-keep class com.facebook.react.** { *; }
-keep interface com.facebook.react.** { *; }

# Android Support Libraries
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Prevent obfuscation of debugging symbols
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Allow native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Preserve enum values
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Preserve custom application classes
-keep class * extends android.app.Activity
-keep class * extends android.app.Service
-keep class * extends android.content.BroadcastReceiver
-keep class * extends android.content.ContentProvider

# WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
