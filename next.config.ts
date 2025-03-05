// next.config.ts
import { type NextConfig } from "next"
import { imageConfig } from "./src/lib/image-config"

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: imageConfig.deviceSizes,
    imageSizes: imageConfig.imageSizes,
    minimumCacheTTL: imageConfig.minimumCacheTTL,
    remotePatterns: [{
      protocol: 'https',
      hostname: '**',
    }],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  poweredByHeader: false,
  compress: true,
  env: {
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://christos-kerigkas.vercel.app',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  },
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png|webp|avif)',
      locale: false,
      headers: [
        {
          key: 'Cache-Control',
          value: `public, max-age=${imageConfig.cacheMaxAge}, s-maxage=${imageConfig.cacheMaxAge}, stale-while-revalidate=${imageConfig.staleWhileRevalidate}`,
        }
      ],
    },
    {
      source: '/uploads/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: `public, max-age=${imageConfig.cacheMaxAge}, immutable`,
        }
      ],
    },
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',  
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        }
      ],
    }
  ],
  // Experimental features για το Next.js 15
  experimental: {
    optimizeServerReact: true,
    optimizeCss: true,
    serverMinification: true,
    // Αφαιρέθηκε το useDeploymentId που δεν υποστηρίζεται
  },
}

export default nextConfig