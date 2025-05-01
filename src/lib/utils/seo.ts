// src/lib/seo.ts
import { Metadata } from 'next';

// Προσθήκη του siteConfig για συμβατότητα με τα υπόλοιπα αρχεία
export const siteConfig = {
  name: 'Christos Kerigkas',
  url: 'https://christoskerigkas.com',
  author: {
    name: 'Christos Kerigkas',
    image: '/profile.jpg',
  },
  description: 'Full Stack Developer specializing in Next.js, React, TypeScript, and Node.js. Portfolio, blog, and professional experience.',
};

// Βασικό configuration για SEO
export const defaultMetadata: Metadata = {
  title: {
    default: 'Christos Kerigkas | Full Stack Developer',
    template: '%s | Christos Kerigkas'
  },
  description: 'Full Stack Developer specializing in Next.js, React, TypeScript, and Node.js. Portfolio, blog, and professional experience.',
  keywords: ['Christos Kerigkas', 'Full Stack Developer', 'Next.js', 'React', 'TypeScript', 'Portfolio', 'Web Development'],
  authors: [{ name: 'Christos Kerigkas', url: 'https://christoskerigkas.com' }],
  creator: 'Christos Kerigkas',
  publisher: 'Christos Kerigkas',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://christoskerigkas.com',
    siteName: 'Christos Kerigkas',
    title: 'Christos Kerigkas | Full Stack Developer',
    description: 'Full Stack Developer specializing in Next.js, React, TypeScript, and Node.js. Portfolio, blog, and professional experience.',
    images: [
      {
        url: 'https://christoskerigkas.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Christos Kerigkas - Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Christos Kerigkas | Full Stack Developer',
    description: 'Full Stack Developer specializing in Next.js, React, TypeScript, and Node.js.',
    images: ['https://christoskerigkas.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID || '',
    yandex: process.env.YANDEX_VERIFICATION_ID || '',
    // Διόρθωση: Το 'bing' δεν είναι έγκυρο property, χρησιμοποιούμε το 'other'
    other: {
      'msvalidate.01': process.env.BING_VERIFICATION_ID || '',
    },
  },
  alternates: {
    canonical: 'https://christoskerigkas.com',
    languages: {
      'en-US': 'https://christoskerigkas.com',
    },
  }
};

// Δημιουργία metadata για blog posts
export function generateBlogPostMetadata(
  title: string,
  description: string,
  slug: string,
  image: string,
  date: string,
  author: string
): Metadata {
  const url = `https://christoskerigkas.com/blog/${slug}`;
  
  return {
    title,
    description,
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [
        {
          url: image.startsWith('http') ? image : `https://christoskerigkas.com${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: date,
      authors: [author],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.startsWith('http') ? image : `https://christoskerigkas.com${image}`],
    },
    alternates: {
      canonical: url,
    },
  };
}

// Δημιουργία JSON-LD για SEO
export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Christos Kerigkas',
    url: 'https://christoskerigkas.com',
    jobTitle: 'Full Stack Developer',
    sameAs: [
      'https://github.com/christoskerigkas',
      'https://linkedin.com/in/christoskerigkas',
      // Πρόσθεσε τα δικά σου social media
    ],
    image: 'https://christoskerigkas.com/profile.jpg',
    description: 'Full Stack Developer specializing in Next.js, React, TypeScript, and Node.js.',
  };
}

export function generateArticleJsonLd(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  author: { name: string; image: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.author.image.startsWith('http') 
      ? post.author.image 
      : `https://christoskerigkas.com${post.author.image}`,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: 'https://christoskerigkas.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Christos Kerigkas',
      logo: {
        '@type': 'ImageObject',
        url: 'https://christoskerigkas.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://christoskerigkas.com/blog/${post.slug}`,
    },
  };
}