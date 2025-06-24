// src/lib/utils/audit-logger.ts
import { db } from '@/lib/db';
import { auditLogs, type NewAuditLog, type AuditActionType, type ResourceTypeType, type SeverityType, type SourceType } from '@/lib/db/schema/audit';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Comprehensive audit logging system
 */

export interface AuditLogData {
  userId?: string;
  action: AuditActionType;
  resourceType?: ResourceTypeType;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity?: SeverityType;
  source?: SourceType;
}

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  source?: SourceType;
}

/**
 * Extracts audit context from Next.js request
 */
export async function extractAuditContext(request?: NextRequest): Promise<AuditContext> {
  let ipAddress: string | undefined;
  let userAgent: string | undefined;

  if (request) {
    // Extract IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    if (forwarded) {
      ipAddress = forwarded.split(',')[0].trim();
    } else {
      ipAddress = realIp || undefined;
    }

    // Extract user agent
    userAgent = request.headers.get('user-agent') || undefined;
  } else {
    // Try to get headers in server component context
    try {
      const headersList = await headers();
      const forwarded = headersList.get('x-forwarded-for');
      const realIp = headersList.get('x-real-ip');
      
      if (forwarded) {
        ipAddress = forwarded.split(',')[0].trim();
      } else {
        ipAddress = realIp || undefined;
      }

      userAgent = headersList.get('user-agent') || undefined;
    } catch {
      // Headers not available in this context
    }
  }

  return {
    ipAddress,
    userAgent,
    source: request ? 'API' : 'WEB',
  };
}

/**
 * Creates an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<boolean> {
  try {
    const auditEntry: NewAuditLog = {
      userId: data.userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent ? data.userAgent.substring(0, 1000) : undefined, // Limit length
      sessionId: data.sessionId,
      severity: data.severity || 'INFO',
      source: data.source || 'WEB',
      timestamp: new Date(),
    };

    await db().insert(auditLogs).values(auditEntry);

    // Log to console in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${data.action}:`, {
        userId: data.userId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        severity: data.severity || 'INFO',
        details: data.details,
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    
    // Critical: audit logging failure should be reported
    if (data.severity === 'CRITICAL') {
      console.error('[CRITICAL] Failed to log critical audit event:', {
        action: data.action,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return false;
  }
}

/**
 * Creates an audit logger with request context
 */
export async function createAuditLogger(request?: NextRequest): Promise<AuditLogger> {
  const context = await extractAuditContext(request);
  return new AuditLogger(context);
}

/**
 * Helper functions for common audit scenarios
 */
export class AuditLogger {
  private context: AuditContext;

  constructor(context: AuditContext = {}) {
    this.context = context;
  }

  /**
   * Sets the user context for subsequent logs
   */
  setUser(userId: string): AuditLogger {
    return new AuditLogger({ ...this.context, userId });
  }

  /**
   * Sets the session context
   */
  setSession(sessionId: string): AuditLogger {
    return new AuditLogger({ ...this.context, sessionId });
  }

