'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { blogService } from '@/domains/blog/services'
import { NewBlogPost } from '@/domains/blog/models'
import { logger } from '@/lib/utils/logger'
import { Role } from '@/lib/auth/access-control'
import { supabaseServer } from '@/lib/supabase/server'

// Post validation schema για δημιουργία/ενημέρωση
const postSchema = z.object({
  slug: z.string().min(1, 'Το slug είναι υποχρεωτικό')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Το slug πρέπει να περιέχει μόνο πεζά γράμματα, αριθμούς και παύλες'),
  title: z.string().min(1, 'Ο τίτλος είναι υποχρεωτικός').max(100, 'Ο τίτλος είναι πολύ μεγάλος'),
  description: z.string().min(1, 'Η περιγραφή είναι υποχρεωτική').max(300, 'Η περιγραφή είναι πολύ μεγάλη'),
  date: z.string().datetime({ message: 'Μη έγκυρη μορφή ημερομηνίας' }),
  image: z.string().url({ message: 'Η εικόνα πρέπει να είναι έγκυρο URL' }),
  author: z.object({
    name: z.string().min(1, 'Το όνομα του συντάκτη είναι υποχρεωτικό'),
    image: z.string().url({ message: 'Η εικόνα του συντάκτη πρέπει να είναι έγκυρο URL' }),
  }),
  categories: z.array(z.string()).min(1, 'Επιλέξτε τουλάχιστον μία κατηγορία'),
  content: z.string().min(1, 'Το περιεχόμενο είναι υποχρεωτικό'),
})

// Τύπος για τα αποτελέσματα των actions
type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action για τη δημιουργία νέου blog post
 */
export async function createBlogPost(formData: FormData): Promise<ActionResult> {
  try {
    // Λήψη του τρέχοντος χρήστη με το νέο σύστημα
    const { user, role } = await supabaseServer.auth.getUserWithRole()
    
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένοι' }
    }
    
    // Μετατροπή του FormData σε αντικείμενο
    const rawData = {
      slug: formData.get('slug') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      image: formData.get('image') as string,
      author: {
        name: formData.get('authorName') as string,
        image: formData.get('authorImage') as string,
      },
      categories: JSON.parse(formData.get('categories') as string),
      content: formData.get('content') as string,
    }
    
    // Επικύρωση δεδομένων
    const validationResult = postSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.message }
    }
    
    const postData = validationResult.data
    logger.info(`Δημιουργία νέου blog post: ${postData.title}`, null, 'action-blog-create')
    
    // Μετατροπή του ρόλου του χρήστη στον τύπο Role του enum
    let userRole: Role
    
    switch (role) {
      case 'admin':
        userRole = Role.ADMIN
        break
      case 'editor':
        userRole = Role.EDITOR
        break
      default:
        userRole = Role.USER
    }
    
    // Calculate reading time (average reading speed: 200 words per minute)
    const wordCount = postData.content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Δημιουργία του post
    const blogPostData: NewBlogPost = {
      slug: postData.slug,
      title: postData.title,
      description: postData.description,
      date: postData.date,
      image: postData.image,
      author_name: postData.author.name,
      author_image: postData.author.image,
      categories: postData.categories,
      content: postData.content,
      featured: false,
      views: 0,
      reading_time: readingTime,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const newPost = await blogService.createPost(blogPostData, {
      id: user.id,
      email: user.email || '',
      role: userRole
    })
    
    // Ανανέωση του cache για τη σελίδα του blog
    revalidatePath('/blog')
    
    return {
      success: true,
      data: {
        ...newPost,
        date: newPost.date,
        created_at: newPost.created_at || new Date().toISOString(),
        updated_at: newPost.updated_at || new Date().toISOString(),
      }
    }
  } catch (error) {
    logger.error('Σφάλμα κατά τη δημιουργία blog post:', error, 'action-blog-create')
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return { success: false, error: 'Μη εξουσιοδοτημένη πρόσβαση' }
      } else if (error.message === 'Δεν έχετε τα απαραίτητα δικαιώματα για τη δημιουργία blog post') {
        return { success: false, error: error.message }
      }
    }
    
    return { success: false, error: 'Παρουσιάστηκε σφάλμα κατά τη δημιουργία του blog post' }
  }
}

/**
 * Server Action για την ενημέρωση ενός blog post
 */
