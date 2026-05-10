package com.fountainstream.app;

import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import timber.log.Timber;

/**
 * FountainWebViewClient - Custom WebViewClient for streaming-optimized loading
 * 
 * Handles:
 * - Page load events
 * - SSL error handling
 * - Resource loading optimization
 * - Error handling
 */
public class FountainWebViewClient extends WebViewClient {

    private CacheManager cacheManager;
    private StreamingModule streamingModule;

    public FountainWebViewClient(CacheManager cacheManager, StreamingModule streamingModule) {
        this.cacheManager = cacheManager;
        this.streamingModule = streamingModule;
    }

    @Override
    public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
        super.onPageStarted(view, url, favicon);
        Timber.d("Page loading started: %s", url);

        // Check cache before loading
        cacheManager.cleanupIfNeeded();
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        Timber.d("Page loading finished: %s", url);
    }

    @Override
    public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
        super.onReceivedError(view, errorCode, description, failingUrl);
        Timber.e("WebView error %d: %s (URL: %s)", errorCode, description, failingUrl);

        // Show error page
        String errorHtml = buildErrorPage(errorCode, description, failingUrl);
        view.loadData(errorHtml, "text/html", "utf-8");
    }

    @Override
    public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        // In production, you should validate the certificate
        // For now, we'll handle common SSL errors gracefully
        Timber.w("SSL Error: %d", error.getPrimaryError());

        if (BuildConfig.DEBUG_MODE) {
            // Allow SSL errors in debug mode only
            handler.proceed();
        } else {
            // Reject in production
            handler.cancel();
        }
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        // Allow all URLs to load in the WebView
        return false;
    }

    /**
     * Build a user-friendly error page
     */
    private String buildErrorPage(int errorCode, String description, String failingUrl) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='utf-8'>" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1'>" +
                "  <title>Connection Error</title>" +
                "  <style>" +
                "    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; " +
                "           background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); " +
                "           color: #fff; margin: 0; padding: 20px; text-align: center; min-height: 100vh; " +
                "           display: flex; align-items: center; justify-content: center; }" +
                "    .container { max-width: 600px; }" +
                "    h1 { font-size: 2em; margin: 20px 0; }" +
                "    p { font-size: 1.1em; color: #ccc; line-height: 1.6; }" +
                "    .error-code { color: #ff6b6b; font-family: monospace; margin: 20px 0; }" +
                "    .retry-btn { display: inline-block; margin-top: 20px; padding: 12px 30px; " +
                "                  background: #e94560; color: white; text-decoration: none; " +
                "                  border-radius: 4px; cursor: pointer; border: none; font-size: 1em; }" +
                "    .retry-btn:hover { background: #d63447; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <h1>⚠️ Connection Error</h1>" +
                "    <p>Unable to load the page. Please check your connection and try again.</p>" +
                "    <div class='error-code'>Error: " + errorCode + "</div>" +
                "    <p style='color: #999; font-size: 0.9em;'>" + description + "</p>" +
                "    <button class='retry-btn' onclick='location.reload()'>Retry</button>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
