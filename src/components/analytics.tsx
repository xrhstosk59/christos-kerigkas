// src/components/analytics.tsx
'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID

  // Track page views
  useEffect(() => {
    if (!GA_ID) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    // Track page view - χρήση window['gtag'] αντί για window.gtag για να αποφύγουμε το TS error
    if (typeof window !== 'undefined' && 'gtag' in window) {
      window['gtag']('config', GA_ID, {
        page_path: url,
      })
    }
  }, [pathname, searchParams, GA_ID])

  if (!GA_ID) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              debug_mode: ${process.env.NODE_ENV === 'development'}
            });
          `,
        }}
      />
    </>
  )
}