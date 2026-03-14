import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials for database health check.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

try {
  const startTime = Date.now();
  const { error, count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw error;
  }

  const duration = Date.now() - startTime;
  console.log(`Database health check passed in ${duration}ms. projects count: ${count ?? 0}`);
} catch (error) {
  console.error('Database health check failed:', error);
  process.exit(1);
}
