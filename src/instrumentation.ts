// This file configures the initialization of Sentry for server-side and edge runtime
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Initializing Node.js instrumentation');

    // Initialize Sentry for Node.js runtime
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Lower sample rate for server-side to reduce costs
      tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.05,

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
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('🌍 Initializing Edge Runtime instrumentation');

    // Initialize Sentry for Edge runtime
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
  }
}

// Handle errors from nested React Server Components
export const onRequestError = Sentry.captureRequestError;