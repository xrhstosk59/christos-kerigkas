'use server';

// src/lib/db/server-db-client.ts (μετονομασία από db-client.ts)
// Αυτό το αρχείο πρέπει να εκτελείται ΜΟΝΟ στο server side

import { getTypedDbClient, getTypedAdminDbClient, sql, checkDatabaseConnection } from './server-db';

// Εξαγωγή των clients ως μεταβλητές για συμβατότητα με υπάρχοντα κώδικα
export const db = getTypedDbClient();
export const adminDb = getTypedAdminDbClient();

// Εξαγωγή του SQL tag
export { sql };

// Επανεξαγωγή του checkDatabaseConnection για ευκολία
export { checkDatabaseConnection };

// Επανεξαγωγή των getters
export { 
  getTypedDbClient, 
  getTypedAdminDbClient 
} from './server-db';

export { 
  getDbClient, 
  getAdminDbClient 
} from './server-db';

// Εξαγωγή του schema
export * as schema from './schema';

// Βοηθητική συνάρτηση για τα repositories που θέλουν να διασφαλίσουν την ύπαρξη σύνδεσης
export { ensureDatabaseConnection } from './server-db';