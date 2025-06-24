// src/components/ui/offline-indicator.tsx
'use client';

import { useOffline } from '@/hooks/useOffline';
import { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
  showConnectionInfo?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function OfflineIndicator({ 
  className = '',
  showConnectionInfo = false,
  autoHide = true,
  autoHideDelay = 5000
}: OfflineIndicatorProps) {
  const [visible, setVisible] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);
  
  const { isOffline, wasOffline, effectiveType, downlink } = useOffline({
    onOnline: () => {
      if (wasOffline) {
        setJustCameOnline(true);
        setTimeout(() => setJustCameOnline(false), autoHideDelay);
      }
    },
    onOffline: () => {
      setVisible(true);
    }
  });

  useEffect(() => {
    if (isOffline) {
      setVisible(true);
    } else if (autoHide && !justCameOnline) {
      setVisible(false);
    }
  }, [isOffline, autoHide, justCameOnline]);

  // Auto-hide success message
  useEffect(() => {
    if (justCameOnline && autoHide) {
      const timer = setTimeout(() => {
        setJustCameOnline(false);
        setVisible(false);
      }, autoHideDelay);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [justCameOnline, autoHide, autoHideDelay]);

  if (!visible && !justCameOnline) return null;

  const getConnectionQuality = () => {
    if (!effectiveType) return null;
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return { label: 'Slow', color: 'text-red-500' };
      case '3g':
        return { label: 'Moderate', color: 'text-yellow-500' };
      case '4g':
        return { label: 'Fast', color: 'text-green-500' };
      default:
        return null;
    }
  };

  const connectionQuality = getConnectionQuality();

  if (justCameOnline) {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Wifi className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Back Online
              </h3>
              <p className="text-sm text-green-600">
                Your connection has been restored
              </p>
              {showConnectionInfo && connectionQuality && (
                <p className="text-xs text-green-500 mt-1">
                  Connection: {connectionQuality.label}
                  {downlink && ` • ${downlink.toFixed(1)} Mbps`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <WifiOff className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                You're Offline
              </h3>
              <p className="text-sm text-red-600">
                Some features may not be available
              </p>
              {showConnectionInfo && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 inline-flex items-center text-xs text-red-600 hover:text-red-800"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

interface ConnectionStatusProps {
  className?: string;
  compact?: boolean;
}

export function ConnectionStatus({ className = '', compact = false }: ConnectionStatusProps) {
  const { isOnline, connectionType, effectiveType, downlink, rtt } = useOffline();

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {isOnline && (
        <div className="space-y-1 text-xs text-gray-600">
          {connectionType && (
            <div>Type: {connectionType}</div>
          )}
          {effectiveType && (
            <div>Speed: {effectiveType.toUpperCase()}</div>
          )}
          {downlink && (
            <div>Bandwidth: {downlink.toFixed(1)} Mbps</div>
          )}
          {rtt && (
            <div>Latency: {rtt}ms</div>
          )}
        </div>
      )}
    </div>
  );
}

interface OfflineFallbackProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function OfflineFallback({ 
  children, 
  fallback, 
  className = '' 
}: OfflineFallbackProps) {
  const { isOffline } = useOffline();

  if (isOffline) {
    return (
      <div className={className}>
        {fallback || (
          <div className="text-center py-8">
            <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              You're Offline
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              This content isn't available offline. Please check your connection and try again.
            </p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

interface OfflineQueueStatusProps {
  queueLength: number;
  className?: string;
}

export function OfflineQueueStatus({ queueLength, className = '' }: OfflineQueueStatusProps) {
  const { isOffline } = useOffline();

  if (!isOffline || queueLength === 0) return null;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-sm ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <span>
        {queueLength} action{queueLength !== 1 ? 's' : ''} pending
      </span>
    </div>
  );
}