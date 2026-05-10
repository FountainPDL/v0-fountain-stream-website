package com.fountainstream.app;

import android.content.Context;
import android.os.Build;

import java.io.File;

import timber.log.Timber;

/**
 * CacheManager - Manages app caching strategy and storage
 * 
 * Handles:
 * - App cache directory management
 * - Cache size monitoring
 * - Cache cleanup and optimization
 * - Storage permissions
 */
public class CacheManager {

    private Context context;
    private File cacheDir;
    private File appCacheDir;
    private static final long MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
    private static final long CACHE_CLEANUP_THRESHOLD = 400 * 1024 * 1024; // 400MB

    public CacheManager(Context context) {
        this.context = context;
        initializeCacheDirs();
    }

    /**
     * Initialize cache directories
     */
    private void initializeCacheDirs() {
        try {
            // Get app cache directory
            this.cacheDir = context.getCacheDir();
            
            // Create app-specific cache directory
            this.appCacheDir = new File(cacheDir, "fountain_app_cache");
            if (!appCacheDir.exists()) {
                appCacheDir.mkdirs();
            }

            Timber.d("Cache dir: %s", appCacheDir.getAbsolutePath());
            Timber.d("Cache dir size: %d MB", getCacheSizeInMB());
        } catch (Exception e) {
            Timber.e(e, "Error initializing cache directories");
        }
    }

    /**
     * Get app cache directory
     */
    public File getAppCacheDir() {
        return appCacheDir;
    }

    /**
     * Get cache directory path
     */
    public String getCacheDirPath() {
        return appCacheDir.getAbsolutePath();
    }

    /**
     * Get current cache size in bytes
     */
    public long getCacheSizeInBytes() {
        return getDirectorySize(appCacheDir);
    }

    /**
     * Get current cache size in MB
     */
    public long getCacheSizeInMB() {
        return getCacheSizeInBytes() / (1024 * 1024);
    }

    /**
     * Calculate directory size recursively
     */
    private long getDirectorySize(File directory) {
        long size = 0;
        try {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isFile()) {
                        size += file.length();
                    } else if (file.isDirectory()) {
                        size += getDirectorySize(file);
                    }
                }
            }
        } catch (Exception e) {
            Timber.e(e, "Error calculating directory size");
        }
        return size;
    }

    /**
     * Clear entire cache
     */
    public void clearCache() {
        try {
            deleteDirectory(appCacheDir);
            appCacheDir.mkdirs();
            Timber.d("Cache cleared");
        } catch (Exception e) {
            Timber.e(e, "Error clearing cache");
        }
    }

    /**
     * Clear cache if it exceeds threshold
     */
    public boolean cleanupIfNeeded() {
        long cacheSize = getCacheSizeInBytes();
        
        if (cacheSize > CACHE_CLEANUP_THRESHOLD) {
            Timber.d("Cache size (%d MB) exceeds threshold, cleaning up", cacheSize / (1024 * 1024));
            clearCache();
            return true;
        }
        return false;
    }

    /**
     * Delete directory and contents
     */
    private void deleteDirectory(File directory) {
        try {
            if (directory.exists()) {
                File[] files = directory.listFiles();
                if (files != null) {
                    for (File file : files) {
                        if (file.isDirectory()) {
                            deleteDirectory(file);
                        } else {
                            file.delete();
                        }
                    }
                }
                directory.delete();
            }
        } catch (Exception e) {
            Timber.e(e, "Error deleting directory");
        }
    }

    /**
     * Get available cache space
     */
    public long getAvailableCacheSpace() {
        try {
            File cacheFile = context.getCacheDir();
            android.os.StatFs statFs = new android.os.StatFs(cacheFile.getAbsolutePath());
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                return statFs.getAvailableBytes();
            } else {
                return statFs.getAvailableBlocks() * (long) statFs.getBlockSize();
            }
        } catch (Exception e) {
            Timber.e(e, "Error getting available space");
            return 0;
        }
    }

    /**
     * Get total cache space
     */
    public long getTotalCacheSpace() {
        try {
            File cacheFile = context.getCacheDir();
            android.os.StatFs statFs = new android.os.StatFs(cacheFile.getAbsolutePath());
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                return statFs.getTotalBytes();
            } else {
                return statFs.getBlockCount() * (long) statFs.getBlockSize();
            }
        } catch (Exception e) {
            Timber.e(e, "Error getting total space");
            return 0;
        }
    }

    /**
     * Cleanup resources
     */
    public void cleanup() {
        // Perform final cleanup if needed
        cleanupIfNeeded();
        Timber.d("CacheManager cleaned up");
    }
}
