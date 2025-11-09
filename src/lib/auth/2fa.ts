// src/lib/auth/2fa.ts
import { Secret, TOTP } from 'otpauth';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';
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
  const supabase = await createClient();
  const { error } = await supabase
    .from('users')
    .update({
      two_factor_secret: encrypt(secret.base32),
      two_factor_backup_codes: encryptBackupCodes(backupCodes),
      two_factor_enabled: false, // Not enabled until verified
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to store 2FA secret: ${error.message}`);
  }

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
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user || !user.two_factor_secret) {
    return false;
  }

  // Decrypt and create TOTP instance with stored secret
  const decryptedSecret = decrypt(user.two_factor_secret);
  const secret = Secret.fromBase32(decryptedSecret);
  const totp = new TOTP({
    issuer: process.env.NEXT_PUBLIC_APP_NAME || 'Christos Kerigkas Portfolio',
    label: user.email || `user_${userId}`,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });

  // Verify the token (with time window tolerance)
  const delta = totp.validate({ token, window: 1 });

  if (delta !== null) {
    // Token is valid, enable 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to enable 2FA: ${updateError.message}`);
    }

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
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user || !user.two_factor_enabled || !user.two_factor_secret) {
    return { isValid: false };
  }

  // First, try TOTP verification
  const decryptedSecret = decrypt(user.two_factor_secret);
  const secret = Secret.fromBase32(decryptedSecret);
  const totp = new TOTP({
    issuer: process.env.NEXT_PUBLIC_APP_NAME || 'Christos Kerigkas Portfolio',
    label: user.email || `user_${userId}`,
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
  if (user.two_factor_backup_codes) {
    const backupCodes: string[] = decryptBackupCodes(user.two_factor_backup_codes);
    const normalizedToken = token.toUpperCase().replace(/\s/g, '');

    if (backupCodes.includes(normalizedToken)) {
      // Remove used backup code
      const updatedCodes = backupCodes.filter(code => code !== normalizedToken);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          two_factor_backup_codes: encryptBackupCodes(updatedCodes),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Failed to update backup codes: ${updateError.message}`);
      }

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
    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

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

  const supabase = await createClient();
  const { error } = await supabase
    .from('users')
    .update({
      two_factor_backup_codes: encryptBackupCodes(backupCodes),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to regenerate backup codes: ${error.message}`);
  }

  return backupCodes;
}

/**
 * Checks if a user has 2FA enabled
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('two_factor_enabled')
    .eq('id', userId)
    .single();

  if (error) {
    return false;
  }

  return user?.two_factor_enabled || false;
}

/**
 * Gets 2FA status for a user
 */
export async function get2FAStatus(userId: string): Promise<{
  enabled: boolean;
  hasBackupCodes: boolean;
  backupCodesCount: number;
}> {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('two_factor_enabled, two_factor_backup_codes')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return { enabled: false, hasBackupCodes: false, backupCodesCount: 0 };
  }

  let backupCodesCount = 0;
  if (user.two_factor_backup_codes) {
    try {
      const codes: string[] = decryptBackupCodes(user.two_factor_backup_codes);
      backupCodesCount = codes.length;
    } catch {
      backupCodesCount = 0;
    }
  }

  return {
    enabled: user.two_factor_enabled || false,
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

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

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
