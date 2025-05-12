'use server';

// src/lib/db/db-actions.ts
import { executeSQL, executeAdminSQL, testConnection } from './server-db-actions';

// Επανεξάγουμε τις server actions από το server-db-actions.ts
export { testConnection };

// Εξάγουμε μόνο ασύγχρονες συναρτήσεις
export async function checkDatabaseStatus() {
  return await testConnection();
}

// Μπορείτε να προσθέσετε άλλες ασύγχρονες server-side λειτουργίες εδώ
export async function executeQuery<T = unknown>(query: string): Promise<T[]> {
  return await executeSQL<T>(query);
}

export async function executeAdminQuery<T = unknown>(query: string): Promise<T[]> {
  return await executeAdminSQL<T>(query);
}