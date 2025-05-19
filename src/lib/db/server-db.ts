'use server';

// src/lib/db/server-db.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schemaImport from './schema';
import { sql as sqlImport, SQLWrapper } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { logger } from '@/lib/utils/logger';

// Τοπικές μη εξαγόμενες μεταβλητές
const schema = schemaImport;
const sql = sqlImport;

// Επιλογές για το regular client που σέβεται το Row Level Security
const regularPoolOptions = {
  max: 15,
  idle_timeout: 30,
  prepare: false,
  ssl: { rejectUnauthorized: false },
  connect_timeout: 30,
  application_name: 'christos-kerigkas-app'
};

// Διευρυμένος τύπος για τις επιλογές της PostgreSQL που περιλαμβάνει πεδίο headers
// Επεκτείνουμε το ConnectionOptions από το database.ts και αντιστοιχίζουμε τα πεδία
interface PostgresConnectionOptions {
  max?: number; // αντιστοιχεί στο maxConnections από το ConnectionOptions
  idle_timeout?: number; // αντιστοιχεί στο idleTimeout
  prepare?: boolean; // αντιστοιχεί στο prepareStatements
  ssl?: boolean | { rejectUnauthorized: boolean };
  connect_timeout?: number; // αντιστοιχεί στο connectTimeout
  application_name?: string; // αντιστοιχεί στο applicationName
  headers?: Record<string, string>; // Προσθέτουμε το headers που χρειαζόμαστε
}

// Τύποι για καλύτερο type safety
export interface DatabaseClient {
  execute: <T = unknown>(query: unknown) => Promise<T[]>;
  query: <T = unknown>(query: unknown) => Promise<T[]>;
  select: <T = unknown>(tablesOrSelection?: unknown) => T;
  insert: <T = unknown>(table?: unknown) => T;
  update: <T = unknown>(table?: unknown) => T;
  delete: <T = unknown>(table?: unknown) => T;
}

// Ορισμός τύπων για τα arguments των μεθόδων του drizzle
type DrizzleQueryType = ReturnType<typeof sqlImport> | SQLWrapper;

// Τύπος για γενικές συναρτήσεις (αντί για any)
type GenericParam = unknown;
type GenericReturn = unknown;
type GenericDatabaseFunction = (param?: GenericParam) => GenericReturn;

// Μια κλάση singleton για τη διαχείριση των συνδέσεων
class DbConnectionManager {
  private static instance: DbConnectionManager;
  private connections: Map<string, { 
    client: PostgresJsDatabase<typeof schema>,
    lastUsed: Date 
  }> = new Map();
  private pgClients: Map<string, postgres.Sql> = new Map();
  
