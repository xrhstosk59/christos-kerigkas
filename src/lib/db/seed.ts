// src/lib/db/seed.ts
import { db } from './index'
import * as schema from './schema'

async function seed() {
  console.log('Seeding database...')
  
  // Seed blog posts
  const blogPosts = [
    {
      slug: 'getting-started-with-nextjs',
      title: 'Getting Started with Next.js and TypeScript',
      description: 'Learn how to build modern web applications using Next.js 13+ with TypeScript and best practices for performance and SEO.',
      date: new Date('2024-01-23'),
      image: '/blog/nextjs-typescript.jpg',
      authorName: 'Christos Kerigkas',
      authorImage: '/profile.jpg',
      categories: ['Next.js', 'TypeScript', 'Web Development'],
      content: '## Introduction\n\nNext.js has become one of the most popular frameworks for building modern web applications...\n\n## Why Next.js?\n\nNext.js provides an excellent developer experience with features like...\n\n## Getting Started\n\nFirst, create a new Next.js project with TypeScript support...'
    },
    {
      slug: 'crypto-trading-basics',
      title: 'Getting Started with Cryptocurrency Trading: A Developer\'s Perspective',
      description: 'Learn the fundamentals of crypto trading through a technical lens, including API integrations, data analysis, and automated trading strategies.',
      date: new Date('2024-01-25'),
      image: '/blog/crypto-trading.jpg',
      authorName: 'Christos Kerigkas',
      authorImage: '/profile.jpg',
      categories: ['Cryptocurrency', 'Trading', 'Programming', 'Data Analysis'],
      content: '## Introduction\n\nAs a developer venturing into cryptocurrency trading, understanding both technical analysis and programmatic approaches is crucial...'
    }
  ]
  
  for (const post of blogPosts) {
    try {
      await db.insert(schema.blogPosts)
        .values(post)
        .onConflictDoNothing();
      console.log(`Inserted blog post: ${post.title}`)
    } catch (error) {
      console.error(`Failed to insert post ${post.title}:`, error);
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
  ]
  
  for (const skill of skills) {
    try {
      await db.insert(schema.skills)
        .values(skill)
        .onConflictDoNothing();
    } catch (error) {
      console.error(`Failed to insert skill ${skill.name}:`, error);
    }
  }
  
  console.log('Database seeding completed!')
}

// Εκτέλεση του seed αν αυτό το αρχείο εκτελεστεί απευθείας
if (require.main === module) {
  seed().catch(console.error).finally(() => process.exit(0));
}

export { seed };