// src/app/sitemap.ts
import { siteConfig } from '@/lib/seo'

export default async function sitemap() {
  const routes = ['', '/blog', '/projects'].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes]
}