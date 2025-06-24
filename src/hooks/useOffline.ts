// src/hooks/useOffline.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OfflineState {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export interface OfflineHookOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  checkInterval?: number;
  pingUrl?: string;
  pingTimeout?: number;
}

/**
 * Hook for detecting online/offline status with enhanced network information
 */
export function useOffline(options: OfflineHookOptions = {}): OfflineState {
  const {
    onOnline,
    onOffline,
    checkInterval = 30000, // 30 seconds
    pingUrl = '/api/health',
    pingTimeout = 5000,
  } = options;

  const [state, setState] = useState<OfflineState>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    wasOffline: false,
  }));

  // Get network connection info if available
  const getConnectionInfo = useCallback(() => {
    if (typeof navigator === 'undefined') return {};

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) return {};

    return {
      connectionType: connection.type,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    };
  }, []);

  // Ping server to verify actual connectivity
  const pingServer = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), pingTimeout);

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, [pingUrl, pingTimeout]);

  // Update state with new online status
  const updateOnlineStatus = useCallback(async (isOnline: boolean, skipPing = false) => {
    let actuallyOnline = isOnline;

    // If browser says we're online, verify with server ping
    if (isOnline && !skipPing) {
      actuallyOnline = await pingServer();
    }

    setState(prevState => {
      const newState: OfflineState = {
        isOnline: actuallyOnline,
        isOffline: !actuallyOnline,
        wasOffline: prevState.isOffline,
        ...getConnectionInfo(),
      };

      // Trigger callbacks if status changed
      if (prevState.isOnline !== actuallyOnline) {
        if (actuallyOnline && onOnline) {
          onOnline();
        } else if (!actuallyOnline && onOffline) {
          onOffline();
        }
      }

      return newState;
    });
  }, [onOnline, onOffline, pingServer, getConnectionInfo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial check
    updateOnlineStatus(navigator.onLine, true);

    // Event listeners for browser online/offline events
    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false, true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Connection change listener
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', () => {
        updateOnlineStatus(navigator.onLine);
      });
    }

    // Periodic connectivity check
    const interval = setInterval(() => {
      if (navigator.onLine) {
        updateOnlineStatus(true);
      }
    }, checkInterval);

    // Visibility change check (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden && navigator.onLine) {
        updateOnlineStatus(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [updateOnlineStatus, checkInterval]);

  return state;
}

/**
 * Simple hook that just returns online/offline boolean
 */
export function useOnlineStatus(): boolean {
  const { isOnline } = useOffline();
  return isOnline;
}

/**
 * Hook for managing offline queue functionality
 */
export function useOfflineQueue<T = any>() {
  const [queue, setQueue] = useState<T[]>([]);
  const { isOnline } = useOffline();

  const addToQueue = useCallback((item: T) => {
    setQueue(prev => [...prev, item]);
  }, []);

  const processQueue = useCallback(async (processor: (item: T) => Promise<void>) => {
    if (!isOnline || queue.length === 0) return;

    const items = [...queue];
    setQueue([]);

    for (const item of items) {
      try {
        await processor(item);
      } catch (error) {
        console.error('Failed to process queued item:', error);
        // Re-add failed item to queue
        setQueue(prev => [...prev, item]);
      }
    }
  }, [isOnline, queue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    queueLength: queue.length,
    addToQueue,
    processQueue,
    clearQueue,
    isOnline,
  };
}

/**
 * Hook for caching data with offline fallback
 */
export function useOfflineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    maxAge?: number; // milliseconds
    revalidateOnFocus?: boolean;
  } = {}
) {
  const { maxAge = 5 * 60 * 1000, revalidateOnFocus = true } = options; // 5 minutes default
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOffline();

  // Get cached data from localStorage
  const getCachedData = useCallback((): { data: T; timestamp: number } | null => {
    try {
      const cached = localStorage.getItem(`offline_cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [key]);

  // Set cached data to localStorage
  const setCachedData = useCallback((data: T) => {
    try {
      localStorage.setItem(`offline_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [key]);

  // Fetch fresh data
  const fetchData = useCallback(async (force = false) => {
    if (loading && !force) return;

    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to fetch fresh data
        const freshData = await fetcher();
        setData(freshData);
        setCachedData(freshData);
      } else {
        // Use cached data when offline
        const cached = getCachedData();
        if (cached) {
          setData(cached.data);
        } else {
          throw new Error('No cached data available offline');
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);

      // Try to use cached data as fallback
      const cached = getCachedData();
      if (cached) {
        setData(cached.data);
        console.warn('Using cached data due to fetch error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, fetcher, getCachedData, setCachedData, loading]);

  // Validate cached data age
  const isCacheValid = useCallback(() => {
    const cached = getCachedData();
    if (!cached) return false;
    return Date.now() - cached.timestamp < maxAge;
  }, [getCachedData, maxAge]);

  // Initial data load
  useEffect(() => {
    const cached = getCachedData();
    
    if (cached && isCacheValid()) {
      setData(cached.data);
      
      // Revalidate in background if online
      if (isOnline) {
        fetchData();
      }
    } else {
      fetchData();
    }
  }, [key]); // Only depend on key to avoid infinite loops

  // Revalidate when coming online
  useEffect(() => {
    if (isOnline && data && !isCacheValid()) {
      fetchData();
    }
  }, [isOnline, isCacheValid, fetchData, data]);

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      if (isOnline && !isCacheValid()) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, isOnline, isCacheValid, fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    loading,
    error,
    isOnline,
    isCached: !!getCachedData(),
    isStale: !isCacheValid(),
    refetch,
  };
}