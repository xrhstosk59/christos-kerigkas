// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Lower sample rate for server-side to reduce costs
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.05,
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Enhanced error filtering for server
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    if (error instanceof Error) {
      // Skip common server errors that don't need tracking
      if (error.message?.includes('ECONNRESET') ||
          error.message?.includes('ENOTFOUND') ||
          error.message?.includes('socket hang up')) {
        return null;
      }
      
      // Skip rate limiting errors (these are expected)
      if (error.message?.includes('Rate limit exceeded')) {
        return null;
      }
      
      // Skip authentication errors (these are user-related, not bugs)
      if (error.message?.includes('Unauthorized') ||
          error.message?.includes('Invalid token') ||
          error.message?.includes('Access denied')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Server-specific integrations
  integrations: [
    // Http integration is automatically included in Next.js server config
    // Uncaught exception handling is automatically configured
  ],
  
  // Environment and release tracking
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Additional context for server
  initialScope: {
    tags: {
      component: 'server',
      runtime: 'nodejs',
    },
  },
  
  // Profiling for server performance
  profilesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.05,
  
  // Configure which URLs to trace
  tracesSampler: (samplingContext) => {
    // Higher sampling for API routes
    if (samplingContext.request?.url?.includes('/api/')) {
      return 0.2;
    }
    
    // Lower sampling for static assets
    if (samplingContext.request?.url?.includes('/_next/')) {
      return 0.01;
    }
    
    // Default sampling
    return process.env.NODE_ENV === 'development' ? 1.0 : 0.05;
  },
});