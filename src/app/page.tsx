'use client';

// src/app/page.tsx - Client Component solution με βάση την έρευνα
import { useState, useEffect } from 'react';
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

export default function Home() {
  // Client-side hydration για αποφυγή flashing/hydration issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Certifications />
      <Projects />
      <CryptoProjects />
      <Contact />
      <Footer />
    </main>
  );
}