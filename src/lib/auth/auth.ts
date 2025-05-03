// src/lib/auth/auth.ts
// Αυτό το αρχείο διατηρείται για συμβατότητα με υπάρχοντα imports
// ΠΡΟΣΟΧΗ: Αυτό το αρχείο δεν πρέπει να χρησιμοποιηθεί σε client-side κώδικα

// Εισαγωγές από τα επιμέρους modules
import * as commonTypes from './common';

// Μόνο server-side imports - δεν εισάγουμε next/headers εδώ
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import { createClient } from '@supabase/supabase-js';
// import { createServerClient } from '@supabase/ssr';
// import { NextRequest, NextResponse } from 'next/server';

// Επανεξαγωγή των τύπων
export interface UserSession {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  } | null;
  isAuthenticated: boolean;
}

// Επανεξαγωγή των σταθερών
export const ADMIN_USERNAME = commonTypes.ADMIN_USERNAME;
export const ADMIN_PASSWORD = commonTypes.ADMIN_PASSWORD;

// Επανεξαγωγή των συναρτήσεων από το common
export const validatePassword = commonTypes.validatePassword;
export const validateSecureToken = commonTypes.validateSecureToken;
export const generateSecureToken = commonTypes.generateSecureToken;

// Σημείωση: Όλες οι λειτουργίες που χρησιμοποιούν server-only modules έχουν μετακινηθεί στο server-auth.ts