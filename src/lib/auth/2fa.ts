// src/lib/auth/2fa.ts
import { Secret, TOTP } from 'otpauth';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { encrypt, decrypt, encryptBackupCodes, decryptBackupCodes } from '@/lib/utils/encryption';
import { createAuditLog } from '@/lib/utils/audit-logger';

/**
 * Two-Factor Authentication utilities
 */

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  backupCodeUsed?: boolean;
}

/**
 * Generates a new 2FA secret and QR code for user setup
 */
export async function generate2FASecret(
  userId: string, 
  userEmail: string
): Promise<TwoFactorSetup> {
  // Generate a random 32-character base32 secret
  const secret = new Secret({ size: 20 });
  
  // Create TOTP instance
  const totp = new TOTP({
    issuer: process.env.NEXT_PUBLIC_APP_NAME || 'Christos Kerigkas Portfolio',
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(totp.toString());
  
  // Generate backup codes (8 codes, 8 characters each)
  const backupCodes = Array.from({ length: 8 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  // Store the secret temporarily (not activated until verification)
  // Encrypt sensitive data before storing
  await db().update(users)
    .set({
      twoFactorSecret: encrypt(secret.base32),
      twoFactorBackupCodes: encryptBackupCodes(backupCodes),
      twoFactorEnabled: false // Not enabled until verified
    })
    .where(eq(users.id, userId));

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Verifies a TOTP token and enables 2FA if verification is successful
 */
export async function verify2FASetup(
  userId: string, 
  token: string
): Promise<boolean> {
  const [user] = await db().select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.twoFactorSecret) {
    return false;
  }

  // Decrypt and create TOTP instance with stored secret
  const decryptedSecret = decrypt(user.twoFactorSecret);
  const secret = Secret.fromBase32(decryptedSecret);
  const totp = new TOTP({
    issuer: process.env.NEXT_PUBLIC_APP_NAME || 'Christos Kerigkas Portfolio',
    label: user.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });

  // Verify the token (with time window tolerance)
  const delta = totp.validate({ token, window: 1 });
  
  if (delta !== null) {
    // Token is valid, enable 2FA
    await db().update(users)
      .set({ 
        twoFactorEnabled: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return true;
  }

  return false;
}

/**
 * Verifies a 2FA token during login
 */
export async function verify2FAToken(
  userId: string, 
  token: string
): Promise<TwoFactorVerification> {
  const [user] = await db().select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return { isValid: false };
  }

  // First, try TOTP verification
  const decryptedSecret = decrypt(user.twoFactorSecret);
  const secret = Secret.fromBase32(decryptedSecret);
  const totp = new TOTP({
    issuer: process.env.NEXT_PUBLIC_APP_NAME || 'Christos Kerigkas Portfolio',
    label: user.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });

  const delta = totp.validate({ token, window: 1 });
  
  if (delta !== null) {
    return { isValid: true };
  }

  // If TOTP fails, check backup codes
  if (user.twoFactorBackupCodes) {
    const backupCodes: string[] = decryptBackupCodes(user.twoFactorBackupCodes);
    const normalizedToken = token.toUpperCase().replace(/\s/g, '');

    if (backupCodes.includes(normalizedToken)) {
      // Remove used backup code
      const updatedCodes = backupCodes.filter(code => code !== normalizedToken);

      await db().update(users)
        .set({
          twoFactorBackupCodes: encryptBackupCodes(updatedCodes),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return { isValid: true, backupCodeUsed: true };
    }
  }

  return { isValid: false };
}

/**
 * Disables 2FA for a user
 */
export async function disable2FA(userId: string): Promise<boolean> {
  try {
    await db().update(users)
      .set({ 
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return true;
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    return false;
  }
}

/**
 * Regenerates backup codes for a user
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  const backupCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  await db().update(users)
    .set({
      twoFactorBackupCodes: encryptBackupCodes(backupCodes),
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));

  return backupCodes;
}

/**
 * Checks if a user has 2FA enabled
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  const [user] = await db().select({ twoFactorEnabled: users.twoFactorEnabled })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.twoFactorEnabled || false;
}

/**
 * Gets 2FA status for a user
 */
export async function get2FAStatus(userId: string): Promise<{
  enabled: boolean;
  hasBackupCodes: boolean;
  backupCodesCount: number;
}> {
  const [user] = await db().select({
    twoFactorEnabled: users.twoFactorEnabled,
    twoFactorBackupCodes: users.twoFactorBackupCodes
  })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { enabled: false, hasBackupCodes: false, backupCodesCount: 0 };
  }

  let backupCodesCount = 0;
  if (user.twoFactorBackupCodes) {
    try {
      const codes: string[] = decryptBackupCodes(user.twoFactorBackupCodes);
      backupCodesCount = codes.length;
    } catch {
      backupCodesCount = 0;
    }
  }

  return {
    enabled: user.twoFactorEnabled || false,
    hasBackupCodes: backupCodesCount > 0,
    backupCodesCount,
  };
}

/**
 * Emergency disable 2FA (for admin use)
 */
export async function emergencyDisable2FA(
  userId: string, 
  adminId: string
): Promise<boolean> {
  try {
    // Log the emergency disable action
    console.warn(`Emergency 2FA disable requested by admin ${adminId} for user ${userId}`);
    
    await db().update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Add audit log entry for security tracking
    await createAuditLog({
      userId: adminId,
      action: 'ADMIN_ACTION',
      resourceType: 'USER',
      resourceId: userId,
      details: {
        action: 'EMERGENCY_2FA_DISABLE',
        targetUserId: userId,
        reason: 'Emergency disable by admin'
      },
      severity: 'CRITICAL',
      source: 'ADMIN',
    });

    return true;
  } catch (error) {
    console.error('Failed to emergency disable 2FA:', error);
    return false;
  }
}