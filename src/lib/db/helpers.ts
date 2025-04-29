// src/lib/db/helpers.ts
/**
 * Βοηθητικές συναρτήσεις και κλάσεις για τη διαχείριση της βάσης δεδομένων
 * Αυτό το module παρέχει κοινόχρηστες λειτουργίες που χρησιμοποιούνται από τα repositories
 */

import { db } from './index';

/**
 * Σφάλμα που εμφανίζεται όταν η σύνδεση με τη βάση δεδομένων δεν είναι διαθέσιμη
 */
export class DatabaseNotAvailableError extends Error {
  constructor() {
    super('Database connection is not available. Make sure you are in a server environment with valid DATABASE_URL.');
    this.name = 'DatabaseNotAvailableError';
  }
}

/**
 * Ελέγχει αν υπάρχει σύνδεση με τη βάση δεδομένων και επιστρέφει το client
 * Ρίχνει DatabaseNotAvailableError αν δεν υπάρχει σύνδεση
 * 
 * @returns Το αντικείμενο σύνδεσης με τη βάση δεδομένων
 * @throws {DatabaseNotAvailableError} Αν η σύνδεση δεν είναι διαθέσιμη
 */
export function ensureDatabaseConnection() {
  if (!db) {
    throw new DatabaseNotAvailableError();
  }
  return db;
}