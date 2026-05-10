package com.fountainstream.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.plugin.splashscreen.SplashScreen;

import timber.log.Timber;

/**
 * MainActivity - Entry point for the FountainHome Capacitor hybrid application
 * 
 * This activity initializes Capacitor, configures WebView settings for optimal
 * streaming performance, and manages the bridge between web and native code.
 */
public class MainActivity extends BridgeActivity {

    private StreamingModule streamingModule;
    private CacheManager cacheManager;
    private WebSettings webSettings;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize logging
        if (BuildConfig.DEBUG_MODE) {
            Timber.plant(new Timber.DebugTree());
        } else {
            Timber.plant(new CrashReportingTree());
        }

        Timber.d("MainActivity created - App Version: %s", BuildConfig.VERSION_NAME);

        // Initialize custom modules
        this.streamingModule = new StreamingModule(this);
        this.cacheManager = new CacheManager(this);

        // Configure WebView
        configureWebView();

        // Initialize Capacitor bridge
        initializeCapacitor();

        // Hide splash screen after app loads
        SplashScreen.show(this, R.style.AppTheme_NoActionBar);
    }

    /**
     * Configure WebView settings for optimal streaming performance
     */
    private void configureWebView() {
        webSettings = this.bridge.getWebView().getSettings();

        // Enable JavaScript
        webSettings.setJavaScriptEnabled(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);

        // Enable DOM storage and local storage
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setLocalStorageEnabled(true);

        // Performance optimizations
        webSettings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        webSettings.setEnableSmoothTransition(true);

        // Caching strategy for streaming
        webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        webSettings.setAppCacheEnabled(true);
        webSettings.setAppCachePath(cacheManager.getAppCacheDir());

        // Media playback
        webSettings.setMediaPlaybackRequiresUserGesture(false);

        // Security settings
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webSettings.setSavePassword(false);
        webSettings.setGeolocationEnabled(false);

        // Allow file access from file:// URLs
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);

        // User agent
        String userAgent = webSettings.getUserAgentString();
        webSettings.setUserAgentString(userAgent + " FountainHome/1.0");

        // Client setup
        this.bridge.getWebView().setWebViewClient(new FountainWebViewClient(cacheManager, streamingModule));
        this.bridge.getWebView().setWebChromeClient(new FountainWebChromeClient());

        Timber.d("WebView configured for streaming");
    }

    /**
     * Initialize Capacitor and register plugins
     */
    private void initializeCapacitor() {
        // Register custom plugins and bridge extensions
        try {
            // Streaming module can register native handlers
            streamingModule.registerBridge(this.bridge);
            Timber.d("Streaming module registered");
        } catch (Exception e) {
            Timber.e(e, "Failed to initialize Capacitor");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Notify streaming module of app resume
        if (streamingModule != null) {
            streamingModule.onAppResume();
        }
        Timber.d("App resumed");
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Notify streaming module of app pause
        if (streamingModule != null) {
            streamingModule.onAppPause();
        }
        Timber.d("App paused");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Cleanup resources
        if (cacheManager != null) {
            cacheManager.cleanup();
        }
        if (streamingModule != null) {
            streamingModule.cleanup();
        }
        Timber.d("App destroyed");
    }

    /**
     * Crash reporting tree for production logging
     */
    private static class CrashReportingTree extends Timber.Tree {
        @Override
        protected void log(int priority, String tag, String message, Throwable t) {
            if (priority == android.util.Log.ERROR) {
                // Report to crash analytics service
                // FirebaseCrashlytics.getInstance().recordException(t);
            }
        }
    }
}
