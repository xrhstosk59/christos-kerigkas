'use client'

// src/components/features/certifications/certifications.tsx
import { useTheme } from '@/components/providers/theme-provider'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// ΔΙΟΡΘΩΣΗ: Αφαίρεση της επιλογής ssr: true
const CertificationsComponent = dynamic(() => import('@/components/features/certifications/index'), {
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
})

export function Certifications() {
  const { theme } = useTheme()
  
  return (
    <section id="certifications" className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }>
          {/* Περνάμε μόνο τη τιμή string για ασφαλή σειριοποίηση */}
          <CertificationsComponent theme={theme === 'dark' ? 'dark' : 'light'} />
        </Suspense>
      </div>
    </section>
  )
}