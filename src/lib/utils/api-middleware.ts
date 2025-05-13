// src/lib/utils/api-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { protectApiRoute } from '@/lib/auth/server-auth';
import { apiResponse } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';
import { 
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
  RateLimitError
} from '@/lib/utils/api-error';

// Απλοποιημένος τύπος για τις παραμέτρους στα API routes
export type RouteParams = Record<string, string | string[]>;

/**
 * Middleware για προστασία route βάσει αυθεντικοποίησης
 * 
 * @param handler Ο handler που θα εκτελεστεί αν ο χρήστης είναι αυθεντικοποιημένος
 */
export function withAuth<P extends RouteParams = RouteParams>(
  handler: (
    req: NextRequest, 
    context: { params: Promise<P> }
  ) => Promise<NextResponse>
): (
  req: NextRequest, 
  context: { params: Promise<P> }
) => Promise<NextResponse> {
  return async (req: NextRequest, context: { params: Promise<P> }) => {
    try {
      // Έλεγχος αυθεντικοποίησης
      const authResult = await protectApiRoute(req);
      
      if (authResult) {
        return authResult; // Επιστροφή του σφάλματος αυθεντικοποίησης
      }
      
      // Αν ο χρήστης είναι αυθεντικοποιημένος, εκτέλεση του handler
      return await handler(req, context);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        logger.warn('Authentication failed:', { path: req.nextUrl.pathname, method: req.method }, 'api-middleware');
        return apiResponse.unauthorized(error.message);
      }
      
      if (error instanceof ForbiddenError) {
        logger.warn('Authorization failed:', { path: req.nextUrl.pathname, method: req.method }, 'api-middleware');
        return apiResponse.forbidden(error.message);
      }
      
      logger.error('Authentication error:', error, 'api-middleware');
      return apiResponse.internalError('An error occurred during authentication');
    }
  };
}

/**
 * Middleware για επικύρωση δεδομένων με Zod schema
 * 
 * @param schema Το Zod schema για την επικύρωση
 * @param handler Ο handler που θα εκτελεστεί αν η επικύρωση είναι επιτυχής
 * @param source 'body', 'query', ή 'params' - η πηγή των δεδομένων για επικύρωση
 */
export function withValidation<T extends z.ZodType, P extends RouteParams = RouteParams>(
  schema: T,
  handler: (
    req: NextRequest, 
    validData: z.infer<T>,
    context: { params: Promise<P> }
  ) => Promise<NextResponse>,
  source: 'body' | 'query' | 'params' = 'body'
): (
  req: NextRequest, 
  context: { params: Promise<P> }
) => Promise<NextResponse> {
  return async (req: NextRequest, context: { params: Promise<P> }) => {
    try {
      let data: Record<string, unknown> = {};
      
      if (source === 'body') {
        // Body validation
        try {
          data = await req.json();
        } catch {
          // Δεν χρειαζόμαστε το error object, οπότε δεν ορίζουμε παράμετρο στο catch
          logger.error('Invalid JSON in request body', null, 'api-middleware');
          throw new BadRequestError('Invalid JSON in request body');
        }
      } else if (source === 'query') {
        // Query params validation
        const url = new URL(req.url);
        
        for (const [key, value] of url.searchParams.entries()) {
          // Μετατροπή τιμών σε αριθμούς αν είναι δυνατόν
          if (!isNaN(Number(value))) {
            data[key] = Number(value);
          } else if (value === 'true') {
            data[key] = true;
          } else if (value === 'false') {
            data[key] = false;
          } else {
            data[key] = value;
          }
        }
      } else if (source === 'params') {
        // URL params validation - χρησιμοποιούμε το context.params αν υπάρχει
        if (context && context.params) {
          // Υποστήριξη για Promise ή απευθείας τιμή στο params
          data = await context.params;
        } else {
          data = {};
        }
      }
      
      // Επικύρωση με το schema
      const validationResult = schema.safeParse(data);
      
      if (!validationResult.success) {
        throw new ValidationError('Validation error', { errors: validationResult.error.format() });
      }
      
      // Αν η επικύρωση είναι επιτυχής, εκτέλεση του handler
      return await handler(req, validationResult.data, context);
    } catch (error) {
      if (error instanceof ValidationError) {
        return apiResponse.validationError(error.details);
      }
      
      if (error instanceof BadRequestError) {
        return apiResponse.badRequest(error.message);
      }
      
      logger.error('Validation error:', error, 'api-middleware');
      return apiResponse.internalError('An error occurred during validation');
    }
  };
}

/**
 * Middleware για μέτρηση χρόνου εκτέλεσης αιτήματος
 * 
 * @param handler Ο handler του API
 * @param name Το όνομα του endpoint για το logging
 */