  private constructor() {
    // Ρύθμιση periodic cleanup των unused connections
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanupUnusedConnections(), 10 * 60 * 1000); // Κάθε 10 λεπτά
    }
  }
  
  public static getInstance(): DbConnectionManager {
    if (!DbConnectionManager.instance) {
      DbConnectionManager.instance = new DbConnectionManager();
    }
    return DbConnectionManager.instance;
  }
  
  // Μέθοδος για το cleanup των αχρησιμοποίητων συνδέσεων
  private cleanupUnusedConnections(): void {
    const now = new Date();
    const timeout = 30 * 60 * 1000; // 30 λεπτά
    
    for (const [type, conn] of this.connections.entries()) {
      if (now.getTime() - conn.lastUsed.getTime() > timeout) {
        logger.info(`Closing unused database connection: ${type}`, null, 'db-connection-manager');
        this.closeConnection(type).catch(err => {
          logger.error(`Failed to close connection ${type}:`, err, 'db-connection-manager');
        });
      }
    }
  }
  
  // Κλείσιμο συγκεκριμένης σύνδεσης
  private async closeConnection(type: string): Promise<void> {
    const pgClient = this.pgClients.get(type);
    if (pgClient) {
      try {
        await pgClient.end({ timeout: 5 });
        this.pgClients.delete(type);
        this.connections.delete(type);
        logger.info(`Connection ${type} closed successfully`, null, 'db-connection-manager');
      } catch (error) {
        logger.error(`Error closing connection ${type}:`, error, 'db-connection-manager');
        throw error;
      }
    }
  }
  
  // Δημιουργία και κατοχύρωση σύνδεσης
  public async createConnection(
    type: string,
    connectionString: string,
    options: PostgresConnectionOptions = regularPoolOptions
  ): Promise<PostgresJsDatabase<typeof schema>> {
    try {
      // Απενεργοποιούμε προσωρινά τον κανόνα ESLint για το any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pgClient = postgres(connectionString, options as any);
      this.pgClients.set(type, pgClient);
      
      // Δημιουργία του drizzle client
      const dbClient = drizzle(pgClient, { schema });
      
      // Αποθήκευση του client με timestamp
      this.connections.set(type, {
        client: dbClient,
        lastUsed: new Date()
      });
      
      // Έλεγχος σύνδεσης
      await this.testConnection(dbClient);
      
      return dbClient;
    } catch (error) {
      logger.error(`Failed to create database connection ${type}:`, error, 'db-connection-manager');
      
      // Καθαρισμός αν η δημιουργία απέτυχε
      const pgClient = this.pgClients.get(type);
      if (pgClient) {
        try {
          await pgClient.end();
        } catch {
          // Αγνοούμε σφάλματα κατά το κλείσιμο failed connections
        }
        this.pgClients.delete(type);
      }
      this.connections.delete(type);
      
      throw error;
    }
  }
  
  // Έλεγχος σύνδεσης με timeout
  private async testConnection(db: PostgresJsDatabase<typeof schema>): Promise<void> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database connection test timed out')), 5000);
      });
      
      const queryPromise = db.execute(sql`SELECT 1`);
      
      await Promise.race([queryPromise, timeoutPromise]);
    } catch (error) {
      logger.error('Database connection test failed:', error, 'db-connection-manager');
      throw error;
    }
  }
  
  // Λήψη σύνδεσης με ενημέρωση του lastUsed timestamp
  public async getConnection(type: string): Promise<PostgresJsDatabase<typeof schema> | null> {
    // Έλεγχος αν υπάρχει ήδη η σύνδεση
    const conn = this.connections.get(type);
    if (conn) {
      // Ενημέρωση του timestamp
      conn.lastUsed = new Date();
      return conn.client;
    }
    
    // Αν δεν υπάρχει, επιστρέφουμε null ώστε η κλήση getDbClient να δημιουργήσει νέα
    return null;
  }
  
  // Κλείσιμο όλων των συνδέσεων (για graceful shutdown)
  public async closeAllConnections(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const [type, pgClient] of this.pgClients.entries()) {
      promises.push(
        (async () => {
          try {
            await pgClient.end({ timeout: 5 });
            logger.info(`Connection ${type} closed successfully`, null, 'db-connection-manager');
          } catch (error) {
            logger.error(`Error closing connection ${type}:`, error, 'db-connection-manager');
            // Συνεχίζουμε το κλείσιμο των υπόλοιπων συνδέσεων
          }
        })()
      );
    }
    
    await Promise.allSettled(promises);
    
    this.pgClients.clear();
    this.connections.clear();
    
    logger.info('All database connections closed', null, 'db-connection-manager');
  }
  
  // Στατιστικά συνδέσεων
  public getConnectionStats(): Record<string, { lastUsed: string }> {
    const stats: Record<string, { lastUsed: string }> = {};
    
    for (const [type, conn] of this.connections.entries()) {
      stats[type] = {
        lastUsed: conn.lastUsed.toISOString()
      };
    }
    
    return stats;
  }
}

// Singleton instance
const connectionManager = DbConnectionManager.getInstance();

