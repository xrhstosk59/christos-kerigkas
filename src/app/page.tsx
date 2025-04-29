// src/app/page.tsx
"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { About } from '@/components/about'
import { Experience } from '@/components/experience'
import { Skills } from '@/components/skills'
import { Projects } from '@/components/projects'
import { CryptoProjects } from '@/components/crypto-projects'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'

// Loading components
const NavbarLoading = () => <div className="h-16 bg-gray-100 dark:bg-gray-900 animate-pulse fixed top-0 left-0 right-0 z-50"></div>
const HeroLoading = () => <div className="min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 animate-pulse"></div>
const CertificationsLoading = () => <div className="h-64 bg-gray-100 dark:bg-gray-900 animate-pulse my-8"></div>

// Dynamic imports
const Navbar = dynamic(() => import('@/components/navbar'), { 
  ssr: true, 
  loading: NavbarLoading 
})

const Hero = dynamic(() => import('@/components/hero'), { 
  ssr: true,
  loading: HeroLoading 
})

const Certifications = dynamic(() => import('@/components/certifications'), { 
  ssr: true,
  loading: CertificationsLoading 
})

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
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