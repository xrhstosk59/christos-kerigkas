'use client';

// src/components/common/client-component-wrapper.tsx
import React from 'react';

/**
 * Client Component Wrapper
 * 
 * Αυτό το component λειτουργεί ως "boundary" μεταξύ Server και Client Components.
 * Βοηθά στην αποφυγή σφαλμάτων serialization επειδή:
 * 1. Διακόπτει την άμεση επικοινωνία δεδομένων από Server σε Client Components
 * 2. Επιτρέπει την ασφαλή αρχικοποίηση των Client Components στον client
 * 
 * Χρήση: Περιτυλίξτε τα Client Components που βρίσκονται μέσα σε Server Components
 */
export default function ClientComponentWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}