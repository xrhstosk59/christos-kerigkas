// src/lib/db/seed.ts
// DISABLED: This file needs to be rewritten for Supabase
// The seeding functionality should be handled through Supabase SQL scripts or migrations
// See docs: https://supabase.com/docs/guides/database/migrations

export async function seed() {
  console.warn('Seeding is currently disabled. Please use Supabase migrations instead.');
  console.log('To seed your database, create SQL migration files in supabase/migrations/');
}

// Εκτέλεση του seed αν αυτό το αρχείο εκτελεστεί απευθείας
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding skipped - use Supabase migrations.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding skipped:', error);
      process.exit(1);
    });
}
