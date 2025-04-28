// src/app/cv/page.tsx
import { Metadata } from 'next';
import InteractiveCV from '@/components/cv/interactive-cv';
import { getMockCVData } from '@/lib/cv-data';

export const metadata: Metadata = {
  title: 'Interactive CV - Christos Kerigkas',
  description: 'Explore my professional experiences, skills, projects, and certifications through an interactive CV.',
};

export default async function CVPage() {
  // Load data on the server
  const cvData = await getMockCVData();
  
  return (
    <main className="container mx-auto px-4 py-8">
      <InteractiveCV initialCVData={cvData} />
    </main>
  );
}