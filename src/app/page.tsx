// src/app/page.tsx
"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { About } from '@/components/features/about/about'
import { Experience } from '@/components/features/experience/experience'
import { Skills } from '@/components/features/skills/skills'
import { Projects } from '@/components/features/projects/projects'
import { CryptoProjects } from '@/components/features/crypto/crypto-projects'
import { Contact } from '@/components/features/contact/contact'
import { Footer } from '@/components/common/footer'

// Loading components
const NavbarLoading = () => <div className="h-16 bg-gray-100 dark:bg-gray-900 animate-pulse fixed top-0 left-0 right-0 z-50"></div>
const HeroLoading = () => <div className="min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 animate-pulse"></div>
const CertificationsLoading = () => <div className="h-64 bg-gray-100 dark:bg-gray-900 animate-pulse my-8"></div>

// Διόρθωση: Αφαίρεση του loading parameter για αποφυγή διπλών loading states
const Navbar = dynamic(() => import('@/components/common/navbar'), { 
  ssr: true
})

const Hero = dynamic(() => import('@/components/layout/hero'), { 
  ssr: true
})

const Certifications = dynamic(() => import('@/components/features/certifications/certifications'), { 
  ssr: true
})

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Διόρθωση: Χρήση σωστής σειράς Suspense και dynamic components */}
      <Suspense fallback={<NavbarLoading />}>
        <Navbar />
      </Suspense>

      <Suspense fallback={<HeroLoading />}>
        <Hero />
      </Suspense>

      <About />
      <Experience />
      <Skills />

      <Suspense fallback={<CertificationsLoading />}>
        <Certifications />
      </Suspense>

      <Projects />
      <CryptoProjects />
      <Contact />
      <Footer />
    </main>
  )
}