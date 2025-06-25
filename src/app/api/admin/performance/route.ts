// src/app/api/admin/performance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth/admin-auth';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { getDbClient } from '@/lib/db/server-db-client';
import { auditLogs } from '@/lib/db/schema/audit';
import { sql, desc, gte, and, eq } from 'drizzle-orm';

/**
 * Get performance metrics and analytics
 * GET /api/admin/performance
 */
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
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get performance-related audit logs
    const performanceLogs = await db
      .select({
        timestamp: auditLogs.timestamp,
        action: auditLogs.action,
        severity: auditLogs.severity,
        metadata: auditLogs.metadata,
        source: auditLogs.source,
      })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.timestamp, startDate),
          eq(auditLogs.source, 'performance')
        )
      )
      .orderBy(desc(auditLogs.timestamp))
      .limit(1000);

    // Process performance metrics
    const metrics = {
      // Page Performance
      pageMetrics: {
        slowPageLoads: performanceLogs.filter(log => log.action === 'slow_page_load').length,
        slowLCP: performanceLogs.filter(log => log.action === 'slow_lcp').length,
        slowFID: performanceLogs.filter(log => log.action === 'slow_fid').length,
        poorCLS: performanceLogs.filter(log => log.action === 'poor_cls').length,
      },

      // API Performance
      apiMetrics: {
        slowAPICalls: performanceLogs.filter(log => log.action === 'slow_api_call').length,
        apiErrors: performanceLogs.filter(log => log.action === 'api_error').length,
        failedOperations: performanceLogs.filter(log => log.action === 'failed_operation').length,
      },

      // Resource Performance
      resourceMetrics: {
        slowResources: performanceLogs.filter(log => log.action === 'slow_resource').length,
        largeResources: performanceLogs.filter(log => log.action === 'large_resource').length,
        highMemoryUsage: performanceLogs.filter(log => log.action === 'high_memory_usage').length,
      },

      // Recent Issues (last 24 hours)
      recentIssues: performanceLogs
        .filter(log => {
          const logDate = new Date(log.timestamp);
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          return logDate >= oneDayAgo && log.severity === 'warning';
        })
        .slice(0, 20),

      // Timeline data for charts
      timeline: await generateTimelineData(performanceLogs, days),
    };

    // Calculate performance scores
    const performanceScore = calculatePerformanceScore(metrics);

    return NextResponse.json({
      success: true,
      data: {
        ...metrics,
        performanceScore,
        period: `${days} days`,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}

/**
 * Generate timeline data for performance charts
 */
async function generateTimelineData(logs: any[], days: number) {
  const timeline = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= date && logDate < nextDate;
    });

    timeline.push({
      date: date.toISOString().split('T')[0],
      slowPageLoads: dayLogs.filter(log => log.action === 'slow_page_load').length,
      apiErrors: dayLogs.filter(log => log.action === 'api_error').length,
      memoryIssues: dayLogs.filter(log => log.action === 'high_memory_usage').length,
      resourceIssues: dayLogs.filter(log => log.action === 'slow_resource').length,
      totalIssues: dayLogs.filter(log => log.severity === 'warning' || log.severity === 'error').length,
    });
  }

  return timeline;
}

/**
 * Calculate overall performance score (0-100)
 */
function calculatePerformanceScore(metrics: any): number {
  const weights = {
    pageMetrics: 0.4,
    apiMetrics: 0.3,
    resourceMetrics: 0.3,
  };

  // Calculate scores for each category (higher issues = lower score)
  const pageScore = Math.max(0, 100 - (
    metrics.pageMetrics.slowPageLoads * 5 +
    metrics.pageMetrics.slowLCP * 3 +
    metrics.pageMetrics.slowFID * 3 +
    metrics.pageMetrics.poorCLS * 4
  ));

  const apiScore = Math.max(0, 100 - (
    metrics.apiMetrics.slowAPICalls * 4 +
    metrics.apiMetrics.apiErrors * 6 +
    metrics.apiMetrics.failedOperations * 8
  ));

  const resourceScore = Math.max(0, 100 - (
    metrics.resourceMetrics.slowResources * 3 +
    metrics.resourceMetrics.largeResources * 2 +
    metrics.resourceMetrics.highMemoryUsage * 5
  ));

  // Weighted average
  const overallScore = Math.round(
    pageScore * weights.pageMetrics +
    apiScore * weights.apiMetrics +
    resourceScore * weights.resourceMetrics
  );

  return Math.min(100, Math.max(0, overallScore));
}