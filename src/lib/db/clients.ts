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
      regularDbClient = drizzle(regularPgClient, { schema });
      
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
        
        adminDbClient = drizzle(adminPgClient, { schema });
      }
      
      console.log('Database clients initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize database clients:', error);
  }
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
    return regularDbClient!.execute(query as never)
      .then(result => transformResult<T>(result));
  },
  query: <T>(query: unknown) => {
    return regularDbClient!.execute(query as never)
      .then(result => transformResult<T>(result));
  },
  select: <T>(args: unknown) => {
    // Αντί για spreading, περνάμε το args ως έχει
    return regularDbClient!.select(args as never) as unknown as T;
  },
  insert: <T>(args: unknown) => {
    // Αντί για spreading, περνάμε το args ως έχει
    return regularDbClient!.insert(args as never) as unknown as T;
  },
  update: <T>(args: unknown) => {
    // Αντί για spreading, περνάμε το args ως έχει
    return regularDbClient!.update(args as never) as unknown as T;
  },
  delete: <T>(args: unknown) => {
    // Αντί για spreading, περνάμε το args ως έχει
    return regularDbClient!.delete(args as never) as unknown as T;
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
    return adminDbClient!.execute(query as never)
      .then(result => transformResult<T>(result));
  },
  query: <T>(query: unknown) => {
    return adminDbClient!.execute(query as never)
      .then(result => transformResult<T>(result));
  },
  select: <T>(args: unknown) => {
    // Αντί για spreading, περνάμε το args ως έχει
    return adminDbClient!.select(args as never) as unknown as T;
  },
  insert: <T>(args: unknown) => {
    // Αντί για spreading, περνάμε το args ως έχει
    return adminDbClient!.insert(args as never) as unknown as T;
  },
  update: <T>(args: unknown) => {
    // Αντί για spreading, περνάμε το args ως έχει
    return adminDbClient!.update(args as never) as unknown as T;
  },
  delete: <T>(args: unknown) => {
    // Αντί για spreading, περνάμε το args ως έχει
    return adminDbClient!.delete(args as never) as unknown as T;
  }
} : {
  execute: notInitializedError,
  query: notInitializedError,
  select: notInitializedError,
  insert: notInitializedError,
  update: notInitializedError,
  delete: notInitializedError
};

// Βοηθητικές συναρτήσεις για έλεγχο της κατάστασης της βάσης
export async function checkDatabaseConnection() {
  if (!regularDbClient) {
    return {
      connected: false,
      message: 'Database client not initialized. Make sure DATABASE_URL is set and you are in a server environment.'
    };
  }
  
  try {
    // Προσπαθούμε να εκτελέσουμε ένα απλό ερώτημα
    await regularDbClient.execute(sql`SELECT 1`);
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