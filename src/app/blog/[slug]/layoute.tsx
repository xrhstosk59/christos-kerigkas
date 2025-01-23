// src/app/blog/[slug]/layout.tsx
import type { Metadata } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import type { BlogPost } from '@/types/blog'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const filePath = path.join(process.cwd(), 'src/content/posts', `${params.slug}.json`)
    const content = await fs.readFile(filePath, 'utf8')
    const post = JSON.parse(content) as BlogPost

    return {
      title: `${post.title} | Blog`,
      description: post.description,
      authors: [{ name: post.author.name }],
      openGraph: {
        title: post.title,
        description: post.description,
        type: 'article',
        publishedTime: post.date,
        authors: [post.author.name],
        images: [
          {
            url: post.image,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
        images: [post.image],
      },
    }
  } catch {
    return {
      title: 'Blog Post Not Found',
    }
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}