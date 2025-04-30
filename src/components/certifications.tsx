'use client'

// src/components/certifications.tsx
// Αντικαθιστά το παλιό certifications.tsx αρχείο
import { useTheme } from '@/components/theme-provider'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Δυναμική εισαγωγή του νέου Certifications component
const CertificationsComponent = dynamic(() => import('./certifications/index'), {
  ssr: true,
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
})

export default function Certifications() {
  const { theme } = useTheme()
  
  return (
    <section id="certifications" className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }>
          <CertificationsComponent theme={theme} />
        </Suspense>
      </div>
    </section>
  )
}