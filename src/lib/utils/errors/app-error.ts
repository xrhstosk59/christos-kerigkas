/**
 * Βασική κλάση σφάλματος για την εφαρμογή.
 * Όλα τα σφάλματα κληρονομούν από αυτήν.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly isOperational: boolean;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    context?: Record<string, unknown>,
    isOperational = true,
    requestId?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;
    this.isOperational = isOperational; // Καθορίζει αν το σφάλμα είναι αναμενόμενο
    this.requestId = requestId;

    // Διατήρηση του proper stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Ρύθμιση του prototype name για καλύτερη διακριτοποίηση των σφαλμάτων
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Σφάλμα για μη εξουσιοδοτημένη πρόσβαση.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Δεν έχετε εξουσιοδότηση για αυτήν την ενέργεια', context?: Record<string, unknown>, requestId?: string) {
    super(message, 401, 'UNAUTHORIZED', context, true, requestId);
  }
}

/**
 * Σφάλμα για απαγορευμένη πρόσβαση (έχει γίνει αυθεντικοποίηση αλλά δεν έχει τα απαραίτητα δικαιώματα).
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Απαγορεύεται η πρόσβαση σε αυτόν τον πόρο', context?: Record<string, unknown>, requestId?: string) {
    super(message, 403, 'FORBIDDEN', context, true, requestId);
  }
}

/**
 * Σφάλμα για πόρο που δεν βρέθηκε.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Ο πόρος που ζητήσατε δεν βρέθηκε', context?: Record<string, unknown>, requestId?: string) {
    super(message, 404, 'NOT_FOUND', context, true, requestId);
  }
}

/**
 * Σφάλμα για μη έγκυρα δεδομένα εισόδου.
 */
export class ValidationError extends AppError {
  constructor(
    message = 'Τα δεδομένα που υποβάλατε δεν είναι έγκυρα',
    validationErrors?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message, 400, 'VALIDATION_ERROR', { validationErrors }, true, requestId);
  }
}

/**
 * Σφάλμα για αποτυχία βάσης δεδομένων.
 */
export class DatabaseError extends AppError {
  constructor(
    message = 'Παρουσιάστηκε σφάλμα κατά την επικοινωνία με τη βάση δεδομένων',
    originalError?: Error,
    requestId?: string
  ) {
    super(
      message, 
      500, 
      'DATABASE_ERROR', 
      { originalError: originalError?.message, errorName: originalError?.name },
      false, // Μη λειτουργικό σφάλμα
      requestId
    );
  }
}

/**
 * Σφάλμα για συγκρούσεις δεδομένων (π.χ. duplicate entry).
 */
export class ConflictError extends AppError {
  constructor(message = 'Προέκυψε σύγκρουση κατά την επεξεργασία του αιτήματός σας', context?: Record<string, unknown>, requestId?: string) {
    super(message, 409, 'CONFLICT', context, true, requestId);
  }
}

/**
 * Σφάλμα για υπέρβαση ορίων (π.χ. rate limit).
 */
export class RateLimitError extends AppError {
  constructor(
    message = 'Έχετε υπερβεί το όριο αιτημάτων',
    resetTime?: number,
    requestId?: string
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { resetTime }, true, requestId);
  }
}

/**
 * Σφάλμα για αιτήματα που είναι πολύ μεγάλα.
 */
export class PayloadTooLargeError extends AppError {
  constructor(message = 'Το αίτημα είναι πολύ μεγάλο', context?: Record<string, unknown>, requestId?: string) {
    super(message, 413, 'PAYLOAD_TOO_LARGE', context, true, requestId);
  }
}

/**
 * Σφάλμα για μη διαθέσιμη υπηρεσία.
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Η υπηρεσία δεν είναι διαθέσιμη αυτή τη στιγμή', context?: Record<string, unknown>, requestId?: string) {
    super(message, 503, 'SERVICE_UNAVAILABLE', context, false, requestId);
  }
}

/**
 * Σφάλμα για προβλήματα με εξωτερικές υπηρεσίες.
 */
