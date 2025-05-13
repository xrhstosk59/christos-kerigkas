import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Τύποι για διαφορετικούς τρόπους σύνδεσης
export enum DatabaseConnectionType {
  REGULAR = 'regular',
  ADMIN = 'admin',
}

// Διεπαφή για τις επιλογές σύνδεσης
export interface ConnectionOptions {
  maxConnections?: number;
  idleTimeout?: number;
  prepareStatements?: boolean;
  ssl?: boolean | { rejectUnauthorized: boolean };
  connectTimeout?: number;
  applicationName?: string;
}

// Κλάση για τη διαχείριση της βάσης δεδομένων
export class DatabaseService {
  private static instance: DatabaseService;
  private connections: Map<string, PostgresJsDatabase<typeof schema>> = new Map();
  private connectionUrls: Map<string, string> = new Map();
  
  private defaultOptions: ConnectionOptions = {
    maxConnections: 15,
    idleTimeout: 30,
    prepareStatements: false,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 30,
    applicationName: 'christos-kerigkas-app'
  };

  private constructor() {
    // Αποθήκευση των connection strings
    this.connectionUrls.set(
      DatabaseConnectionType.REGULAR, 
      process.env.DATABASE_URL || ''
    );
    
    this.connectionUrls.set(
      DatabaseConnectionType.ADMIN,

      process.env.DATABASE_ADMIN_URL || process.env.DATABASE_URL || ''
    );
  }

  // Singleton pattern
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Λήψη σύνδεσης βάσης δεδομένων
  public async getConnection(
    type: DatabaseConnectionType = DatabaseConnectionType.REGULAR,
    options?: Partial<ConnectionOptions>
  ): Promise<PostgresJsDatabase<typeof schema>> {
    const cacheKey = `${type}-${JSON.stringify(options || {})}`;
    
    // Έλεγχος αν υπάρχει ήδη cached connection
    const cachedConnection = this.connections.get(cacheKey);
    if (cachedConnection) {
      return cachedConnection;
    }
    
    // Έλεγχος αν υπάρχει το connection URL
    const connectionUrl = this.connectionUrls.get(type);
    if (!connectionUrl) {
      throw new Error(`Database URL για τύπο σύνδεσης ${type} δεν έχει οριστεί`);
    }
    
    // Συγχώνευση των options
    const mergedOptions = {
      ...this.defaultOptions,
      ...options
    };
    
    // Ρυθμίσεις για postgres.js
    const pgOptions = {
      max: mergedOptions.maxConnections,
      idle_timeout: mergedOptions.idleTimeout,
      prepare: mergedOptions.prepareStatements,
      ssl: mergedOptions.ssl,
      connect_timeout: mergedOptions.connectTimeout,
      application_name: mergedOptions.applicationName
    };
    
    // Δημιουργία νέας σύνδεσης
    const pgClient = postgres(connectionUrl, pgOptions);
    const db = drizzle(pgClient, { schema });
    
    // Αποθήκευση στο cache
    this.connections.set(cacheKey, db);
    
    return db;
  }
  
  // Έλεγχος της κατάστασης της βάσης δεδομένων
  public async checkConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const db = await this.getConnection();
      
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
      console.error('Database connection test failed:', error);
      return {
        connected: false,
        message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  // Κλείσιμο όλων των συνδέσεων (χρήσιμο για testing ή shutdown)
  public async closeAllConnections(): Promise<void> {
    // Σημείωση: Η postgres.js δεν έχει άμεση μέθοδο για το κλείσιμο,
    // χρειάζεται να διατηρήσουμε αναφορές στα αρχικά clients
    this.connections.clear();
  }
}

// Εξαγωγή μιας συνάρτησης βοηθού για εύκολη πρόσβαση
export async function getDatabase(
  type: DatabaseConnectionType = DatabaseConnectionType.REGULAR,
  options?: Partial<ConnectionOptions>
): Promise<PostgresJsDatabase<typeof schema>> {
  return DatabaseService.getInstance().getConnection(type, options);
}

// Συντομεύσεις για συχνές περιπτώσεις χρήσης
export async function getRegularDatabase(): Promise<PostgresJsDatabase<typeof schema>> {
  return getDatabase(DatabaseConnectionType.REGULAR);
}

export async function getAdminDatabase(): Promise<PostgresJsDatabase<typeof schema>> {
  return getDatabase(DatabaseConnectionType.ADMIN);
}

// Εξαγωγή για εύκολη πρόσβαση στο sql tag
export { sql };