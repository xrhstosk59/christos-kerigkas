/**
 * Βασική κλάση σφάλματος για την εφαρμογή.
 * Όλα τα σφάλματα κληρονομούν από αυτήν.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    context?: Record<string, unknown>,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;
    this.isOperational = isOperational; // Καθορίζει αν το σφάλμα είναι αναμενόμενο

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
  constructor(message = 'Δεν έχετε εξουσιοδότηση για αυτήν την ενέργεια') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Σφάλμα για απαγορευμένη πρόσβαση (έχει γίνει αυθεντικοποίηση αλλά δεν έχει τα απαραίτητα δικαιώματα).
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Απαγορεύεται η πρόσβαση σε αυτόν τον πόρο') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Σφάλμα για πόρο που δεν βρέθηκε.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Ο πόρος που ζητήσατε δεν βρέθηκε') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Σφάλμα για μη έγκυρα δεδομένα εισόδου.
 */
export class ValidationError extends AppError {
  constructor(
    message = 'Τα δεδομένα που υποβάλατε δεν είναι έγκυρα',
    validationErrors?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', { validationErrors });
  }
}

/**
 * Σφάλμα για αποτυχία βάσης δεδομένων.
 */
export class DatabaseError extends AppError {
  constructor(
    message = 'Παρουσιάστηκε σφάλμα κατά την επικοινωνία με τη βάση δεδομένων',
    originalError?: Error
  ) {
    super(
      message, 
      500, 
      'DATABASE_ERROR', 
      { originalError: originalError?.message },
      false // Μη λειτουργικό σφάλμα
    );
  }
}

/**
 * Σφάλμα για συγκρούσεις δεδομένων (π.χ. duplicate entry).
 */
export class ConflictError extends AppError {
  constructor(message = 'Προέκυψε σύγκρουση κατά την επεξεργασία του αιτήματός σας') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Σφάλμα για υπέρβαση ορίων (π.χ. rate limit).
 */
export class RateLimitError extends AppError {
  constructor(
    message = 'Έχετε υπερβεί το όριο αιτημάτων',
    resetTime?: number
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { resetTime });
  }
}