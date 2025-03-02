// src/lib/blog.ts
import fs from 'fs/promises';
import path from 'path';
import type { BlogPost } from '@/types/blog';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export async function getAllPosts(): Promise<BlogPost[]> {
  const files = await fs.readdir(postsDirectory);
  
  const posts = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename);
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content) as BlogPost;
    })
  );

  // Sorting posts by date (newest first)
  return posts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(postsDirectory, `${slug}.json`);
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as BlogPost;
  } catch (error) {
    console.error('Error reading post:', error);
    return null;
  }
}

export async function getRelatedPosts(currentPost: BlogPost, limit = 3): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  
  return allPosts
    .filter(post => 
      post.slug !== currentPost.slug && 
      post.categories.some(category => 
        currentPost.categories.includes(category)
      )
    )
    .slice(0, limit);
}