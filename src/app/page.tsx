// src/app/page.tsx - Server Component με βελτιωμένη δομή

import { Suspense } from 'react';
import Navbar from '@/components/common/navbar';
import Hero from '@/components/layout/hero';
import { About } from '@/components/features/about/about';
import { Experience } from '@/components/features/experience/experience';
import { Skills } from '@/components/features/skills/skills';
import { Projects } from '@/components/features/projects/projects';
import { CryptoProjects } from '@/components/features/crypto/crypto-projects';
import { Contact } from '@/components/features/contact/contact';
import { Footer } from '@/components/common/footer';
import { Certifications } from '@/components/features/certifications/certifications';

// Fallback για κάθε ενότητα που φορτώνεται με Suspense
function SectionSkeleton() {
  return (
    <div className="w-full py-16 animate-pulse">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md mb-6 w-1/3"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md mb-4 w-full"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md mb-4 w-full"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-2/3"></div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Hero />
      
      <Suspense fallback={<SectionSkeleton />}>
        <About />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <Experience />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <Skills />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <Certifications />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <Projects />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <CryptoProjects />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <Contact />
      </Suspense>
      
      <Footer />
    </main>
  );
}