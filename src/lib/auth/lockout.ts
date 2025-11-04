// src/lib/auth/lockout.ts
import { db } from '@/lib/db';
import { rateLimitAttempts } from '@/lib/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { createAuditLog } from '@/lib/utils/audit-logger';

/**
 * Account lockout and failed login attempt tracking
 */

export interface AccountLockoutStatus {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutExpiresAt?: Date;
  nextAttemptAllowedAt?: Date;
}

export interface LoginAttemptResult {
  allowed: boolean;
  remainingAttempts: number;
  lockoutMinutes?: number;
  message: string;
}

// Configuration
const LOCKOUT_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,           // Maximum failed attempts before lockout
  INITIAL_LOCKOUT_MINUTES: 15,     // Initial lockout duration
  MAX_LOCKOUT_MINUTES: 24 * 60,    // Maximum lockout duration (24 hours)
  PROGRESSIVE_MULTIPLIER: 2,        // Multiplier for progressive lockout
  CLEANUP_HOURS: 24,               // How long to keep old attempts
} as const;

/**
 * Gets client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIp || 'unknown';
}

/**
 * Records a failed login attempt
 */
export async function recordFailedLoginAttempt(
  identifier: string, // email or IP
  request?: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const clientIP = request ? getClientIP(request) : 'unknown';
  const resetTime = new Date(Date.now() + LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000);

  await db().insert(rateLimitAttempts).values({
    identifier: `login_failed:${identifier}`,
    endpoint: 'auth_login',
    attempts: 1,
    resetTime,
    createdAt: new Date(),
  });

  // Also record by IP to prevent IP-based attacks
  if (clientIP !== 'unknown') {
    await db().insert(rateLimitAttempts).values({
      identifier: `login_failed_ip:${clientIP}`,
      endpoint: 'auth_login',
      attempts: 1,
      resetTime,
      createdAt: new Date(),
    });
  }

  console.log(`Failed login attempt recorded for ${identifier} from IP ${clientIP}`, {
    identifier,
    clientIP,
    metadata,
  });
}

/**
 * Records a successful login (clears failed attempts)
 */
export async function recordSuccessfulLogin(
  identifier: string,
  request?: NextRequest
): Promise<void> {
  const clientIP = request ? getClientIP(request) : 'unknown';

  // Clear failed attempts for this identifier
  await db().delete(rateLimitAttempts)
    .where(eq(rateLimitAttempts.identifier, `login_failed:${identifier}`));

  // Clear failed attempts for this IP
  if (clientIP !== 'unknown') {
    await db().delete(rateLimitAttempts)
      .where(eq(rateLimitAttempts.identifier, `login_failed_ip:${clientIP}`));
  }

  console.log(`Successful login recorded for ${identifier} from IP ${clientIP}`);
}

/**
 * Gets failed login attempts for an identifier
 */
async function getFailedAttempts(identifier: string): Promise<number> {
  const cutoffTime = new Date(Date.now() - LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000);
  
  const attempts = await db().select()
    .from(rateLimitAttempts)
    .where(
      and(
        eq(rateLimitAttempts.identifier, `login_failed:${identifier}`),
        gte(rateLimitAttempts.createdAt, cutoffTime)
      )
    )
    .orderBy(desc(rateLimitAttempts.createdAt));

  return attempts.length;
}

/**
 * Gets failed login attempts by IP
 */
async function getFailedAttemptsByIP(ip: string): Promise<number> {
  const cutoffTime = new Date(Date.now() - LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000);
  
  const attempts = await db().select()
    .from(rateLimitAttempts)
    .where(
      and(
        eq(rateLimitAttempts.identifier, `login_failed_ip:${ip}`),
        gte(rateLimitAttempts.createdAt, cutoffTime)
      )
    )
    .orderBy(desc(rateLimitAttempts.createdAt));

  return attempts.length;
}

/**
 * Calculates lockout duration based on attempt count
 */
function calculateLockoutDuration(attemptCount: number): number {
  if (attemptCount < LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS) {
    return 0;
  }

  const excessAttempts = attemptCount - LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS;
  const lockoutMinutes = LOCKOUT_CONFIG.INITIAL_LOCKOUT_MINUTES * 
    Math.pow(LOCKOUT_CONFIG.PROGRESSIVE_MULTIPLIER, excessAttempts);

  return Math.min(lockoutMinutes, LOCKOUT_CONFIG.MAX_LOCKOUT_MINUTES);
}

/**
 * Checks if an account is locked due to failed login attempts
 */
