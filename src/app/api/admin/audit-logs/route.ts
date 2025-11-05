// src/app/api/admin/audit-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db/server-db';
import { checkAdminAuth } from '@/lib/auth/admin-auth';
import { z } from 'zod';
import type { Database } from '@/lib/db/database.types';

export const dynamic = 'force-dynamic';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
type User = Database['public']['Tables']['users']['Row'];

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

    // Build Supabase query
    let query = db.from('audit_logs').select('*, users(email)', { count: 'exact' });

    // Apply filters
    if (action && action !== 'all') {
      query = query.eq('action', action);
    }

    if (severity && severity !== 'all') {
      query = query.eq('severity', severity);
    }

    if (source && source !== 'all') {
      query = query.eq('source', source);
    }

    if (resourceType && resourceType !== 'all') {
      query = query.eq('resource_type', resourceType);
    }

    if (search) {
      // Sanitize search input to prevent injection
      const sanitizedSearch = search.replace(/[%_\\]/g, '\\$&');
      query = query.ilike('action', `%${sanitizedSearch}%`);
    }

    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }

    if (toDate) {
      query = query.lte('created_at', toDate);
    }

    // Apply pagination and ordering
    const { data: logs, error, count: totalCount } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
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

    let column: string;
    switch (type) {
      case 'actions':
        column = 'action';
        break;
      case 'severities':
        column = 'severity';
        break;
      case 'sources':
        column = 'source';
        break;
      case 'resourceTypes':
        column = 'resource_type';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    // Get distinct values
    const { data, error } = await db
      .from('audit_logs')
      .select(column)
      .order(column);

    if (error) {
      console.error('Error fetching filter values:', error);
      return NextResponse.json(
        { error: 'Failed to fetch filter values' },
        { status: 500 }
      );
    }

    // Extract unique values
    const values = [...new Set(data.map((row: any) => row[column]).filter(Boolean))];

    return NextResponse.json({ values });

  } catch (error) {
    console.error('Error fetching filter values:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
