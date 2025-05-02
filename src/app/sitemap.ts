// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { siteConfig } from '@/lib/utils/seo'

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const routes = ['', '/blog'].map((route): MetadataRoute.Sitemap[number] => ({
   url: `${siteConfig.url}${route}`,
   lastModified: new Date().toISOString(),
   changeFrequency: (route === '' ? 'daily' : 'weekly') as ChangeFreq,
   priority: route === '' ? 1 : 0.8
 }))

 const postsDirectory = path.join(process.cwd(), 'src/content/posts')
 const files = await fs.readdir(postsDirectory)
 
 const blogPosts = files.map((filename): MetadataRoute.Sitemap[number] => ({
   url: `${siteConfig.url}/blog/${filename.replace('.json', '')}`,
   lastModified: new Date().toISOString(), 
   changeFrequency: 'monthly' as ChangeFreq,
   priority: 0.6
 }))

 return [...routes, ...blogPosts]
}