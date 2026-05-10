package com.fountainstream.app;

import android.webkit.WebChromeClient;
import android.webkit.WebView;

import timber.log.Timber;

/**
 * FountainWebChromeClient - Custom WebChromeClient for enhanced media handling
 * 
 * Handles:
 * - JavaScript console messages
 * - Progress updates
 * - Video/media fullscreen
 * - Permissions
 */
public class FountainWebChromeClient extends WebChromeClient {

    @Override
    public void onProgressChanged(WebView view, int newProgress) {
        super.onProgressChanged(view, newProgress);
        
        if (newProgress == 100) {
            Timber.d("Page load progress: 100%");
        } else if (newProgress % 25 == 0) {
            Timber.d("Page load progress: %d%%", newProgress);
        }
    }

    @Override
    public boolean onConsoleMessage(android.webkit.ConsoleMessage consoleMessage) {
        String message = consoleMessage.message();
        String sourceId = consoleMessage.sourceId();
        int lineNumber = consoleMessage.lineNumber();
        int msgLevel = consoleMessage.messageLevel();

        String level;
        switch (msgLevel) {
            case android.webkit.ConsoleMessage.MESSAGE_LEVEL_TIP:
                level = "TIP";
                break;
            case android.webkit.ConsoleMessage.MESSAGE_LEVEL_LOG:
                level = "LOG";
                break;
            case android.webkit.ConsoleMessage.MESSAGE_LEVEL_WARNING:
                level = "WARN";
                break;
            case android.webkit.ConsoleMessage.MESSAGE_LEVEL_ERROR:
                level = "ERROR";
                break;
            case android.webkit.ConsoleMessage.MESSAGE_LEVEL_DEBUG:
                level = "DEBUG";
                break;
            default:
                level = "UNKNOWN";
        }

        Timber.tag("WebViewConsole").d("[%s] %s (%s:%d)", level, message, sourceId, lineNumber);
        return true;
    }

    @Override
    public void onShowCustomView(android.view.View view, CustomViewCallback callback) {
        Timber.d("Entering fullscreen/custom view");
        super.onShowCustomView(view, callback);
    }

    @Override
    public void onHideCustomView() {
        Timber.d("Exiting fullscreen/custom view");
        super.onHideCustomView();
    }

    @Override
    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
        Timber.d("New window requested (userGesture: %s)", isUserGesture);
        // Allow window creation from user gestures
        return isUserGesture;
    }
}
