// src/lib/auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

// Simple auth token generation
export function generateAuthToken(username: string): string {
  const timestamp = Date.now();
  const token = Buffer.from(`${username}:${timestamp}:${ADMIN_PASSWORD}`).toString('base64');
  return token;
}

// Validate auth token
export function validateAuthToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, timestamp, password] = decoded.split(':');
    
    // Check if token is expired (24 hours)
    const now = Date.now();
    const tokenTime = parseInt(timestamp, 10);
    const isExpired = now - tokenTime > 24 * 60 * 60 * 1000;
    
    if (isExpired) return false;
    
    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  } catch (error) {
    return false;
  }
}

// Server action to check authentication
export async function checkAuth() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  
  if (!authToken || !validateAuthToken(authToken)) {
    redirect('/admin/login');
  }
}

// Client-side authentication check
export function useIsAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const authToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
  
  return !!authToken;
}