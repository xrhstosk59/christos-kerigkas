// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import { ADMIN_USERNAME, ADMIN_PASSWORD, generateAuthToken } from '@/lib/auth';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

// Create limiter for login attempts
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10,
});

// Login validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              'unknown';
    
    // Check rate limit - 5 attempts per minute per IP
    try {
      await limiter.check(5, `LOGIN_${ip}`);
    } catch {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Get and validate data
    const body = await req.json();
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid form data', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { username, password } = validationResult.data;
    
    // Check credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Generate authentication token
    const token = generateAuthToken(username);
    
    // Set cookie and return success
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );
    
    // Set auth token cookie with appropriate security settings
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      sameSite: 'strict',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}