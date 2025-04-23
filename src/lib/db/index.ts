// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Το connection string από τις μεταβλητές περιβάλλοντος
const connectionString = process.env.DATABASE_URL || ''

// Δημιουργία του postgres client με πλήρες configuration
const client = postgres(connectionString, {
  max: 10, // Μέγιστος αριθμός connections
  idle_timeout: 20, // Χρόνος αδράνειας σε δευτερόλεπτα
  prepare: false, // απενεργοποίηση prepared statements για καλύτερη συμβατότητα με Supabase
  ssl: true, // Ενεργοποίηση SSL
  connect_timeout: 30, // Αύξηση του timeout
  // Δεν ορίζουμε user/pass εδώ, αφήνουμε τα στοιχεία να προέρχονται από το connection string
})

// Δημιουργία του drizzle client
export const db = drizzle(client, { schema })