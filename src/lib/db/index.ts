// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { sql } from 'drizzle-orm'

// Χρησιμοποιούμε διαφορετικό έλεγχο για server-side code
// Ελέγχουμε αν τρέχουμε σε Node.js περιβάλλον
const isNode = typeof process !== 'undefined' && 
              process.versions != null && 
              process.versions.node != null

// Δημιουργούμε σύνδεση με τη βάση μόνο αν είμαστε σε Node περιβάλλον
let dbClient = null

if (isNode) {
  try {
    // Το connection string από τις μεταβλητές περιβάλλοντος
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error('DATABASE_URL is not defined in environment variables')
    } else {
      // Δημιουργία του postgres client με πλήρες configuration
      const client = postgres(connectionString, {
        max: 10, // Μέγιστος αριθμός connections
        idle_timeout: 20, // Χρόνος αδράνειας σε δευτερόλεπτα
        prepare: false, // απενεργοποίηση prepared statements για καλύτερη συμβατότητα με Supabase
        ssl: { 
          rejectUnauthorized: false // Επιτρέπουμε self-signed πιστοποιητικά
        }, 
        connect_timeout: 30, // Αύξηση του timeout
      })

      // Δημιουργία του drizzle client
      dbClient = drizzle(client, { schema })
      console.log('Database client initialized successfully')
    }
  } catch (error) {
    console.error('Failed to initialize database client:', error)
  }
}

// Εξαγωγή του db client
export const db = dbClient

// Βοηθητικές λειτουργίες για έλεγχο της κατάστασης της βάσης
export const checkDatabaseConnection = async () => {
  if (!db) {
    return {
      connected: false,
      message: 'Database client not initialized. Make sure DATABASE_URL is set and you are in a server environment.'
    }
  }
  
  try {
    // Προσπαθούμε να εκτελέσουμε ένα απλό ερώτημα
    await db.execute(sql`SELECT 1`)
    return {
      connected: true,
      message: 'Database connection successful'
    }
  } catch (error) {
    console.error('Database connection test failed:', error)
    return {
      connected: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

// Εξαγωγή του SQL tag για raw queries
export { sql }