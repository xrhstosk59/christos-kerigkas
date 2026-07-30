// src/app/manifest.ts
// Αντικαθιστά το public/manifest.json, που έδειχνε σε τέσσερα ανύπαρκτα αρχεία
// (apple-icon.png, icon-192.png, icon-512.png, screenshot-*.png) και έσπαγε το PWA install.
import { MetadataRoute } from 'next'
import { brand } from '@/lib/utils/brand'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Christos Kerigkas Portfolio',
    short_name: 'CK Portfolio',
    description: 'Personal portfolio website showcasing my work and skills',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F6F2',
    theme_color: brand.navy,
    orientation: 'portrait-primary',
    lang: 'en',
    dir: 'ltr',
    categories: ['portfolio', 'development', 'personalization'],
    icons: [
      {
        // Παράγεται από src/app/icon.tsx
        src: '/icon/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
