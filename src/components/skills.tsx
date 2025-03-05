// src/components/skills.tsx
"use client"

import { useTheme } from './theme-provider'
import { SkillsServer } from './skills-server'

export function Skills() {
  const { theme } = useTheme()
  
  return (
    <section id="skills" className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SkillsServer theme={theme} />
      </div>
    </section>
  )
}