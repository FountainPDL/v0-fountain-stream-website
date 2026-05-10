package com.fountainpdl.stream.utils;

import android.content.Context;
import android.os.Build;
import android.os.StatFs;

import java.io.File;

/**
 * Utility class for streaming-specific operations
 * Provides helper methods for caching, storage management, and device info
 */
public class StreamingUtils {

    /**
     * Get available storage space in MB
     */
    public static long getAvailableStorageMB(Context context) {
        File path = context.getExternalFilesDir(null);
        if (path == null) {
            path = context.getCacheDir();
        }
        
        StatFs stat = new StatFs(path.getAbsolutePath());
        long availableBlocks = stat.getAvailableBlocks();
        long blockSize = stat.getBlockSize();
        return (availableBlocks * blockSize) / (1024 * 1024);
    }

    /**
     * Get device model and Android version info
     */
    public static String getDeviceInfo() {
        return "Device: " + Build.MODEL + 
               ", Android: " + Build.VERSION.RELEASE + 
               ", SDK: " + Build.VERSION.SDK_INT;
    }

    /**
     * Clear application cache
     */
    public static void clearApplicationCache(Context context) {
        try {
            File dir = context.getCacheDir();
            if (dir != null && dir.isDirectory()) {
                deleteDir(dir);
            }
        } catch (Exception e) {
            System.err.println("[v0] Error clearing cache: " + e.getMessage());
        }
    }

    /**
     * Recursively delete directory
     */
    private static boolean deleteDir(File dir) {
        if (dir.isDirectory()) {
            String[] children = dir.list();
            if (children != null) {
                for (String child : children) {
                    boolean success = deleteDir(new File(dir, child));
                    if (!success) {
                        return false;
                    }
                }
            }
        }
        return dir.delete();
    }

    /**
     * Create cache directory for streaming content
     */
    public static File getStreamingCacheDir(Context context) {
        File cacheDir = new File(context.getCacheDir(), "streaming");
        if (!cacheDir.exists()) {
            cacheDir.mkdirs();
        }
        return cacheDir;
    }
}
