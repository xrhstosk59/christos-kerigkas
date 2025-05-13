import { NextResponse } from 'next/server';
import { AppError } from './app-error';
import { logger } from '../logger';

/**
 * Κεντρικός χειριστής σφαλμάτων για την εφαρμογή.
 * Διαχειρίζεται τα σφάλματα με συνεπή τρόπο.
 */
export class ErrorHandler {
  /**
   * Διαχείριση σφαλμάτων για API routes.
   * 
   * @param error Το σφάλμα που προέκυψε
   * @param source Πηγή του σφάλματος (για το logging)
   * @returns NextResponse με την κατάλληλη κατάσταση και μήνυμα
   */
  public static handleApiError(error: unknown, source = 'api'): NextResponse {
    if (error instanceof AppError) {
      // Καταγραφή της κατάλληλης πληροφορίας ανάλογα με την κρισιμότητα
      if (error.statusCode >= 500) {
        logger.error(`[${source}] ${error.code}: ${error.message}`, error, source);
      } else {
        logger.warn(`[${source}] ${error.code}: ${error.message}`, error.context, source);
      }
      
      // Επιστροφή της κατάλληλης απάντησης
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            ...(error.context && { details: error.context }),
          },
        },
        { status: error.statusCode }
      );
    }
    
    // Αντιμετώπιση γενικών σφαλμάτων
    const unknownError = error instanceof Error 
      ? error 
      : new Error(String(error));
    
    logger.error(
      `[${source}] Unhandled error: ${unknownError.message}`, 
      unknownError, 
      source
    );
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Παρουσιάστηκε ένα εσωτερικό σφάλμα. Παρακαλώ δοκιμάστε ξανά αργότερα.',
        },
      },
      { status: 500 }
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
      details?: Record<string, unknown>; 
    } 
  } {
    if (error instanceof AppError) {
      // Καταγραφή της κατάλληλης πληροφορίας ανάλογα με την κρισιμότητα
      if (error.statusCode >= 500) {
        logger.error(`[${source}] ${error.code}: ${error.message}`, error, source);
      } else {
        logger.warn(`[${source}] ${error.code}: ${error.message}`, error.context, source);
      }
      
      // Επιστροφή της κατάλληλης απάντησης
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.context && { details: error.context }),
        },
      };
    }
    
    // Αντιμετώπιση γενικών σφαλμάτων
    const unknownError = error instanceof Error 
      ? error 
      : new Error(String(error));
    
    logger.error(
      `[${source}] Unhandled error: ${unknownError.message}`, 
      unknownError, 
      source
    );
    
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Παρουσιάστηκε ένα εσωτερικό σφάλμα. Παρακαλώ δοκιμάστε ξανά αργότερα.',
      },
    };
  }
}