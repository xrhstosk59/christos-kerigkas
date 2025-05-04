// src/lib/db/migrations.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Φόρτωση μεταβλητών περιβάλλοντος
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Διαδρομή προς τον φάκελο migrations
const migrationsFolder = path.join(process.cwd(), 'drizzle');

// Δημιουργία του φακέλου migrations αν δεν υπάρχει
if (!fs.existsSync(migrationsFolder)) {
  fs.mkdirSync(migrationsFolder, { recursive: true });
  console.log(`Created migrations folder at ${migrationsFolder}`);
}

// Ρύθμιση του postgres client για migrations με βελτιωμένες παραμέτρους
const migrationClient = postgres(connectionString, { 
  max: 1,
  onnotice: () => {}, // Καταστέλλει τα notice messages
  ssl: { 
    rejectUnauthorized: false // Επιτρέπει self-signed πιστοποιητικά
  }, 
  connect_timeout: 30, // Αύξηση του timeout
});

async function runMigrations() {
  try {
    console.log(`Running migrations from ${migrationsFolder}...`);
    
    // Εκτέλεση των migrations
    await migrate(drizzle(migrationClient), { migrationsFolder });
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    // Αγνοούμε σφάλματα για πίνακες που υπάρχουν ήδη
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('Tables already exist, continuing...');
    } else {
      console.error('Migration failed:', error);
      throw error;
    }
  } finally {
    await migrationClient.end();
  }
}

// Seed function for database
import { db } from './index';
import * as schema from './schema';

async function seed() {
  console.log('Seeding database...');
  
  // Seed blog categories
  const categories = [
    { name: 'Next.js', slug: 'nextjs', description: 'Posts about Next.js framework' },
    { name: 'TypeScript', slug: 'typescript', description: 'Posts about TypeScript language' },
    { name: 'Web Development', slug: 'web-development', description: 'General web development topics' },
    { name: 'Cryptocurrency', slug: 'cryptocurrency', description: 'Posts about cryptocurrency' },
    { name: 'Trading', slug: 'trading', description: 'Posts about trading strategies' },
  ];
  
  for (const category of categories) {
    try {
      await db.insert(schema.blogCategories).values(category).onConflictDoNothing();
      console.log(`Added category ${category.name}`);
    } catch (error) {
      console.error(`Failed to insert category ${category.name}:`, error);
    }
  }
  console.log('Categories seeded');
  
  // Seed skills
  const skills = [
    { name: 'React', category: 'frontend' },
    { name: 'Next.js', category: 'frontend' },
    { name: 'TypeScript', category: 'frontend' },
    { name: 'JavaScript', category: 'frontend' },
    { name: 'Tailwind CSS', category: 'frontend' },
    { name: 'HTML5/CSS3', category: 'frontend' },
    { name: 'Node.js', category: 'backend' },
    { name: 'Python', category: 'backend' },
    { name: 'PostgreSQL', category: 'backend' },
    { name: 'MongoDB', category: 'backend' },
    { name: 'Supabase', category: 'backend' },
    { name: 'Drizzle ORM', category: 'backend' },
    { name: 'Git', category: 'tools' },
    { name: 'VS Code', category: 'tools' },
    { name: 'Docker', category: 'tools' },
    { name: 'REST APIs', category: 'tools' },
    { name: 'Telegram Bot API', category: 'tools' },
    { name: 'Technical Analysis', category: 'trading' },
    { name: 'Bot Development', category: 'trading' },
    { name: 'Data Mining', category: 'trading' },
    { name: 'Machine Learning', category: 'trading' },
  ];
  
  for (const skill of skills) {
    try {
      await db.insert(schema.skills).values(skill).onConflictDoNothing();
      console.log(`Added skill ${skill.name}`);
    } catch (error) {
      console.error(`Failed to insert skill ${skill.name}:`, error);
    }
  }
  console.log('Skills seeded');
  
  // Seed project categories
  const projectCategories = [
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Mobile', slug: 'mobile' },
    { name: 'Crypto', slug: 'crypto' },
    { name: 'Education', slug: 'education' },
    { name: 'Data Analysis', slug: 'data-analysis' },
    { name: 'Real Estate', slug: 'real-estate' },
    { name: 'Portfolio', slug: 'portfolio' },
  ];
  
  for (const category of projectCategories) {
    try {
      await db.insert(schema.projectCategories).values(category).onConflictDoNothing();
      console.log(`Added project category ${category.name}`);
    } catch (error) {
      console.error(`Failed to insert project category ${category.name}:`, error);
    }
  }
  console.log('Project categories seeded');
  
  console.log('Database seeding completed!');
}

// Εκτέλεση του migrate και μετά του seed αν κληθεί άμεσα
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'seed') {
    seed().catch(console.error).finally(() => process.exit(0));
  } else {
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
}

export { runMigrations, seed };