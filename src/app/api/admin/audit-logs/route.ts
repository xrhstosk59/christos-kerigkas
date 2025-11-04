// src/app/api/admin/audit-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db-client';
import { auditLogs } from '@/lib/db/schema/audit';
import { users } from '@/lib/db/schema/auth';
import { desc, eq, count, like, and, gte, lte } from 'drizzle-orm';
import { checkAdminAuth } from '@/lib/auth/admin-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for query parameters
const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().max(10000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  action: z.string().optional(),
  severity: z.string().optional(),
  source: z.string().optional(),
  resourceType: z.string().optional(),
  search: z.string().max(100).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

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

    // Get and validate URL parameters
    const { searchParams } = new URL(request.url);
    const rawParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      action: searchParams.get('action') || undefined,
      severity: searchParams.get('severity') || undefined,
      source: searchParams.get('source') || undefined,
      resourceType: searchParams.get('resourceType') || undefined,
      search: searchParams.get('search') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    };

    // Validate parameters
    const validationResult = queryParamsSchema.safeParse(rawParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { page, limit, action, severity, source, resourceType, search, fromDate, toDate } = validationResult.data;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (action && action !== 'all') {
      whereConditions.push(eq(auditLogs.action, action));
    }
    
    if (severity && severity !== 'all') {
      whereConditions.push(eq(auditLogs.severity, severity));
    }
    
    if (source && source !== 'all') {
      whereConditions.push(eq(auditLogs.source, source));
    }
    
    if (resourceType && resourceType !== 'all') {
      whereConditions.push(eq(auditLogs.resourceType, resourceType));
    }
    
    if (search) {
      // Sanitize search input to prevent LIKE injection
      const sanitizedSearch = search.replace(/[%_\\]/g, '\\$&');
      whereConditions.push(
        like(auditLogs.action, `%${sanitizedSearch}%`)
      );
    }
    
    if (fromDate) {
      whereConditions.push(gte(auditLogs.timestamp, new Date(fromDate)));
    }
    
    if (toDate) {
      whereConditions.push(lte(auditLogs.timestamp, new Date(toDate)));
    }

    const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Get total count for pagination
    const totalCountQuery = whereCondition 
      ? db.select({ count: count() }).from(auditLogs).where(whereCondition)
      : db.select({ count: count() }).from(auditLogs);
    const totalCount = await totalCountQuery;
    
    // Get paginated results with user information
    const baseQuery = db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        sessionId: auditLogs.sessionId,
        timestamp: auditLogs.timestamp,
        severity: auditLogs.severity,
        source: auditLogs.source,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id));
    
    const logsQuery = whereCondition 
      ? baseQuery.where(whereCondition)
      : baseQuery;
    
    const logs = await logsQuery
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get unique values for filters
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
    const { type } = body; // 'actions', 'severities', 'sources', 'resourceTypes'

    const db = await getDbClient();
    
    let results = [];
    
    switch (type) {
      case 'actions':
        results = await db
          .selectDistinct({ value: auditLogs.action })
          .from(auditLogs)
          .where(eq(auditLogs.action, auditLogs.action))
          .orderBy(auditLogs.action);
        break;
      case 'severities':
        results = await db
          .selectDistinct({ value: auditLogs.severity })
          .from(auditLogs)
          .where(eq(auditLogs.severity, auditLogs.severity))
          .orderBy(auditLogs.severity);
        break;
      case 'sources':
        results = await db
          .selectDistinct({ value: auditLogs.source })
          .from(auditLogs)
          .where(eq(auditLogs.source, auditLogs.source))
          .orderBy(auditLogs.source);
        break;
      case 'resourceTypes':
        results = await db
          .selectDistinct({ value: auditLogs.resourceType })
          .from(auditLogs)
          .where(eq(auditLogs.resourceType, auditLogs.resourceType))
          .orderBy(auditLogs.resourceType);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      values: results.map(r => r.value).filter(Boolean)
    });

  } catch (error) {
    console.error('Error fetching filter values:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}