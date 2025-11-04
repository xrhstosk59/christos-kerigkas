#!/usr/bin/env tsx
/**
 * Database Backup Script
 * Securely backs up the database using environment variables
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const DB_HOST = process.env.DATABASE_HOST || process.env.SUPABASE_DB_HOST;
const DB_USER = process.env.DATABASE_USER || process.env.SUPABASE_DB_USER;
const DB_NAME = process.env.DATABASE_NAME || process.env.SUPABASE_DB_NAME || 'postgres';
const DB_PASSWORD = process.env.DATABASE_PASSWORD || process.env.SUPABASE_DB_PASSWORD;

function validateEnvironment() {
  const missing: string[] = [];

  if (!DB_HOST) missing.push('DATABASE_HOST or SUPABASE_DB_HOST');
  if (!DB_USER) missing.push('DATABASE_USER or SUPABASE_DB_USER');
  if (!DB_PASSWORD) missing.push('DATABASE_PASSWORD or SUPABASE_DB_PASSWORD');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(env => console.error(`   - ${env}`));
    console.error('\nPlease set these in your .env.local file');
    process.exit(1);
  }
}

function createBackup() {
  validateEnvironment();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('🔄 Starting database backup...');
  console.log(`📁 Backup location: ${backupFile}`);

  try {
    // Set PGPASSWORD environment variable for pg_dump
    const env = {
      ...process.env,
      PGPASSWORD: DB_PASSWORD,
    };

    // Execute pg_dump
    execSync(
      `pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} > "${backupFile}"`,
      {
        env,
        stdio: 'inherit',
      }
    );

    console.log('✅ Database backup completed successfully!');
    console.log(`📦 Backup size: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB`);

    // Keep only last 10 backups
    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
      .sort()
      .reverse();

    if (backups.length > 10) {
      console.log('\n🧹 Cleaning old backups...');
      backups.slice(10).forEach(old => {
        const oldPath = path.join(backupDir, old);
        fs.unlinkSync(oldPath);
        console.log(`   Deleted: ${old}`);
      });
    }

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

createBackup();
