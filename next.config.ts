// next.config.ts
import { type NextConfig } from "next"
import { imageConfig } from "./src/lib/image-config"

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: imageConfig.deviceSizes,
    imageSizes: imageConfig.imageSizes,
    minimumCacheTTL: imageConfig.minimumCacheTTL,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'christoskerigkas.com',
      },
      {
        protocol: 'https',
        hostname: 'tnwbnlbmlqoxypsqdqii.supabase.co',
      },
      // Πρόσθεσε επιπλέον domains αν χρειάζεται
    ],
  },
  typescript: {
    // Αφαιρέστε το ignoreBuildErrors για να εντοπίζετε τα προβλήματα
    // ignoreBuildErrors: true,
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
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  // Σύγχρονη προσέγγιση για server-only πακέτα
  experimental: {
    // Διόρθωση: αφαιρέθηκε το serverComponentsExternalPackages
    optimizeServerReact: true,
    optimizeCss: true,
    serverMinification: true,
  },
  // Προσθήκη του serverExternalPackages στο σωστό επίπεδο
  serverExternalPackages: ['pg-native'],
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
        },
        {
          key: 'Content-Security-Policy',
          value: imageConfig.contentSecurityPolicy || "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://tnwbnlbmlqoxypsqdqii.supabase.co;"
        }
      ],
    }
  ],
}

export default nextConfig