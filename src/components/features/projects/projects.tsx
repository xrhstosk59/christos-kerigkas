'use client'

// src/components/features/projects/projects.tsx
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { cn } from '@/lib/utils/utils'
import dynamic from 'next/dynamic'

// ΔΙΟΡΘΩΣΗ: Αφαίρεση της επιλογής ssr: true
const ProjectsComponent = dynamic(() => import('./index'), {
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
})

export function Projects() {
  const { theme } = useTheme()
  
  // ✅ FIXED: Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  // ✅ Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ FIXED: Use neutral classes until mounted
  if (!mounted) {
    return (
      <section 
        id="projects" 
        className="py-24 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div>
            <Suspense fallback={
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            }>
              {/* Pass light theme as default */}
              <ProjectsComponent theme="light" />
            </Suspense>
          </div>
        </div>
      </section>
    )
  }

  // ✅ FIXED: Now use theme-dependent classes only after mounted
  return (
    <motion.section 
      id="projects" 
      className={cn("py-24", theme === 'dark' ? 'bg-gray-950' : 'bg-white')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Suspense fallback={
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          }>
            {/* Περνάμε μόνο τη τιμή string για ασφαλή σειριοποίηση */}
            <ProjectsComponent theme={theme === 'dark' ? 'dark' : 'light'} />
          </Suspense>
        </motion.div>
      </div>
    </motion.section>
  )
}