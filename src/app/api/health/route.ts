// src/app/api/health/route.ts
import { NextRequest } from 'next/server';
import { getMigrationStatus, verifyDatabaseSchema } from '@/lib/db/migrator';
import { getDb } from '@/lib/db/database';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { env, features } from '@/lib/config/env';

/**
 * Health Check API Endpoint
 * Provides system health status including database, migrations, and services
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const healthData: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    };

    // Database health check
    try {
      const db = getDb();
      await db.execute('SELECT 1');
      healthData.database = {
        status: 'connected',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      healthData.database = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
      healthData.status = 'degraded';
    }

    // Migration status check
    try {
      const migrationStatus = await getMigrationStatus();
      healthData.migrations = {
        status: migrationStatus.pending === 0 ? 'up-to-date' : 'pending',
        available: migrationStatus.available,
        applied: migrationStatus.applied,
        pending: migrationStatus.pending,
        lastMigration: migrationStatus.lastMigration,
      };

      if (migrationStatus.pending > 0) {
        healthData.status = 'degraded';
      }
    } catch (error) {
      healthData.migrations = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Migration check failed',
      };
      healthData.status = 'degraded';
    }

    // Schema verification check
    try {
      const schemaValid = await verifyDatabaseSchema();
      healthData.schema = {
        status: schemaValid ? 'valid' : 'invalid',
      };

      if (!schemaValid) {
        healthData.status = 'error';
      }
    } catch (error) {
      healthData.schema = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Schema verification failed',
      };
      healthData.status = 'error';
    }

    // Feature flags status
    healthData.features = {
      twoFactorAuth: features.enable2FA,
      auditLogging: features.enableAuditLogging,
      rateLimiting: features.enableRateLimiting,
      offlineSupport: features.enableOfflineSupport,
      performanceMonitoring: features.enablePerformanceMonitoring,
    };

    // Service dependencies
    healthData.services = {
      supabase: {
        status: env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not-configured',
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

    // Set appropriate HTTP status
    const httpStatus = healthData.status === 'ok' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503;

    return Response.json(healthData, { 
      status: httpStatus,
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

/**
 * Health check with detailed diagnostics (POST with admin secret)
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow detailed health check with admin access
    if (env.NODE_ENV === 'production') {
      const body = await request.json().catch(() => ({}));
      const adminSecret = body.adminSecret;

      if (!adminSecret || adminSecret !== env.DATABASE_ADMIN_URL) {
        return Response.json(
          { error: 'Detailed health check requires admin authorization' },
          { status: 401 }
        );
      }
    }

    // Run the basic health check
    const basicHealth = await GET(request);
    const healthData = await basicHealth.json();

    // Add detailed diagnostics
    healthData.diagnostics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: {
        databaseUrl: env.DATABASE_URL ? '✅ configured' : '❌ missing',
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL ? '✅ configured' : '❌ missing',
        authSecret: env.AUTH_SECRET ? '✅ configured' : '❌ missing',
      },
    };

    return Response.json(healthData, { 
      status: basicHealth.status,
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