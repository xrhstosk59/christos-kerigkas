// /src/components/features/certifications/index.tsx
import { Suspense } from 'react'
import { studentCertifications } from '@/lib/data/mock-certifications'
import CertificationList from './certification-list'
import { cn } from '@/lib/utils/utils'

// Ορίζουμε ρητά τον τύπο των props
interface CertificationsProps {
  theme: 'dark' | 'light'
}

// Server Component που αντικαθιστά το παλιό certifications-server.tsx
// αλλά χρησιμοποιεί την server-first προσέγγιση

async function CertificationsContent({ theme }: CertificationsProps) {
  // Για την ώρα, χρησιμοποιούμε απευθείας τα mock data αντί για repository
  // καθώς υπάρχουν ασυμβατότητες τύπων
  const certifications = studentCertifications;
  
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
        {/* Περνάμε τα δεδομένα και το theme στο client component */}
        <CertificationList 
          certifications={certifications} 
          theme={theme} 
        />
      </div>
    </div>
  )
}

// Export το wrapper component που λαμβάνει το theme
export default function Certifications({ theme }: CertificationsProps) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <CertificationsContent theme={theme} />
    </Suspense>
  )
}