// src/lib/db/server-db-client.ts
// ΣΗΜΕΙΩΣΗ: Αυτό το αρχείο ΔΕΝ έχει 'use server' directive

import { 
  getDbClient,
  getAdminDbClient,
  getTypedDbClient,
  getTypedAdminDbClient,
  checkDatabaseConnection,
  ensureDatabaseConnection,
  getSql,
  getSchema
} from './server-db';

// Εξαγωγή για απλοποιημένη χρήση
export {
  getDbClient,
  getAdminDbClient,
  getTypedDbClient,
  getTypedAdminDbClient,
  checkDatabaseConnection,
  ensureDatabaseConnection
};

// Βοηθητικές συναρτήσεις για να χρησιμοποιηθούν στα imports
export async function sql() {
  return await getSql();
}

export async function schema() {
  return await getSchema();
}