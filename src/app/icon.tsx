// src/app/icon.tsx
// Παράγει /icon/192 και /icon/512 — αντικαθιστά τα ανύπαρκτα public/icon-192.png & icon-512.png.
import { ImageResponse } from 'next/og'
import { brand } from '@/lib/utils/brand'

export const contentType = 'image/png'

export function generateImageMetadata() {
  return [
    { id: '192', size: { width: 192, height: 192 }, contentType },
    { id: '512', size: { width: 512, height: 512 }, contentType },
  ]
}

export default function Icon({ id }: { id: string }) {
  const dimension = Number(id)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: brand.navy,
          color: brand.gold,
          fontSize: dimension * 0.42,
          fontWeight: 700,
          letterSpacing: dimension * 0.01,
        }}
      >
        CK
      </div>
    ),
    { width: dimension, height: dimension }
  )
}
