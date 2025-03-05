import type { Metadata } from 'next'

export const siteConfig = {
  name: 'Christos Kerigkas',
  title: 'Christos Kerigkas | Full Stack Developer & Crypto Enthusiast',
  description: 'Full Stack Developer specializing in Next.js, React, and TypeScript. Building modern web applications and cryptocurrency trading solutions.',
  url: 'https://christoskerigkas.com',
  ogImage: '/og.png',
  links: {
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
    email: 'your-email@example.com'
  },
  author: {
    name: 'Christos Kerigkas',
    image: '/profile.jpg',
    bio: '21-year-old Full Stack Developer and Computer Science student based in Kavala, Greece.'
  }
}

export const defaultMetadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  formatDetection: {
    email: true,
    address: false,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{
      url: siteConfig.ogImage,
      width: 1200,
      height: 630,
      alt: siteConfig.name
    }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@yourusername'
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      'en-US': `${siteConfig.url}/en`,
      'el-GR': `${siteConfig.url}/el`,
    },
  },
  category: 'technology',
  keywords: [
    'Full Stack Developer', 
    'Next.js', 
    'React', 
    'TypeScript', 
    'Web Development',
    'Crypto Trading',
    'Portfolio',
    'Software Engineer',
    'JavaScript Developer',
    'Frontend Developer',
    'Backend Developer'
  ]
}