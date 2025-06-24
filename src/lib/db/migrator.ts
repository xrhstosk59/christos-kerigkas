// src/lib/db/migrator.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { env } from '@/lib/config/env';

/**
 * Database Migration Runner
 * Handles automatic and manual database migrations
 */

export interface MigrationInfo {
  id: string;
  name: string;
  appliedAt?: Date;
  sql: string;
  checksum: string;
}

export interface MigrationResult {
  success: boolean;
  migrationsApplied: number;
  errors: string[];
  appliedMigrations: string[];
}

/**
 * Database Migrator Class
 */
export class DatabaseMigrator {
  private db: ReturnType<typeof drizzle>;
  private pgClient: postgres.Sql;
  private migrationsPath: string;

  constructor(connectionString?: string, migrationsPath?: string) {
    const dbUrl = connectionString || env.DATABASE_URL;
    this.migrationsPath = migrationsPath || join(process.cwd(), 'drizzle');
    
    this.pgClient = postgres(dbUrl, {
      max: 1,
      prepare: false,
    });
    
    this.db = drizzle(this.pgClient);
  }

  /**
   * Initialize migration tracking table
   */
  private async initializeMigrationTable(): Promise<void> {
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Enhanced migration tracking table
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS __migration_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        migration_name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum TEXT NOT NULL,
        execution_time_ms INTEGER,
        success BOOLEAN DEFAULT TRUE,
        error_message TEXT
      );
    `);
  }

  /**
   * Get list of available migration files
   */
  private getAvailableMigrations(): MigrationInfo[] {
    try {
      const files = readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      return files.map(file => {
        const filePath = join(this.migrationsPath, file);
        const sql = readFileSync(filePath, 'utf-8');
        const checksum = this.calculateChecksum(sql);
        
        return {
          id: file.replace('.sql', ''),
          name: file,
          sql,
          checksum,
        };
      });
    } catch (error) {
      console.warn(`Could not read migrations from ${this.migrationsPath}:`, error);
      return [];
    }
  }

  /**
   * Get applied migrations from database
   */
  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const result = await this.db.execute(sql`
        SELECT migration_name FROM __migration_history WHERE success = TRUE ORDER BY applied_at
      `);
      
      return result.map((row: any) => row.migration_name);
    } catch {
      // Table might not exist yet
      return [];
    }
  }

  /**
   * Calculate checksum for migration content
   */
  private calculateChecksum(content: string): string {
    return Buffer.from(content).toString('base64').slice(0, 32);
  }

  /**
   * Apply a single migration
   */
  private async applyMigration(migration: MigrationInfo): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Execute the migration SQL
      await this.db.execute(sql.raw(migration.sql));
      
      const executionTime = Date.now() - startTime;
      
      // Record successful migration
      await this.db.execute(sql`
        INSERT INTO __migration_history (migration_name, checksum, execution_time_ms, success)
        VALUES (${migration.name}, ${migration.checksum}, ${executionTime}, TRUE)
      `);
      
      console.log(`✅ Applied migration: ${migration.name} (${executionTime}ms)`);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Record failed migration
      await this.db.execute(sql`
        INSERT INTO __migration_history (migration_name, checksum, execution_time_ms, success, error_message)
        VALUES (${migration.name}, ${migration.checksum}, ${executionTime}, FALSE, ${errorMessage})
      `);
      
      console.error(`❌ Failed migration: ${migration.name} - ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Run migrations automatically (uses drizzle-kit)
   */
  async runAutoMigrations(): Promise<MigrationResult> {
    try {
      console.log('🚀 Running automatic migrations...');
      
      await this.initializeMigrationTable();
      
      // Use drizzle-kit's migrate function
      await migrate(this.db, { migrationsFolder: this.migrationsPath });
      
      console.log('✅ Automatic migrations completed successfully');
      
      return {
        success: true,
        migrationsApplied: 0, // drizzle-kit handles this internally
        errors: [],
        appliedMigrations: [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Automatic migration failed:', errorMessage);
      
      return {
        success: false,
        migrationsApplied: 0,
        errors: [errorMessage],
        appliedMigrations: [],
      };
    }
  }

  /**
   * Run migrations manually (custom implementation)
   */
  async runManualMigrations(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrationsApplied: 0,
      errors: [],
      appliedMigrations: [],
    };

    try {
      console.log('🚀 Running manual migrations...');
      
      await this.initializeMigrationTable();
      
      const availableMigrations = this.getAvailableMigrations();
      const appliedMigrations = await this.getAppliedMigrations();
      
      const pendingMigrations = availableMigrations.filter(
        migration => !appliedMigrations.includes(migration.name)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return result;
      }
      
      console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
      pendingMigrations.forEach(migration => {
        console.log(`  - ${migration.name}`);
      });
      
      // Apply each migration in order
      for (const migration of pendingMigrations) {
        try {
          await this.applyMigration(migration);
          result.migrationsApplied++;
          result.appliedMigrations.push(migration.name);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`${migration.name}: ${errorMessage}`);
          result.success = false;
          break; // Stop on first error
        }
      }
      
      if (result.success) {
        console.log(`✅ Successfully applied ${result.migrationsApplied} migrations`);
      } else {
        console.error(`❌ Migration failed after ${result.migrationsApplied} successful migrations`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Migration process failed:', errorMessage);
      
      result.success = false;
      result.errors.push(errorMessage);
      return result;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    available: number;
    applied: number;
    pending: number;
    lastMigration?: string;
  }> {
    try {
      await this.initializeMigrationTable();
      
      const availableMigrations = this.getAvailableMigrations();
      const appliedMigrations = await this.getAppliedMigrations();
      
      const lastMigrationResult = await this.db.execute(sql`
        SELECT migration_name FROM __migration_history 
        WHERE success = TRUE 
        ORDER BY applied_at DESC 
        LIMIT 1
      `);
      
      return {
        available: availableMigrations.length,
        applied: appliedMigrations.length,
        pending: availableMigrations.length - appliedMigrations.length,
        lastMigration: lastMigrationResult[0]?.migration_name as string | undefined,
      };
    } catch (error) {
      console.error('Failed to get migration status:', error);
      return {
        available: 0,
        applied: 0,
        pending: 0,
      };
    }
  }

  /**
   * Verify database schema integrity
   */
  async verifySchema(): Promise<boolean> {
    try {
      // Check if required tables exist
      const requiredTables = [
        'users',
        'blog_posts',
        'projects',
        'certifications',
        'audit_logs',
        'rate_limit_attempts',
      ];
      
      for (const table of requiredTables) {
        const result = await this.db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          );
        `);
        
        if (!result[0]?.exists) {
          console.error(`❌ Required table missing: ${table}`);
          return false;
        }
      }
      
      console.log('✅ Schema verification passed');
      return true;
    } catch (error) {
      console.error('❌ Schema verification failed:', error);
      return false;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pgClient.end();
  }
}

/**
 * Run migrations with proper error handling
 */
export async function runMigrations(useAutoMigrations = true): Promise<MigrationResult> {
  const migrator = new DatabaseMigrator();
  
  try {
    if (useAutoMigrations) {
      return await migrator.runAutoMigrations();
    } else {
      return await migrator.runManualMigrations();
    }
  } finally {
    await migrator.close();
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus() {
  const migrator = new DatabaseMigrator();
  
  try {
    return await migrator.getMigrationStatus();
  } finally {
    await migrator.close();
  }
}

/**
 * Verify database schema
 */
export async function verifyDatabaseSchema(): Promise<boolean> {
  const migrator = new DatabaseMigrator();
  
  try {
    return await migrator.verifySchema();
  } finally {
    await migrator.close();
  }
}