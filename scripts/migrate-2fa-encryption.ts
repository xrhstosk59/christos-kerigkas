#!/usr/bin/env tsx
/**
 * Migration Script: Encrypt Existing 2FA Data
 *
 * This script migrates plain-text 2FA secrets and backup codes to encrypted format.
 *
 * WARNING: This is a one-way migration. Make sure you have a database backup before running!
 *
 * Usage:
 *   npm run migrate:2fa-encryption
 */

import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { isNotNull, eq } from 'drizzle-orm';
import { encrypt, encryptBackupCodes, validateEncryptionSetup } from '../src/lib/utils/encryption';

async function migrate2FAData() {
  console.log('🔐 Starting 2FA Data Encryption Migration\n');

  try {
    // Step 1: Validate encryption setup
    console.log('Step 1: Validating encryption configuration...');
    try {
      validateEncryptionSetup();
      console.log('✅ Encryption setup validated\n');
    } catch (error) {
      console.error('❌ Encryption setup validation failed!');
      console.error('Error:', error instanceof Error ? error.message : error);
      console.error('\nPlease ensure ENCRYPTION_KEY and ENCRYPTION_SALT are set in your .env file.');
      console.error('Generate a key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      process.exit(1);
    }

    // Step 2: Fetch all users with 2FA data
    console.log('Step 2: Fetching users with 2FA data...');
    const usersWithTwoFactor = await db()
      .select({
        id: users.id,
        email: users.email,
        twoFactorSecret: users.twoFactorSecret,
        twoFactorBackupCodes: users.twoFactorBackupCodes,
        twoFactorEnabled: users.twoFactorEnabled,
      })
      .from(users)
      .where(isNotNull(users.twoFactorSecret));

    console.log(`Found ${usersWithTwoFactor.length} users with 2FA data\n`);

    if (usersWithTwoFactor.length === 0) {
      console.log('✅ No users to migrate. Exiting.');
      return;
    }

    // Step 3: Migrate each user
    console.log('Step 3: Encrypting 2FA data for each user...');
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const user of usersWithTwoFactor) {
      try {
        console.log(`\nProcessing user: ${user.email} (${user.id})`);

        // Check if already encrypted (encrypted data has the format: iv:encrypted:authTag)
        if (user.twoFactorSecret && user.twoFactorSecret.includes(':')) {
          console.log('  ⏭️  Skipping - Already encrypted');
          skipCount++;
          continue;
        }

        let encryptedSecret: string | null = null;
        let encryptedBackupCodes: string | null = null;

        // Encrypt 2FA secret
        if (user.twoFactorSecret) {
          try {
            encryptedSecret = encrypt(user.twoFactorSecret);
            console.log('  ✓ Secret encrypted');
          } catch (error) {
            console.error('  ⚠️  Failed to encrypt secret:', error);
            throw error;
          }
        }

        // Encrypt backup codes
        if (user.twoFactorBackupCodes) {
          try {
            // Parse the JSON backup codes
            const backupCodes = JSON.parse(user.twoFactorBackupCodes);

            if (!Array.isArray(backupCodes)) {
              throw new Error('Backup codes are not in array format');
            }

            encryptedBackupCodes = encryptBackupCodes(backupCodes);
            console.log('  ✓ Backup codes encrypted');
          } catch (error) {
            console.error('  ⚠️  Failed to encrypt backup codes:', error);
            throw error;
          }
        }

        // Update database
        await db()
          .update(users)
          .set({
            twoFactorSecret: encryptedSecret,
            twoFactorBackupCodes: encryptedBackupCodes,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        console.log('  ✅ Database updated');
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error processing user ${user.email}:`, error);
        errorCount++;
      }
    }

    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Total users:      ${usersWithTwoFactor.length}`);
    console.log(`✅ Migrated:      ${successCount}`);
    console.log(`⏭️  Skipped:       ${skipCount} (already encrypted)`);
    console.log(`❌ Failed:        ${errorCount}`);
    console.log('='.repeat(60));

    if (errorCount > 0) {
      console.error('\n⚠️  Some users failed to migrate. Please check the errors above.');
      process.exit(1);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify 2FA login still works for test users');
    console.log('2. Monitor error logs for any decryption issues');
    console.log('3. Keep the database backup until you\'re confident the migration succeeded');
  } catch (error) {
    console.error('\n❌ Migration failed with error:', error);
    process.exit(1);
  }
}

// Run migration
migrate2FAData()
  .then(() => {
    console.log('\n✅ Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script execution failed:', error);
    process.exit(1);
  });
