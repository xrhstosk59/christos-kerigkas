// src/app/page.tsx - OPTIMIZED & WORKING
import { Suspense } from 'react';

// ✅ CRITICAL COMPONENTS - Load immediately
import Navbar from '@/components/common/navbar';
import Hero from '@/components/layout/hero';

// ✅ NON-CRITICAL COMPONENTS - Normal imports
import { About } from '@/components/features/about/about';
import { Experience } from '@/components/features/experience/experience';
import { Skills } from '@/components/features/skills/skills';
import { Certifications } from '@/components/features/certifications/certifications';
import { Projects } from '@/components/features/projects/projects';
import { Contact } from '@/components/features/contact/contact';
import { Footer } from '@/components/common/footer';

// ✅ TAILWIND-BASED LOADING SKELETON
function SectionSkeleton() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Title skeleton */}
        <div className="h-12 bg-muted rounded-lg mb-8 w-1/3 skeleton"></div>
        
        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded-md skeleton"></div>
          <div className="h-6 bg-muted rounded-md skeleton w-5/6"></div>
          <div className="h-6 bg-muted rounded-md skeleton w-4/6"></div>
        </div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg skeleton"></div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ✅ SECTION WRAPPER
function LazySection({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[200px]">
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background transition-theme">
      {/* ✅ CRITICAL ABOVE-THE-FOLD CONTENT */}
      <Navbar />
      <Hero />
      
      {/* ✅ SECTIONS WITH OPTIMIZED LOADING */}
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <About />
        </Suspense>
      </LazySection>
      
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <Experience />
        </Suspense>
      </LazySection>
      
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <Skills />
        </Suspense>
      </LazySection>
      
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <Certifications />
        </Suspense>
      </LazySection>
      
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <Projects />
        </Suspense>
      </LazySection>

      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <Contact />
        </Suspense>
      </LazySection>
      
      {/* ✅ FOOTER */}
      <Suspense fallback={<div className="h-32 bg-muted animate-pulse" />}>
        <Footer />
      </Suspense>
    </main>
  );
}