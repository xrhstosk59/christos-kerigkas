// src/lib/db/helpers.ts

import { getRegularDatabase } from './database-service';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

/**
 * Συνάρτηση που διασφαλίζει τη σύνδεση με τη βάση δεδομένων.
 * Χρησιμοποιείται από τα repositories.
 */
export async function ensureDatabaseConnection(): Promise<PostgresJsDatabase<typeof schema>> {
  return await getRegularDatabase();
}

// Εξαγωγή του sql tag για διευκόλυνση
export { sql } from 'drizzle-orm';