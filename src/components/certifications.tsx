// src/components/certifications.tsx
import { useTheme } from './theme-provider'
import { CertificationsServer } from './certifications-server'
import { Suspense } from 'react'

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
          <CertificationsServer theme={theme} />
        </Suspense>
      </div>
    </section>
  )
}