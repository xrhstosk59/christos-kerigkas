// src/lib/image-config.ts

/**
 * Ρυθμίσεις για το Next.js Image Optimization
 */

// Μεγέθη εικόνων για διαφορετικές συσκευές (σε pixels)
const deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

// Μεγέθη εικόνων για γενική χρήση (σε pixels)
const imageSizes = [16, 32, 48, 64, 96, 128, 256, 384, 512];

// Ρυθμίσεις για το caching των εικόνων
const minimumCacheTTL = 60; // σε δευτερόλεπτα
const cacheMaxAge = 60 * 60 * 24 * 7; // 7 ημέρες
const staleWhileRevalidate = 60 * 60 * 24; // 1 ημέρα

// Domains που επιτρέπονται για εξωτερικές εικόνες
const domains = [
  'christoskerigkas.com',
  'tnwbnlbmlqoxypsqdqii.supabase.co',
  'avatars.githubusercontent.com',
  'github.com',
  'raw.githubusercontent.com',
  'lh3.googleusercontent.com',
];

// Content Security Policy
const contentSecurityPolicy = "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://tnwbnlbmlqoxypsqdqii.supabase.co;";

// Εξαγωγή όλων των ρυθμίσεων
export const imageConfig = {
  deviceSizes,
  imageSizes,
  minimumCacheTTL,
  cacheMaxAge,
  staleWhileRevalidate,
  contentSecurityPolicy,
  domains,
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
      pathname: '**',
    },
  ],
  formats: ['image/avif', 'image/webp'],
  dangerouslyAllowSVG: true,
};

export default imageConfig;