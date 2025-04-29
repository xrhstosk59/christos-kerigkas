// scripts/migrate-posts-to-supabase.ts
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Φορτώνουμε τις περιβαλλοντικές μεταβλητές
config({ path: '.env.local' });

// Τύπος για το JSON του blog post
interface BlogPostJSON {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  author: {
    name: string;
    image: string;
  };
  categories: string[];
  content: string;
}

// Τύπος για το post στο Supabase
interface SupabaseBlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  author_name: string;
  author_image: string;
  categories: string[];
  content: string;
}

// Διαμόρφωση Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Λείπουν οι απαραίτητες μεταβλητές περιβάλλοντος για το Supabase');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Διαδρομή προς τα JSON αρχεία
const postsDirectory = path.join(process.cwd(), 'src/content/posts');

async function migratePostsToSupabase(): Promise<void> {
  try {
    // Διάβασε όλα τα JSON αρχεία
    const files = fs.readdirSync(postsDirectory);
    console.log(`Βρέθηκαν ${files.length} αρχεία για μεταφορά.`);

    for (const filename of files) {
      if (!filename.endsWith('.json')) continue;
      
      const filePath = path.join(postsDirectory, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const post = JSON.parse(fileContent) as BlogPostJSON;
      
      // Μετατροπή σε δομή πίνακα Supabase
      const supabasePost: SupabaseBlogPost = {
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        image: post.image,
        author_name: post.author.name,
        author_image: post.author.image,
        categories: post.categories,
        content: post.content,
      };
      
      // Έλεγχος αν υπάρχει ήδη το post
      const { data: existingPost, error: fetchError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', post.slug)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`Σφάλμα κατά την αναζήτηση του post ${post.slug}:`, fetchError);
        continue;
      }
      
      if (existingPost) {
        // Ενημέρωση του post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(supabasePost)
          .eq('id', existingPost.id);
        
        if (updateError) {
          console.error(`Σφάλμα κατά την ενημέρωση του post ${post.slug}:`, updateError);
        } else {
          console.log(`Επιτυχής ενημέρωση του post: ${post.title}`);
        }
      } else {
        // Προσθήκη νέου post
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert(supabasePost);
        
        if (insertError) {
          console.error(`Σφάλμα κατά την προσθήκη του post ${post.slug}:`, insertError);
        } else {
          console.log(`Επιτυχής προσθήκη του post: ${post.title}`);
        }
      }
    }
    
    console.log('Η μεταφορά των posts ολοκληρώθηκε.');
  } catch (error) {
    console.error('Σφάλμα κατά τη μεταφορά των posts:', error);
    process.exit(1);
  }
}

// Εκτέλεση της μεταφοράς
migratePostsToSupabase();