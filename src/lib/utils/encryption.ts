/**
 * Encryption utilities for sensitive data
 * Uses Node.js native crypto with AES-256-GCM
 *
 * @security This module handles encryption of sensitive data like 2FA secrets
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SCRYPT_N = 16384; // CPU/memory cost parameter

/**
 * Get encryption key from environment variable
 * The key should be a 64-character hex string (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set. Required for 2FA encryption.');
  }

  if (encryptionKey.length < 64) {
    throw new Error('ENCRYPTION_KEY must be at least 64 characters (32 bytes hex encoded)');
  }

  // Use scrypt to derive a key from the encryption key
  const salt = Buffer.from(process.env.ENCRYPTION_SALT || 'default-salt-change-me', 'utf8');
  return scryptSync(encryptionKey, salt, KEY_LENGTH, { N: SCRYPT_N });
}

/**
 * Encrypt sensitive data
 *
 * @param plaintext - The data to encrypt
 * @returns Encrypted data as base64 string (format: iv:encrypted:authTag)
 *
 * @example
 * const encrypted = encrypt('my-2fa-secret');
 * // Returns: "iv-base64:encrypted-base64:tag-base64"
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty data');
  }

  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    // Return format: iv:encrypted:authTag (all base64 encoded)
    return `${iv.toString('base64')}:${encrypted}:${authTag.toString('base64')}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 *
 * @param encryptedData - The encrypted data (format: iv:encrypted:authTag)
 * @returns Decrypted plaintext string
 *
 * @example
 * const decrypted = decrypt('iv-base64:encrypted-base64:tag-base64');
 * // Returns: "my-2fa-secret"
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty data');
  }

  try {
    const key = getEncryptionKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivBase64, encrypted, authTagBase64] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data. Data may be corrupted or key is invalid.');
  }
}

/**
 * Encrypt an array of backup codes
 *
 * @param codes - Array of backup codes
 * @returns Encrypted JSON string
 */
export function encryptBackupCodes(codes: string[]): string {
  if (!Array.isArray(codes) || codes.length === 0) {
    throw new Error('Backup codes must be a non-empty array');
  }

  return encrypt(JSON.stringify(codes));
}

/**
 * Decrypt backup codes
 *
 * @param encryptedCodes - Encrypted backup codes string
 * @returns Array of backup codes
 */
export function decryptBackupCodes(encryptedCodes: string): string[] {
  const decrypted = decrypt(encryptedCodes);

  try {
    const codes = JSON.parse(decrypted);

    if (!Array.isArray(codes)) {
      throw new Error('Decrypted data is not an array');
    }

    return codes;
  } catch (error) {
    console.error('Failed to parse backup codes:', error);
    throw new Error('Invalid backup codes format');
  }
}

/**
 * Generate a secure encryption key
 * This should be run once and the key stored securely in environment variables
 *
 * @returns A 64-character hex string suitable for ENCRYPTION_KEY
 *
 * @example
 * node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validate that encryption is properly configured
 * Should be called at application startup
 */
export function validateEncryptionSetup(): void {
  try {
    getEncryptionKey();

    // Test encryption/decryption
    const testData = 'test-encryption-setup';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);

    if (decrypted !== testData) {
      throw new Error('Encryption test failed: decrypted data does not match');
    }
  } catch (error) {
    throw new Error(`Encryption setup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
