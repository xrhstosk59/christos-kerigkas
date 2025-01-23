// src/app/blog/layout.tsx
import type { Metadata } from 'next'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Blog | Christos Kerigkas',
  description: 'Articles about web development, cryptocurrency trading, and software engineering',
  openGraph: {
    ...siteConfig.default.openGraph,
    title: 'Blog | Christos Kerigkas',
    description: 'Articles about web development, cryptocurrency trading, and software engineering',
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}