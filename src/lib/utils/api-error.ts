/**
 * Standard API error class
 */
export class APIError extends Error {
  public status: number;
  public code: string;
  // Διόρθωση για exactOptionalPropertyTypes - Η ιδιότητα είναι πάντα ορισμένη
  public details: Record<string, unknown>;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    // Εάν το details είναι undefined, αρχικοποιούμε με κενό αντικείμενο
    this.details = details || {};
  }

  static fromError(error: Error, defaultStatus: number = 500): APIError {
    if (error instanceof APIError) {
      return error;
    }

    return new APIError(error.message, defaultStatus);
  }

  static fromUnknown(error: unknown): APIError {
    if (error instanceof APIError) {
      return error;
    }

    if (error instanceof Error) {
      return new APIError(error.message);
    }

    const errorMessage = typeof error === 'string' 
      ? error 
      : 'An unknown error occurred';
    
    return new APIError(errorMessage);
  }
}

/**
 * 400 Bad Request error
 */
export class BadRequestError extends APIError {
  constructor(message: string = 'Bad Request', details?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

/**
 * 401 Unauthorized error
 */
export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized', details?: Record<string, unknown>) {
    super(message, 401, 'UNAUTHORIZED', details);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden error
 */
export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden', details?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', details);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends APIError {
  constructor(message: string = 'Not Found', details?: Record<string, unknown>) {
    super(message, 404, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 Conflict error
 */
export class ConflictError extends APIError {
  constructor(message: string = 'Conflict', details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

/**
 * 422 Unprocessable Entity error
 */
export class ValidationError extends APIError {
  constructor(message: string = 'Validation Error', details?: Record<string, unknown>) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * 429 Too Many Requests error
 */
export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded', details?: Record<string, unknown>) {
    super(message, 429, 'RATE_LIMIT_ERROR', details);
    this.name = 'RateLimitError';
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends APIError {
  constructor(message: string = 'Internal Server Error', details?: Record<string, unknown>) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'InternalServerError';
  }
}

// Βελτιωμένος τύπος για ErrorResponse
export type ErrorResponse = {
  error: {
    message: string;
    code: string;
    status: number;
    // Διόρθωση για exactOptionalPropertyTypes: αν δεν υπάρχει, θα είναι κενό αντικείμενο
    details: Record<string, unknown>;
  };
};

/**
 * Factory function to create an error response object
 */
export function createErrorResponse(error: unknown): ErrorResponse {
  const apiError = APIError.fromUnknown(error);
  
  return {
    error: {
      message: apiError.message,
      code: apiError.code,
      status: apiError.status,
      // Διασφαλίζουμε ότι το details είναι πάντα ορισμένο
      details: apiError.details || {},
    },
  };
}