export class ExternalServiceError extends AppError {
  constructor(
    message = 'Παρουσιάστηκε σφάλμα κατά την επικοινωνία με εξωτερική υπηρεσία',
    serviceName: string,
    errorDetails?: unknown,
    requestId?: string
  ) {
    super(
      message, 
      502, 
      'EXTERNAL_SERVICE_ERROR', 
      { service: serviceName, details: errorDetails },
      false,
      requestId
    );
  }
}

/**
 * Σφάλμα για προβλήματα κατά την επεξεργασία αρχείων.
 */
export class FileProcessingError extends AppError {
  constructor(
    message = 'Παρουσιάστηκε σφάλμα κατά την επεξεργασία του αρχείου',
    filename?: string,
    errorDetails?: unknown,
    requestId?: string
  ) {
    super(
      message, 
      500, 
      'FILE_PROCESSING_ERROR', 
      { filename, details: errorDetails },
      true,
      requestId
    );
  }
}

/**
 * Σφάλμα για λήξη token ή session.
 */
export class TokenExpiredError extends AppError {
  constructor(message = 'Το token έχει λήξει', context?: Record<string, unknown>, requestId?: string) {
    super(message, 401, 'TOKEN_EXPIRED', context, true, requestId);
  }
}

/**
 * Σφάλμα για μη έγκυρο token.
 */
export class InvalidTokenError extends AppError {
  constructor(message = 'Το token δεν είναι έγκυρο', context?: Record<string, unknown>, requestId?: string) {
    super(message, 401, 'INVALID_TOKEN', context, true, requestId);
  }
}

/**
 * Τύπος για να αναγνωρίζουμε σφάλματα PostgreSQL
 */
export interface PostgresError extends Error {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

/**
 * Έλεγχος αν ένα σφάλμα είναι PostgreSQL error
 */
export function isPostgresError(error: unknown): error is PostgresError {
  return (
    error instanceof Error && 
    'code' in error && 
    typeof (error as { code?: unknown }).code === 'string'
  );
}

/**
 * Δημιουργία κατάλληλου AppError από PostgreSQL error
 */
export function createErrorFromPostgresError(error: PostgresError): AppError {
  switch (error.code) {
    case '23505': // unique_violation
      return new ConflictError(
        'Η εγγραφή δεν μπορεί να δημιουργηθεί επειδή τα δεδομένα έρχονται σε σύγκρουση με υπάρχουσα εγγραφή',
        { constraint: error.constraint, table: error.table, detail: error.detail }
      );
    
    case '23503': // foreign_key_violation
      return new ValidationError(
        'Η εγγραφή δεν μπορεί να δημιουργηθεί ή να ενημερωθεί επειδή αναφέρεται σε μη υπαρκτή εγγραφή',
        { constraint: error.constraint, table: error.table, detail: error.detail }
      );
    
    case '23502': // not_null_violation
      return new ValidationError(
        'Το πεδίο δεν μπορεί να είναι κενό',
        { constraint: error.constraint, table: error.table, detail: error.detail }
      );
    
    case '22P02': // invalid_text_representation
      return new ValidationError(
        'Τα δεδομένα δεν έχουν την αναμενόμενη μορφή',
        { detail: error.detail }
      );
    
    case '42P01': // undefined_table
      return new DatabaseError(
        'Ο πίνακας δεν υπάρχει στη βάση δεδομένων',
        error
      );
    
    case '28P01': // invalid_password
      return new UnauthorizedError(
        'Λανθασμένα διαπιστευτήρια βάσης δεδομένων',
        { detail: error.detail }
      );
    
    default:
      return new DatabaseError(
        'Παρουσιάστηκε σφάλμα βάσης δεδομένων',
        error
      );
  }
}