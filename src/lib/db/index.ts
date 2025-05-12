// src/lib/db/index.ts
// Αυτό το αρχείο είναι ο κεντρικός άξονας για τα exports της βάσης δεδομένων
// Αφαιρέθηκε η χρήση 'use client' ή 'use server' για να επιτρέπει επιλεκτικά imports

// Re-export των server-side utilities - αυτά θα είναι διαθέσιμα μόνο στον server
export * from './server-db-actions';

// Re-export των client-safe συναρτήσεων από το client-db αρχείο
export { clientDb, clientAdminDb, getClientDbHelper, type ClientDatabaseInterface } from './client-db';

// Εξαγωγή των τύπων από το schema
export type * from './schema';

// ΣΗΜΑΝΤΙΚΗ ΣΗΜΕΙΩΣΗ:
// Το παρακάτω σχόλιο εξηγεί στους developers πώς να χρησιμοποιούν σωστά
// τις λειτουργίες της βάσης δεδομένων:

/*
 * ΟΔΗΓΟΣ ΧΡΗΣΗΣ:
 * 
 * 1. Για Server Components:
 *    - Χρησιμοποιήστε απευθείας τις server-only συναρτήσεις και τα repositories
 *    - Παράδειγμα: import { selectFromTable } from '@/lib/db'
 * 
 * 2. Για Client Components:
 *    - Χρησιμοποιήστε μόνο τις ασφαλείς client συναρτήσεις και τα server actions
 *    - Παράδειγμα: import { clientDb } from '@/lib/db'
 *    - Καλύτερα ακόμα, χρησιμοποιήστε τα repositories μέσω server actions
 * 
 * 3. Για νέες λειτουργίες:
 *    - Αν είναι συνάρτηση που καλείται από client, προσθέστε τη στο server-db-actions.ts
 *    - Αν είναι συνάρτηση που καλείται μόνο από server, προσθέστε τη στο server-db.ts
 */