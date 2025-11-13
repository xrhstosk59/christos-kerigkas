/**
 * Memory-based Rate Limiting
 * Simple in-memory rate limiting for development and small-scale deployments
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config/env';

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
  message?: string;
  errorStatusCode?: number;
};

interface RateLimitResponse {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  response?: NextResponse;
  headers?: Record<string, string>;
}

// In-memory store for rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const memoryStore: RateLimitStore = {};

/**
 * Gets a unique identifier for the request (IP address or other identifier)
 */
function getRequestIdentifier(req: NextRequest | Request): string {
  const nextRequest = req instanceof NextRequest
    ? req
    : new NextRequest(req, { headers: req.headers });

  const forwardedFor = nextRequest.headers.get('x-forwarded-for');
  const realIp = nextRequest.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';

  return ip;
}

/**
 * Memory-based rate limiting
 */
function memoryRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResponse {
  const { maxRequests, windowMs, message, errorStatusCode } = config;
  const now = Date.now();

  // Initialize or update the request record
  if (!memoryStore[key] || memoryStore[key].resetTime < now) {
    memoryStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
  } else {
    memoryStore[key].count += 1;
  }

  const requestRecord = memoryStore[key];
  const remaining = Math.max(0, maxRequests - requestRecord.count);
  const success = requestRecord.count <= maxRequests;

  const headers = {
    'X-RateLimit-Limit': String(maxRequests),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(requestRecord.resetTime / 1000)),
  };

  if (!success) {
    const response = NextResponse.json(
      { error: message || 'Too many requests, please try again later.' },
      {
        status: errorStatusCode || 429,
        headers: {
          ...headers,
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
      headers,
    };
  }

  return {
    success: true,
    limit: maxRequests,
    remaining,
    resetTime: requestRecord.resetTime,
    headers,
  };
}

/**
 * Main rate limiting function
 * Uses in-memory storage for rate limiting
 */
export async function rateLimit(
  req: NextRequest | Request,
  config: RateLimitConfig,
  customKey?: string
): Promise<RateLimitResponse> {
  const identifier = customKey || getRequestIdentifier(req);
  const key = `ratelimit:${identifier}`;

  return memoryRateLimit(key, config);
}

/**
 * Creates a rate limiter for specific endpoints
 */
export function createEndpointRateLimit(
  endpointId: string,
  maxRequests: number,
  windowSeconds: number,
  message?: string
) {
  return (req: NextRequest | Request): Promise<RateLimitResponse> => {
    const identifier = getRequestIdentifier(req);
    const key = `${endpointId}:${identifier}`;

    return rateLimit(req, {
      maxRequests,
      windowMs: windowSeconds * 1000,
      message: message || `Too many requests to ${endpointId}, please try again later.`,
    }, key);
  };
}

// Pre-configured rate limiters
export const apiRateLimit = (req: NextRequest | Request): Promise<RateLimitResponse> =>
  rateLimit(req, {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many API requests, please try again in a minute.',
  });

export const contactFormRateLimit = (req: NextRequest | Request): Promise<RateLimitResponse> =>
  rateLimit(req, {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many contact form submissions. Please try again later.',
  });

export const newsletterRateLimit = (req: NextRequest | Request): Promise<RateLimitResponse> =>
  rateLimit(req, {
    maxRequests: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    message: 'Too many newsletter subscription attempts. Please try again tomorrow.',
  });

export const authRateLimit = (req: NextRequest | Request): Promise<RateLimitResponse> =>
  rateLimit(req, {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
  });

/**
 * Rate limit error type
 */
export type RateLimitError = Error & {
  status: number;
  headers: Record<string, string>;
  data: {
    message: string;
    remaining: number;
    resetTime: number;
  };
};

/**
 * Creates a rate limit error that can be thrown
 */
export function createRateLimitError(response: RateLimitResponse): RateLimitError {
  const error = new Error('Rate limit exceeded') as RateLimitError;
  error.status = 429;
  error.headers = {
    'X-RateLimit-Limit': String(response.limit),
    'X-RateLimit-Remaining': String(response.remaining),
    'X-RateLimit-Reset': String(Math.ceil(response.resetTime / 1000)),
    'Retry-After': String(Math.ceil((response.resetTime - Date.now()) / 1000)),
  };
  error.data = {
    message: response.response?.statusText || 'Too many requests',
    remaining: response.remaining,
    resetTime: response.resetTime,
  };
  return error;
}

/**
 * Cleanup memory store periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(memoryStore).forEach((key) => {
      if (memoryStore[key].resetTime < now) {
        delete memoryStore[key];
      }
    });
  }, 5 * 60 * 1000); // Every 5 minutes
}

/**
 * Apply rate limiting to a request and return response if rate limit exceeded
 * Alias for apiRateLimit for backward compatibility
 */
export const applyRateLimit = apiRateLimit;
