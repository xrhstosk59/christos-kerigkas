'use client'

// src/components/features/skills/skills.tsx
import { useTheme } from '@/components/providers/theme-provider'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Δυναμική εισαγωγή του νέου Skills component
// Διόρθωση του μονοπατιού εισαγωγής
const SkillsComponent = dynamic(() => import('./index'), {
  ssr: true,
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
})

export function Skills() {
  const { theme } = useTheme()
  
  return (
    <section id="skills" className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }>
          {/* Διόρθωση type casting για το theme prop */}
          <SkillsComponent theme={theme === 'dark' ? 'dark' : 'light'} />
        </Suspense>
      </div>
    </section>
  )
}