export function withTiming<P extends RouteParams = RouteParams>(
  handler: (
    req: NextRequest, 
    context: { params: Promise<P> }
  ) => Promise<NextResponse>,
  name: string
): (
  req: NextRequest, 
  context: { params: Promise<P> }
) => Promise<NextResponse> {
  return async (req: NextRequest, context: { params: Promise<P> }) => {
    const startTime = performance.now();
    let success = true;
    
    try {
      // Εκτέλεση του handler
      const response = await handler(req, context);
      
      // Υπολογισμός διάρκειας
      const duration = performance.now() - startTime;
      logger.debug(`${name} completed in ${duration.toFixed(2)}ms`, null, 'api-timing');
      
      return response;
    } catch (error) {
      // Υπολογισμός διάρκειας σε περίπτωση σφάλματος
      const duration = performance.now() - startTime;
      success = false;
      logger.error(`${name} failed after ${duration.toFixed(2)}ms:`, error, 'api-timing');
      
      throw error;
    } finally {
      // Metrics logging για performance monitoring
      const duration = performance.now() - startTime;
      logger.info('API Request', {
        endpoint: name,
        method: req.method,
        duration: duration.toFixed(2),
        success,
        path: req.nextUrl.pathname
      }, 'api-metrics');
    }
  };
}

/**
 * Middleware για κεντρικό χειρισμό σφαλμάτων
 */
export function withErrorHandling<P extends RouteParams = RouteParams>(
  handler: (
    req: NextRequest, 
    context: { params: Promise<P> }
  ) => Promise<NextResponse>
): (
  req: NextRequest, 
  context: { params: Promise<P> }
) => Promise<NextResponse> {
  return async (req: NextRequest, context: { params: Promise<P> }) => {
    try {
      return await handler(req, context);
    } catch (error) {
      // Χειρισμός διαφορετικών τύπων σφαλμάτων
      if (error instanceof ValidationError) {
        return apiResponse.validationError(error.details);
      }
      
      if (error instanceof NotFoundError) {
        return apiResponse.notFound(error.message);
      }
      
      if (error instanceof UnauthorizedError) {
        return apiResponse.unauthorized(error.message);
      }
      
      if (error instanceof ForbiddenError) {
        return apiResponse.forbidden(error.message);
      }
      
      if (error instanceof BadRequestError) {
        return apiResponse.badRequest(error.message, error.details);
      }
      
      if (error instanceof ConflictError) {
        return apiResponse.conflict(error.message, error.details);
      }
      
      if (error instanceof RateLimitError) {
        return apiResponse.rateLimited(error.message, error.details?.resetTime as number);
      }
      
      // Χειρισμός Zod errors που δεν έχουν μετατραπεί σε ValidationError
      if (error instanceof z.ZodError) {
        return apiResponse.validationError(error.format());
      }
      
      // Χειρισμός γενικών σφαλμάτων
      logger.error('Unhandled API error:', error, 'api-error-handler');
      
      // Απόκρυψη λεπτομερειών σε production
      const isProd = process.env.NODE_ENV === 'production';
      return apiResponse.internalError(
        isProd ? 'An unexpected error occurred' : `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
}

/**
 * Συνδυασμός όλων των middlewares
 * 
 * @param schema Το schema για επικύρωση
 * @param handler Ο handler του API
 * @param options Πρόσθετες επιλογές
 */
export function createApiHandler<T extends z.ZodType, P extends RouteParams = RouteParams>(
  schema: T,
  handler: (
    req: NextRequest, 
    validData: z.infer<T>, 
    context: { params: Promise<P> }
  ) => Promise<NextResponse>,
  options: {
    name: string;
    source?: 'body' | 'query' | 'params';
    requireAuth?: boolean;
  }
): (
  req: NextRequest, 
  context: { params: Promise<P> }
) => Promise<NextResponse> {
  const { name, source = 'body', requireAuth = true } = options;
  
  // Δημιουργία του αρχικού handler με callback για το validation
  let wrappedHandler = (req: NextRequest, context: { params: Promise<P> }) => {
    // Ο αρχικός handler θα λάβει κενά δεδομένα, τα οποία θα αντικατασταθούν από το withValidation
    return handler(req, {} as z.infer<T>, context);
  };
  
  // Εφαρμογή των middlewares με την αντίστροφη σειρά (από μέσα προς τα έξω)
  // Το τελευταίο middleware που εφαρμόζεται είναι το πρώτο που θα εκτελεστεί
  
  // 1. Error handling - πρώτο που εφαρμόζεται, τελευταίο που εκτελείται
  wrappedHandler = withErrorHandling(wrappedHandler);
  
  // 2. Timing middleware
  wrappedHandler = withTiming(wrappedHandler, name);
  
  // 3. Validation middleware
  wrappedHandler = withValidation(schema, handler, source);
  
  // 4. Auth middleware (αν απαιτείται)
  if (requireAuth) {
    wrappedHandler = withAuth(wrappedHandler);
  }
  
  return wrappedHandler;
}