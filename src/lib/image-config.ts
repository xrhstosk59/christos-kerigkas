// src/lib/image-config.ts
export const imageConfig = {
    // Ρυθμίσεις για το Next.js Image
    minimumCacheTTL: 86400, // 1 day
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Lambda cache settings (Next.js 15)
    cacheMaxAge: 31536000, // 1 year
    staleWhileRevalidate: 60, // 1 minute
  }