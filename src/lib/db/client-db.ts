'use client';

// src/lib/db/client-db.ts
// Αυτό το αρχείο είναι ασφαλές για χρήση στο client-side, καθώς δεν κάνει άμεσα import Node.js modules

import { executeSQL, executeAdminSQL, testConnection } from './server-db-actions';

// Τύποι για καλύτερο type safety
export interface ClientDatabaseInterface {
  // Βασικές λειτουργίες που είναι ασφαλείς για client
  executeSQL: <T = unknown>(query: string) => Promise<T[]>;
  testConnection: () => Promise<{ status: string; details?: string }>;
}

// Client-safe database interface που χρησιμοποιεί server actions
export const clientDb: ClientDatabaseInterface = {
  executeSQL: async <T = unknown>(query: string): Promise<T[]> => {
    return await executeSQL<T>(query);
  },
  testConnection: async (): Promise<{ status: string; details?: string }> => {
    return await testConnection();
  }
};

// Admin πρόσβαση μέσω server actions
export const clientAdminDb = {
  executeSQL: async <T = unknown>(query: string): Promise<T[]> => {
    return await executeAdminSQL<T>(query);
  }
};

// Βοηθητική συνάρτηση για καθοδήγηση των developers να χρησιμοποιούν τα repositories
export function getClientDbHelper() {
  console.warn(
    'Η άμεση χρήση του clientDb δεν συνιστάται. ' +
    'Παρακαλούμε χρησιμοποιήστε τα αντίστοιχα repositories ή server actions.'
  );
  return clientDb;
}