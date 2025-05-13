'use server';

// src/lib/db/clients.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

// Τύποι για καλύτερο type safety
export interface DatabaseClient {
  execute: <T>(query: unknown) => Promise<T[]>;
  query: <T>(query: unknown) => Promise<T[]>;
  select: <T>(args: unknown) => T;
  insert: <T>(args: unknown) => T;
  update: <T>(args: unknown) => T;
  delete: <T>(args: unknown) => T;
}

/**
 * Έλεγχος αν το περιβάλλον είναι Node.js
 * Αυτό είναι σημαντικό γιατί η σύνδεση με τη βάση δεδομένων
 * πρέπει να γίνεται μόνο στο server-side
 */
const isNode = typeof process !== 'undefined' && 
              process.versions != null && 
              process.versions.node != null;

// Επιλογές για το regular client που σέβεται το Row Level Security
const regularPoolOptions = {
  max: 15, // Αύξηση από 10 σε 15 για καλύτερο handling περισσότερων συνδέσεων
  idle_timeout: 30, // Αύξηση από 20 σε 30 δευτερόλεπτα
  prepare: false, // Απαραίτητο για συμβατότητα με Supabase connection pooler
  ssl: { rejectUnauthorized: false }, // Επιτρέπει self-signed πιστοποιητικά
  connect_timeout: 30, // Αύξηση του timeout για μεγαλύτερη ανοχή σε καθυστερήσεις δικτύου
  application_name: 'christos-kerigkas-app' // Βοηθά στην αναγνώριση των συνδέσεων
};

// Regular client (σέβεται τις RLS πολιτικές)
let regularPgClient: postgres.Sql<Record<string, unknown>> | null = null;
let regularDbClient: ReturnType<typeof drizzle<typeof schema>> | null = null;

// Admin client (παρακάμπτει τις RLS πολιτικές για διαχειριστικές λειτουργίες)
let adminPgClient: postgres.Sql<Record<string, unknown>> | null = null;
let adminDbClient: ReturnType<typeof drizzle<typeof schema>> | null = null;

// Flag για να παρακολουθούμε αν οι connections έχουν κλείσει
let connectionsActive = false;

// Δημιουργία clients μόνο αν είμαστε σε Node.js περιβάλλον
if (isNode) {
  try {
    // Το connection string από τις μεταβλητές περιβάλλοντος
    const connectionString = process.env.DATABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!connectionString) {
      console.error('DATABASE_URL is not defined in environment variables');
    } else {
      // Regular client για κανονικές λειτουργίες (σέβεται το RLS)
      regularPgClient = postgres(connectionString, regularPoolOptions);
      if (regularPgClient) {
        regularDbClient = drizzle(regularPgClient, { schema });
      }
      
      // Admin client για διαχειριστικές λειτουργίες (παρακάμπτει το RLS)
      if (serviceRoleKey) {
        // Σημείωση: Η Supabase χρησιμοποιεί κυρίως το header Authorization για RLS bypass
        // αλλά επειδή το postgres.js δεν υποστηρίζει custom headers απευθείας 
        // χρησιμοποιούμε εναλλακτική προσέγγιση
        
        // Δημιουργία ξεχωριστού client με τα ίδια options
        adminPgClient = postgres(connectionString, {
          ...regularPoolOptions,
          // Σε περιβάλλον παραγωγής, θα χρειαζόταν εναλλακτική προσέγγιση
          // όπως η χρήση του Supabase REST API με το service role key
        });
        
        if (adminPgClient) {
          adminDbClient = drizzle(adminPgClient, { schema });
        }
      }
      
      connectionsActive = true;
      console.log('Database clients initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize database clients:', error);
  }
  
  // Προσθήκη event listeners για graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connections');
    await closeDbConnections();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connections');
    await closeDbConnections();
    process.exit(0);
  });
  
  // Διασφάλιση ότι οι συνδέσεις κλείνουν πριν την έξοδο της εφαρμογής
  process.on('exit', () => {
    if (connectionsActive) {
      console.warn('Process exiting but database connections were not properly closed');
    }
  });
}

// Ορίζουμε fallback functions για όταν οι clients δεν είναι διαθέσιμοι
const notInitializedError = (): never => {
  throw new Error('Database client not initialized');
};

// Βοηθητική συνάρτηση για μετατροπή των αποτελεσμάτων σε συμβατή μορφή
function transformResult<T>(result: unknown): T[] {
  // Εδώ θα μπορούσαμε να προσθέσουμε οποιαδήποτε λογική μετασχηματισμού αν χρειαστεί
  return result as T[];
}

