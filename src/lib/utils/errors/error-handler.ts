import { NextResponse } from 'next/server';
import { AppError, isPostgresError, createErrorFromPostgresError } from './app-error';
import { logger } from '../logger';
import { ZodError } from 'zod';
import crypto from 'crypto';

/**
 * Κεντρικός χειριστής σφαλμάτων για την εφαρμογή.
 * Διαχειρίζεται τα σφάλματα με συνεπή τρόπο.
 */
export class ErrorHandler {
  /**
   * Δημιουργία ενός μοναδικού ID για το error tracking
   */
  private static generateRequestId(): string {
    return crypto.randomUUID();
  }

  /**
   * Μετατροπή γενικών σφαλμάτων σε AppError
   */
  public static normalizeError(error: unknown, defaultMessage = 'Παρουσιάστηκε ένα σφάλμα'): AppError {
    // Αν είναι ήδη AppError, το επιστρέφουμε ως έχει
    if (error instanceof AppError) {
      return error;
    }
    
    // Αν είναι PostgreSQL error, το μετατρέπουμε στο κατάλληλο AppError
    if (isPostgresError(error)) {
      return createErrorFromPostgresError(error);
    }
    
    // Αν είναι Zod Error, το μετατρέπουμε σε ValidationError
    if (error instanceof ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });
      
