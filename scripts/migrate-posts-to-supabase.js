// scripts/migrate-posts-to-supabase.js
require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Διαμόρφωση Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Διαδρομή προς τα JSON αρχεία
const postsDirectory = path.join(process.cwd(), 'src/content/posts')

async function migratePostsToSupabase() {
  try {
    // Διάβασε όλα τα JSON αρχεία
    const files = fs.readdirSync(postsDirectory)
    console.log(`Βρέθηκαν ${files.length} αρχεία για μεταφορά.`)

    for (const filename of files) {
      if (!filename.endsWith('.json')) continue
      
      const filePath = path.join(postsDirectory, filename)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const post = JSON.parse(fileContent)
      
      // Μετατροπή σε δομή πίνακα Supabase
      const supabasePost = {
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        image: post.image,
        author_name: post.author.name,
        author_image: post.author.image,
        categories: post.categories,
        content: post.content,
      }
      
      // Έλεγχος αν υπάρχει ήδη το post
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', post.slug)
        .single()
      
      if (existingPost) {
        // Ενημέρωση του post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(supabasePost)
          .eq('id', existingPost.id)
        
        if (updateError) {
          console.error(`Σφάλμα κατά την ενημέρωση του post ${post.slug}:`, updateError)
        } else {
          console.log(`Επιτυχής ενημέρωση του post: ${post.title}`)
        }
      } else {
        // Προσθήκη νέου post
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert(supabasePost)
        
        if (insertError) {
          console.error(`Σφάλμα κατά την προσθήκη του post ${post.slug}:`, insertError)
        } else {
          console.log(`Επιτυχής προσθήκη του post: ${post.title}`)
        }
      }
    }
    
    console.log('Η μεταφορά των posts ολοκληρώθηκε.')
  } catch (error) {
    console.error('Σφάλμα κατά τη μεταφορά των posts:', error)
  }
}

// Εκτέλεση της μεταφοράς
migratePostsToSupabase()