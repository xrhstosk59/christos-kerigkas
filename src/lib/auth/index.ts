// src/lib/auth/index.ts
export type { UserSession } from './common';

// Μόνο συναρτήσεις proxy με δυναμικά imports
export async function logout() {
  if (typeof window === 'undefined') {
    const { logout } = await import('./server-auth');
    return logout();
  } else {
    const { auth } = await import('./client-auth');
    await auth.signOut();
    window.location.href = '/admin/login';
  }
}

export async function getCurrentSession() {
  if (typeof window === 'undefined') {
    const { getCurrentSession } = await import('./server-auth');
    return getCurrentSession();
  } else {
    const { getClientSession } = await import('./client-auth');
    return getClientSession();
  }
}