      return new AppError(
        'Τα δεδομένα δεν είναι έγκυρα',
        400,
        'VALIDATION_ERROR',
        { errors: formattedErrors }
      );
    }
    
    // Για τα υπόλοιπα σφάλματα
    if (error instanceof Error) {
      return new AppError(
        error.message || defaultMessage,
        500,
        'INTERNAL_ERROR',
        { 
          originalError: error.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        false
      );
    }
    
    // Για άγνωστα σφάλματα
    return new AppError(
      typeof error === 'string' ? error : defaultMessage,
      500,
      'INTERNAL_ERROR',
      { unknownError: error },
      false
    );
  }

  /**
   * Διαχείριση σφαλμάτων για API routes.
   * 
   * @param error Το σφάλμα που προέκυψε
   * @param source Πηγή του σφάλματος (για το logging)
   * @returns NextResponse με την κατάλληλη κατάσταση και μήνυμα
   */
  public static handleApiError(error: unknown, source = 'api'): NextResponse {
    const requestId = this.generateRequestId();
    const normalizedError = this.normalizeError(error);
    
    // Προσθήκη του requestId αν δεν υπάρχει ήδη
    if (!normalizedError.requestId) {
      Object.defineProperty(normalizedError, 'requestId', { value: requestId });
    }

    // Καταγραφή της κατάλληλης πληροφορίας ανάλογα με την κρισιμότητα
    if (normalizedError.isOperational) {
      // Τα λειτουργικά σφάλματα είναι αναμενόμενα (π.χ. validation errors, auth errors)
      if (normalizedError.statusCode >= 500) {
        logger.error(
          `[${source}] ${normalizedError.code}: ${normalizedError.message}`, 
          { 
            ...normalizedError.context,
            requestId: normalizedError.requestId || requestId,
            statusCode: normalizedError.statusCode
          },
          source
        );
      } else {
        logger.warn(
          `[${source}] ${normalizedError.code}: ${normalizedError.message}`, 
          { 
            ...normalizedError.context,
            requestId: normalizedError.requestId || requestId,
            statusCode: normalizedError.statusCode
          }, 
          source
        );
      }
    } else {
      // Τα μη λειτουργικά σφάλματα είναι πιο σοβαρά (π.χ. database errors, unexpected errors)
      logger.error(
        `[${source}] ${normalizedError.code}: ${normalizedError.message}`, 
        { 
          ...normalizedError.context,
          requestId: normalizedError.requestId || requestId,
          statusCode: normalizedError.statusCode,
          stack: normalizedError.stack
        }, 
        source
      );
    }
    
    // Επιστροφή του κατάλληλου response
    // Σε production, κρύβουμε ευαίσθητες πληροφορίες
    const isProd = process.env.NODE_ENV === 'production';
    const details = isProd && !normalizedError.isOperational 
      ? undefined 
      : normalizedError.context;
    
    return NextResponse.json(
      {
        error: {
          code: normalizedError.code,
          message: normalizedError.message,
          requestId: normalizedError.requestId || requestId,
          ...(details && { details }),
        },
      },
      { 
        status: normalizedError.statusCode,
        headers: {
          'X-Request-ID': normalizedError.requestId || requestId
        }
      }
    );
  }
  
  /**
   * Διαχείριση σφαλμάτων για Server Components και Server Actions.
   * 
   * @param error Το σφάλμα που προέκυψε
   * @param source Πηγή του σφάλματος (για το logging)
   * @returns Ένα τυποποιημένο αντικείμενο σφάλματος
   */
  public static handleServerError(error: unknown, source = 'server'): { 
    success: false; 
    error: { 
      code: string; 
      message: string; 
      requestId: string;
      details?: Record<string, unknown>; 
    } 
  } {
    const requestId = this.generateRequestId();
    const normalizedError = this.normalizeError(error);
    
    // Προσθήκη του requestId αν δεν υπάρχει ήδη
    if (!normalizedError.requestId) {
      Object.defineProperty(normalizedError, 'requestId', { value: requestId });
    }
    
    // Καταγραφή με τον ίδιο τρόπο όπως το handleApiError
    if (normalizedError.isOperational) {
      if (normalizedError.statusCode >= 500) {
        logger.error(
          `[${source}] ${normalizedError.code}: ${normalizedError.message}`, 
          { 
            ...normalizedError.context,
            requestId: normalizedError.requestId || requestId,
            statusCode: normalizedError.statusCode
          },
          source
        );
      } else {
        logger.warn(
          `[${source}] ${normalizedError.code}: ${normalizedError.message}`, 
          { 
            ...normalizedError.context,
            requestId: normalizedError.requestId || requestId,
            statusCode: normalizedError.statusCode
          }, 
          source
        );
      }
    } else {
      logger.error(
        `[${source}] ${normalizedError.code}: ${normalizedError.message}`, 
        { 
          ...normalizedError.context,
          requestId: normalizedError.requestId || requestId,
          statusCode: normalizedError.statusCode,
          stack: normalizedError.stack
        }, 
        source
      );
    }
    
    // Επιστροφή του κατάλληλου αντικειμένου
    // Σε production, κρύβουμε ευαίσθητες πληροφορίες
    const isProd = process.env.NODE_ENV === 'production';
    const details = isProd && !normalizedError.isOperational 
      ? undefined 
      : normalizedError.context;
    
    return {
      success: false,
      error: {
        code: normalizedError.code,
        message: normalizedError.message,
        requestId: normalizedError.requestId || requestId,
        ...(details && { details }),
      },
    };
  }

  /**
   * Διαχείριση σφαλμάτων βάσης δεδομένων με ειδική λογική ανά τύπο
   * 
   * @param error Το σφάλμα που προέκυψε
   * @param context Πληροφορίες για το context του σφάλματος
   * @param source Πηγή του σφάλματος
   */
  public static handleDatabaseError(error: unknown, context: string, source = 'database'): AppError {
    const requestId = this.generateRequestId();
    
    // Αν είναι PostgreSQL error, το μετατρέπουμε κατάλληλα
    if (isPostgresError(error)) {
      const appError = createErrorFromPostgresError(error);
      
      // Προσθήκη requestId και context
      Object.defineProperty(appError, 'requestId', { value: requestId });
      Object.defineProperty(appError, 'context', { 
        value: { 
          ...appError.context, 
          databaseContext: context 
        } 
      });
      
      logger.error(
        `Database error in ${context}: ${appError.message}`,
        {
          code: error.code,
          detail: error.detail,
          table: error.table,
          constraint: error.constraint,
          requestId
        },
        source
      );
      
      return appError;
    }
    
    // Για άλλους τύπους σφαλμάτων
    logger.error(
      `Database error in ${context}:`,
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId
      },
      source
    );
    
    return new AppError(
      `Database error in ${context}: ${error instanceof Error ? error.message : String(error)}`,
      500,
      'DATABASE_ERROR',
      { originalError: error },
      false,
      requestId
    );
  }

  /**
   * Διαχείριση σφαλμάτων από εξωτερικές υπηρεσίες
   * 
   * @param error Το σφάλμα που προέκυψε
   * @param serviceName Όνομα της εξωτερικής υπηρεσίας
   * @param source Πηγή του σφάλματος
   */
  public static handleExternalServiceError(error: unknown, serviceName: string, source = 'external'): AppError {
    const requestId = this.generateRequestId();
    
    logger.error(
      `Error from external service ${serviceName}:`,
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        service: serviceName,
        requestId
      },
      source
    );
    
    return new AppError(
      `Error communicating with ${serviceName}: ${error instanceof Error ? error.message : String(error)}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      { service: serviceName, originalError: error },
      false,
      requestId
    );
  }
}