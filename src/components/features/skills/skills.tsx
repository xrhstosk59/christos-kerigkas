'use client'

// src/components/features/skills/skills.tsx
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils/utils'

// ΔΙΟΡΘΩΣΗ: Αφαίρεση της επιλογής ssr: true
const SkillsComponent = dynamic(() => import('./index'), {
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
})

export function Skills() {
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
        id="skills" 
        className="py-24 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Suspense fallback={
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          }>
            {/* Pass light theme as default */}
            <SkillsComponent theme="light" />
          </Suspense>
        </div>
      </section>
    )
  }

  // ✅ FIXED: Now use theme-dependent classes only after mounted
  return (
    <section 
      id="skills" 
      className={cn(
        "py-24",
        theme === 'dark' ? 'bg-gray-950' : 'bg-white'
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }>
          {/* Περνάμε μόνο τη τιμή string για ασφαλή σειριοποίηση */}
          <SkillsComponent theme={theme === 'dark' ? 'dark' : 'light'} />
        </Suspense>
      </div>
    </section>
  )
}