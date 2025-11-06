// src/lib/utils/seo.ts
import { Metadata } from 'next';
import { getProfileImageUrl } from './storage';

// Προσθήκη του siteConfig για συμβατότητα με τα υπόλοιπα αρχεία
export const siteConfig = {
  name: 'Christos Kerigkas',
  url: 'https://christoskerigkas.com',
  author: {
    name: 'Christos Kerigkas',
    image: getProfileImageUrl(),
    jobTitle: 'Full Stack Developer',
    email: 'contact@christoskerigkas.com',
    location: 'Kavala, Greece',
    sameAs: [
      'https://github.com/christoskerigkas',
      'https://linkedin.com/in/christoskerigkas',
      // Συμπλήρωσε με τα πραγματικά social profiles
    ]
  },
  description: 'Full Stack Developer specializing in Next.js, React, TypeScript, and Node.js. Portfolio, blog, and professional experience.',
  logo: {
    url: '/logo.png',
    width: 192,
    height: 192,
    alt: 'Christos Kerigkas Logo'
  },
  organization: {
    name: 'Christos Kerigkas',
    url: 'https://christoskerigkas.com',
    logo: '/logo.png'
  }
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
    creator: '@christoskerigkas', // Συμπλήρωσε με το πραγματικό Twitter handle
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
    other: {
      'msvalidate.01': process.env.BING_VERIFICATION_ID || '',
    },
  },
  alternates: {
    canonical: 'https://christoskerigkas.com',
    languages: {
      'en-US': 'https://christoskerigkas.com',
      'el-GR': 'https://christoskerigkas.com/el'
    },
  },
  category: 'technology'
};

// Δημιουργία JSON-LD για Person schema
export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.author.image}`,
    jobTitle: siteConfig.author.jobTitle,
    email: siteConfig.author.email,
    sameAs: siteConfig.author.sameAs,
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.author.location
    },
    worksFor: {
      '@type': 'Organization',
      name: siteConfig.organization.name,
      url: siteConfig.organization.url
    }
  };
}

// Δημιουργία JSON-LD για WebSite schema
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@type': 'Person',
      name: siteConfig.author.name
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/blog/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

// Δημιουργία metadata για blog posts
export function generateBlogPostMetadata(
  title: string,
  description: string,
  slug: string,
  image: string,
  date: string,
  author: string,
  categories: string[] = []
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
      tags: categories,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.startsWith('http') ? image : `https://christoskerigkas.com${image}`],
      creator: '@christoskerigkas', // Συμπλήρωσε με το πραγματικό Twitter handle
    },
    alternates: {
      canonical: url,
    },
    keywords: [...categories, 'Christos Kerigkas', 'blog', 'web development'],
    authors: [{ name: author, url: 'https://christoskerigkas.com' }],
    category: categories[0] || 'technology'
  };
}

// Δημιουργία JSON-LD για Blog Post (Article schema)
export function generateArticleJsonLd(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  author: { name: string; image: string };
  categories?: string[];
  modifiedDate?: string;
}) {
  const url = `https://christoskerigkas.com/blog/${post.slug}`;
  const imageUrl = post.author.image.startsWith('http') 
    ? post.author.image 
    : `https://christoskerigkas.com${post.author.image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: imageUrl,
    datePublished: post.date,
    dateModified: post.modifiedDate || post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: 'https://christoskerigkas.com',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.logo.url}`,
        width: siteConfig.logo.width,
        height: siteConfig.logo.height
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.categories?.join(', ') || '',
    articleSection: post.categories?.[0] || 'Technology'
  };
}