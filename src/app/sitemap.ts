// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/utils/seo'

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const routes = ['', '/cv'].map((route): MetadataRoute.Sitemap[number] => ({
   url: `${siteConfig.url}${route}`,
   lastModified: new Date().toISOString(),
   changeFrequency: (route === '' ? 'daily' : 'weekly') as ChangeFreq,
   priority: route === '' ? 1 : 0.8
 }))

 return routes
}