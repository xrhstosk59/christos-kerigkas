// scripts/apply-rls-policies-fixed.ts
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Φόρτωση μεταβλητών περιβάλλοντος
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Έλεγχος απαραίτητων μεταβλητών περιβάλλοντος
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Δημιουργία Supabase client με service role key για πλήρη πρόσβαση
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

// Λίστα των πινάκων που θέλουμε να ελέγξουμε αν υπάρχουν
const targetTables = ['blog_posts', 'certifications', 'contact_messages'];

// Τύπος για τις πολιτικές
interface Policy {
  name: string;
  action: string;
  type: 'using' | 'check';
  expression: string;
}

// Οι πολιτικές που θα εφαρμοστούν σε κάθε πίνακα
const tablePolicies: Record<string, Policy[]> = {
  'blog_posts': [
    { 
      name: "Blog posts are viewable by everyone",
      action: "SELECT",
      type: "using",
      expression: "true"
    },
    { 
      name: "Blog posts are insertable by admins",
      action: "INSERT",
      type: "check",
      expression: "auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'"
    },
    { 
      name: "Blog posts are updatable by admins",
      action: "UPDATE",
      type: "using",
      expression: "auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'"
    },
    { 
      name: "Blog posts are deletable by admins",
      action: "DELETE",
      type: "using",
      expression: "auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'"
    }
  ],
  'certifications': [
    { 
      name: "Certifications are viewable by everyone",
      action: "SELECT",
      type: "using",
      expression: "true"
    },
    { 
      name: "Certifications are insertable by admins",
      action: "INSERT",
      type: "check",
      expression: "auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'"
    },
    { 
      name: "Certifications are updatable by admins",
      action: "UPDATE",
      type: "using",
      expression: "auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'"
    },
    { 
      name: "Certifications are deletable by admins",
      action: "DELETE",
      type: "using",
      expression: "auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'"
    }
  ],
  'contact_messages': [
    { 
      name: "Contact messages can be created by anyone",
      action: "INSERT",
      type: "check",
      expression: "true"
    },
    { 
      name: "Contact messages are viewable by admins",
      action: "SELECT",
      type: "using",
      expression: "auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'"
    },
    { 
      name: "Contact messages are editable by admins",
      action: "UPDATE",
      type: "using",
      expression: "auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'"
    },
    { 
      name: "Contact messages are deletable by admins",
      action: "DELETE",
      type: "using",
      expression: "auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'"
    }
  ],
};

async function getExistingTables(): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `
    });

    if (error) {
      console.error('Error fetching tables:', error);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      console.error('Unexpected response format from exec_sql:', data);
      return [];
    }

    console.log('Existing tables:', data);
    return data.map((row: Record<string, string>) => row.table_name);
  } catch (error) {
    console.error('Exception fetching tables:', error);
    return [];
  }
}

async function enableRlsForTable(tableName: string): Promise<boolean> {
  try {
    console.log(`Enabling RLS for table: ${tableName}`);
    
    const { error } = await supabase.rpc('exec_sql', {
      query: `ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;`
    });

    if (error) {
      console.error(`Error enabling RLS for ${tableName}:`, error);
      return false;
    }
    
    console.log(`✓ RLS enabled for ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Exception enabling RLS for ${tableName}:`, error);
    return false;
  }
}

async function createPolicyForTable(
  tableName: string, 
  policyName: string, 
  action: string, 
  type: 'using' | 'check', 
  expression: string
): Promise<boolean> {
  try {
    // Πρώτα διαγράφουμε την πολιτική αν υπάρχει ήδη για να αποφύγουμε conflicts
    await supabase.rpc('exec_sql', {
      query: `DROP POLICY IF EXISTS "${policyName}" ON "${tableName}";`
    });
    
    // Δημιουργία της πολιτικής με τη σωστή σύνταξη ανάλογα με τον τύπο
    const typeClause = type === 'using' ? 'USING' : 'WITH CHECK';
    
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        CREATE POLICY "${policyName}" 
        ON "${tableName}" FOR ${action} 
        ${typeClause} (${expression});
      `
    });

    if (error) {
      console.error(`Error creating policy "${policyName}" for ${tableName}:`, error);
      return false;
    }
    
    console.log(`✓ Policy "${policyName}" created for ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Exception creating policy "${policyName}" for ${tableName}:`, error);
    return false;
  }
}

async function applyRlsPoliciesFixed(): Promise<void> {
  try {
    console.log('🔒 Applying Row Level Security policies with fixed syntax...');

    // Λήψη των υπαρχόντων πινάκων
    const existingTables = await getExistingTables();
    
    // Διατρέχουμε τους πίνακες-στόχους και εφαρμόζουμε RLS μόνο για αυτούς που υπάρχουν
    for (const tableName of targetTables) {
      if (existingTables.includes(tableName)) {
        console.log(`\n📋 Processing table: ${tableName}`);
        
        // Ενεργοποίηση RLS
        const rlsEnabled = await enableRlsForTable(tableName);
        
        // Αν το RLS ενεργοποιήθηκε επιτυχώς, δημιουργούμε τις πολιτικές
        if (rlsEnabled && tablePolicies[tableName]) {
          // Εφαρμογή των πολιτικών για τον πίνακα
          for (const policy of tablePolicies[tableName]) {
            await createPolicyForTable(
              tableName,
              policy.name,
              policy.action,
              policy.type,
              policy.expression
            );
          }
        }
      } else {
        console.warn(`⚠️ Table "${tableName}" does not exist, skipping...`);
      }
    }

    console.log('\n✅ RLS policies have been applied successfully to existing tables!');
  } catch (error) {
    console.error('Failed to apply RLS policies:', error);
    process.exit(1);
  }
}

// Εκτέλεση της κύριας λειτουργίας
applyRlsPoliciesFixed().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});