// Χρήση του Next.js cache για αποτελεσματική διαχείριση συνδέσεων
export async function getDbClient(): Promise<PostgresJsDatabase<typeof schema>> {
  try {
    // Έλεγχος αν υπάρχει ήδη η σύνδεση
    const existingClient = await connectionManager.getConnection('default');
    if (existingClient) {
      return existingClient;
    }
    
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    // Δημιουργία νέας σύνδεσης
    return await connectionManager.createConnection('default', connectionString, regularPoolOptions);
  } catch (error) {
    logger.error('Failed to get database client:', error, 'database');
    throw new Error(`Database client initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Για admin λειτουργίες (με σκοπό να παρακάμπτει το RLS)
export async function getAdminDbClient(): Promise<PostgresJsDatabase<typeof schema>> {
  try {
    // Έλεγχος αν υπάρχει ήδη η σύνδεση
    const existingClient = await connectionManager.getConnection('admin');
    if (existingClient) {
      return existingClient;
    }
    
    const connectionString = process.env.DATABASE_ADMIN_URL || process.env.DATABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    if (!serviceRoleKey) {
      logger.warn('SUPABASE_SERVICE_ROLE_KEY is not defined, admin client will not bypass RLS', null, 'database');
    }
    
    // Admin client με τα ίδια options προς το παρόν αλλά με headers
    const adminOptions: PostgresConnectionOptions = {
      ...regularPoolOptions,
      headers: serviceRoleKey ? {
        Authorization: `Bearer ${serviceRoleKey}`
      } : undefined
    };
    
    return await connectionManager.createConnection('admin', connectionString, adminOptions);
  } catch (error) {
    logger.error('Failed to get admin database client:', error, 'database');
    throw new Error(`Admin database client initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Βοηθητική συνάρτηση για μετατροπή των αποτελεσμάτων σε συμβατή μορφή
function transformResult<T>(result: unknown): T[] {
  return result as T[];
}

// Εξαγωγή μιας τυποποιημένης έκδοσης του db client συμβατή με το υπάρχον API
export async function getTypedDbClient(): Promise<DatabaseClient> {
  const db = await getDbClient();
  
  return {
    execute: <T = unknown>(query: unknown) => {
      return db.execute(query as DrizzleQueryType).then(result => transformResult<T>(result));
    },
    query: <T = unknown>(query: unknown) => {
      return db.execute(query as DrizzleQueryType).then(result => transformResult<T>(result));
    },
    select: <T = unknown>(tablesOrSelection?: unknown) => {
      return ((db.select as GenericDatabaseFunction)(tablesOrSelection)) as T;
    },
    insert: <T = unknown>(table?: unknown) => {
      return ((db.insert as GenericDatabaseFunction)(table)) as T;
    },
    update: <T = unknown>(table?: unknown) => {
      return ((db.update as GenericDatabaseFunction)(table)) as T;
    },
    delete: <T = unknown>(table?: unknown) => {
      return ((db.delete as GenericDatabaseFunction)(table)) as T;
    }
  };
}

// Ομοίως για το admin client
export async function getTypedAdminDbClient(): Promise<DatabaseClient> {
  const db = await getAdminDbClient();
  
  return {
    execute: <T = unknown>(query: unknown) => {
      return db.execute(query as DrizzleQueryType).then(result => transformResult<T>(result));
    },
    query: <T = unknown>(query: unknown) => {
      return db.execute(query as DrizzleQueryType).then(result => transformResult<T>(result));
    },
    select: <T = unknown>(tablesOrSelection?: unknown) => {
      return ((db.select as GenericDatabaseFunction)(tablesOrSelection)) as T;
    },
    insert: <T = unknown>(table?: unknown) => {
      return ((db.insert as GenericDatabaseFunction)(table)) as T;
    },
    update: <T = unknown>(table?: unknown) => {
      return ((db.update as GenericDatabaseFunction)(table)) as T;
    },
    delete: <T = unknown>(table?: unknown) => {
      return ((db.delete as GenericDatabaseFunction)(table)) as T;
    }
  };
}

// Βοηθητική συνάρτηση για έλεγχο της κατάστασης της βάσης
export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const db = await getDbClient();
    
    // Προσπαθούμε να εκτελέσουμε ένα απλό ερώτημα με timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout after 5 seconds')), 5000);
    });
    
    const queryPromise = db.execute(sql`SELECT 1`);
    
    // Race για να κάνουμε timeout αν η σύνδεση καθυστερήσει πολύ
    await Promise.race([queryPromise, timeoutPromise]);
    
    return {
      connected: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    logger.error('Database connection test failed:', error, 'database');
    return {
      connected: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Βοηθητική συνάρτηση για λήψη των στατιστικών συνδέσεων
export async function getDatabaseStats(): Promise<Record<string, { lastUsed: string }>> {
  return connectionManager.getConnectionStats();
}

// Βοηθητική συνάρτηση για τα repositories
export async function ensureDatabaseConnection(): Promise<PostgresJsDatabase<typeof schema>> {
  return await getDbClient();
}

// Graceful shutdown για αποφυγή memory leaks
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing database connections...', null, 'database');
    await connectionManager.closeAllConnections();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    logger.info('SIGINT received, closing database connections...', null, 'database');
    await connectionManager.closeAllConnections();
    process.exit(0);
  });
}

// Ασύγχρονες συναρτήσεις για την εξαγωγή του sql και του schema
export async function getSql() {
  return sql;
}

export async function getSchema() {
  return schema;
}