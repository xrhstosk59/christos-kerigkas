import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// CSRF Token configuration
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Interface for token data
interface TokenData {
  token: string;
  expires: number;
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new CSRF token and cookie
 */
export function createCsrfToken(): TokenData {
  const token = generateToken();
  const expires = Date.now() + TOKEN_EXPIRY;
  
  return { token, expires };
}

/**
 * Set CSRF token cookie in response
 */
export function setCsrfCookie(
  res: NextResponse,
  tokenData: TokenData
): NextResponse {
  const { token, expires } = tokenData;
  
  // Add secure cookie with the token
  res.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    expires: new Date(expires),
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  
  return res;
}

/**
 * Get CSRF token from request
 */
export function getCsrfToken(req: NextRequest): string | undefined {
  return req.cookies.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Verify CSRF token from request
 */
export function verifyCsrfToken(req: NextRequest): boolean {
  const cookieToken = getCsrfToken(req);
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  return cookieToken === headerToken;
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req: NextRequest): NextResponse | null {
  // Skip CSRF check for GET, HEAD, OPTIONS
  const safeMethod = /^(GET|HEAD|OPTIONS)$/i.test(req.method);
  if (safeMethod) {
    return null;
  }
  
  // Verify token
  if (!verifyCsrfToken(req)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Generate a new CSRF token response
 */
export function generateCsrfResponse(
  data: Record<string, unknown> = {}
): NextResponse {
  const tokenData = createCsrfToken();
  
  const response = NextResponse.json({
    ...data,
    csrfToken: tokenData.token,
  });
  
  return setCsrfCookie(response, tokenData);
}

/**
 * Error types for CSRF protection
 */
export class CsrfError extends Error {
  public status: number;
  
  constructor(message: string = 'Invalid CSRF token') {
    super(message);
    this.name = 'CsrfError';
    this.status = 403;
  }
}