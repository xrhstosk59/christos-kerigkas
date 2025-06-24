// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring.
  // Adjust this value in production to reduce costs
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  
  // Capture Replay for 10% of all sessions and 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Enhanced error filtering
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    const error = hint.originalException;
    
    if (error instanceof Error) {
      // Skip Next.js hydration errors that are common and usually harmless
      if (error.message?.includes('Hydration failed') || 
          error.message?.includes('Text content does not match') ||
          error.message?.includes('useLayoutEffect does nothing on the server')) {
        return null;
      }
      
      // Skip AbortController errors (user cancelled requests)
      if (error.name === 'AbortError') {
        return null;
      }
      
      // Skip network errors that might be due to offline state
      if (error.message?.includes('fetch') && error.message?.includes('Failed')) {
        return null;
      }
    }
    
    // Skip events from extensions
    if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
      frame => frame.filename?.includes('extension://') || 
               frame.filename?.includes('moz-extension://')
    )) {
      return null;
    }
    
    return event;
  },
  
  // Set up integrations
  integrations: [
    // Replay integration is automatically included in Next.js
    // BrowserTracing is automatically included in Next.js
  ],
  
  // Environment and release tracking
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Additional context
  initialScope: {
    tags: {
      component: 'client',
    },
  },
  
  // Set sampling rate for profiling
  profilesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
});