// src/lib/db/seed.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

// Φόρτωση μεταβλητών περιβάλλοντος
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

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Ρύθμιση του postgres client για το seeding
const seedClient = postgres(connectionString, { 
  max: 10,
  idle_timeout: 20,
  prepare: false, // Απενεργοποίηση prepared statements για συμβατότητα με Supabase
  ssl: { 
    rejectUnauthorized: false // Επιτρέπει self-signed πιστοποιητικά
  },
  connect_timeout: 30,
});

// Δημιουργία του drizzle instance
const db = drizzle(seedClient, { schema });

export async function seed() {
  console.log('Seeding database...');
  
  try {
    // Έλεγχος της βάσης δεδομένων
    const tablesCheck = await seedClient`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Διαθέσιμοι πίνακες στη βάση:', tablesCheck.map(t => t.table_name).join(', '));
  } catch (error) {
    console.error('Σφάλμα κατά τον έλεγχο της βάσης δεδομένων:', error);
  }
  
  // Seed blog categories
  const categories = [
    { name: 'Next.js', slug: 'nextjs', description: 'Posts about Next.js framework' },
    { name: 'TypeScript', slug: 'typescript', description: 'Posts about TypeScript language' },
    { name: 'Web Development', slug: 'web-development', description: 'General web development topics' },
    { name: 'Cryptocurrency', slug: 'cryptocurrency', description: 'Posts about cryptocurrency' },
    { name: 'Trading', slug: 'trading', description: 'Posts about trading strategies' },
    { name: 'Programming', slug: 'programming', description: 'General programming topics' },
    { name: 'Data Analysis', slug: 'data-analysis', description: 'Data analytics and visualization' }
  ];
  
  try {
    // Χρησιμοποιούμε το schema.blogCategories που προσθέσαμε στο blog.ts
    for (const category of categories) {
      await db.insert(schema.blogCategories)
        .values(category)
        .onConflictDoNothing();
      console.log(`Added category ${category.name}`);
    }
    console.log('Blog categories seeded successfully.');
  } catch (error) {
    console.error('Failed to seed blog categories:', error);
  }
  
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
  
  try {
    for (const skill of skills) {
      await db.insert(schema.skills)
        .values(skill)
        .onConflictDoNothing();
      console.log(`Added skill ${skill.name}`);
    }
    console.log('Skills seeded successfully.');
  } catch (error) {
    console.error('Failed to seed skills:', error);
  }
  
  // Seed project categories
  const projectCategories = [
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Mobile', slug: 'mobile' },
    { name: 'Crypto', slug: 'crypto' },
    { name: 'Education', slug: 'education' },
    { name: 'Data Analysis', slug: 'data-analysis' },
    { name: 'Real Estate', slug: 'real-estate' },
    { name: 'Portfolio', slug: 'portfolio' }
  ];
  
  try {
    for (const category of projectCategories) {
      await db.insert(schema.projectCategories)
        .values(category)
        .onConflictDoNothing();
      console.log(`Added project category ${category.name}`);
    }
    console.log('Project categories seeded successfully.');
  } catch (error) {
    console.error('Failed to seed project categories:', error);
  }
  
  // Seed blog posts - χρησιμοποιούμε τη γενική προσέγγιση
  try {
    // Έλεγχος αν υπάρχει ο πίνακας blog_posts
    const blogPostsTable = await seedClient`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_posts'
      )
    `;
    
    if (blogPostsTable[0].exists) {
      // Πρώτα ελέγχουμε αν υπάρχουν ήδη εγγραφές
      const existingPosts = await db.select({ count: sql`count(*)` })
        .from(schema.blogPosts);
      
      if (existingPosts[0].count === 0) {
        // Μετατροπή string ημερομηνιών σε Date objects για συμβατότητα με το schema
        const firstPost = {
          slug: 'getting-started-with-nextjs',
          title: 'Getting Started with Next.js and TypeScript',
          description: 'Learn how to build modern web applications using Next.js 13+ with TypeScript and best practices for performance and SEO.',
          date: new Date('2024-01-23'), // Χρήση Date object αντί για string
          image: '/blog/nextjs-typescript.jpg',
          authorName: 'Christos Kerigkas',
          authorImage: '/profile.jpg',
          categories: ['Next.js', 'TypeScript', 'Web Development'],
          content: 'Introduction\n\nNext.js has become one of the most popular frameworks for building modern web applications...\n\nWhy Next.js?\n\nNext.js provides an excellent developer experience with features like...\n\nGetting Started\n\nFirst, create a new Next.js project with TypeScript support...'
        };
        
        const secondPost = {
          slug: 'crypto-trading-basics',
          title: 'Getting Started with Cryptocurrency Trading: A Developer\'s Perspective',
          description: 'Learn the fundamentals of crypto trading through a technical lens, including API integrations, data analysis, and automated trading strategies.',
          date: new Date('2024-01-25'), // Χρήση Date object αντί για string
          image: '/blog/crypto-trading.jpg',
          authorName: 'Christos Kerigkas',
          authorImage: '/profile.jpg',
          categories: ['Cryptocurrency', 'Trading', 'Programming', 'Data Analysis'],
          content: 'Introduction\n\nAs a developer venturing into cryptocurrency trading, understanding both technical analysis and programmatic approaches is crucial...'
        };
        
        // Χρησιμοποιούμε το Drizzle API για την εισαγωγή των blog posts
        await db.insert(schema.blogPosts).values([firstPost]);
        console.log(`Added blog post: ${firstPost.title}`);
        
        await db.insert(schema.blogPosts).values([secondPost]);
        console.log(`Added blog post: ${secondPost.title}`);
        
        console.log('Blog posts seeded successfully.');
      } else {
        console.log('Blog posts already exist, skipping seeding.');
      }
    } else {
      console.log('Blog posts table does not exist, skipping seeding.');
    }
  } catch (error) {
    console.error('Error while seeding blog posts:', error);
  }
  
  console.log('Database seeding completed!');
  
  // Κλείσιμο της σύνδεσης
  await seedClient.end();
}

// Εκτέλεση του seed αν αυτό το αρχείο εκτελεστεί απευθείας
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

// Δεν χρειάζεται επιπλέον export, η συνάρτηση seed ήδη εξάγεται παραπάνω