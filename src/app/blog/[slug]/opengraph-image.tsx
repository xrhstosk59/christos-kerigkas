// src/app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog';
import { siteConfig } from '@/lib/seo';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const alt = 'Blog Post';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  
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
          {/* Το img element χρησιμοποιείται εδώ μέσα στο ImageResponse.
              Προσθέτουμε το eslint-disable comment για να αποφύγουμε την προειδοποίηση */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${siteConfig.url}/profile.jpg`}
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
          {post.categories.map((category) => (
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