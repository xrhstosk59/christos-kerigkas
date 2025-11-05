// src/lib/auth/lockout.ts
import { createClient } from '@/lib/supabase/server';
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
  const supabase = await createClient();

  // Check if a record exists for this identifier
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', `login_failed:${identifier}`)
    .eq('action_type', 'auth_login')
    .single();

  const now = new Date().toISOString();

  if (existing) {
    // Update existing record
    const newAttemptCount = existing.attempt_count + 1;
    const isLocked = newAttemptCount >= LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS;
    const lockoutMinutes = isLocked ? calculateLockoutDuration(newAttemptCount) : 0;
    const lockedUntil = isLocked ? new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString() : null;

    await supabase
      .from('rate_limits')
      .update({
        attempt_count: newAttemptCount,
        last_attempt_at: now,
        is_locked: isLocked,
        locked_until: lockedUntil,
        updated_at: now,
      })
      .eq('id', existing.id);
  } else {
    // Create new record
    await supabase
      .from('rate_limits')
      .insert({
        identifier: `login_failed:${identifier}`,
        action_type: 'auth_login',
        attempt_count: 1,
        first_attempt_at: now,
        last_attempt_at: now,
        is_locked: false,
        locked_until: null,
      });
  }

  // Also record by IP to prevent IP-based attacks
  if (clientIP !== 'unknown') {
    const { data: existingIP } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', `login_failed_ip:${clientIP}`)
      .eq('action_type', 'auth_login')
      .single();

    if (existingIP) {
      const newAttemptCount = existingIP.attempt_count + 1;
      const isLocked = newAttemptCount >= LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS;
      const lockoutMinutes = isLocked ? calculateLockoutDuration(newAttemptCount) : 0;
      const lockedUntil = isLocked ? new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString() : null;

      await supabase
        .from('rate_limits')
        .update({
          attempt_count: newAttemptCount,
          last_attempt_at: now,
          is_locked: isLocked,
          locked_until: lockedUntil,
          updated_at: now,
        })
        .eq('id', existingIP.id);
    } else {
      await supabase
        .from('rate_limits')
        .insert({
          identifier: `login_failed_ip:${clientIP}`,
          action_type: 'auth_login',
          attempt_count: 1,
          first_attempt_at: now,
          last_attempt_at: now,
          is_locked: false,
          locked_until: null,
        });
    }
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
  const supabase = await createClient();

  // Clear failed attempts for this identifier
  await supabase
    .from('rate_limits')
    .delete()
    .eq('identifier', `login_failed:${identifier}`)
    .eq('action_type', 'auth_login');

  // Clear failed attempts for this IP
  if (clientIP !== 'unknown') {
    await supabase
      .from('rate_limits')
      .delete()
      .eq('identifier', `login_failed_ip:${clientIP}`)
      .eq('action_type', 'auth_login');
  }

  console.log(`Successful login recorded for ${identifier} from IP ${clientIP}`);
}

/**
 * Gets failed login attempts for an identifier
 */
async function getFailedAttempts(identifier: string): Promise<number> {
  const supabase = await createClient();
  const cutoffTime = new Date(Date.now() - LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('rate_limits')
    .select('attempt_count')
    .eq('identifier', `login_failed:${identifier}`)
    .eq('action_type', 'auth_login')
    .gte('first_attempt_at', cutoffTime)
    .single();

  return data?.attempt_count || 0;
}

/**
 * Gets failed login attempts by IP
 */
async function getFailedAttemptsByIP(ip: string): Promise<number> {
  const supabase = await createClient();
  const cutoffTime = new Date(Date.now() - LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('rate_limits')
    .select('attempt_count')
    .eq('identifier', `login_failed_ip:${ip}`)
    .eq('action_type', 'auth_login')
    .gte('first_attempt_at', cutoffTime)
    .single();

  return data?.attempt_count || 0;
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

  // Account is locked - get lockout info
  const supabase = await createClient();
  const { data: rateLimit } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', `login_failed:${identifier}`)
    .eq('action_type', 'auth_login')
    .single();

  if (!rateLimit || !rateLimit.is_locked || !rateLimit.locked_until) {
    return {
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS,
    };
  }

  const lockoutExpiresAt = new Date(rateLimit.locked_until);
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

    const supabase = await createClient();

    // Clear all failed attempts for this identifier
    await supabase
      .from('rate_limits')
      .delete()
      .eq('identifier', `login_failed:${identifier}`)
      .eq('action_type', 'auth_login');

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
  const supabase = await createClient();
  const cutoffTime = new Date(Date.now() - LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000).toISOString();

  // Get all recent failed attempts
  const { data: allAttempts } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('action_type', 'auth_login')
    .gte('first_attempt_at', cutoffTime);

  if (!allAttempts) {
    return {
      totalLockedAccounts: 0,
      recentFailedAttempts: 0,
      topFailedIPs: [],
    };
  }

  // Count locked accounts (those with >= MAX_FAILED_ATTEMPTS)
  const accountAttempts = new Map<string, number>();
  const ipAttempts = new Map<string, number>();

  for (const attempt of allAttempts) {
    if (attempt.identifier.startsWith('login_failed:')) {
      const account = attempt.identifier.replace('login_failed:', '');
      accountAttempts.set(account, attempt.attempt_count);
    } else if (attempt.identifier.startsWith('login_failed_ip:')) {
      const ip = attempt.identifier.replace('login_failed_ip:', '');
      ipAttempts.set(ip, attempt.attempt_count);
    }
  }

  const totalLockedAccounts = Array.from(accountAttempts.values())
    .filter(count => count >= LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS).length;

  const topFailedIPs = Array.from(ipAttempts.entries())
    .sort(([, a], [, b]) => b - a)
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
  const supabase = await createClient();
  const cutoffTime = new Date(Date.now() - LOCKOUT_CONFIG.CLEANUP_HOURS * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('rate_limits')
    .delete()
    .eq('action_type', 'auth_login')
    .lt('first_attempt_at', cutoffTime)
    .select();

  console.log(`Cleaned up old failed login attempts`);
  return data?.length || 0;
}