export async function updateBlogPost(slug: string, formData: FormData): Promise<ActionResult> {
  try {
    // Λήψη του τρέχοντος χρήστη με το νέο σύστημα
    const { user, role } = await supabaseServer.auth.getUserWithRole()
    
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένοι' }
    }
    
    // Μετατροπή του FormData σε αντικείμενο
    const rawData = {
      slug: formData.get('slug') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      image: formData.get('image') as string,
      author: {
        name: formData.get('authorName') as string,
        image: formData.get('authorImage') as string,
      },
      categories: JSON.parse(formData.get('categories') as string),
      content: formData.get('content') as string,
    }
    
    // Επικύρωση δεδομένων
    const validationResult = postSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.message }
    }
    
    const postData = validationResult.data
    logger.info(`Ενημέρωση blog post ${slug} -> ${postData.slug}`, null, 'action-blog-update')
    
    // Μετατροπή του ρόλου του χρήστη στον τύπο Role του enum
    let userRole: Role
    
    switch (role) {
      case 'admin':
        userRole = Role.ADMIN
        break
      case 'editor':
        userRole = Role.EDITOR
        break
      default:
        userRole = Role.USER
    }
    
    // Ενημέρωση του post
    const updateData: Partial<NewBlogPost> = {
      slug: postData.slug,
      title: postData.title,
      description: postData.description,
      date: postData.date,
      image: postData.image,
      author_name: postData.author.name,
      author_image: postData.author.image,
      categories: postData.categories,
      content: postData.content,
      featured: false,
      updated_at: new Date().toISOString()
    };
    
    const updatedPost = await blogService.updatePost(slug, updateData, {
      id: user.id,
      email: user.email || '',
      role: userRole
    })
    
    if (!updatedPost) {
      return { success: false, error: 'Το blog post δεν βρέθηκε' }
    }
    
    // Ανανέωση του cache για τις σελίδες του blog
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
    
    // Αν το slug άλλαξε, ανανέωση και του νέου path
    if (slug !== postData.slug) {
      revalidatePath(`/blog/${postData.slug}`)
    }
    
    return {
      success: true,
      data: {
        ...updatedPost,
        date: updatedPost.date,
        created_at: updatedPost.created_at || new Date().toISOString(),
        updated_at: updatedPost.updated_at || new Date().toISOString(),
      }
    }
  } catch (error) {
    logger.error(`Σφάλμα κατά την ενημέρωση blog post ${slug}:`, error, 'action-blog-update')
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return { success: false, error: 'Μη εξουσιοδοτημένη πρόσβαση' }
      } else if (error.message === 'Δεν έχετε τα απαραίτητα δικαιώματα για την ενημέρωση blog post') {
        return { success: false, error: error.message }
      } else if (error.message === 'Το blog post δεν βρέθηκε') {
        return { success: false, error: error.message }
      }
    }
    
    return { success: false, error: 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση του blog post' }
  }
}

/**
 * Server Action για τη διαγραφή ενός blog post
 */
export async function deleteBlogPost(slug: string): Promise<ActionResult> {
  try {
    // Λήψη του τρέχοντος χρήστη με το νέο σύστημα
    const { user, role } = await supabaseServer.auth.getUserWithRole()
    
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένοι' }
    }
    
    logger.info(`Διαγραφή blog post ${slug}`, null, 'action-blog-delete')
    
    // Μετατροπή του ρόλου του χρήστη στον τύπο Role του enum
    let userRole: Role
    
    switch (role) {
      case 'admin':
        userRole = Role.ADMIN
        break
      case 'editor':
        userRole = Role.EDITOR
        break
      default:
        userRole = Role.USER
    }
    
    // Διαγραφή του post
    await blogService.deletePost(slug, {
      id: user.id,
      email: user.email || '',
      role: userRole
    })
    
    // Ανανέωση του cache για τη σελίδα του blog
    revalidatePath('/blog')
    
    return { success: true }
  } catch (error) {
    logger.error(`Σφάλμα κατά τη διαγραφή blog post ${slug}:`, error, 'action-blog-delete')
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return { success: false, error: 'Μη εξουσιοδοτημένη πρόσβαση' }
      } else if (error.message === 'Δεν έχετε τα απαραίτητα δικαιώματα για τη διαγραφή blog post') {
        return { success: false, error: error.message }
      }
    }
    
    return { success: false, error: 'Παρουσιάστηκε σφάλμα κατά τη διαγραφή του blog post' }
  }
}