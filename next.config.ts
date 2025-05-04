// next.config.ts
import { type NextConfig } from "next"
import { imageConfig } from "./src/lib/utils/image-config"

// Ενισχυμένα security headers
const securityHeaders = [
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
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://tnwbnlbmlqoxypsqdqii.supabase.co https://www.google-analytics.com; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;"
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }
];

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
      // Add additional domains if needed
    ],
  },
  typescript: {
    // Remove ignoreBuildErrors to catch problems
    // ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  poweredByHeader: false,
  compress: true,
  // Remove env object - Next.js automatically exposes NEXT_PUBLIC_ env vars
  experimental: {
    optimizeCss: true,
    serverMinification: true,
  },
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
      headers: securityHeaders,
    }
  ],
}

export default nextConfig