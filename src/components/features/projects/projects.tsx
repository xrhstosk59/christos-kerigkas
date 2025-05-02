'use client'

// src/components/features/projects/projects.tsx
// Διόρθωση μονοπατιού εισαγωγής
import { useTheme } from '@/components/providers/theme-provider'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { cn } from '@/lib/utils/utils'
import dynamic from 'next/dynamic'

// Δυναμική εισαγωγή του Projects component
// Διόρθωση μονοπατιού εισαγωγής
const ProjectsComponent = dynamic(() => import('./index'), {
  ssr: true,
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
})

export function Projects() {
  const { theme } = useTheme()
  
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
            {/* Διόρθωση type casting για το theme prop */}
            <ProjectsComponent theme={theme === 'dark' ? 'dark' : 'light'} />
          </Suspense>
        </motion.div>
      </div>
    </motion.section>
  )
}