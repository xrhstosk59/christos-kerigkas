// src/app/api/blog/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { blogService } from '@/lib/services/blog-service';
import { apiResponse } from '@/lib/utils/api-response';
import { checkAuth, getCurrentSession } from '@/lib/auth/server-auth';
import { logger } from '@/lib/utils/logger';
import { Role } from '@/lib/auth/access-control';

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
export async function GET(request: NextRequest) {
  try {
    // Μέτρηση διάρκειας αιτήματος
    const startTime = performance.now();

    // Λήψη παραμέτρων από το URL
    const url = new URL(request.url);
    const rawParams = {
      query: url.searchParams.get('query') || undefined,
      category: url.searchParams.get('category') || undefined,
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      sortBy: url.searchParams.get('sortBy'),
      sortOrder: url.searchParams.get('sortOrder'),
    };

    // Επικύρωση παραμέτρων
    const validationResult = searchParamsSchema.safeParse({
      ...rawParams,
      page: rawParams.page ? parseInt(rawParams.page, 10) : undefined,
      limit: rawParams.limit ? parseInt(rawParams.limit, 10) : undefined,
    });

    if (!validationResult.success) {
      return apiResponse.validationError(validationResult.error);
    }

    const params = validationResult.data;
    logger.info(`Αναζήτηση blog posts`, params, 'api-blog-GET');

    // Εκτέλεση της αναζήτησης με το service
    const result = await blogService.searchPosts(params);

    // Κατάλληλο format της απάντησης
    const response = apiResponse.success(
      {
        posts: result.posts.map(post => ({
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
        postsPerPage: params.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      }
    );

    // Καταγραφή του χρόνου εκτέλεσης
    const duration = performance.now() - startTime;
    logger.debug(`GET /api/blog ολοκληρώθηκε σε ${duration.toFixed(2)}ms`, null, 'api-blog-GET');

    // Προσθήκη cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return response;
  } catch (error) {
    logger.error('Σφάλμα κατά την ανάκτηση blog posts:', error, 'api-blog-GET');
    return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά την ανάκτηση των blog posts', error);
  }
}

/**
 * POST - Δημιουργία νέου blog post.
 */
export async function POST(request: NextRequest) {
  try {
    // Έλεγχος αν ο χρήστης είναι authenticated
    await checkAuth();
    
    // Λήψη του τρέχοντος χρήστη
    const session = await getCurrentSession();
    if (!session.user) {
      return apiResponse.unauthorized();
    }
    
    // Λήψη και επικύρωση δεδομένων
    const body = await request.json();
    const validationResult = postSchema.safeParse(body);
    
    if (!validationResult.success) {
      return apiResponse.validationError(validationResult.error);
    }
    
    const postData = validationResult.data;
    logger.info(`Δημιουργία νέου blog post: ${postData.title}`, null, 'api-blog-POST');
    
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
    
    const newPost = await blogService.createPost({
      slug: postData.slug,
      title: postData.title,
      description: postData.description,
      date: new Date(postData.date),
      image: postData.image,
      authorName: postData.author.name,
      authorImage: postData.author.image,
      categories: postData.categories,
      content: postData.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      id: session.user.id,
      email: session.user.email,
      role: userRole
    });
    
    return apiResponse.success(
      { 
        message: 'Το blog post δημιουργήθηκε επιτυχώς', 
        post: {
          ...newPost,
          date: newPost.date.toISOString(),
          createdAt: newPost.createdAt.toISOString(),
          updatedAt: newPost.updatedAt.toISOString(),
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
}