export async function checkAccountLockout(
  identifier: string,
  request?: NextRequest
): Promise<AccountLockoutStatus> {
  const clientIP = request ? getClientIP(request) : 'unknown';
  
  // Check attempts by identifier (email)
  const identifierAttempts = await getFailedAttempts(identifier);
  
  // Check attempts by IP
  const ipAttempts = clientIP !== 'unknown' ? await getFailedAttemptsByIP(clientIP) : 0;
  
  // Use the higher of the two counts
  const maxAttempts = Math.max(identifierAttempts, ipAttempts);
  
  if (maxAttempts < LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS) {
    return {
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS - maxAttempts,
    };
  }

  // Account is locked - calculate when it will be unlocked
  const lockoutMinutes = calculateLockoutDuration(maxAttempts);
  
  // Get the timestamp of the most recent failed attempt
  const cutoffTime = new Date(Date.now() - LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000);
  
  const recentAttempts = await db().select()
    .from(rateLimitAttempts)
    .where(
      and(
        eq(rateLimitAttempts.identifier, `login_failed:${identifier}`),
        gte(rateLimitAttempts.createdAt, cutoffTime)
      )
    )
    .orderBy(desc(rateLimitAttempts.createdAt))
    .limit(1);

  if (recentAttempts.length === 0) {
    // No recent attempts found, not locked
    return {
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS,
    };
  }

  const lastAttemptTime = recentAttempts[0].createdAt;
  const lockoutExpiresAt = new Date(lastAttemptTime!.getTime() + lockoutMinutes * 60 * 1000);
  const now = new Date();

  if (now < lockoutExpiresAt) {
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutExpiresAt,
      nextAttemptAllowedAt: lockoutExpiresAt,
    };
  }

  // Lockout has expired
  return {
    isLocked: false,
    remainingAttempts: LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS,
  };
}

/**
 * Checks if a login attempt is allowed
 */
export async function checkLoginAttemptAllowed(
  identifier: string,
  request?: NextRequest
): Promise<LoginAttemptResult> {
  const lockoutStatus = await checkAccountLockout(identifier, request);

  if (lockoutStatus.isLocked) {
    const minutesRemaining = lockoutStatus.lockoutExpiresAt
      ? Math.ceil((lockoutStatus.lockoutExpiresAt.getTime() - Date.now()) / (60 * 1000))
      : 0;

    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutMinutes: minutesRemaining,
      message: `Account is temporarily locked due to too many failed login attempts. Please try again in ${minutesRemaining} minutes.`,
    };
  }

  return {
    allowed: true,
    remainingAttempts: lockoutStatus.remainingAttempts,
    message: `Login attempt allowed. ${lockoutStatus.remainingAttempts} attempts remaining before lockout.`,
  };
}

/**
 * Emergency unlock an account (for admin use)
 */
export async function emergencyUnlockAccount(
  identifier: string,
  adminId: string,
  _reason?: string
): Promise<boolean> {
  try {
    console.warn(`Emergency account unlock requested by admin ${adminId} for ${identifier}`);
    
    // Clear all failed attempts for this identifier
    await db().delete(rateLimitAttempts)
      .where(eq(rateLimitAttempts.identifier, `login_failed:${identifier}`));

    // Add audit log entry for security tracking
    await createAuditLog({
      userId: adminId,
      action: 'ADMIN_ACTION',
      resourceType: 'USER',
      resourceId: identifier,
      details: {
        action: 'EMERGENCY_ACCOUNT_UNLOCK',
        targetIdentifier: identifier,
        reason: _reason || 'Emergency unlock by admin'
      },
      severity: 'CRITICAL',
      source: 'ADMIN',
    });

    return true;
  } catch (error) {
    console.error('Failed to emergency unlock account:', error);
    return false;
  }
}

/**
 * Gets lockout statistics for monitoring
 */
export async function getLockoutStatistics(): Promise<{
  totalLockedAccounts: number;
  recentFailedAttempts: number;
  topFailedIPs: Array<{ ip: string; attempts: number }>;
}> {
  const cutoffTime = new Date(Date.now() - LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000);
  
  // Get all recent failed attempts
  const allAttempts = await db().select()
    .from(rateLimitAttempts)
    .where(
      and(
        gte(rateLimitAttempts.createdAt, cutoffTime)
      )
    );

  // Count locked accounts (those with >= MAX_FAILED_ATTEMPTS)
  const accountAttempts = new Map<string, number>();
  const ipAttempts = new Map<string, number>();

  for (const attempt of allAttempts) {
    if (attempt.identifier.startsWith('login_failed:')) {
      const account = attempt.identifier.replace('login_failed:', '');
      accountAttempts.set(account, (accountAttempts.get(account) || 0) + 1);
    } else if (attempt.identifier.startsWith('login_failed_ip:')) {
      const ip = attempt.identifier.replace('login_failed_ip:', '');
      ipAttempts.set(ip, (ipAttempts.get(ip) || 0) + 1);
    }
  }

  const totalLockedAccounts = Array.from(accountAttempts.values())
    .filter(count => count >= LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS).length;

  const topFailedIPs = Array.from(ipAttempts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([ip, attempts]) => ({ ip, attempts }));

  return {
    totalLockedAccounts,
    recentFailedAttempts: allAttempts.length,
    topFailedIPs,
  };
}

/**
 * Cleanup old failed attempts (should be run periodically)
 */
export async function cleanupOldFailedAttempts(): Promise<number> {
  const cutoffTime = new Date(Date.now() - LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000);
  
  await db().delete(rateLimitAttempts)
    .where(
      and(
        gte(rateLimitAttempts.createdAt, cutoffTime)
      )
    );

  console.log(`Cleaned up old failed login attempts`);
  return 0; // Drizzle doesn't return affected rows count in delete
}