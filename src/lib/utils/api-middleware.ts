// src/lib/utils/api-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { protectApiRoute } from '@/lib/auth/server-auth';
import { apiResponse } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';

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
          return apiResponse.validationError(
            new z.ZodError([{
              code: z.ZodIssueCode.custom,
              path: [],
              message: 'Invalid JSON in request body'
            }])
          );
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
        return apiResponse.validationError(validationResult.error);
      }
      
      // Αν η επικύρωση είναι επιτυχής, εκτέλεση του handler
      return await handler(req, validationResult.data, context);
    } catch (error) {
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
      logger.error(`${name} failed after ${duration.toFixed(2)}ms:`, error, 'api-timing');
      
      throw error;
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
  
  // Δημιουργούμε έναν handler που είναι συμβατός με το Next.js 15
  let wrappedHandler = (req: NextRequest, context: { params: Promise<P> }) => {
    // Ο αρχικός handler θα λάβει κενά δεδομένα, τα οποία θα αντικατασταθούν από το withValidation
    return handler(req, {} as z.infer<T>, context);
  };
  
  // Εφαρμόζουμε τα middlewares
  wrappedHandler = withTiming(wrappedHandler, name);
  wrappedHandler = withValidation(schema, handler, source);
  
  // Τέλος, αν απαιτείται, εφαρμόζουμε το auth middleware
  if (requireAuth) {
    wrappedHandler = withAuth(wrappedHandler);
  }
  
  return wrappedHandler;
}