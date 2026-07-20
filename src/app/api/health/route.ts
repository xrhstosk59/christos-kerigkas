// src/app/api/health/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { env, features } from '@/lib/config/env';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  environment: string;
  version: string;
  features?: Record<string, boolean>;
  services?: Record<string, { status: string }>;
  responseTime?: number;
}

/**
 * Health Check API Endpoint
 * Provides application health status and service configuration.
 * The portfolio content is compiled into the bundle, so there is no
 * database dependency to check.
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const healthData: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    };

    // Feature flags status
    healthData.features = {
      rateLimiting: features.enableRateLimiting,
      offlineSupport: features.enableOfflineSupport,
      performanceMonitoring: features.enablePerformanceMonitoring,
    };

    // Service dependencies
    healthData.services = {
      email: {
        status: env.SMTP_HOST ? 'configured' : 'not-configured',
      },
      sentry: {
        status: env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'not-configured',
      },
      analytics: {
        status: env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? 'configured' : 'not-configured',
      },
    };

    // Response time
    healthData.responseTime = Date.now() - startTime;

    return Response.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}
