// src/app/apple-icon.tsx
// Αντικαθιστά το ανύπαρκτο public/apple-icon.png.
// Τα apple touch icons δεν υποστηρίζουν διαφάνεια και δεν στρογγυλοποιούνται από iOS,
// γι' αυτό γεμίζει όλο το καμβά.
import { ImageResponse } from 'next/og'
import { brand } from '@/lib/utils/brand'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: brand.navy,
        }}
      >
        <div
          style={{
            display: 'flex',
            color: brand.gold,
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          CK
        </div>
        <div
          style={{
            display: 'flex',
            width: 44,
            height: 3,
            background: brand.goldFaint,
            marginTop: 10,
          }}
        />
      </div>
    ),
    size
  )
}
