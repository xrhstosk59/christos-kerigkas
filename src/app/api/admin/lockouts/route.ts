// src/app/api/admin/lockouts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db';
import { checkAdminAuth } from '@/lib/auth/admin-auth';
import {
  checkAccountLockout,
  emergencyUnlockAccount,
  getLockoutStatistics
} from '@/lib/auth/lockout';
import type { Database } from '@/lib/db/database.types';

export const dynamic = 'force-dynamic';

type RateLimit = Database['public']['Tables']['rate_limits']['Row'];

// Get locked accounts and lockout statistics
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated admin
    const authResult = await checkAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDbClient();

    // Get URL parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const actionType = searchParams.get('actionType');
    const identifier = searchParams.get('identifier');
    const offset = (page - 1) * limit;

    // Build base query
    let query = db.from('rate_limits').select('*', { count: 'exact' });

    // Apply filters
    if (actionType && actionType !== 'all') {
      query = query.eq('action_type', actionType);
    }

    if (identifier) {
      query = query.eq('identifier', identifier);
    }

    // Filter for recent attempts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    query = query.gte('last_attempt_at', oneDayAgo.toISOString());

    // Get rate limits with pagination
    const { data: rateLimits, error, count: totalCount } = await query
      .order('last_attempt_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching lockout data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lockout data' },
        { status: 500 }
      );
    }

    // Check lockout status for each identifier
    const lockedAccounts = [];
    if (rateLimits) {
      for (const rateLimit of rateLimits) {
        const lockoutStatus = await checkAccountLockout(rateLimit.identifier);
        lockedAccounts.push({
          identifier: rateLimit.identifier,
          actionType: rateLimit.action_type,
          totalAttempts: rateLimit.attempt_count,
          lastAttempt: rateLimit.last_attempt_at,
          isLocked: lockoutStatus.isLocked,
          remainingAttempts: lockoutStatus.remainingAttempts,
          lockoutExpiresAt: lockoutStatus.lockoutExpiresAt,
          nextAttemptAllowedAt: lockoutStatus.nextAttemptAllowedAt,
        });
      }
    }

    // Get overall statistics
    const statistics = await getLockoutStatistics();

    return NextResponse.json({
      lockedAccounts,
      statistics,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching lockout data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Emergency unlock account
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated admin
    const authResult = await checkAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { identifier, reason } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier is required' },
        { status: 400 }
      );
    }

    // Emergency unlock the account
    const success = await emergencyUnlockAccount(
      identifier,
      authResult.user.id,
      reason || 'Emergency unlock by admin'
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Account successfully unlocked'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to unlock account' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error unlocking account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get distinct action types for filtering
export async function PATCH(request: NextRequest) {
  try {
    // Check if user is authenticated admin
    const authResult = await checkAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDbClient();

    // Get distinct action types
    const { data, error } = await db
      .from('rate_limits')
      .select('action_type')
      .order('action_type');

    if (error) {
      console.error('Error fetching action types:', error);
      return NextResponse.json(
        { error: 'Failed to fetch action types' },
        { status: 500 }
      );
    }

    // Extract unique action types
    const actionTypes = [...new Set(data.map(row => row.action_type).filter(Boolean))];

    return NextResponse.json({
      actionTypes
    });

  } catch (error) {
    console.error('Error fetching action types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
