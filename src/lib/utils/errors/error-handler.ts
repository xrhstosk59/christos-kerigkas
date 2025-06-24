// src/lib/utils/errors/error-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { reportError } from '@/lib/monitoring/sentry';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export class ApiErrorClass extends Error implements ApiError {
  public statusCode: number;
  public code?: string;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Handle API errors and return appropriate responses
 */
export function handleApiError(
  error: unknown,
  request?: NextRequest
): NextResponse {
  console.error('API Error:', error);

  // Report error to Sentry
  if (error instanceof Error) {
    reportError(error, {
      feature: 'api_error',
      action: 'unhandled_error',
      metadata: {
        url: request?.url,
        method: request?.method,
      },
    });
  }

  // Handle different types of errors
  if (error instanceof ApiErrorClass) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Handle database connection errors
  if (error instanceof Error && error.message.includes('connection')) {
    return NextResponse.json(
      {
        error: 'Database connection failed',
        code: 'DATABASE_ERROR',
      },
      { status: 503 }
    );
  }

  // Handle authentication errors
  if (error instanceof Error && error.message.includes('unauthorized')) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      },
      { status: 401 }
    );
  }

  // Handle permission errors
  if (error instanceof Error && error.message.includes('forbidden')) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        code: 'FORBIDDEN',
      },
      { status: 403 }
    );
  }

  // Handle generic errors
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Create a custom API error
 */
export function createApiError(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: Record<string, unknown>
): ApiErrorClass {
  return new ApiErrorClass(message, statusCode, code, details);
}

/**
 * Validation error creator
 */
export function createValidationError(
  message: string = 'Validation failed',
  details?: Record<string, unknown>
): ApiErrorClass {
  return new ApiErrorClass(message, 400, 'VALIDATION_ERROR', details);
}

/**
 * Unauthorized error creator
 */
export function createUnauthorizedError(
  message: string = 'Unauthorized'
): ApiErrorClass {
  return new ApiErrorClass(message, 401, 'UNAUTHORIZED');
}

/**
 * Forbidden error creator
 */
export function createForbiddenError(
  message: string = 'Forbidden'
): ApiErrorClass {
  return new ApiErrorClass(message, 403, 'FORBIDDEN');
}

/**
 * Not found error creator
 */
export function createNotFoundError(
  message: string = 'Not found'
): ApiErrorClass {
  return new ApiErrorClass(message, 404, 'NOT_FOUND');
}

/**
 * Rate limit error creator
 */
export function createRateLimitError(
  message: string = 'Too many requests'
): ApiErrorClass {
  return new ApiErrorClass(message, 429, 'RATE_LIMIT_EXCEEDED');
}

/**
 * Server error creator
 */
export function createServerError(
  message: string = 'Internal server error',
  details?: Record<string, unknown>
): ApiErrorClass {
  return new ApiErrorClass(message, 500, 'INTERNAL_ERROR', details);
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}