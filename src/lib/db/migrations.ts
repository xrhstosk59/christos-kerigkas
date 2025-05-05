// src/lib/db/migrations.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Φόρτωση μεταβλητών περιβάλλοντος - βελτιωμένη αρχικοποίηση
const envPath = path.resolve(process.cwd(), '.env.local');

// Έλεγχος αν το αρχείο .env.local υπάρχει
if (!fs.existsSync(envPath)) {
  console.error(`Το αρχείο .env.local δεν βρέθηκε στη διαδρομή: ${envPath}`);
  console.error('Δημιουργήστε το αρχείο .env.local με τις απαραίτητες μεταβλητές περιβάλλοντος.');
  process.exit(1);
}

// Φόρτωση του αρχείου .env.local
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Σφάλμα κατά τη φόρτωση του αρχείου .env.local:', result.error);
  process.exit(1);
}

// Έλεγχος για DATABASE_URL μετά τη φόρτωση του .env.local
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Η μεταβλητή DATABASE_URL δεν έχει οριστεί στο αρχείο .env.local');
  console.error('Βεβαιωθείτε ότι το αρχείο .env.local περιέχει τη γραμμή: DATABASE_URL="..."');
  process.exit(1);
}

// Διαδρομή προς τον φάκελο migrations
const migrationsFolder = path.join(process.cwd(), 'drizzle');

// Δημιουργία του φακέλου migrations αν δεν υπάρχει
if (!fs.existsSync(migrationsFolder)) {
  fs.mkdirSync(migrationsFolder, { recursive: true });
  console.log(`Δημιουργήθηκε ο φάκελος migrations στη διαδρομή: ${migrationsFolder}`);
}

// Ρύθμιση του postgres client για migrations με βελτιωμένες παραμέτρους
const migrationClient = postgres(connectionString, { 
  max: 1,
  onnotice: () => {}, // Καταστέλλει τα notice messages
  prepare: false, // Απενεργοποίηση prepared statements για συμβατότητα με Supabase
  ssl: { 
    rejectUnauthorized: false // Επιτρέπει self-signed πιστοποιητικά
  }, 
  connect_timeout: 30, // Αύξηση του timeout
});

// Δημιουργούμε το drizzle instance για τα migrations
const db = drizzle(migrationClient);

// Ορίζουμε την κύρια συνάρτηση για την εκτέλεση των migrations
export async function runMigrations() {
  try {
    console.log(`Εκτέλεση migrations από το ${migrationsFolder}...`);
    
    // Εκτέλεση των migrations
    await migrate(db, { migrationsFolder });
    
    console.log('Migrations ολοκληρώθηκαν επιτυχώς!');
  } catch (error) {
    // Αγνοούμε σφάλματα για πίνακες που υπάρχουν ήδη
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('Οι πίνακες υπάρχουν ήδη, συνέχεια...');
    } else {
      console.error('Σφάλμα κατά την εκτέλεση των migrations:', error);
      throw error;
    }
  } finally {
    await migrationClient.end();
  }
}

// Εκτέλεση του migrate αν κληθεί άμεσα
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

// Δεν χρειάζεται να εξάγουμε ξανά το runMigrations, έχει ήδη εξαχθεί παραπάνω