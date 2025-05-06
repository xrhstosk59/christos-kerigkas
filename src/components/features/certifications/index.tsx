// src/components/features/certifications/index.tsx
import React, { useEffect, useState } from 'react';
import { Certification } from '@/types/certifications';
import { getCertifications } from '@/lib/db/repositories/certifications-repository';
import CertificationCard from './certification-card';
import CertificationDialog from './certification-dialog';

interface CertificationsComponentProps {
  theme: 'dark' | 'light';
}

export default function CertificationsComponent({ theme }: CertificationsComponentProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);

  useEffect(() => {
    const loadCertifications = async () => {
      try {
        setLoading(true);
        const data = await getCertifications();
        setCertifications(data);
      } catch (err) {
        console.error('Error loading certifications:', err);
        setError('Σφάλμα κατά τη φόρτωση των πιστοποιήσεων');
      } finally {
        setLoading(false);
      }
    };

    loadCertifications();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (certifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Δεν βρέθηκαν πιστοποιήσεις</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Πιστοποιήσεις
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          Επίσημες πιστοποιήσεις και προγράμματα εκπαίδευσης που έχω ολοκληρώσει
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((certification) => (
          <CertificationCard
            key={certification.id}
            certification={certification}
            theme={theme}
            onClick={() => setSelectedCertification(certification)}
          />
        ))}
      </div>

      {selectedCertification && (
        <CertificationDialog 
          certification={selectedCertification} 
          isOpen={!!selectedCertification}
          onClose={() => setSelectedCertification(null)}
          theme={theme}
        />
      )}
    </div>
  );
}