// src/lib/utils/api-response.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from './logger';

/**
 * Τύποι κωδικών σφάλματος API που μπορούν να επιστραφούν.
 */
export type ApiErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'PAYLOAD_TOO_LARGE'
  | 'SERVICE_UNAVAILABLE';

/**
 * Δομή απόκρισης σφάλματος API.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

/**
 * Δομή επιτυχούς απόκρισης API.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

/**
 * Συνολικός τύπος απόκρισης API (επιτυχία ή σφάλμα).
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Utility για τη δημιουργία τυποποιημένων API responses.
 */
export const apiResponse = {
  /**
   * Δημιουργία επιτυχούς απόκρισης.
   * 
   * @param data Τα δεδομένα που θα επιστραφούν.
   * @param meta Προαιρετικά μεταδεδομένα (π.χ. για pagination).
   * @param status HTTP status code (προεπιλογή: 200).
   */
  success<T>(data: T, meta?: ApiSuccessResponse<T>['meta'], status = 200) {
    return NextResponse.json<ApiSuccessResponse<T>>(
      { success: true, data, meta },
      { status }
    );
  },
  
  /**
   * Δημιουργία απόκρισης σφάλματος.
   * 
   * @param code Κωδικός σφάλματος.
   * @param message Μήνυμα σφάλματος φιλικό προς το χρήστη.
   * @param details Προαιρετικές λεπτομέρειες σφάλματος.
   * @param status HTTP status code (προεπιλογή ανάλογα με τον κωδικό).
   */
  error(
    code: ApiErrorCode,
    message: string,
    details?: unknown,
    status?: number
  ) {
    // Δημιουργία μοναδικού αναγνωριστικού για το σφάλμα
    const requestId = crypto.randomUUID();
    
    // Καταγραφή του σφάλματος για εσωτερική χρήση
    logger.error(message, details, 'api-response', requestId);
    
    // Καθορισμός του κατάλληλου HTTP status code βάσει του κωδικού σφάλματος
    if (!status) {
      status = this.getStatusCodeForErrorCode(code);
    }
    
    return NextResponse.json<ApiErrorResponse>(
      { 
        success: false,
        error: { code, message, details, requestId }
      },
      { status }
    );
  },
  
  /**
   * Μετατροπή κωδικού σφάλματος σε HTTP status code.
   */
  getStatusCodeForErrorCode(code: ApiErrorCode): number {
    switch (code) {
      case 'VALIDATION_ERROR':
      case 'BAD_REQUEST':
        return 400;
      case 'UNAUTHORIZED':
        return 401;
      case 'FORBIDDEN':
        return 403;
      case 'NOT_FOUND':
        return 404;
      case 'CONFLICT':
        return 409;
      case 'PAYLOAD_TOO_LARGE':
        return 413;
      case 'RATE_LIMITED':
        return 429;
      case 'SERVICE_UNAVAILABLE':
        return 503;
      case 'INTERNAL_ERROR':
      default:
        return 500;
    }
  },
  
  /**
   * Δημιουργία απόκρισης σφάλματος επικύρωσης (από Zod).
   */
  validationError(error: z.ZodError) {
    return this.error(
      'VALIDATION_ERROR',
      'Λάθος στην επικύρωση των δεδομένων',
      error.flatten(),
      400
    );
  },
  
  /**
   * Δημιουργία απόκρισης "δεν βρέθηκε".
   */
  notFound(message = 'Ο πόρος που ζητήσατε δεν βρέθηκε') {
    return this.error('NOT_FOUND', message, undefined, 404);
  },
  
  /**
   * Δημιουργία απόκρισης "μη εξουσιοδοτημένο".
   */
  unauthorized(message = 'Απαιτείται σύνδεση') {
    return this.error('UNAUTHORIZED', message, undefined, 401);
  },
  
  /**
   * Δημιουργία απόκρισης "απαγορευμένο".
   */
  forbidden(message = 'Δεν έχετε πρόσβαση σε αυτόν τον πόρο') {
    return this.error('FORBIDDEN', message, undefined, 403);
  },
  
  /**
   * Δημιουργία απόκρισης εσωτερικού σφάλματος.
   */
  internalError(message = 'Παρουσιάστηκε εσωτερικό σφάλμα', error?: unknown) {
    // Καταγραφή του πραγματικού σφάλματος εσωτερικά
    logger.error('Εσωτερικό σφάλμα εφαρμογής:', error, 'api-response');
    
    return this.error('INTERNAL_ERROR', message, undefined, 500);
  },
  
  /**
   * Δημιουργία απόκρισης περιορισμού ρυθμού (rate limiting).
   */
  rateLimited(message = 'Πολλές αιτήσεις, παρακαλώ δοκιμάστε αργότερα', resetTime?: number) {
    return this.error(
      'RATE_LIMITED',
      message,
      resetTime ? { resetTime } : undefined,
      429
    );
  },
  
  /**
   * Δημιουργία απόκρισης κακής αίτησης.
   */
  badRequest(message = 'Μη έγκυρη αίτηση', details?: unknown) {
    return this.error('BAD_REQUEST', message, details, 400);
  },
  
  /**
   * Δημιουργία απόκρισης σύγκρουσης δεδομένων.
   */
  conflict(message = 'Σύγκρουση δεδομένων', details?: unknown) {
    return this.error('CONFLICT', message, details, 409);
  }
};