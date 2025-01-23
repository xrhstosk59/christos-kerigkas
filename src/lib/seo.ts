// src/lib/seo.ts

export const siteConfig = {
    name: 'Christos Kerigkas',
    title: 'Christos Kerigkas | Full Stack Developer',
    description: 'Full Stack Developer specializing in Next.js, React, and TypeScript. Building modern web applications and cryptocurrency trading solutions.',
    url: 'https://christoskerigkas.com',
    ogImage: '/og.png',
    links: {
      github: 'https://github.com/yourusername',
      linkedin: 'https://linkedin.com/in/yourusername',
      email: 'your-email@example.com'
    }
  }
  
  export const seoConfig = {
    default: {
      title: siteConfig.title,
      description: siteConfig.description,
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
        }]
      },
      twitter: {
        card: 'summary_large_image',
        title: siteConfig.title,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
      },
      alternates: {
        canonical: siteConfig.url
      }
    }
  }
  
  export type SeoMetadata = {
    title?: string
    description?: string
    image?: string
    canonical?: string
    noIndex?: boolean
  }
  
  export function constructMetadata({
    title,
    description,
    image,
    canonical,
    noIndex,
  }: SeoMetadata = {}) {
    return {
      title: title ? `${title} | ${siteConfig.name}` : seoConfig.default.title,
      description: description || seoConfig.default.description,
      openGraph: {
        ...seoConfig.default.openGraph,
        title: title || seoConfig.default.title,
        description: description || seoConfig.default.description,
        images: [
          {
            url: image || seoConfig.default.openGraph.images[0].url,
            width: 1200,
            height: 630,
            alt: title || siteConfig.name,
          },
        ],
      },
      twitter: {
        ...seoConfig.default.twitter,
        title: title || seoConfig.default.title,
        description: description || seoConfig.default.description,
        images: [image || seoConfig.default.twitter.images[0]],
      },
      alternates: {
        canonical: canonical || seoConfig.default.alternates.canonical,
      },
      robots: {
        index: !noIndex,
        follow: !noIndex,
      },
    }
  }