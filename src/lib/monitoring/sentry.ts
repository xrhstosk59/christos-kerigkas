// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';

/**
 * Enhanced error reporting utilities for Sentry
 */

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  feature?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceContext {
  operation: string;
  category?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Reports an error to Sentry with enhanced context
 */
export function reportError(
  error: Error,
  context: ErrorContext = {},
  level: Sentry.SeverityLevel = 'error'
): string {
  return Sentry.withScope((scope) => {
    // Set user context if available
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    // Set session context
    if (context.sessionId) {
      scope.setTag('sessionId', context.sessionId);
    }
    
    // Set feature context
    if (context.feature) {
      scope.setTag('feature', context.feature);
    }
    
    // Set action context
    if (context.action) {
      scope.setTag('action', context.action);
    }
    
    // Add metadata as extra context
    if (context.metadata) {
      scope.setContext('metadata', context.metadata);
    }
    
    // Set severity level
    scope.setLevel(level);
    
    return Sentry.captureException(error);
  });
}

/**
 * Reports a message to Sentry
 */
export function reportMessage(
  message: string,
  context: ErrorContext = {},
  level: Sentry.SeverityLevel = 'info'
): string {
  return Sentry.withScope((scope) => {
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context.sessionId) {
      scope.setTag('sessionId', context.sessionId);
    }
    
    if (context.feature) {
      scope.setTag('feature', context.feature);
    }
    
    if (context.metadata) {
      scope.setContext('metadata', context.metadata);
    }
    
    scope.setLevel(level);
    
    return Sentry.captureMessage(message);
  });
}

/**
 * Creates a performance transaction (using span for newer Sentry versions)
 */
export function startTransaction(
  name: string,
  context: PerformanceContext
) {
  return Sentry.withScope((scope) => {
    scope.setTag('operation', context.operation);
    scope.setTag('category', context.category || 'general');
    if (context.userId) {
      scope.setTag('userId', context.userId);
    }
    if (context.metadata) {
      scope.setContext('metadata', context.metadata);
    }
    
    return Sentry.startSpan({
      name,
      op: context.operation,
    }, () => {
      // Return a mock transaction-like object for compatibility
      return {
        setStatus: (status: string) => console.log(`Transaction status: ${status}`),
        finish: () => console.log(`Transaction finished: ${name}`),
      };
    });
  });
}

/**
 * Wraps an async function with performance monitoring
 */
export function withPerformanceMonitoring<T extends any[], R>(
  name: string,
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    return await Sentry.startSpan({
      name,
      op: operation,
    }, async () => {
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    });
  };
}

/**
 * Adds request context to Sentry scope
 */
export function addRequestContext(request: NextRequest): void {
  Sentry.withScope((scope) => {
    scope.setTag('method', request.method);
    scope.setTag('url', request.url);
    scope.setTag('userAgent', request.headers.get('user-agent') || 'unknown');
    
    // Add IP address (respecting privacy)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    scope.setTag('clientIP', ip.split(',')[0].trim());
    
    // Add request ID if available
    const requestId = request.headers.get('x-request-id');
    if (requestId) {
      scope.setTag('requestId', requestId);
    }
  });
}

/**
 * Breadcrumb helpers for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category: string = 'custom',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Security event reporting
 */
export function reportSecurityEvent(
  event: string,
  context: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, any>;
  }
): string {
  return Sentry.withScope((scope) => {
    scope.setTag('eventType', 'security');
    scope.setLevel('warning');
    
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context.ipAddress) {
      scope.setTag('clientIP', context.ipAddress);
    }
    
    if (context.userAgent) {
      scope.setTag('userAgent', context.userAgent);
    }
    
    if (context.details) {
      scope.setContext('securityDetails', context.details);
    }
    
    return Sentry.captureMessage(`Security Event: ${event}`);
  });
}

/**
 * Database error reporting with query context
 */
export function reportDatabaseError(
  error: Error,
  query?: string,
  params?: any[],
  context: ErrorContext = {}
): string {
  return Sentry.withScope((scope) => {
    scope.setTag('errorType', 'database');
    scope.setLevel('error');
    
    if (query) {
      // Sanitize query to avoid logging sensitive data
      const sanitizedQuery = query.replace(/('.*?'|".*?")/g, "'***'");
      scope.setContext('database', {
        query: sanitizedQuery,
        paramCount: params?.length || 0,
      });
    }
    
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context.metadata) {
      scope.setContext('metadata', context.metadata);
    }
    
    return Sentry.captureException(error);
  });
}

/**
 * API route error wrapper
 */
export function withSentryErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context: ErrorContext = {}
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      reportError(err, context);
      throw error;
    }
  };
}

/**
 * Frontend component error boundary integration
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Configure Sentry for specific features
 */
export const SentryFeatures = {
  auth: {
    reportLogin: (userId: string, success: boolean, details?: Record<string, any>) => {
      addBreadcrumb(
        `User login ${success ? 'successful' : 'failed'}`,
        'auth',
        success ? 'info' : 'warning',
        { userId, ...details }
      );
      
      if (!success) {
        reportSecurityEvent('LOGIN_FAILED', {
          userId,
          details,
        });
      }
    },
    
    reportLogout: (userId: string) => {
      addBreadcrumb('User logout', 'auth', 'info', { userId });
    },
    
    report2FAEvent: (userId: string, event: string, success: boolean) => {
      addBreadcrumb(
        `2FA ${event} ${success ? 'successful' : 'failed'}`,
        'auth',
        success ? 'info' : 'warning',
        { userId, event }
      );
    },
  },
  
  performance: {
    reportSlowQuery: (query: string, duration: number, context?: Record<string, any>) => {
      reportMessage(
        `Slow database query detected: ${duration}ms`,
        {
          feature: 'database',
          action: 'slow_query',
          metadata: { query, duration, ...context },
        },
        'warning'
      );
    },
    
    reportSlowPageLoad: (page: string, duration: number) => {
      reportMessage(
        `Slow page load detected: ${page} (${duration}ms)`,
        {
          feature: 'performance',
          action: 'slow_page_load',
          metadata: { page, duration },
        },
        'warning'
      );
    },
  },
  
  business: {
    reportContactForm: (success: boolean, details?: Record<string, any>) => {
      addBreadcrumb(
        `Contact form ${success ? 'submitted' : 'failed'}`,
        'business',
        success ? 'info' : 'error',
        details
      );
    },
    
    reportNewsletterSignup: (email: string, success: boolean) => {
      addBreadcrumb(
        `Newsletter signup ${success ? 'successful' : 'failed'}`,
        'business',
        success ? 'info' : 'warning',
        { email: email.replace(/(.{2}).*@/, '$1***@') } // Partially hide email
      );
    },
  },
};