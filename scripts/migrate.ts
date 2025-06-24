#!/usr/bin/env tsx
// scripts/migrate.ts
import { runMigrations, getMigrationStatus, verifyDatabaseSchema } from '@/lib/db/migrator';

/**
 * Database Migration CLI
 * Usage: npm run migrate [options]
 */

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  console.log('🚀 Database Migration CLI\n');

  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'run':
      await runMigrationsCommand();
      break;
    case 'verify':
      await verifySchema();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.log('❌ Unknown command. Use "npm run migrate help" for usage information.\n');
      showHelp();
      process.exit(1);
  }
}

async function showStatus() {
  try {
    console.log('📊 Migration Status:');
    const status = await getMigrationStatus();
    
    console.log(`  Available migrations: ${status.available}`);
    console.log(`  Applied migrations: ${status.applied}`);
    console.log(`  Pending migrations: ${status.pending}`);
    
    if (status.lastMigration) {
      console.log(`  Last migration: ${status.lastMigration}`);
    }
    
    if (status.pending > 0) {
      console.log(`\n⚠️  ${status.pending} migrations are pending. Run 'npm run migrate run' to apply them.`);
    } else {
      console.log('\n✅ Database is up to date!');
    }
  } catch (error) {
    console.error('❌ Failed to get migration status:', error);
    process.exit(1);
  }
}

async function runMigrationsCommand() {
  try {
    const useAuto = args.includes('--auto') || args.includes('-a');
    
    console.log(`🔄 Running ${useAuto ? 'automatic' : 'manual'} migrations...\n`);
    
    const result = await runMigrations(useAuto);
    
    if (result.success) {
      console.log(`\n✅ Migration completed successfully!`);
      if (result.migrationsApplied > 0) {
        console.log(`  Applied ${result.migrationsApplied} migrations:`);
        result.appliedMigrations.forEach(migration => {
          console.log(`    - ${migration}`);
        });
      }
    } else {
      console.log(`\n❌ Migration failed!`);
      if (result.errors.length > 0) {
        console.log('  Errors:');
        result.errors.forEach(error => {
          console.log(`    - ${error}`);
        });
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function verifySchema() {
  try {
    console.log('🔍 Verifying database schema...\n');
    
    const isValid = await verifyDatabaseSchema();
    
    if (isValid) {
      console.log('✅ Database schema verification passed!');
    } else {
      console.log('❌ Database schema verification failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Schema verification failed:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log('Database Migration CLI');
  console.log('');
  console.log('Usage:');
  console.log('  npm run migrate <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  status      Show migration status');
  console.log('  run         Run pending migrations');
  console.log('  run --auto  Run migrations using drizzle-kit (automatic)');
  console.log('  verify      Verify database schema integrity');
  console.log('  help        Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  npm run migrate status');
  console.log('  npm run migrate run');
  console.log('  npm run migrate run --auto');
  console.log('  npm run migrate verify');
}

// Run the CLI
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});