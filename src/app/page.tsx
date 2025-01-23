// src/app/page.tsx

"use client"

import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import('@/components/navbar'), { ssr: false })
const Hero = dynamic(() => import('@/components/hero'), { ssr: false })
import { About } from '@/components/about'
import { Experience } from '@/components/experience'
import { Skills } from '@/components/skills'
import { Projects } from '@/components/projects'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
    </main>
  )
}