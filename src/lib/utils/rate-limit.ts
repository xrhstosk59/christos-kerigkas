import { NextRequest, NextResponse } from 'next/server';

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
  message?: string;
  errorStatusCode?: number;
};

type RequestRecord = {
  count: number;
  resetTime: number;
};

interface RateLimitResponse {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  response?: NextResponse;
}

interface RateLimitStore {
  [key: string]: RequestRecord;
}

const store: RateLimitStore = {};

/**
 * Cleans up expired records from the store
 */
function cleanupStore(): void {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

/**
 * Periodically clean up the store (every 5 minutes)
 */
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupStore, 5 * 60 * 1000);
}

/**
 * Gets a unique identifier for the request (IP address or other identifier)
 */
function getRequestIdentifier(req: NextRequest): string {
  // Get IP from headers or request object
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';
  
  return ip;
}

/**
 * Creates a rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    message = 'Too many requests, please try again later.',
    errorStatusCode = 429,
  } = config;

  return async function rateLimitMiddleware(
    req: NextRequest
  ): Promise<RateLimitResponse> {
    const identifier = getRequestIdentifier(req);
    const now = Date.now();

    // Initialize or update the request record
    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      store[identifier].count += 1;
    }

    const requestRecord = store[identifier];
    const remaining = Math.max(0, maxRequests - requestRecord.count);
    const success = requestRecord.count <= maxRequests;

    // If exceeded limit, return error response
    if (!success) {
      const response = NextResponse.json(
        { error: message },
        {
          status: errorStatusCode,
          headers: {
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(
              Math.ceil(requestRecord.resetTime / 1000)
            ),
            'Retry-After': String(Math.ceil((requestRecord.resetTime - now) / 1000)),
          },
        }
      );

      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetTime: requestRecord.resetTime,
        response,
      };
    }

    // Return success response
    return {
      success: true,
      limit: maxRequests,
      remaining,
      resetTime: requestRecord.resetTime,
    };
  };
}

/**
 * Generic rate limit handler for API routes
 */
export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResponse> {
  const limiter = createRateLimiter(config);
  return limiter(req);
}

// Define exported rate limiters with specific configurations
export const apiRateLimit = (req: NextRequest): Promise<RateLimitResponse> =>
  rateLimit(req, {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many API requests, please try again in a minute.',
  });

export const contactFormRateLimit = (req: NextRequest): Promise<RateLimitResponse> =>
  rateLimit(req, {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many contact form submissions. Please try again later.',
  });

export const newsletterRateLimit = (req: NextRequest): Promise<RateLimitResponse> =>
  rateLimit(req, {
    maxRequests: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    message: 'Too many newsletter subscription attempts. Please try again tomorrow.',
  });

export const authRateLimit = (req: NextRequest): Promise<RateLimitResponse> =>
  rateLimit(req, {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
  });

// Error handling types for rate limiting
type RateLimitErrorData = {
  message: string;
  remaining: number;
  resetTime: number;
};

export type RateLimitError = Error & {
  status: number;
  headers: Record<string, string>;
  data: RateLimitErrorData;
};

/**
 * Creates a rate limit error that can be thrown
 */
export function createRateLimitError(
  response: RateLimitResponse
): RateLimitError {
  const error = new Error('Rate limit exceeded') as RateLimitError;
  error.status = 429;
  error.headers = {
    'X-RateLimit-Limit': String(response.limit),
    'X-RateLimit-Remaining': String(response.remaining),
    'X-RateLimit-Reset': String(Math.ceil(response.resetTime / 1000)),
    'Retry-After': String(
      Math.ceil((response.resetTime - Date.now()) / 1000)
    ),
  };
  error.data = {
    message: response.response?.statusText || 'Too many requests',
    remaining: response.remaining,
    resetTime: response.resetTime,
  };
  return error;
}