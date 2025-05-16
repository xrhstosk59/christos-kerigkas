// src/lib/db/database.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

// Τύποι επιλογών σύνδεσης
export interface ConnectionOptions {
  maxConnections?: number;
  idleTimeout?: number;
  prepareStatements?: boolean;
  ssl?: boolean | { rejectUnauthorized: boolean };
  connectTimeout?: number;
  applicationName?: string;
}

// Έλεγχος του περιβάλλοντος
export const isServer = typeof window === 'undefined';

// Προεπιλεγμένες επιλογές σύνδεσης
const defaultOptions: Required<ConnectionOptions> = {
  maxConnections: 15,
  idleTimeout: 30,
  prepareStatements: false,
  ssl: { rejectUnauthorized: false },
  connectTimeout: 30,
  applicationName: 'christos-kerigkas-app'
};

// Τύποι σύνδεσης βάσης δεδομένων
export enum DbConnectionType {
  DEFAULT = 'default',
  ADMIN = 'admin'
}

// Ορισμός του τύπου του Drizzle client
export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

// Singleton που διαχειρίζεται τις συνδέσεις
class DatabaseManager {
  private static instance: DatabaseManager;
  private connections: Map<string, DrizzleClient> = new Map();
  private pgClients: Map<string, postgres.Sql<Record<string, unknown>>> = new Map();
  private _isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  // Αρχικοποίηση του διαχειριστή συνδέσεων
  public initialize(): void {
    if (this._isInitialized || !isServer) return;

    try {
      const connectionString = process.env.DATABASE_URL;
      const adminConnectionString = process.env.DATABASE_ADMIN_URL || process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error('DATABASE_URL is not defined in environment variables');
      }

      // Δημιουργία των pg clients
      this.createConnection(DbConnectionType.DEFAULT, connectionString, defaultOptions);
      
      if (adminConnectionString) {
        this.createConnection(DbConnectionType.ADMIN, adminConnectionString, defaultOptions);
      }

      this._isInitialized = true;
      console.log('Database manager initialized successfully');

      // Προσθήκη event listeners για graceful shutdown
      this.setupShutdownHandlers();
    } catch (error) {
      console.error('Failed to initialize database manager:', error);
      throw error;
    }
  }

  // Δημιουργία νέας σύνδεσης
  private createConnection(
    type: DbConnectionType,
    connectionString: string,
    options: Required<ConnectionOptions>
  ): void {
    // Μετατροπή των επιλογών για το postgres.js
    const pgOptions = {
      max: options.maxConnections,
      idle_timeout: options.idleTimeout,
      prepare: options.prepareStatements,
      ssl: options.ssl,
      connect_timeout: options.connectTimeout,
      application_name: options.applicationName
    };

    // Δημιουργία του postgres client
    const pgClient = postgres(connectionString, pgOptions);
    this.pgClients.set(type, pgClient);

    // Δημιουργία του drizzle client
    const dbClient = drizzle(pgClient, { schema });
    this.connections.set(type, dbClient);
  }

  // Λήψη σύνδεσης από το cache
  public getConnection(type: DbConnectionType = DbConnectionType.DEFAULT): DrizzleClient {
    if (!this._isInitialized) {
      this.initialize();
    }

    const connection = this.connections.get(type);
    if (!connection) {
      throw new Error(`Connection of type ${type} not found`);
    }

    return connection;
  }

  // Έλεγχος της σύνδεσης με τη βάση δεδομένων
  public async checkConnection(type: DbConnectionType = DbConnectionType.DEFAULT): Promise<{ connected: boolean; message: string }> {
    try {
      const db = this.getConnection(type);
      
      // Απλό query για έλεγχο σύνδεσης
      await db.execute(sql`SELECT 1`);
      
      return {
        connected: true,
        message: `Database connection (${type}) is working properly`
      };
    } catch (error) {
      console.error(`Database connection test failed for ${type}:`, error);
      return {
        connected: false,
        message: `Database connection (${type}) failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Κλείσιμο όλων των συνδέσεων
  public async closeAllConnections(): Promise<void> {
    for (const [type, pgClient] of this.pgClients.entries()) {
      try {
        await pgClient.end({ timeout: 5 });
        console.log(`Connection ${type} closed successfully`);
      } catch (error) {
        console.error(`Error closing connection ${type}:`, error);
      }
    }

    this.pgClients.clear();
    this.connections.clear();
    this._isInitialized = false;
    console.log('All database connections closed');
  }

  // Ρύθμιση των handlers για το shutdown
  private setupShutdownHandlers(): void {
    if (typeof process !== 'undefined') {
      // Handler για graceful shutdown
      const handleShutdown = async () => {
        console.log('Closing database connections before shutdown...');
        await this.closeAllConnections();
        process.exit(0);
      };

      process.on('SIGTERM', handleShutdown);
      process.on('SIGINT', handleShutdown);
      
      // Διασφάλιση ότι οι συνδέσεις κλείνουν πριν την έξοδο
      process.on('exit', () => {
        if (this._isInitialized) {
          console.warn('Process exiting but database connections are still active');
        }
      });
    }
  }
}

// Εξαγωγή του instance του διαχειριστή
export const dbManager = DatabaseManager.getInstance();

// Αρχικοποίηση σε περιβάλλον server
if (isServer) {
  dbManager.initialize();
}

// Συντομεύσεις για συχνές περιπτώσεις χρήσης
export function getDb(): DrizzleClient {
  return dbManager.getConnection(DbConnectionType.DEFAULT);
}

export function getAdminDb(): DrizzleClient {
  return dbManager.getConnection(DbConnectionType.ADMIN);
}

// Αρχείο transaction helper
export async function transaction<T>(
  callback: (tx: DrizzleClient) => Promise<T>,
  type: DbConnectionType = DbConnectionType.DEFAULT
): Promise<T> {
  const db = dbManager.getConnection(type);
  
  // Έναρξη transaction
  await db.execute(sql`BEGIN`);
  
  try {
    // Εκτέλεση της callback με το transaction
    const result = await callback(db);
    
    // Επιβεβαίωση του transaction
    await db.execute(sql`COMMIT`);
    
    return result;
  } catch (error) {
    // Αναίρεση του transaction σε περίπτωση σφάλματος
    await db.execute(sql`ROLLBACK`);
    throw error;
  }
}

// Utility για τη δημιουργία συνθηκών αναζήτησης με ασφάλεια τύπων
export function safeQuery<T extends Record<string, unknown>>(
  query: T, 
  allowedFields: Array<keyof T>
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const field of allowedFields) {
    if (field in query && query[field] !== undefined && query[field] !== null) {
      result[field] = query[field];
    }
  }
  
  return result;
}

// Εξαγωγή για το sql tag
export { sql };