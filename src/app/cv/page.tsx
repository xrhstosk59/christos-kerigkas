// src/app/cv/page.tsx
import { Metadata } from 'next';
import InteractiveCV from '@/components/cv/interactive-cv';
import { getMockCVData } from '@/lib/cv-data';

export const metadata: Metadata = {
  title: 'Διαδραστικό Βιογραφικό - Χρήστος Κέριγκας',
  description: 'Εξερευνήστε τις επαγγελματικές μου εμπειρίες, δεξιότητες, έργα και πιστοποιήσεις μέσω ενός διαδραστικού βιογραφικού.',
};

export default async function CVPage() {
  // Φόρτωση δεδομένων στο server
  const cvData = await getMockCVData();
  
  return (
    <main className="container mx-auto px-4 py-8">
      <InteractiveCV cvData={cvData} />
    </main>
  );
}