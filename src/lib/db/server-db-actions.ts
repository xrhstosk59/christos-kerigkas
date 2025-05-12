'use server';

// src/lib/db/server-db-actions.ts
import { sql } from 'drizzle-orm';
import { checkDatabaseConnection, getDbClient, getAdminDbClient, ensureDatabaseConnection } from './server-db';
// Αφαιρούμε την αχρησιμοποίητη εισαγωγή του schema
// import * as schema from './schema';

// Εξάγουμε βασικές συναρτήσεις για χρήση σε server actions
export { checkDatabaseConnection, ensureDatabaseConnection };

// Ασύγχρονη συνάρτηση για εκτέλεση SQL ερωτημάτων
export async function executeSQL<T = unknown>(query: string): Promise<T[]> {
  const db = await getDbClient(); // Προσθέτουμε await
  return await db.execute(sql.raw(query)) as T[];
}

// Ασύγχρονη συνάρτηση για εκτέλεση SQL ερωτημάτων με admin δικαιώματα
export async function executeAdminSQL<T = unknown>(query: string): Promise<T[]> {
  const db = await getAdminDbClient(); // Προσθέτουμε await
  return await db.execute(sql.raw(query)) as T[];
}

// Ασύγχρονη συνάρτηση για έλεγχο της σύνδεσης με τη βάση δεδομένων
export async function testConnection(): Promise<{ status: string; details?: string }> {
  const result = await checkDatabaseConnection();
  return {
    status: result.connected ? 'success' : 'error',
    details: result.message
  };
}

// -------------------------------------------------------------------------
// Απλοποιημένες server actions που χρησιμοποιούν απευθείας SQL αντί για ORM
// -------------------------------------------------------------------------

/**
 * Γενική συνάρτηση για επιλογή δεδομένων από πίνακα με δυναμικά WHERE conditions
 */
export async function selectFromTable<T = unknown>(
  tableName: string, 
  conditions?: Record<string, unknown>, 
  limit?: number
): Promise<T[]> {
  const db = await getDbClient(); // Προσθέτουμε await
  
  try {
    // Βασικό query
    let query = `SELECT * FROM ${tableName}`;
    const params: unknown[] = [];
    
    // Προσθήκη WHERE conditions αν υπάρχουν
    if (conditions && Object.keys(conditions).length > 0) {
      const conditionStrings = Object.entries(conditions).map(([key], index) => {
        params.push(Object.values(conditions)[index]);
        return `${key} = $${index + 1}`;
      });
      
      // Προσθήκη των conditions στο query
      query += ` WHERE ${conditionStrings.join(' AND ')}`;
    }
    
    // Προσθήκη LIMIT αν υπάρχει
    if (limit && limit > 0) {
      query += ` LIMIT ${limit}`;
    }
    
    // Εκτέλεση του query με τις παραμέτρους
    // Διορθώνουμε τη χρήση του spread operator για τα params
    const sqlQuery = sql.raw(query);
    // Εφαρμόζουμε κάθε παράμετρο ξεχωριστά
    const result = await db.execute(applyParamsToQuery(sqlQuery, params));
    return result as T[];
  } catch (error) {
    console.error(`Error in selectFromTable for table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Γενική συνάρτηση για εισαγωγή δεδομένων σε πίνακα
 */
export async function insertIntoTable<T = unknown>(
  tableName: string, 
  data: Record<string, unknown>
): Promise<T> {
  const db = await getDbClient(); // Προσθέτουμε await
  
  try {
    const columns = Object.keys(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(data);
    
    // Δημιουργία του query INSERT
    const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    // Εκτέλεση του query
    // Διορθώνουμε τη χρήση του spread operator για τα values
    const sqlQuery = sql.raw(query);
    // Εφαρμόζουμε κάθε παράμετρο ξεχωριστά
    const results = await db.execute(applyParamsToQuery(sqlQuery, values));
    return (results[0] || null) as T;
  } catch (error) {
    console.error(`Error in insertIntoTable for table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Γενική συνάρτηση για ενημέρωση δεδομένων σε πίνακα
 */
export async function updateTable<T = unknown>(
  tableName: string,
  conditions: Record<string, unknown>,
  data: Record<string, unknown>
): Promise<T[]> {
  const db = await getDbClient(); // Προσθέτουμε await
  
  try {
    const updateColumns = Object.keys(data);
    let paramIndex = 1;
    
    // Δημιουργία του SET μέρους του query
    const setClause = updateColumns
      .map(col => {
        const result = `${col} = $${paramIndex}`;
        paramIndex++;
        return result;
      })
      .join(', ');
    
    // Δημιουργία του WHERE μέρους του query
    const whereColumns = Object.keys(conditions);
    const whereClause = whereColumns
      .map(col => {
        const result = `${col} = $${paramIndex}`;
        paramIndex++;
        return result;
      })
      .join(' AND ');
    
    // Συνδυασμός όλων των παραμέτρων
    const params = [...Object.values(data), ...Object.values(conditions)];
    
    // Δημιουργία του πλήρους query
    const query = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *
    `;
    
    // Εκτέλεση του query
    // Διορθώνουμε τη χρήση του spread operator για τα params
    const sqlQuery = sql.raw(query);
    // Εφαρμόζουμε κάθε παράμετρο ξεχωριστά
    const results = await db.execute(applyParamsToQuery(sqlQuery, params));
    return results as T[];
  } catch (error) {
    console.error(`Error in updateTable for table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Γενική συνάρτηση για διαγραφή δεδομένων από πίνακα
 */
export async function deleteFromTable(
  tableName: string,
  conditions: Record<string, unknown>
): Promise<void> {
  const db = await getDbClient(); // Προσθέτουμε await
  
  try {
    const whereColumns = Object.keys(conditions);
    const whereClause = whereColumns
      .map((col, index) => `${col} = $${index + 1}`)
      .join(' AND ');
    
    const params = Object.values(conditions);
    
    // Δημιουργία του query DELETE
    const query = `
      DELETE FROM ${tableName}
      WHERE ${whereClause}
    `;
    
    // Εκτέλεση του query
    // Διορθώνουμε τη χρήση του spread operator για τα params
    const sqlQuery = sql.raw(query);
    // Εφαρμόζουμε κάθε παράμετρο ξεχωριστά
    await db.execute(applyParamsToQuery(sqlQuery, params));
  } catch (error) {
    console.error(`Error in deleteFromTable for table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Βοηθητική συνάρτηση για την εφαρμογή παραμέτρων σε ένα SQL query
 * Αυτή η προσέγγιση αποφεύγει τη χρήση του spread operator σε πίνακες άγνωστου μεγέθους
 */
function applyParamsToQuery(query: ReturnType<typeof sql.raw>, params: unknown[]): ReturnType<typeof sql.raw> {
  // Εφαρμόζουμε κάθε παράμετρο ως ξεχωριστό όρισμα
  let result = query;
  for (const param of params) {
    result = sql`${result} ${param}`;
  }
  return result;
}