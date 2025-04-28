// src/components/certifications-server.tsx
import React from 'react';
import { certificationsRepository } from '@/lib/db/repositories/certifications-repository';
import { CertificationsClient } from './certifications-client';

interface CertificationsServerProps {
  theme: string;
}

export async function CertificationsServer({ theme }: CertificationsServerProps) {
  // Φόρτωση πιστοποιητικών από τη βάση δεδομένων
  const allCertifications = await certificationsRepository.findAll();
  
  // Client-side component για τα tabs και το φιλτράρισμα
  return <CertificationsClient theme={theme} certifications={allCertifications} />;
}