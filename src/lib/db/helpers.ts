'use server';

// src/lib/db/helpers.ts
import { getDbClient, getAdminDbClient } from './server-db';

/**
 * Βοηθητική συνάρτηση που διασφαλίζει την ύπαρξη σύνδεσης με τη βάση δεδομένων.
 * 
 * @returns Το database client
 */
export async function ensureDatabaseConnection() {
  return getDbClient();
}

/**
 * Βοηθητική συνάρτηση που διασφαλίζει την ύπαρξη admin σύνδεσης με τη βάση δεδομένων.
 * 
 * @returns Το admin database client
 */
export async function ensureAdminDatabaseConnection() {
  return getAdminDbClient();
}