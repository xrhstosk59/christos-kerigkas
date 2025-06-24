import { z } from 'zod';
import { NextRequest } from 'next/server';
import { ValidationError } from './api-error';

/**
 * Input validation types
 */
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  error?: ValidationError;
};

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): Promise<ValidationResult<T>> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    // Validate against schema
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const formattedErrors = formatZodError(result.error);
      throw new ValidationError('Validation failed', { errors: formattedErrors });
    }
    
    return {
      success: true,
      data: result.data,
    };
  } catch (err) {
    if (err instanceof ValidationError) {
      return {
        success: false,
        error: err,
      };
    }
    
    if (err instanceof Error) {
      return {
        success: false,
        error: new ValidationError(err.message),
      };
    }
    
    return {
      success: false,
      error: new ValidationError('Validation failed'),
    };
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): ValidationResult<T> {
  try {
    const url = new URL(req.url);
    const queryObj: Record<string, string> = {};
    
    // Convert URLSearchParams to object
    url.searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });
    
    // Validate against schema
    const result = schema.safeParse(queryObj);
    
    if (!result.success) {
      const formattedErrors = formatZodError(result.error);
      throw new ValidationError('Query validation failed', { errors: formattedErrors });
    }
    
    return {
      success: true,
      data: result.data,
    };
  } catch (err) {
    if (err instanceof ValidationError) {
      return {
        success: false,
        error: err,
      };
    }
    
    if (err instanceof Error) {
      return {
        success: false,
        error: new ValidationError(err.message),
      };
    }
    
    return {
      success: false,
      error: new ValidationError('Query validation failed'),
    };
  }
}

/**
 * Format Zod validation errors into a more user-friendly structure
 */
export function formatZodError(
  zodError: z.ZodError
): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};
  
  for (const issue of zodError.issues) {
    const path = issue.path.join('.');
    const message = issue.message;
    
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    
    formattedErrors[path].push(message);
  }
  
  return formattedErrors;
}

/**
 * Convert validation errors to API error response
 */
export function validationErrorResponse(
  error: ValidationError
): { status: number; body: Record<string, unknown> } {
  return {
    status: error.status,
    body: {
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    },
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input to prevent XSS
 * @deprecated Χρησιμοποιήστε το sanitizeInput από το sanitize.ts για καλύτερη προστασία
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Common validation schemas
 */
export const Schemas = {
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  uuid: z.string().uuid('Invalid UUID'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
};