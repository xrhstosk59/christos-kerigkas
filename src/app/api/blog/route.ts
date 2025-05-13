// src/app/api/blog/route.ts

import { z } from 'zod';
import { apiResponse } from '@/lib/utils/api-response';
import { getCurrentSession } from '@/lib/auth/server-auth';
import { logger } from '@/lib/utils/logger';
import { Role } from '@/lib/auth/access-control';
import { createApiHandler } from '@/lib/utils/api-middleware';
import { BlogPost } from '@/domains/blog/models/blog-post.model';

// Αλλαγή του import path για να δείχνει στο νέο domains folder
import { blogService } from '@/domains/blog/services';

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
});

// Search schema για επικύρωση παραμέτρων αναζήτησης
const searchParamsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['date', 'title']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * GET - Ανάκτηση blog posts με δυνατότητα αναζήτησης και φιλτραρίσματος.
 */
export const GET = createApiHandler(
  searchParamsSchema,
  async (req, validData, _context) => {
    try {
      logger.info(`Αναζήτηση blog posts`, validData, 'api-blog-GET');

      // Εκτέλεση της αναζήτησης απευθείας με το blog service
      const result = await blogService.searchPosts(validData);

      // Κατάλληλο format της απάντησης
      const response = apiResponse.success(
        {
          posts: result.posts.map((post: BlogPost) => ({
            slug: post.slug,
            title: post.title,
            description: post.description,
            date: post.date.toISOString(),
            image: post.image,
            author: {
              name: post.authorName,
              image: post.authorImage
            },
            categories: post.categories,
            content: post.content,
          })),
        },
        {
          totalPosts: result.total,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          postsPerPage: validData.limit,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        }
      );

      // Προσθήκη cache headers
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

      return response;
    } catch (error) {
      logger.error('Σφάλμα κατά την ανάκτηση blog posts:', error, 'api-blog-GET');
      return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά την ανάκτηση των blog posts', error);
    }
  },
  {
    name: 'GET /api/blog',
    source: 'query',
    requireAuth: false // Το GET endpoint είναι δημόσιο
  }
);

/**
 * POST - Δημιουργία νέου blog post.
 */
export const POST = createApiHandler(
  postSchema,
  async (req, validData, _context) => {
    try {
      // Λήψη του τρέχοντος χρήστη
      const session = await getCurrentSession();
      if (!session.user) {
        return apiResponse.unauthorized();
      }
      
      logger.info(`Δημιουργία νέου blog post: ${validData.title}`, null, 'api-blog-POST');
      
      // Μετατροπή από το schema του frontend στο schema του service/database
      // Ασφαλέστερη μετατροπή του ρόλου του χρήστη στον τύπο Role του enum
      let userRole: Role;
      
      switch (session.user.role) {
        case 'admin':
          userRole = Role.ADMIN;
          break;
        case 'editor':
          userRole = Role.EDITOR;
          break;
        default:
          userRole = Role.USER;
      }
      
      // Προσθήκη των απαραίτητων πεδίων για συμβατότητα με το NewBlogPost
      const newPost = await blogService.createPost({
        slug: validData.slug,
        title: validData.title,
        description: validData.description,
        date: new Date(validData.date),
        image: validData.image,
        authorName: validData.author.name,
        authorImage: validData.author.image,
        categories: validData.categories,
        content: validData.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Προσθήκη των πεδίων που έλειπαν και προκαλούσαν το TypeScript σφάλμα
        category: validData.categories[0] || 'general', // Χρήση της πρώτης κατηγορίας ως default
        published: true, // Default τιμή για published
        featured: false, // Default τιμή για featured
        excerpt: validData.description.slice(0, 160), // Δημιουργία excerpt από την περιγραφή
        metaTitle: validData.title, // Χρήση του τίτλου ως meta title
        metaDescription: validData.description.slice(0, 160) // Χρήση της περιγραφής ως meta description
      }, {
        id: session.user.id,
        email: session.user.email,
        role: userRole
      });
      
      // Έλεγχος ότι τα createdAt και updatedAt δεν είναι undefined
      const createdAt = newPost.createdAt ? newPost.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = newPost.updatedAt ? newPost.updatedAt.toISOString() : new Date().toISOString();
      
      return apiResponse.success(
        { 
          message: 'Το blog post δημιουργήθηκε επιτυχώς', 
          post: {
            ...newPost,
            date: newPost.date.toISOString(),
            createdAt: createdAt,
            updatedAt: updatedAt,
          }
        },
        undefined,
        201
      );
    } catch (error) {
      logger.error('Σφάλμα κατά τη δημιουργία blog post:', error, 'api-blog-POST');
      
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return apiResponse.unauthorized();
        } else if (error.message === 'Δεν έχετε τα απαραίτητα δικαιώματα για τη δημιουργία blog post') {
          return apiResponse.forbidden(error.message);
        }
      }
      
      return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά τη δημιουργία του blog post', error);
    }
  },
  {
    name: 'POST /api/blog',
    source: 'body',
    requireAuth: true
  }
);