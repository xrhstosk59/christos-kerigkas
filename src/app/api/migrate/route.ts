// src/app/api/migrate/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { env, isDev } from '@/lib/config/env';

/**
 * Migration API Endpoint
 * Note: With Supabase, migrations are handled through Supabase CLI or Dashboard
 * This endpoint provides information about the migration system
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

    return Response.json({
      success: true,
      message: 'Migrations are managed through Supabase',
      info: {
        system: 'Supabase',
        method: 'Supabase CLI or Dashboard',
        documentation: 'https://supabase.com/docs/guides/database/migrations',
      },
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}

/**
 * Migration actions endpoint
 * Returns information about Supabase migration system
 */
export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development
    if (!isDev) {
      return Response.json(
        { error: 'Migration API is only available in development environment' },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      message: 'Migrations are managed through Supabase CLI',
      instructions: {
        status: 'Use: supabase db diff to check migration status',
        create: 'Use: supabase migration new <name> to create a new migration',
        apply: 'Use: supabase db push to apply migrations',
      },
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}
