// src/lib/api/middleware/api-middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ErrorHandler } from '@/lib/utils/errors/error-handler';
import { ForbiddenError, UnauthorizedError, ValidationError } from '@/lib/utils/errors/app-error';
import { getCurrentSession } from '@/lib/auth/server-auth';
import { checkPermission, Permission, UserWithRole } from '@/lib/auth/access-control';
import { logger } from '@/lib/utils/logger';

// Τύπος για τα context δεδομένα που περνάνε στον handler
export interface HandlerContext {
  user?: UserWithRole;
  session?: {
    isAuthenticated: boolean;
  };
}

// Επιλογές για τον API handler
export interface ApiHandlerOptions {
  name: string;
  source: 'query' | 'body' | 'params';
  requireAuth?: boolean;
  permissions?: Permission[];
  rateLimitKey?: string;
  maxRequests?: number;
  timeWindow?: number;
}

/**
 * Δημιουργεί ένα API handler με πλήρη λειτουργικότητα middleware.
 * 
 * @param schema Το Zod schema για την επικύρωση των δεδομένων
 * @param handler Ο χειριστής του endpoint
 * @param options Οι επιλογές για τον handler
 * @returns Μια συνάρτηση που χειρίζεται το HTTP request
 */
export function createApiHandler<T extends z.ZodTypeAny>(
  schema: T,
  handler: (
    req: NextRequest,
    validData: z.infer<T>,
    context: HandlerContext
  ) => Promise<NextResponse | Response>,
  options: ApiHandlerOptions
) {
  return async function apiHandler(req: NextRequest): Promise<NextResponse | Response> {
    try {
      logger.info(`Request to ${options.name}`, null, options.name);
      
      // Δημιουργία του context
      const context: HandlerContext = {
        session: {
          isAuthenticated: false
        }
      };
      
      // Έλεγχος αυθεντικοποίησης αν απαιτείται
      if (options.requireAuth) {
        const userSession = await getCurrentSession();
        
        if (!userSession.isAuthenticated || !userSession.user) {
          throw new UnauthorizedError();
        }
        
        context.user = userSession.user as UserWithRole;
        
        // Διόρθωση για το πιθανό undefined session
        if (context.session) {
          context.session.isAuthenticated = true;
        }
        
        // Έλεγχος δικαιωμάτων αν υπάρχουν
        if (options.permissions && options.permissions.length > 0) {
          const hasPermission = options.permissions.every(permission => 
            checkPermission(userSession.user as UserWithRole, permission)
          );
          
          if (!hasPermission) {
            throw new ForbiddenError();
          }
        }
      }
      
      // Λήψη και επικύρωση των δεδομένων
      let data: z.infer<T>;
      
      try {
        if (options.source === 'query') {
          // Αν είναι GET, χρησιμοποιούμε τα URL parameters
          const searchParams = Object.fromEntries(new URL(req.url).searchParams.entries());
          data = schema.parse(searchParams);
        } else if (options.source === 'params') {
          // Αν χρειάζεται να χρησιμοποιήσουμε παραμέτρους από το path
          const url = new URL(req.url);
          const pathParts = url.pathname.split('/').filter(Boolean);
          
          // Υποθέτουμε ότι η τελευταία παράμετρος είναι το param
          const param = pathParts[pathParts.length - 1];
          data = schema.parse({ param });
        } else {
          // Αλλιώς, παίρνουμε τα δεδομένα από το body
          const body = await req.json();
          data = schema.parse(body);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors: Record<string, string[]> = {};
          
          error.errors.forEach(err => {
            const path = err.path.join('.');
            if (!validationErrors[path]) {
              validationErrors[path] = [];
            }
            validationErrors[path].push(err.message);
          });
          
          throw new ValidationError('Τα δεδομένα δεν είναι έγκυρα', validationErrors);
        }
        
        throw error;
      }
      
      // Εκτέλεση του handler
      return await handler(req, data, context);
    } catch (error) {
      return ErrorHandler.handleApiError(error, options.name);
    }
  };
}