  /**
   * Logs a user authentication event
   */
  async logAuth(
    action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | '2FA_VERIFY_SUCCESS' | '2FA_VERIFY_FAILED',
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      ...this.context,
      action,
      resourceType: 'SESSION',
      details,
      severity: action.includes('FAILED') ? 'WARN' : 'INFO',
    });
  }

  /**
   * Logs a user management event
   */
  async logUserAction(
    action: 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_ROLE_CHANGE',
    targetUserId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      ...this.context,
      action,
      resourceType: 'USER',
      resourceId: targetUserId,
      details,
      severity: action === 'USER_DELETE' ? 'WARN' : 'INFO',
    });
  }

  /**
   * Logs a content management event
   */
  async logContentAction(
    action: 'BLOG_POST_CREATE' | 'BLOG_POST_UPDATE' | 'BLOG_POST_DELETE' | 'PROJECT_CREATE' | 'PROJECT_UPDATE' | 'PROJECT_DELETE',
    resourceId: string,
    details?: Record<string, any>
  ): Promise<void> {
    const resourceType = action.startsWith('BLOG_POST') ? 'BLOG_POST' : 'PROJECT';
    
    await createAuditLog({
      ...this.context,
      action,
      resourceType,
      resourceId,
      details,
      severity: action.includes('DELETE') ? 'WARN' : 'INFO',
    });
  }

  /**
   * Logs a security event
   */
  async logSecurity(
    action: 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT_EXCEEDED' | 'UNAUTHORIZED_ACCESS_ATTEMPT' | 'ACCOUNT_LOCKED',
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      ...this.context,
      action,
      resourceType: 'SYSTEM',
      details,
      severity: 'WARN',
    });
  }

  /**
   * Logs a critical security event
   */
  async logCriticalSecurity(
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      ...this.context,
      action: action as AuditActionType,
      resourceType: 'SYSTEM',
      details,
      severity: 'CRITICAL',
    });
  }

  /**
   * Logs an admin action
   */
  async logAdmin(
    action: 'ADMIN_ACCESS' | 'ADMIN_SETTINGS_CHANGE' | 'ADMIN_USER_IMPERSONATE' | 'EMERGENCY_ACCOUNT_UNLOCK',
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      ...this.context,
      action,
      resourceType: 'SYSTEM',
      resourceId,
      details,
      severity: action === 'ADMIN_USER_IMPERSONATE' ? 'WARN' : 'INFO',
    });
  }

  /**
   * Logs a file operation
   */
  async logFile(
    action: 'FILE_UPLOAD' | 'FILE_DELETE' | 'FILE_ACCESS',
    filename: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      ...this.context,
      action,
      resourceType: 'FILE',
      resourceId: filename,
      details,
      severity: action === 'FILE_DELETE' ? 'WARN' : 'INFO',
    });
  }

  /**
   * Logs a system error
   */
  async logError(
    error: Error,
    context?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      ...this.context,
      action: 'SYSTEM_ERROR',
      resourceType: 'SYSTEM',
      details: {
        error: error.message,
        stack: error.stack,
        ...context,
      },
      severity: 'ERROR',
    });
  }

  /**
   * Logs a generic action
   */
  async log(
    action: AuditActionType,
    resourceType?: ResourceTypeType,
    resourceId?: string,
    details?: Record<string, any>,
    severity?: SeverityType
  ): Promise<void> {
    await createAuditLog({
      ...this.context,
      action,
      resourceType,
      resourceId,
      details,
      severity: severity || 'INFO',
    });
  }
}

/**
 * Quick audit logging functions for common scenarios
 */

export async function auditLogin(
  userId: string,
  success: boolean,
  request?: NextRequest,
  details?: Record<string, any>
): Promise<void> {
  const logger = await createAuditLogger(request);
  await logger.setUser(userId).logAuth(
    success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    details
  );
}

export async function auditLogout(
  userId: string,
  request?: NextRequest
): Promise<void> {
  const logger = await createAuditLogger(request);
  await logger.setUser(userId).logAuth('LOGOUT');
}

export async function auditSecurityEvent(
  action: 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT_EXCEEDED' | 'UNAUTHORIZED_ACCESS_ATTEMPT',
  request?: NextRequest,
  details?: Record<string, any>
): Promise<void> {
  const logger = await createAuditLogger(request);
  await logger.logSecurity(action, details);
}

export async function auditAdminAction(
  userId: string,
  action: string,
  resourceId?: string,
  request?: NextRequest,
  details?: Record<string, any>
): Promise<void> {
  const logger = await createAuditLogger(request);
  await logger.setUser(userId).logAdmin(
    action as 'ADMIN_ACCESS',
    resourceId,
    details
  );
}

// Export the AuditLogger class for backwards compatibility
export { AuditLogger as logger };