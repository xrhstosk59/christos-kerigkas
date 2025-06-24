// src/app/api/migrate/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { runMigrations, getMigrationStatus, verifyDatabaseSchema } from '@/lib/db/migrator';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { validateBody } from '@/lib/utils/validate';
import { env, isDev } from '@/lib/config/env';

const migrationRequestSchema = z.object({
  action: z.enum(['status', 'run', 'verify']),
  useAutoMigrations: z.boolean().default(true),
  adminSecret: z.string().optional(),
});

/**
 * Migration API Endpoint
 * Only available in development or with admin secret
 */
export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development or with admin secret
    if (!isDev && !env.DATABASE_ADMIN_URL) {
      return Response.json(
        { error: 'Migration API is only available in development environment' },
        { status: 403 }
      );
    }

    // Validate request body
    const validation = await validateBody(request, migrationRequestSchema);
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid request data', details: validation.error?.details },
        { status: 400 }
      );
    }

    const { action, useAutoMigrations, adminSecret } = validation.data!;

    // Check admin secret in production
    if (!isDev && adminSecret !== env.DATABASE_ADMIN_URL) {
      return Response.json(
        { error: 'Invalid admin secret' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'status':
        const status = await getMigrationStatus();
        return Response.json({
          success: true,
          data: status,
        });

      case 'run':
        const result = await runMigrations(useAutoMigrations);
        return Response.json({
          success: result.success,
          data: {
            migrationsApplied: result.migrationsApplied,
            appliedMigrations: result.appliedMigrations,
            errors: result.errors,
          },
        });

      case 'verify':
        const isValid = await verifyDatabaseSchema();
        return Response.json({
          success: true,
          data: {
            isValid,
            message: isValid 
              ? 'Database schema verification passed' 
              : 'Database schema verification failed',
          },
        });

      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    return handleApiError(error, request);
  }
}

/**
 * Get migration status (GET request)
 */
export async function GET(request: NextRequest) {
  try {
    // Security check
    if (!isDev) {
      return Response.json(
        { error: 'Migration API is only available in development environment' },
        { status: 403 }
      );
    }

    const status = await getMigrationStatus();
    return Response.json({
      success: true,
      data: status,
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}