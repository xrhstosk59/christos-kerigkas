// src/app/api/admin/lockouts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db-client';
import { rateLimitAttempts } from '@/lib/db/schema/rate-limit';
import { desc, eq, gte, and, sql } from 'drizzle-orm';
import { checkAdminAuth } from '@/lib/auth/admin-auth';
import { 
  checkAccountLockout, 
  emergencyUnlockAccount,
  getLockoutStatistics 
} from '@/lib/auth/lockout';

export const dynamic = 'force-dynamic';

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
    const endpoint = searchParams.get('endpoint');
    const identifier = searchParams.get('identifier');
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (endpoint && endpoint !== 'all') {
      whereConditions.push(eq(rateLimitAttempts.endpoint, endpoint));
    }
    
    if (identifier) {
      whereConditions.push(eq(rateLimitAttempts.identifier, identifier));
    }

    // Get recent failed attempts (last 24 hours) grouped by identifier
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const whereCondition = whereConditions.length > 0 
      ? and(gte(rateLimitAttempts.createdAt, oneDayAgo), ...whereConditions)
      : gte(rateLimitAttempts.createdAt, oneDayAgo);

    // Get failed attempts grouped by identifier
    const failedAttempts = await db
      .select({
        identifier: rateLimitAttempts.identifier,
        endpoint: rateLimitAttempts.endpoint,
        totalAttempts: sql<number>`count(*)`,
        lastAttempt: sql<Date>`max(${rateLimitAttempts.createdAt})`,
        attempts: sql<number>`sum(${rateLimitAttempts.attempts})`,
      })
      .from(rateLimitAttempts)
      .where(whereCondition)
      .groupBy(rateLimitAttempts.identifier, rateLimitAttempts.endpoint)
      .orderBy(desc(sql`max(${rateLimitAttempts.createdAt})`))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(distinct ${rateLimitAttempts.identifier})` })
      .from(rateLimitAttempts)
      .where(whereCondition);

    // Check lockout status for each identifier
    const lockedAccounts = [];
    for (const attempt of failedAttempts) {
      const lockoutStatus = await checkAccountLockout(attempt.identifier);
      lockedAccounts.push({
        ...attempt,
        isLocked: lockoutStatus.isLocked,
        remainingAttempts: lockoutStatus.remainingAttempts,
        lockoutExpiresAt: lockoutStatus.lockoutExpiresAt,
        nextAttemptAllowedAt: lockoutStatus.nextAttemptAllowedAt,
      });
    }

    // Get overall statistics
    const statistics = await getLockoutStatistics();

    return NextResponse.json({
      lockedAccounts,
      statistics,
      pagination: {
        page,
        limit,
        total: totalCountResult[0]?.count || 0,
        totalPages: Math.ceil((totalCountResult[0]?.count || 0) / limit)
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

// Get distinct endpoints for filtering
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
    
    const endpoints = await db
      .selectDistinct({ endpoint: rateLimitAttempts.endpoint })
      .from(rateLimitAttempts)
      .orderBy(rateLimitAttempts.endpoint);

    return NextResponse.json({
      endpoints: endpoints.map(e => e.endpoint).filter(Boolean)
    });

  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}