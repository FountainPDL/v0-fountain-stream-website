package com.fountainstream.app;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

import com.getcapacitor.Bridge;
import com.getcapacitor.CapacitorPlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import timber.log.Timber;

/**
 * StreamingModule - Custom native module for streaming optimization and media handling
 * 
 * Handles streaming-specific features:
 * - Network quality monitoring
 * - Adaptive bitrate selection
 * - Playback state management
 * - Bandwidth optimization
 */
@CapacitorPlugin(name = "StreamingModule")
public class StreamingModule extends Plugin implements ConnectivityManager.OnNetworkActiveListener {

    private Context context;
    private ConnectivityManager connectivityManager;
    private boolean isAppActive = false;
    private int currentNetworkQuality = 0;

    // Quality levels: 0=offline, 1=poor, 2=fair, 3=good, 4=excellent
    private static final int QUALITY_OFFLINE = 0;
    private static final int QUALITY_POOR = 1;
    private static final int QUALITY_FAIR = 2;
    private static final int QUALITY_GOOD = 3;
    private static final int QUALITY_EXCELLENT = 4;

    public StreamingModule(Context context) {
        this.context = context;
        this.connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
    }

    /**
     * Register this module with the Capacitor bridge
     */
    public void registerBridge(Bridge bridge) {
        // Module is registered as CapacitorPlugin annotation
        Timber.d("StreamingModule registered with Capacitor");
    }

    /**
     * Get current network quality
     */
    @PluginMethod
    public void getNetworkQuality(PluginCall call) {
        try {
            int quality = checkNetworkQuality();
            JSONObject result = new JSONObject();
            result.put("quality", quality);
            result.put("isOnline", quality > QUALITY_OFFLINE);
            result.put("qualityLevel", getQualityLevel(quality));
            call.resolve(result);
            Timber.d("Network quality: %s", getQualityLevel(quality));
        } catch (JSONException e) {
            call.reject("Failed to get network quality", e);
        }
    }

    /**
     * Get optimal bitrate based on network conditions
     */
    @PluginMethod
    public void getOptimalBitrate(PluginCall call) {
        try {
            int quality = checkNetworkQuality();
            int bitrate = calculateOptimalBitrate(quality);
            JSONObject result = new JSONObject();
            result.put("bitrate", bitrate);
            result.put("quality", quality);
            result.put("recommendation", getQualityLevel(quality));
            call.resolve(result);
            Timber.d("Optimal bitrate: %d kbps", bitrate);
        } catch (JSONException e) {
            call.reject("Failed to get optimal bitrate", e);
        }
    }

    /**
     * Check current network quality
     */
    private int checkNetworkQuality() {
        NetworkInfo activeNetwork = connectivityManager.getActiveNetworkInfo();
        
        if (activeNetwork == null || !activeNetwork.isConnected()) {
            return QUALITY_OFFLINE;
        }

        int type = activeNetwork.getType();
        int subtype = activeNetwork.getSubtype();

        // Network type quality assessment
        if (type == ConnectivityManager.TYPE_WIFI) {
            // Assume good quality for WiFi
            return QUALITY_EXCELLENT;
        } else if (type == ConnectivityManager.TYPE_MOBILE) {
            // Assess mobile network type
            return assessMobileNetworkQuality(subtype);
        }

        return QUALITY_FAIR;
    }

    /**
     * Assess quality based on mobile network type
     */
    private int assessMobileNetworkQuality(int subtype) {
        switch (subtype) {
            case android.telephony.TelephonyManager.NETWORK_TYPE_GPRS:
            case android.telephony.TelephonyManager.NETWORK_TYPE_EDGE:
                return QUALITY_POOR;
            
            case android.telephony.TelephonyManager.NETWORK_TYPE_UMTS:
            case android.telephony.TelephonyManager.NETWORK_TYPE_CDMA:
            case android.telephony.TelephonyManager.NETWORK_TYPE_EVDO_0:
            case android.telephony.TelephonyManager.NETWORK_TYPE_EVDO_A:
            case android.telephony.TelephonyManager.NETWORK_TYPE_1xRTT:
                return QUALITY_FAIR;
            
            case android.telephony.TelephonyManager.NETWORK_TYPE_HSDPA:
            case android.telephony.TelephonyManager.NETWORK_TYPE_HSUPA:
            case android.telephony.TelephonyManager.NETWORK_TYPE_HSPA:
            case android.telephony.TelephonyManager.NETWORK_TYPE_IDEN:
                return QUALITY_GOOD;
            
            case android.telephony.TelephonyManager.NETWORK_TYPE_LTE:
            case android.telephony.TelephonyManager.NETWORK_TYPE_EHRPD:
            case android.telephony.TelephonyManager.NETWORK_TYPE_HSPAP:
                return QUALITY_EXCELLENT;
            
            // 5G networks
            case android.telephony.TelephonyManager.NETWORK_TYPE_NR:
                return QUALITY_EXCELLENT;
            
            default:
                return QUALITY_FAIR;
        }
    }

    /**
     * Calculate optimal bitrate in kbps
     */
    private int calculateOptimalBitrate(int quality) {
        switch (quality) {
            case QUALITY_OFFLINE:
                return 0;
            case QUALITY_POOR:
                return 500;      // 480p
            case QUALITY_FAIR:
                return 1500;     // 720p
            case QUALITY_GOOD:
                return 3000;     // 1080p
            case QUALITY_EXCELLENT:
                return 6000;     // 4K capable
            default:
                return 1500;
        }
    }

    /**
     * Get human-readable quality level
     */
    private String getQualityLevel(int quality) {
        switch (quality) {
            case QUALITY_OFFLINE:
                return "offline";
            case QUALITY_POOR:
                return "poor";
            case QUALITY_FAIR:
                return "fair";
            case QUALITY_GOOD:
                return "good";
            case QUALITY_EXCELLENT:
                return "excellent";
            default:
                return "unknown";
        }
    }

    /**
     * Called when app resumes
     */
    public void onAppResume() {
        isAppActive = true;
        Timber.d("StreamingModule resumed");
    }

    /**
     * Called when app pauses
     */
    public void onAppPause() {
        isAppActive = false;
        Timber.d("StreamingModule paused");
    }

    /**
     * Cleanup resources
     */
    public void cleanup() {
        if (connectivityManager != null) {
            try {
                connectivityManager.unregisterNetworkCallback(null);
            } catch (Exception e) {
                Timber.e(e, "Error unregistering network callback");
            }
        }
        Timber.d("StreamingModule cleaned up");
    }

    @Override
    public void onNetworkActive() {
        Timber.d("Network became active");
        currentNetworkQuality = checkNetworkQuality();
    }
}
