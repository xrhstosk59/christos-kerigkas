// next.config.ts
import { type NextConfig } from "next"

const nextConfig: NextConfig = {
 images: {
   formats: ['image/avif', 'image/webp'],
   deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
   minimumCacheTTL: 60,
   remotePatterns: [{
     protocol: 'https',
     hostname: '**',
   }],
 },
 typescript: {
   ignoreBuildErrors: false,
 },
 eslint: {
   ignoreDuringBuilds: false,
 },
 poweredByHeader: false,
 compress: true,
 env: {
   NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
 },
 headers: async () => [
   {
     source: '/:all*(svg|jpg|png|webp|avif)',
     locale: false,
     headers: [
       {
         key: 'Cache-Control',
         value: 'public, max-age=31536000, immutable',
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
}

export default nextConfig