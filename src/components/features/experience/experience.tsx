'use client'

// src/components/features/experience/experience.tsx
import { useTheme } from '@/components/providers/theme-provider'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

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
  
  return (
    <section 
      id="experience" 
      className={`py-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
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