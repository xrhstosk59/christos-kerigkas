// src/components/analytics.tsx
'use client'

import Script from 'next/script'

export function Analytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID

  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-script" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            debug_mode: process.env.NODE_ENV === 'development'
          });
        `}
      </Script>
    </>
  )
}