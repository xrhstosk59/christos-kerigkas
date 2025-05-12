'use server';

// src/lib/db/server-db.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { sql, SQLWrapper } from 'drizzle-orm';
import { cache } from 'react';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Επιλογές για το regular client που σέβεται το Row Level Security
const regularPoolOptions = {
  max: 15,
  idle_timeout: 30,
  prepare: false,
  ssl: { rejectUnauthorized: false },
  connect_timeout: 30,
  application_name: 'christos-kerigkas-app'
};

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
type DrizzleQueryType = ReturnType<typeof sql> | SQLWrapper;

// Τύπος για γενικές συναρτήσεις (αντί για any)
type GenericParam = unknown;
type GenericReturn = unknown;
type GenericDatabaseFunction = (param?: GenericParam) => GenericReturn;

// Χρήση του Next.js cache για αποτελεσματική διαχείριση συνδέσεων
// Μετατροπή σε ασύγχρονη συνάρτηση
export const getDbClient = cache(async (): Promise<PostgresJsDatabase<typeof schema>> => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment variables');
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const pgClient = postgres(connectionString, regularPoolOptions);
  return drizzle(pgClient, { schema });
});

// Για admin λειτουργίες (με σκοπό να παρακάμπτει το RLS)
// Μετατροπή σε ασύγχρονη συνάρτηση
export const getAdminDbClient = cache(async (): Promise<PostgresJsDatabase<typeof schema>> => {
  const connectionString = process.env.DATABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment variables');
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined, admin client will not bypass RLS');
  }

  // Admin client με τα ίδια options προς το παρόν
  const pgClient = postgres(connectionString, {
    ...regularPoolOptions,
  });
  
  return drizzle(pgClient, { schema });
});

// Βοηθητική συνάρτηση για μετατροπή των αποτελεσμάτων σε συμβατή μορφή
function transformResult<T>(result: unknown): T[] {
  return result as T[];
}

// Εξαγωγή μιας τυποποιημένης έκδοσης του db client συμβατή με το υπάρχον API
// Μετατροπή σε ασύγχρονη συνάρτηση
export const getTypedDbClient = async (): Promise<DatabaseClient> => {
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
};

// Ομοίως για το admin client
// Μετατροπή σε ασύγχρονη συνάρτηση
export const getTypedAdminDbClient = async (): Promise<DatabaseClient> => {
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
};

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
    console.error('Database connection test failed:', error);
    return {
      connected: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Βοηθητική συνάρτηση για τα repositories
// Μετατροπή σε ασύγχρονη συνάρτηση
export async function ensureDatabaseConnection() {
  return getDbClient();
}

// Εξαγωγή για εύκολη πρόσβαση στο sql tag
export { sql };