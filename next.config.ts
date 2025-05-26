// next.config.ts - OPTIMIZED FOR MAXIMUM PERFORMANCE
import { type NextConfig } from "next"
import BundleAnalyzer from "@next/bundle-analyzer"

// ✅ MINIMAL ESSENTIAL SECURITY HEADERS ONLY
const essentialHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

// ✅ OPTIMIZED BUNDLE ANALYZER
const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false, // Don't auto-open
});

// ✅ SUPER OPTIMIZED NEXT CONFIG
const nextConfig: NextConfig = {
  // ✅ IMAGE OPTIMIZATION
  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Optimized sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Common icon sizes
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'christoskerigkas.com',
      },
      {
        protocol: 'https',
        hostname: 'tnwbnlbmlqoxypsqdqii.supabase.co',
      },
    ],
  },
  
  // ✅ BUILD OPTIMIZATIONS
  typescript: {
    ignoreBuildErrors: false, // Enable for stricter builds
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable for better code quality
  },
  
  // ✅ PERFORMANCE SETTINGS
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  reactStrictMode: true, // Enable React strict mode
  
  // ✅ OPTIMIZED WEBPACK CONFIG
  webpack: (config, { isServer, dev }) => {
    // Client-side optimizations
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
      
      // Production optimizations
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          usedExports: true,
          sideEffects: false,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                maxSize: 244000, // ~240KB
              },
              common: {
                minChunks: 2,
                chunks: 'all',
                enforce: true,
                maxSize: 244000,
              },
            },
          },
        };
      }
    }
    
    return config;
  },
  
  // ✅ EXPERIMENTAL FEATURES FOR PERFORMANCE
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb', // Reduced from 2mb
    },
    optimizeCss: true, // Enable CSS optimization
    serverMinification: true, // Minify server code
    webVitalsAttribution: ['CLS', 'LCP'], // Track key metrics only
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'lodash-es'
    ], // Optimize specific packages
  },
  
  // ✅ OPTIMIZED HEADERS
  headers: async () => [
    // Static assets - long cache
    {
      source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf|eot)',
      locale: false,
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        }
      ],
    },
    // Uploads - long cache with revalidation
    {
      source: '/uploads/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        }
      ],
    },
    // API routes - no cache
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, must-revalidate',
        }
      ],
    },
    // All pages - essential headers
    {
      source: '/:path*',
      headers: essentialHeaders,
    }
  ],
  
  // ✅ REDIRECT OPTIMIZATIONS
  redirects: async () => [
    // Add common redirects here if needed
  ],
  
  // ✅ LOGGING (minimal in production)
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV !== 'production',
    },
  },
  
  // ✅ OUTPUT SETTINGS
  output: 'standalone', // Optimize for deployment
  
  // ✅ COMPILER OPTIONS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  
  // ✅ RUNTIME CONFIG
  serverRuntimeConfig: {
    // Server-only config
  },
  publicRuntimeConfig: {
    // Client-side config
  },
}

// ✅ EXPORT WITH CONDITIONAL BUNDLE ANALYZER
export default process.env.ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig;