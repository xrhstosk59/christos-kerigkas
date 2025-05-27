'use client'

// src/components/features/experience/experience.tsx
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils/utils'

// ΔΙΟΡΘΩΣΗ: Αφαίρεση της επιλογής ssr: true
const ExperienceComponent = dynamic(() => import('./index'), {
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
})

export function Experience() {
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
        id="experience" 
        className="py-24 bg-gray-50"
        aria-label="Experience and Projects"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div>
            <Suspense fallback={
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            }>
              {/* Pass light theme as default */}
              <ExperienceComponent theme="light" />
            </Suspense>
          </div>
        </div>
      </section>
    )
  }

  // ✅ FIXED: Now use theme-dependent classes only after mounted
  return (
    <section 
      id="experience" 
      className={cn(
        "py-24",
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      )}
      aria-label="Experience and Projects"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Suspense fallback={
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          }>
            {/* Περνάμε μόνο τη τιμή string για ασφαλή σειριοποίηση */}
            <ExperienceComponent theme={theme === 'dark' ? 'dark' : 'light'} />
          </Suspense>
        </motion.div>
      </div>
    </section>
  )
}