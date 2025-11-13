// src/components/providers/offline-provider.tsx
'use client';

import { createContext, useContext, useEffect } from 'react';
import { useOffline } from '@/hooks/useOffline';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { toast } from 'sonner';

interface OfflineContextType {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  connectionType?: string;
  effectiveType?: string;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: React.ReactNode;
  showIndicator?: boolean;
  showToasts?: boolean;
}

export function OfflineProvider({ 
  children, 
  showIndicator = true,
  showToasts = true 
}: OfflineProviderProps) {
  const offlineState = useOffline({
    onOnline: () => {
      if (showToasts) {
        toast.success('Connection restored', {
          description: 'You are back online',
          duration: 3000,
        });
      }
    },
    onOffline: () => {
      if (showToasts) {
        toast.warning('Connection lost', {
          description: 'You are currently offline',
          duration: 5000,
        });
      }
    },
  });

  // Register service worker - DISABLED temporarily due to webpack conflicts
  useEffect(() => {
    // Service Worker disabled in development to prevent module resolution conflicts
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (showToasts) {
                    toast.info('App updated', {
                      description: 'A new version is available. Refresh to update.',
                      action: {
                        label: 'Refresh',
                        onClick: () => window.location.reload(),
                      },
                      duration: 10000,
                    });
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('SW Message:', event.data);

        if (event.data?.type === 'CACHE_UPDATED') {
          if (showToasts) {
            toast.info('Content updated', {
              description: 'New content is available',
              duration: 3000,
            });
          }
        }
      });
    }
  }, [showToasts]);

  return (
    <OfflineContext.Provider value={offlineState}>
      {children}
      {showIndicator && <OfflineIndicator />}
    </OfflineContext.Provider>
  );
}

export function useOfflineContext(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
}

// Higher-order component for offline-aware components
export function withOfflineSupport<P extends object>(
  Component: React.ComponentType<P>
) {
  return function OfflineAwareComponent(props: P) {
    const offlineState = useOfflineContext();
    
    return <Component {...props} offlineState={offlineState} />;
  };
}