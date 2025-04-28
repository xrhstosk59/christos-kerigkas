// src/components/certifications-server.tsx
// Αυτό το αρχείο πρέπει να είναι Server Component (χωρίς 'use client')
// για να μπορεί να χρησιμοποιεί async/await λειτουργίες

import { cn } from '@/lib/utils'
import { Certification } from '@/types/certifications'
import dynamic from 'next/dynamic'

// Δυναμική εισαγωγή του client component
const CertificationsClient = dynamic(() => import('./certifications-client'), {
  ssr: true
})

// Συνάρτηση για να φέρει τα πιστοποιητικά από το API ή τα mock data
async function getCertifications(): Promise<Certification[]> {
  try {
    // Προσπάθεια να φέρει τα πιστοποιητικά από το API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certifications`, {
      next: { revalidate: 3600 } // Revalidate κάθε 1 ώρα
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch certifications')
    }
    
    const data = await res.json()
    return data.certifications
  } catch (error) {
    console.error('Error fetching certifications:', error)
    
    // Φόρτωση των mock data σε περίπτωση σφάλματος
    const { studentCertifications } = await import('@/lib/mock-certifications')
    return studentCertifications
  }
}

interface CertificationsServerProps {
  theme: 'dark' | 'light'
}

export async function CertificationsServer({ theme }: CertificationsServerProps) {
  const certifications = await getCertifications()
  
  return (
    <div>
      <div className="mx-auto max-w-2xl lg:max-w-4xl text-center">
        <h2 className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl",
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Certifications
        </h2>
        
        <p className={cn(
          "mt-4 text-lg",
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          Professional certifications and courses completed in various technologies and domains.
        </p>
      </div>
      
      <div className="mt-16">
        <CertificationsClient certifications={certifications} theme={theme} />
      </div>
    </div>
  )
}