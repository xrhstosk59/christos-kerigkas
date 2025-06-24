// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Edge runtime has memory constraints, so use lower sampling
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 0.5 : 0.01,
  
  // Minimal configuration for edge runtime
  debug: false, // Always false for edge to avoid memory issues
  
  // Minimal error filtering for edge
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    if (error instanceof Error) {
      // Skip edge-specific timeout errors
      if (error.message?.includes('timeout') ||
          error.message?.includes('execution time limit')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Minimal integrations for edge runtime
  integrations: [],
  
  // Environment tracking
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Edge runtime context
  initialScope: {
    tags: {
      component: 'edge',
      runtime: 'edge',
    },
  },
});