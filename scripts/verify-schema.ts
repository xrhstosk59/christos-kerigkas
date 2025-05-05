// scripts/verify-schema.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';
import * as schema from '../src/lib/db/schema';

// Φόρτωση μεταβλητών περιβάλλοντος από .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Έλεγχος για DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('📛 Σφάλμα: DATABASE_URL δεν έχει οριστεί στο .env.local');
  process.exit(1);
}

// Ορισμός του postgres client
const pgClient = postgres(DATABASE_URL, {
  max: 1,
  ssl: { rejectUnauthorized: false },
  connect_timeout: 30,
});

// Ορισμός τύπου για τα αντικείμενα σχήματος
interface SchemaItem {
  name?: string;
  [key: string]: unknown;
}

/**
 * Εντοπισμός των πινάκων από το schema module
 * Στο Drizzle, οι πίνακες είναι αντικείμενα που δημιουργούνται με συναρτήσεις
 * όπως pgTable, mysqlTable, κλπ.
 */
function getTablesFromSchema(): string[] {
  const tableFinder = (obj: Record<string, SchemaItem> | SchemaItem | unknown): string[] => {
    if (!obj || typeof obj !== 'object') return [];
    
    // Αναζήτηση για αντικείμενα που μοιάζουν με πίνακες Drizzle
    const tables: string[] = [];
    
    for (const key in obj as Record<string, SchemaItem>) {
      const value = (obj as Record<string, SchemaItem>)[key];
      
      // Έλεγχος αν είναι αντικείμενο
      if (value && typeof value === 'object') {
        // Έλεγχος αν έχει ιδιότητες που συνήθως έχουν οι πίνακες Drizzle
        if ('name' in value && typeof value.name === 'string') {
          // Βρέθηκε το όνομα του πίνακα
          tables.push(value.name);
        }
      }
    }
    
    return tables;
  };
  
  // Αναζήτηση σε όλα τα εξαγόμενα αντικείμενα του schema
  return tableFinder(schema);
}

async function verifySchema() {
  console.log('🔍 Έναρξη επαλήθευσης σχήματος βάσης δεδομένων...\n');

  try {
    // 1. Έλεγχος σύνδεσης με τη βάση
    console.log('🔄 Έλεγχος σύνδεσης με τη βάση δεδομένων...');
    await pgClient`SELECT 1`;
    console.log('✅ Σύνδεση επιτυχής\n');

    // 2. Λήψη λίστας πινάκων από τη βάση
    console.log('🔄 Λήψη λίστας πινάκων από τη βάση...');
    const dbTables = await pgClient`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const dbTableNames = dbTables.map(t => t.table_name as string);
    
    // 3. Λήψη λίστας πινάκων από τον κώδικα
    console.log('🔄 Λήψη λίστας πινάκων από τον κώδικα...');
    
    // Χειροκίνητη λίστα πινάκων για την περίπτωση που ο αυτόματος εντοπισμός αποτύχει
    const manualTableNames = [
      'blog_categories',
      'blog_posts',
      'blog_posts_to_categories',
      'certifications',
      'certifications_to_skills',
      'contact_messages',
      'crypto_projects',
      'newsletter_subscribers',
      'project_categories',
      'projects',
      'projects_to_categories',
      'skills',
      'user_profiles',
      'users'
    ];
    
    // Προσπάθεια αυτόματου εντοπισμού πινάκων
    const detectedTables = getTablesFromSchema();
    
    // Χρήση της χειροκίνητης λίστας αν ο αυτόματος εντοπισμός δεν βρήκε πίνακες
    const schemaTables = detectedTables.length > 0 ? detectedTables : manualTableNames;
    
    console.log(`Πίνακες στη βάση (${dbTableNames.length}): ${dbTableNames.join(', ')}`);
    console.log(`Πίνακες στον κώδικα (${schemaTables.length}): ${schemaTables.join(', ')}`);
    
    // 4. Σύγκριση πινάκων
    console.log('\n📊 Σύγκριση πινάκων:');
    
    // Πίνακες που υπάρχουν στη βάση αλλά όχι στον κώδικα
    const extraTablesInDb = dbTableNames.filter(table => !schemaTables.includes(table));
    
    // Πίνακες που υπάρχουν στον κώδικα αλλά όχι στη βάση
    const missingTablesInDb = schemaTables.filter(table => !dbTableNames.includes(table));
    
    if (extraTablesInDb.length > 0) {
      console.log('⚠️  Πίνακες που υπάρχουν στη βάση αλλά όχι στον κώδικα:');
      extraTablesInDb.forEach(table => console.log(`   - ${table}`));
    }
    
    if (missingTablesInDb.length > 0) {
      console.log('❌ Πίνακες που υπάρχουν στον κώδικα αλλά λείπουν από τη βάση:');
      missingTablesInDb.forEach(table => console.log(`   - ${table}`));
    }
    
    if (extraTablesInDb.length === 0 && missingTablesInDb.length === 0) {
      console.log('✅ Όλοι οι πίνακες υπάρχουν και στη βάση και στον κώδικα\n');
    }
    
    // 5. Έλεγχος δομής πινάκων
    console.log('\n🔄 Έλεγχος δομής πινάκων...');
    
    // Για κάθε πίνακα που υπάρχει και στη βάση και στον κώδικα,
    // ελέγχουμε τις στήλες
    const commonTables = dbTableNames.filter(table => schemaTables.includes(table));
    
    for (const table of commonTables) {
      // Λήψη στηλών από τη βάση
      const dbColumns = await pgClient`
        SELECT 
          column_name, 
          data_type,
          is_nullable
        FROM 
          information_schema.columns 
        WHERE 
          table_schema = 'public' AND 
          table_name = ${table}
      `;
      
      console.log(`\n📋 Πίνακας: ${table}`);
      console.log(`   Στήλες: ${dbColumns.length}`);
      
      // Έλεγχος primary key
      const primaryKeys = await pgClient`
        SELECT 
          kcu.column_name
        FROM 
          information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE 
          tc.constraint_type = 'PRIMARY KEY' AND
          tc.table_schema = 'public' AND
          tc.table_name = ${table}
      `;
      
      if (primaryKeys.length > 0) {
        console.log(`   Primary Key: ${primaryKeys.map(pk => pk.column_name).join(', ')}`);
      } else {
        console.log(`   ⚠️ Δεν βρέθηκε Primary Key!`);
      }
      
      // Έλεγχος foreign keys
      const foreignKeys = await pgClient`
        SELECT 
          kcu.column_name,
          ccu.table_name as referenced_table,
          ccu.column_name as referenced_column
        FROM 
          information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE 
          tc.constraint_type = 'FOREIGN KEY' AND
          tc.table_schema = 'public' AND
          tc.table_name = ${table}
      `;
      
      if (foreignKeys.length > 0) {
        console.log(`   Foreign Keys:`);
        foreignKeys.forEach(fk => {
          console.log(`     - ${fk.column_name} -> ${fk.referenced_table}.${fk.referenced_column}`);
        });
      }
    }
    
    console.log('\n✅ Επαλήθευση σχήματος ολοκληρώθηκε');
    
  } catch (error) {
    console.error('❌ Σφάλμα κατά την επαλήθευση σχήματος:', error);
    process.exit(1);
  } finally {
    // Κλείσιμο σύνδεσης
    await pgClient.end();
  }
}

// Εκτέλεση της επαλήθευσης
verifySchema();