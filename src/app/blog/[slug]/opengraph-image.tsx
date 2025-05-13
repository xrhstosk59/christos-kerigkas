// src/app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getBlogPostBySlug } from '@/lib/api/blog';
import { siteConfig } from '@/lib/utils/seo';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const alt = 'Blog Post';

// Διορθωμένο για χειρισμό relative URLs στο server environment
export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  
  // Βοηθητική συνάρτηση για απόλυτα URLs (χρειάζεται στην edge runtime)
  const getAbsoluteUrl = (path: string) => {
    // Αφαιρούμε τυχόν προηγούμενες absolute URLs 
    const relativePath = path.startsWith('http') ? 
      new URL(path).pathname : 
      path.startsWith('/') ? path : `/${path}`;
    
    // Χρησιμοποιούμε το process.env.NEXT_PUBLIC_SITE_URL αν είναι διαθέσιμο
    // ή fallback σε ένα σχετικό URL που θα διαχειριστεί το Next.js
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    return `${baseUrl}${relativePath}`;
  };
  
  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            background: '#f8fafc',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: 60, fontWeight: 'bold' }}>
            {siteConfig.name}
          </h1>
          <p style={{ fontSize: 30, marginTop: 20 }}>Blog Post Not Found</p>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          background: '#f8fafc',
          width: '100%',
          height: '100%',
          padding: 40,
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          {/* Διορθωμένο για χρήση σχετικών URLs αντί για απόλυτα */}
          <img
            src={getAbsoluteUrl('/profile.jpg')}
            width={60}
            height={60}
            style={{ borderRadius: 30 }}
            alt={siteConfig.author.name}
          />
          <p style={{ marginLeft: 20, fontSize: 24 }}>{siteConfig.author.name}</p>
        </div>
        
        <h1 style={{ fontSize: 60, fontWeight: 'bold', maxWidth: 900 }}>
          {post.title}
        </h1>
        
        <p style={{ fontSize: 30, marginTop: 20, color: '#64748b', maxWidth: 900 }}>
          {post.description}
        </p>
        
        <div style={{ display: 'flex', marginTop: 'auto', gap: 10 }}>
          {post.categories && post.categories.map((category: string) => (
            <div
              key={category}
              style={{
                background: '#e2e8f0',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 18,
              }}
            >
              {category}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}