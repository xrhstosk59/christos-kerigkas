// src/app/opengraph-image.tsx
// Παράγεται στο build — αντικαθιστά το στατικό /og-image.jpg που δεν υπήρχε ποτέ.
import { ImageResponse } from 'next/og'
import { brand } from '@/lib/utils/brand'

export const alt = 'Christos Kerigkas - Web Developer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.navyLight} 100%)`,
          position: 'relative',
        }}
      >
        {/* hairline frame */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: `1px solid ${brand.goldFaint}`,
          }}
        />

        {/* monogram */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 76,
              height: 76,
              borderRadius: 38,
              border: `2px solid ${brand.gold}`,
              color: brand.gold,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            CK
          </div>
        </div>

        {/* name + role */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: brand.cream,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            Christos Kerigkas
          </div>

          <div
            style={{
              display: 'flex',
              width: 96,
              height: 3,
              background: brand.gold,
              marginTop: 28,
              marginBottom: 24,
            }}
          />

          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: brand.gold,
              letterSpacing: 6,
            }}
          >
            WEB DEVELOPER
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 22,
            color: brand.muted,
          }}
        >
          <div style={{ display: 'flex' }}>christoskerigkas.com</div>
          <div style={{ display: 'flex', letterSpacing: 1 }}>TypeScript · React · Next.js</div>
        </div>
      </div>
    ),
    size
  )
}
