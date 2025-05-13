// src/domains/blog/utils/blog-constants.ts

/**
 * Αριθμός άρθρων που εμφανίζονται ανά σελίδα στη λίστα του blog
 */
export const POSTS_PER_PAGE = 9;

/**
 * Μέγιστος αριθμός λέξεων που εμφανίζονται στην περίληψη άρθρου
 */
export const EXCERPT_MAX_WORDS = 30;

/**
 * Επιτρεπόμενοι τύποι περιεχομένου για εικόνες blog
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Μέγιστο μέγεθος εικόνας σε bytes (2MB)
 */
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/**
 * Διαθέσιμες κατηγορίες blog για εμφάνιση στο UI
 */
export const ALL_CATEGORIES = [
  'development',
  'javascript',
  'react',
  'nextjs',
  'typescript',
  'crypto',
  'trading',
  'technology',
  'web3',
  'tutorials',
  'tips'
];