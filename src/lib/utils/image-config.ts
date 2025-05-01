// src/lib/image-config.ts (βελτιωμένη έκδοση)
export const imageConfig = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  domains: [
    // Προσθέτουμε μόνο συγκεκριμένα domains αντί για wildcard
    'christoskerigkas.com',
    'tnwbnlbmlqoxypsqdqii.supabase.co', // Supabase storage
    // Πρόσθεσε εδώ άλλα domains που χρειάζεσαι
  ],
  path: '/_next/image',
  loader: 'default',
  minimumCacheTTL: 60,
  cacheMaxAge: 60 * 60 * 24 * 30, // 30 days
  staleWhileRevalidate: 60 * 60 * 24 * 7, // 7 days
  contentSecurityPolicy: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://tnwbnlbmlqoxypsqdqii.supabase.co;",
};

// Βελτιωμένος image loader με βελτιστοποιήσεις
export const customImageLoader = ({ src, width, quality }: { 
  src: string; 
  width: number; 
  quality?: number;
}) => {
  // Χειρισμός απόλυτων URL
  if (src.startsWith('http')) {
    return src;
  }
  
  // Βασικό URL για τις εικόνες του δικού σου server
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://christoskerigkas.com';
  
  // Προσθήκη παραμέτρων ποιότητας & πλάτους για το Next.js Image Optimization API
  return `${baseUrl}${src}?w=${width}&q=${quality || 75}`;
};