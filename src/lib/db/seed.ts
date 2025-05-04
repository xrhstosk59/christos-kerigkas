// src/lib/db/seed.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import * as schema from './schema';

// Φόρτωση μεταβλητών περιβάλλοντος
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Ρύθμιση του postgres client για το seeding
const seedClient = postgres(connectionString, { 
  max: 1,
  onnotice: () => {}, // Καταστέλλει τα notice messages
  ssl: { 
    rejectUnauthorized: false // Επιτρέπει self-signed πιστοποιητικά
  }
});

// Δημιουργία του drizzle instance
const db = drizzle(seedClient, { schema });

async function seed() {
  console.log('Seeding database...');
  
  // Πρώτα: Έλεγχος της δομής του πίνακα blog_posts
  try {
    console.log('Checking database structure...');
    const tableInfo = await seedClient`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'blog_posts'
    `;
    console.log('Blog posts table structure:', tableInfo);
    
    // Καταγραφή των ονομάτων των στηλών για εύκολη αναφορά
    const columnNames = tableInfo.map((row) => row.column_name as string);
    console.log('Available columns:', columnNames.join(', '));
    
    // Έλεγχος περιορισμών πίνακα
    const constraints = await seedClient`
      SELECT 
          tc.constraint_name, 
          tc.constraint_type, 
          kcu.column_name
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
      WHERE 
          tc.table_name = 'blog_posts'
    `;
    console.log('Blog posts table constraints:', constraints);
  } catch (error) {
    console.error('Error checking database structure:', error);
  }
  
  // Seed blog posts - Ασφαλής έκδοση με έλεγχο πριν την εισαγωγή
  try {
    // Μετατροπή των ημερομηνιών σε ISO string για συμβατότητα με το πεδίο text
    const firstPostDate = new Date('2024-01-23').toISOString();
    const secondPostDate = new Date('2024-01-25').toISOString();
    
    // Έλεγχος αν υπάρχει ήδη το πρώτο blog post
    const existingFirstPost = await seedClient`
      SELECT id FROM blog_posts WHERE slug = 'getting-started-with-nextjs'
    `;
    
    if (existingFirstPost.length === 0) {
      // Εισαγωγή του πρώτου blog post αν δεν υπάρχει
      await seedClient`
        INSERT INTO blog_posts (
          slug, title, description, date, image, 
          author_name, author_image, categories, content,
          created_at, updated_at
        ) 
        VALUES (
          'getting-started-with-nextjs',
          'Getting Started with Next.js and TypeScript',
          'Learn how to build modern web applications using Next.js 13+ with TypeScript and best practices for performance and SEO.',
          ${firstPostDate},
          '/blog/nextjs-typescript.jpg',
          'Christos Kerigkas',
          '/profile.jpg',
          ${['Next.js', 'TypeScript', 'Web Development']}::text[],
          'Introduction\n\nNext.js has become one of the most popular frameworks for building modern web applications...\n\nWhy Next.js?\n\nNext.js provides an excellent developer experience with features like...\n\nGetting Started\n\nFirst, create a new Next.js project with TypeScript support...',
          NOW(),
          NOW()
        )
      `;
      console.log('Inserted blog post: Getting Started with Next.js and TypeScript');
    } else {
      console.log('Blog post "Getting Started with Next.js and TypeScript" already exists.');
    }
    
    // Έλεγχος αν υπάρχει ήδη το δεύτερο blog post
    const existingSecondPost = await seedClient`
      SELECT id FROM blog_posts WHERE slug = 'crypto-trading-basics'
    `;
    
    if (existingSecondPost.length === 0) {
      // Εισαγωγή του δεύτερου blog post αν δεν υπάρχει
      await seedClient`
        INSERT INTO blog_posts (
          slug, title, description, date, image, 
          author_name, author_image, categories, content,
          created_at, updated_at
        ) 
        VALUES (
          'crypto-trading-basics',
          'Getting Started with Cryptocurrency Trading: A Developer''s Perspective',
          'Learn the fundamentals of crypto trading through a technical lens, including API integrations, data analysis, and automated trading strategies.',
          ${secondPostDate},
          '/blog/crypto-trading.jpg',
          'Christos Kerigkas',
          '/profile.jpg',
          ${['Cryptocurrency', 'Trading', 'Programming', 'Data Analysis']}::text[],
          'Introduction\n\nAs a developer venturing into cryptocurrency trading, understanding both technical analysis and programmatic approaches is crucial...',
          NOW(),
          NOW()
        )
      `;
      console.log('Inserted blog post: Getting Started with Cryptocurrency Trading: A Developer\'s Perspective');
    } else {
      console.log('Blog post "Getting Started with Cryptocurrency Trading: A Developer\'s Perspective" already exists.');
    }
    
  } catch (error) {
    console.error('Failed to insert blog posts:', error);
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
  
  for (const category of categories) {
    try {
      await db.insert(schema.blogCategories).values(category).onConflictDoNothing();
      console.log(`Added category ${category.name}`);
    } catch (error) {
      console.error(`Failed to insert category ${category.name}:`, error);
    }
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
  
  for (const skill of skills) {
    try {
      await db.insert(schema.skills)
        .values(skill)
        .onConflictDoNothing();
      console.log(`Added skill ${skill.name}`);
    } catch (error) {
      console.error(`Failed to insert skill ${skill.name}:`, error);
    }
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
  
  for (const category of projectCategories) {
    try {
      await db.insert(schema.projectCategories).values(category).onConflictDoNothing();
      console.log(`Added project category ${category.name}`);
    } catch (error) {
      console.error(`Failed to insert project category ${category.name}:`, error);
    }
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

export { seed };