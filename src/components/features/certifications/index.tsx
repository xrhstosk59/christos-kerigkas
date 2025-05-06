'use client'

// /src/components/features/certifications/index.tsx
import { useEffect, useState } from 'react'
import { studentCertifications } from '@/lib/data/mock-certifications'
import CertificationList from './certification-list'
import { cn } from '@/lib/utils/utils'
import { Certification } from '@/types/certifications'

// Ορίζουμε ρητά τον τύπο των props
interface CertificationsProps {
  theme: 'dark' | 'light'
}

// Μετατροπή σε client component
export default function Certifications({ theme }: CertificationsProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Χρησιμοποιούμε useEffect για να φορτώσουμε τα δεδομένα
  useEffect(() => {
    // Αρχικά χρησιμοποιούμε τα mock δεδομένα
    setCertifications(studentCertifications);
    setLoading(false);
    
    // Εδώ θα μπορούσαμε να κάνουμε fetch από το API αν χρειαστεί
    /*
    const fetchCertifications = async () => {
      try {
        const response = await fetch('/api/certifications');
        if (response.ok) {
          const data = await response.json();
          setCertifications(data);
        } else {
          // Αν υπάρχει σφάλμα, χρησιμοποιούμε τα mock δεδομένα
          setCertifications(studentCertifications);
        }
      } catch (error) {
        console.error('Error fetching certifications:', error);
        setCertifications(studentCertifications);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertifications();
    */
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
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
  );
}