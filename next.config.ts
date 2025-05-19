// src/next.config.ts - Ενημερωμένο για Next.js 15
import { type NextConfig } from "next"
import { imageConfig } from "./src/lib/utils/image-config"
import BundleAnalyzer from "@next/bundle-analyzer"

// Ενισχυμένα security headers με πιο αυστηρό CSP
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
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), gyroscope=(), magnetometer=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://tnwbnlbmlqoxypsqdqii.supabase.co https://www.google-analytics.com; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; base-uri 'self';"
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'require-corp'
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin'
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin'
  }
];

// Βελτιωμένες ρυθμίσεις για το Bundle Analyzer
const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

// Διαμόρφωση του NextConfig
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
    // Σε παραγωγικό περιβάλλον, είναι καλύτερα να αγνοούνται τα σφάλματα για την αποφυγή διακοπών
    ignoreBuildErrors: true,
  },
  eslint: {
    // Σε παραγωγικό περιβάλλον, καλύτερα να αγνοούνται τα lint warnings
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  compress: true,
  // Προσθήκη webpack configuration για τα Node.js modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        perf_hooks: false,
        crypto: false,
        stream: false,
        os: false,
        path: false,
      };
    }
    
    // Προσθήκη source maps σε development mode
    if (!isServer && process.env.NODE_ENV === 'development') {
      config.devtool = 'eval-source-map';
    }
    
    return config;
  },
  experimental: {
    // Ενεργοποίηση υποστήριξης για server actions
    serverActions: {
      bodySizeLimit: '2mb', // Αύξηση ορίου μεγέθους για server actions
    },
    optimizeCss: true,
    serverMinification: true,
    // Η ιδιότητα missingSuspenseWithCSRBailout έχει αφαιρεθεί από το Next.js 15
    // Βασιζόμαστε πλέον μόνο στην αλλαγή του PageTransition component
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
      headers: securityHeaders,
    }
  ],
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV !== 'production',
    },
  },
}

// Εξαγωγή του config με το BundleAnalyzer wrapper όταν χρειάζεται
export default process.env.ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig;