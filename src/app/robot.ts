// src/app/robots.ts
import { siteConfig } from '@/lib/utils/seo'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}