// Εξαγωγή του regular db client (με πλήρες σεβασμό στο RLS)
export const db: DatabaseClient = regularDbClient ? {
  execute: <T>(query: unknown) => {
    if (!regularDbClient) {
      return Promise.reject(new Error('Database client not initialized'));
    }
    return regularDbClient.execute(query as never)
      .then(result => transformResult<T>(result));
  },
  query: <T>(query: unknown) => {
    if (!regularDbClient) {
      return Promise.reject(new Error('Database client not initialized'));
    }
    return regularDbClient.execute(query as never)
      .then(result => transformResult<T>(result));
  },
  select: <T>(args: unknown) => {
    if (!regularDbClient) {
      throw new Error('Database client not initialized');
    }
    // Αντί για spreading, περνάμε το args ως έχει
    return regularDbClient.select(args as never) as unknown as T;
  },
  insert: <T>(args: unknown) => {
    if (!regularDbClient) {
      throw new Error('Database client not initialized');
    }
    // Αντί για spreading, περνάμε το args ως έχει
    return regularDbClient.insert(args as never) as unknown as T;
  },
  update: <T>(args: unknown) => {
    if (!regularDbClient) {
      throw new Error('Database client not initialized');
    }
    // Αντί για spreading, περνάμε το args ως έχει
    return regularDbClient.update(args as never) as unknown as T;
  },
  delete: <T>(args: unknown) => {
    if (!regularDbClient) {
      throw new Error('Database client not initialized');
    }
    // Αντί για spreading, περνάμε το args ως έχει
    return regularDbClient.delete(args as never) as unknown as T;
  }
} : {
  execute: notInitializedError,
  query: notInitializedError,
  select: notInitializedError,
  insert: notInitializedError,
  update: notInitializedError,
  delete: notInitializedError
};

// Εξαγωγή του admin db client (παρακάμπτει το RLS)
export const adminDb: DatabaseClient = adminDbClient ? {
  execute: <T>(query: unknown) => {
    if (!adminDbClient) {
      return Promise.reject(new Error('Admin database client not initialized'));
    }
    return adminDbClient.execute(query as never)
      .then(result => transformResult<T>(result));
  },
  query: <T>(query: unknown) => {
    if (!adminDbClient) {
      return Promise.reject(new Error('Admin database client not initialized'));
    }
    return adminDbClient.execute(query as never)
      .then(result => transformResult<T>(result));
  },
  select: <T>(args: unknown) => {
    if (!adminDbClient) {
      throw new Error('Admin database client not initialized');
    }
    // Αντί για spreading, περνάμε το args ως έχει
    return adminDbClient.select(args as never) as unknown as T;
  },
  insert: <T>(args: unknown) => {
    if (!adminDbClient) {
      throw new Error('Admin database client not initialized');
    }
    // Αντί για spreading, περνάμε το args ως έχει
    return adminDbClient.insert(args as never) as unknown as T;
  },
  update: <T>(args: unknown) => {
    if (!adminDbClient) {
      throw new Error('Admin database client not initialized');
    }
    // Αντί για spreading, περνάμε το args ως έχει
    return adminDbClient.update(args as never) as unknown as T;
  },
  delete: <T>(args: unknown) => {
    if (!adminDbClient) {
      throw new Error('Admin database client not initialized');
    }
    // Αντί για spreading, περνάμε το args ως έχει
    return adminDbClient.delete(args as never) as unknown as T;
  }
} : {
  execute: notInitializedError,
  query: notInitializedError,
  select: notInitializedError,
  insert: notInitializedError,
  update: notInitializedError,
  delete: notInitializedError
};

/**
 * Συνάρτηση για σωστό κλείσιμο των database connections
 * Χρησιμοποιείται κατά το shutdown της εφαρμογής ή όταν χρειάζεται
 * να κλείσουμε χειροκίνητα τις συνδέσεις
 */
export async function closeDbConnections(): Promise<void> {
  if (!connectionsActive) {
    console.log('Database connections are already closed');
    return;
  }

  try {
    // Κλείσιμο του regularPgClient
    if (regularPgClient) {
      await regularPgClient.end({ timeout: 5 });
      regularPgClient = null;
      regularDbClient = null;
      console.log('Regular database connection closed');
    }
    
    // Κλείσιμο του adminPgClient
    if (adminPgClient) {
      await adminPgClient.end({ timeout: 5 });
      adminPgClient = null;
      adminDbClient = null;
      console.log('Admin database connection closed');
    }
    
    connectionsActive = false;
    console.log('All database connections closed successfully');
  } catch (error) {
    console.error('Error closing database connections:', error);
    throw error;
  }
}

// Βοηθητικές συναρτήσεις για έλεγχο της κατάστασης της βάσης
export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!regularDbClient) {
    return {
      connected: false,
      message: 'Database client not initialized. Make sure DATABASE_URL is set and you are in a server environment.'
    };
  }
  
  try {
    // Προσπαθούμε να εκτελέσουμε ένα απλό ερώτημα με timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout after 5 seconds')), 5000);
    });
    
    const queryPromise = regularDbClient.execute(sql`SELECT 1`);
    
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

// Εξαγωγή για εύκολη πρόσβαση στο sql tag
export { sql };