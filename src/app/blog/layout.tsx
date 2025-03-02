import type { Metadata } from 'next'
import { defaultMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...defaultMetadata,
  title: 'Blog | Christos Kerigkas',
  description: 'Articles about web development, cryptocurrency trading, and software engineering',
  openGraph: {
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